// Contact form endpoint with image attachments.
//
// Delivery (set in Vercel -> Settings -> Environment Variables). They are tried in this order and the
// first one that works wins; if an earlier one failed, the message carries a warning saying which:
//   CONTACT_WEBHOOK_URL     private Discord channel (message + attachments)
//   CONTACT_WEBHOOK_URL_2   backup Discord channel
//   RESEND_API_KEY          real email through Resend (optional CONTACT_TO, CONTACT_FROM)
//   ALERT_WEBHOOK_URL       optional extra channel that gets a short alert when something failed
// Anti-spam (optional): TURNSTILE_SITE_KEY + TURNSTILE_SECRET_KEY turn on a Cloudflare Turnstile captcha.
// With nothing set the endpoint answers 503.

const RESEND_KEY = process.env.RESEND_API_KEY || '';
const WEBHOOK = process.env.CONTACT_WEBHOOK_URL || '';
const WEBHOOK2 = process.env.CONTACT_WEBHOOK_URL_2 || '';    // optional backup Discord channel
const ALERT = process.env.ALERT_WEBHOOK_URL || '';           // optional: where to report that a channel failed
const TS_SITE = process.env.TURNSTILE_SITE_KEY || '';        // Cloudflare Turnstile (optional)
const TS_SECRET = process.env.TURNSTILE_SECRET_KEY || '';
const TO = process.env.CONTACT_TO || 'nguyenngoctrivinh72@gmail.com';
const FROM = process.env.CONTACT_FROM || 'vinhx.info <onboarding@resend.dev>';

const fs = require('fs');
const path = require('path');
const { over, clientIp } = require('./_limit');

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

const SITE = 'https://vinhx.info';
const LOGO = SITE + '/assets/logo-192.png';
const BANNER = SITE + '/assets/mail-banner.png';
// Banner and logo travel inside the same request (attachment://...), so the card never depends on Discord
// fetching images from the site (or on its cache of an older failed fetch).
async function asset(name) {
  for (const p of [path.join(process.cwd(), 'assets', name), path.join(__dirname, '..', 'assets', name)]) {
    try { return fs.readFileSync(p); } catch (_) { /* try the next place */ }
  }
  try {
    const r = await fetch(`${SITE}/assets/${name}?v=3`);
    if (r.ok) return Buffer.from(await r.arrayBuffer());
  } catch (_) { /* fall back to plain URLs */ }
  return null;
}
const fmtSize = (n) => (n < 1048576 ? Math.max(1, Math.round(n / 1024)) + ' KB' : (n / 1048576).toFixed(1) + ' MB');

async function viaResend(m, files, note) {
  const reply = `mailto:${encodeURIComponent(m.email)}?subject=${encodeURIComponent('Re: ' + m.subject)}`;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM,
      to: [TO],
      reply_to: m.email,
      subject: `[vinhx.info] ${m.subject}`,
      text: `${note ? note + '\n\n' : ''}From: ${m.email}\n\n${m.message}`,
      html: `<div style="max-width:560px;margin:0 auto;font-family:Arial,sans-serif;color:#202124;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden">
<img src="${BANNER}" alt="vinhx.info" width="560" style="display:block;width:100%">
${note ? `<div style="padding:10px 22px;background:#fef7e0;color:#b06000;font-size:13px">${esc(note)}</div>` : ''}<div style="padding:20px 22px"><h2 style="margin:0 0 6px;font-size:20px">${esc(m.subject)}</h2>
<p style="margin:0 0 14px;color:#5f6368;font-size:13px">Từ <b>${esc(m.email)}</b> · tới Vinh</p>
<div style="white-space:pre-wrap;font-size:15px;line-height:1.55">${esc(m.message)}</div>
<p style="margin:20px 0 0"><a href="${reply}" style="background:#0b57d0;color:#fff;text-decoration:none;padding:9px 20px;border-radius:18px;font-size:14px">Trả lời</a></p></div>
<div style="padding:12px 22px;background:#f6f8fc;color:#5f6368;font-size:12px"><img src="${LOGO}" width="16" height="16" style="vertical-align:middle;border-radius:4px"> vinhx.info · hộp thư</div></div>`,
      attachments: files.map((f) => ({ filename: f.name, content: f.buf.toString('base64') }))
    })
  });
  if (!res.ok) console.error('contact: resend failed', res.status, (await res.text().catch(() => '')).slice(0, 300));
  return { ok: res.ok, status: res.status };
}

