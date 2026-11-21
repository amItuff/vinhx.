// Storage endpoint for vinhx library sync (reading progress and bookmarks between devices).
//
// The browser encrypts everything with a key derived from the sync code, and looks the data up by a
// hash of that code. This function therefore only ever sees an opaque lookup id and AES-GCM
// ciphertext: it cannot read a user's progress, and the code itself never leaves the browser.
//
// Needs an Upstash Redis database connected to the Vercel project (same one /note uses).

const { hit } = require('./_limit');

const BASE = (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '').replace(/\/$/, '');
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '';

const PREFIX = 'libsync:v1:';
const TTL = 60 * 60 * 24 * 400;   // refreshed on every read and write, so an unused code expires after ~13 months
const MAX_CT = 700000;            // base64 characters, roughly 500 KB
const ID_RE = /^[0-9a-f]{32}$/;
const B64_RE = /^[A-Za-z0-9+/]+={0,2}$/;
const LIMITS = { read: [120, 60], write: [60, 60], create: [30, 86400] };

async function redis(command) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command)
  });
  if (!res.ok) throw new Error(`redis ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json.result;
}

function body(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body);
  return {};
}

const view = (d) => ({ rev: d.rev, iv: d.iv, ct: d.ct, t: d.t });

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const send = (code, obj) => res.status(code).json(obj);

  if (!BASE || !TOKEN) return send(503, { error: 'not_configured' });

  try {
    if (req.method === 'GET' && req.query && 'ping' in req.query) return send(200, { ok: true });

    const wait = async (bucket) => hit(req, 'sync-' + bucket, LIMITS[bucket][0], LIMITS[bucket][1]);
    const tooMany = (s) => { res.setHeader('Retry-After', String(s)); return send(429, { error: 'rate_limited', retry: s }); };

    if (req.method === 'GET') {
      const w = await wait('read');
      if (w) return tooMany(w);
      const id = String((req.query && req.query.id) || '');
      if (!ID_RE.test(id)) return send(400, { error: 'bad_id' });
      const raw = await redis(['GET', PREFIX + id]);
      if (!raw) return send(404, { error: 'not_found' });
      redis(['EXPIRE', PREFIX + id, TTL]).catch(() => {});
      return send(200, { data: view(JSON.parse(raw)) });
    }

    if (req.method === 'PUT') {
      const w = await wait('write');
      if (w) return tooMany(w);
      const b = body(req);
      const id = String(b.id || '');
      const d = b.data || {};
      if (!ID_RE.test(id)) return send(400, { error: 'bad_id' });
      if (typeof d.iv !== 'string' || d.iv.length > 40 || !B64_RE.test(d.iv)) return send(400, { error: 'bad_data' });
      if (typeof d.ct !== 'string' || !d.ct.length || d.ct.length > MAX_CT || !B64_RE.test(d.ct)) return send(400, { error: 'bad_data' });

      const raw = await redis(['GET', PREFIX + id]);
      const cur = raw ? JSON.parse(raw) : null;
      if (!cur) {
        // creating a new code is what spammers would abuse, so it has its own tighter budget
        const c = await wait('create');
        if (c) return tooMany(c);
      }
      // optimistic concurrency: the client must have seen the latest revision, otherwise it merges and retries
      const base = Number.isInteger(b.base) ? b.base : 0;
      if (cur && cur.rev !== base) return send(409, { error: 'conflict', data: view(cur) });

      const next = { rev: (cur ? cur.rev : 0) + 1, iv: d.iv, ct: d.ct, t: Date.now() };
      await redis(['SET', PREFIX + id, JSON.stringify(next), 'EX', TTL]);
      return send(200, { rev: next.rev, t: next.t });
    }

    if (req.method === 'DELETE') {
      const w = await wait('write');
      if (w) return tooMany(w);
      const id = String((req.query && req.query.id) || '');
      if (!ID_RE.test(id)) return send(400, { error: 'bad_id' });
      await redis(['DEL', PREFIX + id]);
      return send(200, { ok: true });
    }

    res.setHeader('Allow', 'GET, PUT, DELETE');
    return send(405, { error: 'method' });
  } catch (_) {
    return send(500, { error: 'server' });
  }
};
