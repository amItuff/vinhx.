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

const MAX_FILES = 5;
const MAX_FILE_BYTES = 3 * 1024 * 1024;
const MAX_TOTAL_BYTES = 3.2 * 1024 * 1024; // stays under Vercel's 4.5 MB body limit once base64-encoded
const PER_HOUR = 5;

const EMAIL_RE = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;
const B64_RE = /^[A-Za-z0-9+/]+={0,2}$/;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Allowed attachments: the file extension picks the type, and the first bytes must really match it,
// so a renamed program or script is refused. Anything not listed here is rejected.
const starts = (b, ...sig) => sig.every((x, i) => b[i] === x);
const ZIP = (b) => starts(b, 0x50, 0x4b, 0x03, 0x04);
const OLE = (b) => starts(b, 0xd0, 0xcf, 0x11, 0xe0);
const RIFF = (b, kind) => starts(b, 0x52, 0x49, 0x46, 0x46) && b.slice(8, 12).toString('latin1') === kind;
const TEXT = (b) => !b.slice(0, 4096).includes(0);
const TYPES = {
  jpg: ['image/jpeg', (b) => starts(b, 0xff, 0xd8, 0xff)],
  jpeg: ['image/jpeg', (b) => starts(b, 0xff, 0xd8, 0xff)],
  png: ['image/png', (b) => starts(b, 0x89, 0x50, 0x4e, 0x47)],
  gif: ['image/gif', (b) => b.slice(0, 4).toString('latin1') === 'GIF8'],
  webp: ['image/webp', (b) => RIFF(b, 'WEBP')],
  pdf: ['application/pdf', (b) => b.slice(0, 4).toString('latin1') === '%PDF'],
  doc: ['application/msword', OLE],
  docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', ZIP],
  xls: ['application/vnd.ms-excel', OLE],
  xlsx: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', ZIP],
  ppt: ['application/vnd.ms-powerpoint', OLE],
  pptx: ['application/vnd.openxmlformats-officedocument.presentationml.presentation', ZIP],
  csv: ['text/csv', TEXT],
  txt: ['text/plain', TEXT],
  mp3: ['audio/mpeg', (b) => b.slice(0, 3).toString('latin1') === 'ID3' || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0)],
  wav: ['audio/wav', (b) => RIFF(b, 'WAVE')],
  m4a: ['audio/mp4', (b) => b.slice(4, 8).toString('latin1') === 'ftyp'],
  mp4: ['video/mp4', (b) => b.slice(4, 8).toString('latin1') === 'ftyp'],
  mov: ['video/quicktime', (b) => b.slice(4, 8).toString('latin1') === 'ftyp' || b.slice(4, 8).toString('latin1') === 'moov'],
  webm: ['video/webm', (b) => starts(b, 0x1a, 0x45, 0xdf, 0xa3)]
};

function parseFiles(list) {
  if (list === undefined) return [];
  if (!Array.isArray(list) || list.length > MAX_FILES) return null;
  const out = [];
  let total = 0;
  for (const f of list) {
    if (!f || typeof f.data !== 'string' || !B64_RE.test(f.data)) return null;
    const name = String(f.name || 'file').replace(/[^\p{L}\p{N}._\- ]+/gu, '_').slice(0, 80) || 'file';
    const ext = (name.split('.').pop() || '').toLowerCase();
    const type = TYPES[ext];
    if (!type) return null;
    const buf = Buffer.from(f.data, 'base64');
    if (!buf.length || buf.length > MAX_FILE_BYTES || !type[1](buf)) return null;
    total += buf.length;
    out.push({ name, buf, mime: type[0] });
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
  files.forEach((f, i) => form.append(`files[${i}]`, new Blob([f.buf], { type: f.mime }), f.name));
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
