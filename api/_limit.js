// Shared helpers for the API: client IP, hashed IP key and a per-IP fixed-window limiter
// (Upstash Redis when configured, in-memory otherwise).
const crypto = require('crypto');

const REDIS = (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '').replace(/\/$/, '');
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '';
const SALT = process.env.NOTE_SALT || 'vinhx-note';
const memory = new Map();

function clientIp(req) {
  const h = req.headers || {};
  if (h['x-real-ip']) return String(h['x-real-ip']).trim();
  if (h['x-forwarded-for']) return String(h['x-forwarded-for']).split(',')[0].trim();
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}

// salted hash of the caller's IP, so raw IPs never reach the database
const ipKey = (req) => crypto.createHash('sha256').update(`${SALT}|${clientIp(req)}`).digest('hex').slice(0, 20);

// Counts one call of `name` for this IP. Returns 0 when allowed, otherwise the seconds until the window resets.
async function hit(req, name, max, windowSec) {
  const now = Math.floor(Date.now() / 1000);
  const key = `rl:${name}:${ipKey(req)}:${Math.floor(now / windowSec)}`;
  let count;
  if (REDIS && TOKEN) {
    try {
      const res = await fetch(REDIS + '/pipeline', {
        method: 'POST',
        headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify([['INCR', key], ['EXPIRE', key, windowSec + 30]])
      });
      const rows = await res.json();
      count = Number(rows[0].result);
    } catch (_) { /* fall back to memory */ }
  }
  if (!(count > 0)) {
    count = (memory.get(key) || 0) + 1;
    memory.set(key, count);
    if (memory.size > 800) memory.clear();
  }
  return count > max ? windowSec - (now % windowSec) : 0;
}

// true when this IP has used more than `max` calls of `name` in the current window
const over = async (req, name, max, windowSec) => (await hit(req, name, max, windowSec)) > 0;

module.exports = { clientIp, ipKey, hit, over };
