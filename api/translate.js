// Batch translation for the library reader (English/other -> Vietnamese).
// POST { sl: "en", texts: ["...", "..."] }  ->  { texts: ["...", "..."] }
// Uses Google's public web translate endpoint, which is unofficial and can change or throttle;
// the reader falls back to the browser's own translator when this answers an error.

const { over } = require('./_limit');

const MAX_TEXTS = 30;
const MAX_CHARS = 4500;       // per text
const MAX_TOTAL = 40000;      // per request
const SL_RE = /^[a-z]{2,3}(-[A-Za-z]{2,4})?$/;

async function one(sl, text) {
  const body = new URLSearchParams({ q: text });
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(sl)}&tl=vi&dt=t&dj=0`;
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 8000);
  try {
    const r = await fetch(url, { method: 'POST', body, signal: ctl.signal, headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'Mozilla/5.0' } });
    if (!r.ok) throw new Error('upstream ' + r.status);
    const j = await r.json();
    return (j[0] || []).map((s) => s[0] || '').join('');
  } finally { clearTimeout(timer); }
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.statusCode = 405; res.setHeader('Allow', 'POST'); return res.end('Method Not Allowed'); }
  let data = req.body;
  if (typeof data === 'string') { try { data = JSON.parse(data); } catch (_) { data = null; } }
  const sl = data && String(data.sl || 'en');
  const texts = data && data.texts;
  if (!SL_RE.test(sl || '') || !Array.isArray(texts) || !texts.length || texts.length > MAX_TEXTS || texts.some((t) => typeof t !== 'string' || !t.trim() || t.length > MAX_CHARS)) {
    res.statusCode = 400; return res.end('Bad request');
  }
  if (texts.reduce((n, t) => n + t.length, 0) > MAX_TOTAL) { res.statusCode = 413; return res.end('Too large'); }
  if (await over(req, 'tr', 90, 60)) { res.statusCode = 429; return res.end('Too many requests'); }

  try {
    const out = new Array(texts.length);
    let next = 0;
    const worker = async () => { while (next < texts.length) { const i = next++; out[i] = await one(sl, texts[i]); } };
    await Promise.all(Array.from({ length: Math.min(8, texts.length) }, worker));
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify({ texts: out }));
  } catch (_) {
    res.statusCode = 502;
    return res.end('Translate failed');
  }
};
