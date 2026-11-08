// Contact form endpoint with image attachments.
//
// Delivery (set one in Vercel -> Settings -> Environment Variables):
//   RESEND_API_KEY   sends a real email through Resend (optional CONTACT_TO, CONTACT_FROM)
//   CONTACT_WEBHOOK_URL   posts the message and images to a private Discord channel
// With neither set the endpoint answers 503 and the page falls back to text-only sending.

const crypto = require('crypto');

const RESEND_KEY = process.env.RESEND_API_KEY || '';
const WEBHOOK = process.env.CONTACT_WEBHOOK_URL || '';
const TO = process.env.CONTACT_TO || 'nguyenngoctrivinh72@gmail.com';
const FROM = process.env.CONTACT_FROM || 'vinhx.info <onboarding@resend.dev>';

const REDIS = (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '').replace(/\/$/, '');
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '';
const SALT = process.env.NOTE_SALT || 'vinhx-note';

const MAX_FILES = 3;
const MAX_FILE_BYTES = 2 * 1024 * 1024;
const MAX_TOTAL_BYTES = 3.2 * 1024 * 1024;
const PER_HOUR = 5;

const EMAIL_RE = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;
const B64_RE = /^[A-Za-z0-9+/]+={0,2}$/;

const memory = new Map(); // fallback limiter when Redis is not configured

function clientIp(req) {
  const h = req.headers || {};
  if (h['x-real-ip']) return String(h['x-real-ip']).trim();
  if (h['x-forwarded-for']) return String(h['x-forwarded-for']).split(',')[0].trim();
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}

async function tooMany(ip) {
  const slot = Math.floor(Date.now() / 3600000);
  const key = `rl:contact:${crypto.createHash('sha256').update(`${SALT}|${ip}`).digest('hex').slice(0, 20)}:${slot}`;
  if (REDIS && REDIS_TOKEN) {
    try {
      const res = await fetch(REDIS + '/pipeline', {
        method: 'POST',
        headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify([['INCR', key], ['EXPIRE', key, 3700]])
      });
      const rows = await res.json();
      return Number(rows[0].result) > PER_HOUR;
    } catch (_) { /* fall back to memory */ }
  }
  const n = (memory.get(key) || 0) + 1;
  memory.set(key, n);
  if (memory.size > 500) memory.clear();
  return n > PER_HOUR;
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function parseFiles(list) {
  if (list === undefined) return [];
  if (!Array.isArray(list) || list.length > MAX_FILES) return null;
  const out = [];
  let total = 0;
  for (const f of list) {
    if (!f || typeof f.data !== 'string' || !B64_RE.test(f.data) || f.type !== 'image/jpeg') return null;
    const buf = Buffer.from(f.data, 'base64');
    if (!buf.length || buf.length > MAX_FILE_BYTES) return null;
    if (!(buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff)) return null; // real JPEG only
    total += buf.length;
    const name = String(f.name || 'image.jpg').replace(/[^\w.\- ]+/g, '_').slice(0, 60) || 'image.jpg';
    out.push({ name: /\.jpe?g$/i.test(name) ? name : name + '.jpg', buf });
  }
  return total > MAX_TOTAL_BYTES ? null : out;
}

async function viaResend(m, files) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM,
      to: [TO],
      reply_to: m.email,
      subject: `[vinhx.info] ${m.subject}`,
      text: `From: ${m.email}\n\n${m.message}`,
      html: `<p><b>From:</b> ${esc(m.email)}</p><div style="white-space:pre-wrap">${esc(m.message)}</div>`,
      attachments: files.map((f) => ({ filename: f.name, content: f.buf.toString('base64') }))
    })
  });
  return res.ok;
}

async function viaWebhook(m, files) {
  const form = new FormData();
  form.append('payload_json', JSON.stringify({
    username: 'vinhx.info contact',
    allowed_mentions: { parse: [] },
    embeds: [{
      title: m.subject.slice(0, 250),
      description: m.message.slice(0, 3800),
      fields: [{ name: 'From', value: m.email.slice(0, 200) }],
      color: 0x0b57d0
    }]
  }));
  files.forEach((f, i) => form.append(`files[${i}]`, new Blob([f.buf], { type: 'image/jpeg' }), f.name));
  const res = await fetch(WEBHOOK, { method: 'POST', body: form });
  return res.ok;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'method_not_allowed' }); }
  if (!RESEND_KEY && !WEBHOOK) return res.status(503).json({ error: 'not_configured' });

  try {
    const b = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    if (b.hp) return res.status(200).json({ ok: true }); // honeypot filled: pretend success

    const email = String(b.email || '').trim();
    const subject = String(b.subject || '').replace(/[\r\n]+/g, ' ').trim();
    const message = String(b.message || '').trim();
    if (!EMAIL_RE.test(email) || email.length > 200) return res.status(400).json({ error: 'bad_email' });
    if (!subject || subject.length > 150) return res.status(400).json({ error: 'bad_subject' });
    if (!message || message.length > 5000) return res.status(400).json({ error: 'bad_message' });
    const files = parseFiles(b.files);
    if (files === null) return res.status(400).json({ error: 'bad_files' });

    if (await tooMany(clientIp(req))) return res.status(429).json({ error: 'rate_limited' });

    const m = { email, subject, message };
    const ok = RESEND_KEY ? await viaResend(m, files) : await viaWebhook(m, files);
    if (!ok) return res.status(502).json({ error: 'delivery_failed' });
    return res.status(200).json({ ok: true });
  } catch (_) {
    return res.status(500).json({ error: 'server_error' });
  }
};
