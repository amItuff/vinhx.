// Public-domain book proxy for /library.
// The browser cannot fetch gutenberg.org directly (no CORS), so this function fetches one EPUB
// from Project Gutenberg and passes it through. It only ever requests
// https://www.gutenberg.org/ebooks/<id>.epub.noimages, so it is not an open proxy.
// Responses are cached by Vercel's CDN, so each book is fetched from Gutenberg at most once.

const MAX_BYTES = 4 * 1024 * 1024; // Vercel serverless responses are limited to ~4.5 MB

module.exports = async (req, res) => {
  if (req.method !== 'GET') { res.statusCode = 405; res.setHeader('Allow', 'GET'); return res.end('Method Not Allowed'); }
  const id = String((req.query && req.query.id) || '');
  if (!/^[1-9]\d{0,6}$/.test(id)) { res.statusCode = 400; return res.end('Bad id'); }

  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 20000);
    const up = await fetch(`https://www.gutenberg.org/ebooks/${id}.epub.noimages`, {
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
