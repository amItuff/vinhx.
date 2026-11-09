// Public-domain book proxy for /library.
// The browser cannot fetch these sites directly (no CORS), so this function fetches one EPUB from
// Project Gutenberg (?id=) or Standard Ebooks (?se=) and passes it through. Both URLs are built
// from fixed templates with validated parts, so this is not an open proxy.
// Responses are cached by Vercel's CDN, so each book is fetched from Gutenberg at most once.

const MAX_BYTES = 4 * 1024 * 1024; // Vercel serverless responses are limited to ~4.5 MB

module.exports = async (req, res) => {
  if (req.method !== 'GET') { res.statusCode = 405; res.setHeader('Allow', 'GET'); return res.end('Method Not Allowed'); }
  const q = req.query || {};
  let url;
  if (q.se) {
    // Standard Ebooks path such as "jane-austen/emma" or "leo-tolstoy/anna-karenina/constance-garnett"
    const path = String(q.se);
    if (!/^[a-z0-9-]+(\/[a-z0-9_-]+){1,2}$/.test(path)) { res.statusCode = 400; return res.end('Bad path'); }
    url = `https://standardebooks.org/ebooks/${path}/downloads/${path.split('/').join('_')}.epub`;
  } else {
    const id = String(q.id || '');
    if (!/^[1-9]\d{0,6}$/.test(id)) { res.statusCode = 400; return res.end('Bad id'); }
    url = `https://www.gutenberg.org/ebooks/${id}.epub.noimages`;
  }

  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 20000);
    const up = await fetch(url, {
      redirect: 'follow',
      signal: ctl.signal,
      headers: { 'User-Agent': 'vinhx-library/1.0 (+https://vinhx.info/library)' }
    });
    clearTimeout(timer);
    if (!up.ok) { res.statusCode = up.status === 404 ? 404 : 502; return res.end('Not available'); }
    const buf = Buffer.from(await up.arrayBuffer());
    if (buf.length > MAX_BYTES) { res.statusCode = 413; return res.end('Too large'); }
    if (buf.length < 4 || buf[0] !== 0x50 || buf[1] !== 0x4b) { res.statusCode = 502; return res.end('Unexpected response'); }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/epub+zip');
    res.setHeader('Content-Length', String(buf.length));
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=31536000, immutable');
    return res.end(buf);
  } catch (_) {
    res.statusCode = 504;
    return res.end('Upstream error');
  }
};
