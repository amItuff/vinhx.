// Contact form endpoint with image attachments.
//
// Delivery (set one in Vercel -> Settings -> Environment Variables):
//   RESEND_API_KEY   sends a real email through Resend (optional CONTACT_TO, CONTACT_FROM)
//   CONTACT_WEBHOOK_URL   posts the message and images to a private Discord channel
// With neither set the endpoint answers 503 and the page falls back to text-only sending.

const RESEND_KEY = process.env.RESEND_API_KEY || '';
const WEBHOOK = process.env.CONTACT_WEBHOOK_URL || '';
const TO = process.env.CONTACT_TO || 'nguyenngoctrivinh72@gmail.com';
const FROM = process.env.CONTACT_FROM || 'vinhx.info <onboarding@resend.dev>';

const { over } = require('./_limit');

const MAX_FILES = 3;
const MAX_FILE_BYTES = 2 * 1024 * 1024;
const MAX_TOTAL_BYTES = 3.2 * 1024 * 1024;
const PER_HOUR = 5;

const EMAIL_RE = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;
const B64_RE = /^[A-Za-z0-9+/]+={0,2}$/;

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
  if (!res.ok) console.error('contact: resend failed', res.status, (await res.text().catch(() => '')).slice(0, 300));
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
  if (!res.ok) console.error('contact: webhook failed', res.status, (await res.text().catch(() => '')).slice(0, 300));
  return res.ok;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'GET') { // lets the page (and the owner) check whether attachments are set up
    return res.status(200).json({ configured: !!(RESEND_KEY || WEBHOOK), provider: RESEND_KEY ? 'resend' : WEBHOOK ? 'discord-webhook' : null });
  }
  if (req.method !== 'POST') { res.setHeader('Allow', 'GET, POST'); return res.status(405).json({ error: 'method_not_allowed' }); }
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

    if (await over(req, 'contact', PER_HOUR, 3600)) return res.status(429).json({ error: 'rate_limited' });

    const m = { email, subject, message };
    const ok = RESEND_KEY ? await viaResend(m, files) : await viaWebhook(m, files);
    if (!ok) return res.status(502).json({ error: 'delivery_failed', provider: RESEND_KEY ? 'resend' : 'discord-webhook' });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('contact: error', err && err.message);
    return res.status(500).json({ error: 'server_error' });
  }
};
