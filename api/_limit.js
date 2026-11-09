// Small per-IP limiter shared by the library endpoints (Upstash Redis when configured, memory otherwise).
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

// true when `ip` has used more than `max` calls of `name` in the current window
async function over(req, name, max, windowSec) {
  const slot = Math.floor(Date.now() / 1000 / windowSec);
  const key = `rl:${name}:${crypto.createHash('sha256').update(`${SALT}|${clientIp(req)}`).digest('hex').slice(0, 20)}:${slot}`;
  if (REDIS && TOKEN) {
    try {
      const res = await fetch(REDIS + '/pipeline', {
        method: 'POST',
        headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify([['INCR', key], ['EXPIRE', key, windowSec + 30]])
      });
      const rows = await res.json();
      return Number(rows[0].result) > max;
    } catch (_) { /* fall back to memory */ }
  }
  const n = (memory.get(key) || 0) + 1;
  memory.set(key, n);
  if (memory.size > 800) memory.clear();
  return n > max;
}

module.exports = { over };
