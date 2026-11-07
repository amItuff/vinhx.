// Storage endpoint for /note.
// It only ever sees an opaque lookup key and AES-GCM ciphertext; the note id and
// the encryption key never leave the browser.
//
// Needs an Upstash Redis database connected to the Vercel project
// (Storage tab -> Upstash Redis). Either env var naming scheme works.

const crypto = require('crypto');

const BASE = (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '').replace(/\/$/, '');
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '';

const PREFIX = 'note:v1:';
const TTL_SECONDS = 60 * 60 * 24 * 365; // dropped after a year without edits
const MAX_CT = 500000;                  // base64 chars, ~370 KB of ciphertext

const K_RE = /^[0-9a-f]{64}$/;
const VER_RE = /^[0-9a-f]{0,16}$/;
const B64_RE = /^[A-Za-z0-9+/]+={0,2}$/;

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

async function readNote(k) {
  const raw = await redis(['GET', PREFIX + k]);
  return raw ? JSON.parse(raw) : null;
}

function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body);
  return {};
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (!BASE || !TOKEN) return res.status(503).json({ error: 'storage_not_configured' });

  try {
    if (req.method === 'GET') {
      const { k, ver } = req.query || {};
      if (!K_RE.test(String(k || ''))) return res.status(400).json({ error: 'bad_key' });

      const note = await readNote(k);
      if (!note) return res.status(404).json({ error: 'not_found' });
      if (ver && ver === note.ver) return res.status(200).json({ unchanged: true, ver: note.ver });
      return res.status(200).json(note);
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      const { k, base = '', iv, ct } = readBody(req);

      if (!K_RE.test(String(k || ''))) return res.status(400).json({ error: 'bad_key' });
      if (typeof base !== 'string' || !VER_RE.test(base)) return res.status(400).json({ error: 'bad_version' });
      if (typeof iv !== 'string' || iv.length !== 16 || !B64_RE.test(iv)) return res.status(400).json({ error: 'bad_iv' });
      if (typeof ct !== 'string' || !ct.length || ct.length > MAX_CT || !B64_RE.test(ct)) {
        return res.status(413).json({ error: 'bad_or_too_large' });
      }

      const current = await readNote(k);
      // Someone else saved since this client last synced: hand back their copy.
      if (current && current.ver !== base) return res.status(409).json({ error: 'conflict', ...current });

      const next = { v: 1, ver: crypto.randomBytes(6).toString('hex'), iv, ct, t: Date.now() };
      await redis(['SET', PREFIX + k, JSON.stringify(next), 'EX', TTL_SECONDS]);
      return res.status(200).json({ ver: next.ver });
    }

    if (req.method === 'DELETE') {
      const { k } = req.query || {};
      if (!K_RE.test(String(k || ''))) return res.status(400).json({ error: 'bad_key' });
      await redis(['DEL', PREFIX + k]);
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'GET, PUT, POST, DELETE');
    return res.status(405).json({ error: 'method_not_allowed' });
  } catch (err) {
    return res.status(500).json({ error: 'server_error' });
  }
};