// Discord: a banner on top, then a mail "card" (sender, subject, body, attachments, reply link)
async function viaWebhook(url, m, files, note) {
  const now = Math.floor(Date.now() / 1000);
  const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(m.email)}&su=${encodeURIComponent('Re: ' + m.subject)}`;
  const fields = [
    { name: 'Từ', value: m.email.slice(0, 200), inline: true },
    { name: 'Tới', value: 'Vinh', inline: true },
    { name: 'Thời gian', value: `<t:${now}:f>`, inline: true }
  ];
  if (files.length) fields.push({ name: `Đính kèm (${files.length})`, value: files.map((f) => `• ${f.name} · ${fmtSize(f.buf.length)}`).join('\n').slice(0, 1000) });
  fields.push({ name: '\u200b', value: `[Trả lời bằng Gmail](${gmail})` });
  if (note) fields.push({ name: '⚠️ Cảnh báo hệ thống', value: note.slice(0, 900) });

  const [banner, logo] = await Promise.all([asset('mail-banner.png'), asset('logo-96.png')]);
  const bannerUrl = banner ? 'attachment://vx-banner.png' : BANNER + '?v=3';
  const logoUrl = logo ? 'attachment://vx-logo.png' : LOGO + '?v=3';

  const form = new FormData();
  form.append('payload_json', JSON.stringify({
    username: 'vinhx.info mail',
    avatar_url: LOGO + '?v=3',
    allowed_mentions: { parse: [] },
    embeds: [
      { color: 0x0b57d0, image: { url: bannerUrl } },
      {
        color: 0x0b57d0,
        author: { name: m.email.slice(0, 200), icon_url: logoUrl },
        title: m.subject.slice(0, 250),
        description: m.message.slice(0, 3800),
        fields,
        footer: { text: 'vinhx.info · Hộp thư', icon_url: logoUrl },
        timestamp: new Date().toISOString()
      }
    ]
  }));
  const all = files.map((f) => ({ name: f.name, buf: f.buf, mime: f.mime }));
  if (banner) all.push({ name: 'vx-banner.png', buf: banner, mime: 'image/png' });
  if (logo) all.push({ name: 'vx-logo.png', buf: logo, mime: 'image/png' });
  all.forEach((f, i) => form.append(`files[${i}]`, new Blob([f.buf], { type: f.mime }), f.name));
  const res = await fetch(url, { method: 'POST', body: form });
  if (!res.ok) console.error('contact: webhook failed', res.status, (await res.text().catch(() => '')).slice(0, 300));
  return { ok: res.ok, status: res.status };
}

async function alertOwner(text) {
  if (!ALERT) return;
  try { await fetch(ALERT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'vinhx.info mail', allowed_mentions: { parse: [] }, content: ('⚠️ ' + text).slice(0, 1900) }) }); } catch (_) { /* nothing more to try */ }
}

// Try every configured channel in turn. A failure never loses the message while another channel works.
async function deliver(m, files) {
  const chain = [];
  if (WEBHOOK) chain.push(['Discord chính', (n) => viaWebhook(WEBHOOK, m, files, n), 'CONTACT_WEBHOOK_URL']);
  if (WEBHOOK2) chain.push(['Discord dự phòng', (n) => viaWebhook(WEBHOOK2, m, files, n), 'CONTACT_WEBHOOK_URL_2']);
  if (RESEND_KEY) chain.push(['Email (Resend)', (n) => viaResend(m, files, n), 'RESEND_API_KEY']);
  const failed = [];
  for (const [name, send, envName] of chain) {
    let r;
    try { r = await send(failed.length ? failed.join('; ') + '. Thư này được gửi bằng kênh dự phòng.' : ''); } catch (e) { r = { ok: false, status: 'mạng' }; }
    if (r.ok) {
      if (failed.length) await alertOwner(`${failed.join('; ')} (${new Date().toISOString()}). Thư vẫn được gửi qua ${name}.`);
      return { ok: true, via: name };
    }
    failed.push(`${name} lỗi (${r.status}) - kiểm tra biến ${envName} trên Vercel`);
  }
  console.error('contact: ALL DELIVERY FAILED', failed.join(' | '), '| from', m.email, '| subject', m.subject);
  await alertOwner(`Không gửi được thư của ${m.email} (“${m.subject.slice(0, 80)}”): ${failed.join('; ')}`);
  return { ok: false };
}

async function verifyTurnstile(token, ip) {
  if (!token || typeof token !== 'string' || token.length > 2048) return false;
  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 5000);
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', signal: ctl.signal,
      body: new URLSearchParams({ secret: TS_SECRET, response: token, remoteip: ip || '' })
    });
    clearTimeout(timer);
    const j = await r.json();
    return !!j.success;
  } catch (_) {
    console.error('contact: turnstile unreachable, letting the message through');
    return true; // Cloudflare itself being down must not lose a real message
  }
}

// cheap filter for the obvious ads (gambling, adult, loans) and link dumps; they get a fake "sent" so bots do not retry
const SPAM_RE = /(casino|nhà cái|cá cược|cá độ|tài xỉu|xổ số|bắn cá|slot ?game|sbobet|\b\d{2,3}bet\b|viet69|18\+|\bporn|\bsex\b|vay tiền|đăng ký ngay)/i;
const isSpam = (m) => SPAM_RE.test(m.subject + ' ' + m.message) || (m.message.match(/https?:\/\/|www\./gi) || []).length > 2;

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'GET') { // lets the page (and the owner) check whether attachments are set up
    return res.status(200).json({ configured: !!(RESEND_KEY || WEBHOOK || WEBHOOK2), provider: WEBHOOK ? 'discord-webhook' : RESEND_KEY ? 'resend' : null, turnstile: TS_SITE && TS_SECRET ? TS_SITE : null });
  }
  if (req.method !== 'POST') { res.setHeader('Allow', 'GET, POST'); return res.status(405).json({ error: 'method_not_allowed' }); }
  if (!RESEND_KEY && !WEBHOOK && !WEBHOOK2) return res.status(503).json({ error: 'not_configured' });

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

    if (TS_SITE && TS_SECRET && !(await verifyTurnstile(b.cf, clientIp(req)))) return res.status(400).json({ error: 'captcha' });

    const m = { email, subject, message };
    if (isSpam(m)) { console.error('contact: spam dropped from', email); return res.status(200).json({ ok: true }); }
    const r = await deliver(m, files);
    if (!r.ok) return res.status(502).json({ error: 'delivery_failed' });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('contact: error', err && err.message);
    return res.status(500).json({ error: 'server_error' });
  }
};
