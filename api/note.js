// Storage endpoint for /note.
//
// This function only ever receives an opaque lookup token and AES-GCM ciphertext,
// never the note id or an encryption key. Writing needs a separate secret (the
// write token): only its SHA-256 is stored, so someone holding just the
// read-only link can read a note but never change it.
//
// Needs an Upstash Redis database connected to the Vercel project
// (either env var naming scheme works).

const crypto = require('crypto');

const BASE = (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '').replace(/\/$/, '');
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '';
const IP_SALT = process.env.NOTE_SALT || 'vinhx-note';

const PREFIX = 'note:v2:';
const TTL_CHOICES = [3600, 86400, 604800, 31536000]; // 1 hour, 1 day, 1 week, 1 year
const DEFAULT_TTL = 31536000;
const MAX_CT = 500000; // base64 chars, roughly 370 KB of ciphertext

// Per-IP limits (IPs are hashed before they touch the database).
const LIMITS = {
  read: { max: 120, window: 60 },
  write: { max: 90, window: 60 },
  create: { max: 20, window: 86400 }
};
const MAX_ACTIVE_NOTES_PER_IP = 100;

const HEX64 = /^[0-9a-f]{64}$/;
const VER_RE = /^[0-9a-f]{0,16}$/;
const B64_RE = /^[A-Za-z0-9+/]+={0,2}$/;

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

function clientIp(req) {
  const h = req.headers || {};
  if (h['x-real-ip']) return String(h['x-real-ip']).trim();
  if (h['x-forwarded-for']) return String(h['x-forwarded-for']).split(',')[0].trim();
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}
const ipKey = (req) => sha256(`${IP_SALT}|${clientIp(req)}`).slice(0, 20);

async function call(path, body) {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`redis ${res.status}`);
  return res.json();
}
async function redis(command) {
  const json = await call('', command);
  if (json.error) throw new Error(json.error);
  return json.result;
}
async function pipeline(commands) {
  const rows = await call('/pipeline', commands);
  return rows.map((r) => { if (r.error) throw new Error(r.error); return r.result; });
}

// Fixed-window counter. Returns 0 when allowed, otherwise the seconds to wait.
async function overLimit(bucket, ip) {
  const { max, window } = LIMITS[bucket];
  const now = Math.floor(Date.now() / 1000);
  const key = `rl:${bucket}:${ip}:${Math.floor(now / window)}`;
  const [count] = await pipeline([['INCR', key], ['EXPIRE', key, window]]);
  return count > max ? window - (now % window) : 0;
}

async function readNote(k) {
  const raw = await redis(['GET', PREFIX + k]);
  return raw ? JSON.parse(raw) : null;
}

function holdsWriteToken(token, note) {
  if (!HEX64.test(String(token || '')) || !note || !note.wh) return false;
  const a = Buffer.from(sha256(token), 'hex');
  const b = Buffer.from(note.wh, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

const publicView = (n) => ({ ver: n.ver, iv: n.iv, ct: n.ct, t: n.t, ttl: n.ttl, burn: !!n.burn });

function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body);
  return {};
}

function tooMany(res, wait, error) {
  res.setHeader('Retry-After', String(wait));
  return res.status(429).json({ error, retry: wait });
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (!BASE || !TOKEN) return res.status(503).json({ error: 'storage_not_configured' });

  try {
    const ip = ipKey(req);

    // ---- read -------------------------------------------------------------
    if (req.method === 'GET') {
      const { k, ver } = req.query || {};
      if (!HEX64.test(String(k || ''))) return res.status(400).json({ error: 'bad_key' });

      const wait = await overLimit('read', ip);
      if (wait) return tooMany(res, wait, 'rate_limited');

      const note = await readNote(k);
      if (!note) return res.status(404).json({ error: 'not_found' });
      const owner = holdsWriteToken((req.headers || {})['x-note-write'], note);

      // Burn after reading: the first read-only visitor gets the note, then it is gone.
      // DEL returning 1 means this request was the one that removed it.
      if (note.burn && !owner) {
        const removed = await redis(['DEL', PREFIX + k]);
        if (removed !== 1) return res.status(404).json({ error: 'not_found' });
        return res.status(200).json({ ...publicView(note), burned: true });
      }

      if (ver && ver === note.ver) return res.status(200).json({ unchanged: true, ver: note.ver });
      return res.status(200).json(publicView(note));
    }

    // ---- create / update ---------------------------------------------------
    if (req.method === 'PUT' || req.method === 'POST') {
      const body = readBody(req);
      const { k, w, iv, ct } = body;
      const base = body.base === undefined ? '' : body.base;

      if (!HEX64.test(String(k || ''))) return res.status(400).json({ error: 'bad_key' });
      if (!HEX64.test(String(w || ''))) return res.status(400).json({ error: 'bad_write_token' });
      if (typeof base !== 'string' || !VER_RE.test(base)) return res.status(400).json({ error: 'bad_version' });
      if (typeof iv !== 'string' || iv.length !== 16 || !B64_RE.test(iv)) return res.status(400).json({ error: 'bad_iv' });
      if (typeof ct !== 'string' || !ct.length || ct.length > MAX_CT || !B64_RE.test(ct)) {
        return res.status(413).json({ error: 'bad_or_too_large' });
      }
      const ttl = TTL_CHOICES.includes(Number(body.ttl)) ? Number(body.ttl) : DEFAULT_TTL;
      const burn = body.burn === true;

      const wait = await overLimit('write', ip);
      if (wait) return tooMany(res, wait, 'rate_limited');

      const current = await readNote(k);
      if (current) {
        if (!holdsWriteToken(w, current)) return res.status(403).json({ error: 'forbidden' });
        if (current.ver !== base) return res.status(409).json({ error: 'conflict', ...publicView(current) });
      } else {
        const waitNew = await overLimit('create', ip);
        if (waitNew) return tooMany(res, waitNew, 'too_many_notes');

        const set = `ipn:${ip}`;
        const [, active] = await pipeline([['ZREMRANGEBYSCORE', set, 0, Date.now()], ['ZCARD', set]]);
        if (active >= MAX_ACTIVE_NOTES_PER_IP) return res.status(429).json({ error: 'note_limit' });
      }

      const next = {
        v: 2,
        ver: crypto.randomBytes(6).toString('hex'),
        iv, ct, ttl, burn,
        t: Date.now(),
        wh: current ? current.wh : sha256(w)
      };
      await redis(['SET', PREFIX + k, JSON.stringify(next), 'EX', ttl]);
      if (!current) {
        await pipeline([['ZADD', `ipn:${ip}`, Date.now() + ttl * 1000, k], ['EXPIRE', `ipn:${ip}`, 31536000]]);
      }
      return res.status(200).json({ ver: next.ver, ttl, burn });
    }

    // ---- delete -------------------------------------------------------------
    if (req.method === 'DELETE') {
      const { k } = req.query || {};
      if (!HEX64.test(String(k || ''))) return res.status(400).json({ error: 'bad_key' });

      const wait = await overLimit('write', ip);
      if (wait) return tooMany(res, wait, 'rate_limited');

      const note = await readNote(k);
      if (!note) return res.status(200).json({ ok: true });
      if (!holdsWriteToken((req.headers || {})['x-note-write'], note)) return res.status(403).json({ error: 'forbidden' });

      await redis(['DEL', PREFIX + k]);
      await redis(['ZREM', `ipn:${ip}`, k]);
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'GET, PUT, POST, DELETE');
    return res.status(405).json({ error: 'method_not_allowed' });
  } catch (err) {
    return res.status(500).json({ error: 'server_error' });
  }
};
