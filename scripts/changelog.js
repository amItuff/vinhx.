// Builds changelog.json from git history for the "Recent updates" card.
// Runs as the Vercel build command. It must never fail the deploy: if git history is
// unavailable it leaves the committed changelog.json untouched.

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'changelog.json');
const KEEP = 12;

try {
  let existing = [];
  try { existing = JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch (_) { /* first run */ }

  // %x1e starts each commit; the header is hash, date, subject, body; --numstat lines follow.
  const out = execFileSync('git', ['log', '-n', '60', '--no-merges', '--numstat', '--format=%x1e%h%x1f%cI%x1f%s%x1f%b%x1f'], {
    cwd: path.join(__dirname, '..'), encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024
  });

  const SKIP = /^(changelog\.json|sitemap\.xml)$|\.gz$/; // generated files and book data would drown the real numbers
  const fresh = out.split('\x1e').filter(Boolean).map((chunk) => {
    const [hash, date, raw, body, stat] = chunk.split('\x1f');
    // Commit subjects may carry a Vietnamese version after " | ": "English text | Tiếng Việt"
    const [subject, vi] = (raw || '').split(' | ').map((x) => x.trim());
    // Optional description: first non-empty body line, also "English | Tiếng Việt"
    const bodyLine = (body || '').split('\n').map((x) => x.trim()).find((x) => x && !/^(Co-Authored-By|Claude-Session):/i.test(x)) || '';
    const [desc, descVi] = bodyLine.split(' | ').map((x) => x.trim());
    let add = 0, del = 0, top = '', topN = -1, files = 0;
    (stat || '').split('\n').forEach((l) => {
      const m = /^(\d+)\t(\d+)\t(.+)$/.exec(l.trim());
      if (!m || SKIP.test(m[3].split('/').pop())) return;
      files++; add += +m[1]; del += +m[2];
      if (+m[1] + +m[2] > topN) { topN = +m[1] + +m[2]; top = m[3]; }
    });
    const old = existing.find((e) => e && e.hash === (hash || '').trim()) || {};
    return {
      hash: (hash || '').trim(), date, subject, vi: vi || old.vi || '',
      desc: desc || old.desc || '', descVi: descVi || old.descVi || '',
      add, del, files, top: top.split('/').pop()
    };
  }).filter((c) => c.hash && c.date && c.subject);

  const seen = new Set();
  const merged = [...fresh, ...existing].filter((c) => {
    if (!c || !c.hash || seen.has(c.hash)) return false;
    seen.add(c.hash);
    return true;
  }).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, KEEP);

  if (merged.length) fs.writeFileSync(FILE, JSON.stringify(merged, null, 2) + '\n');
  console.log(`changelog: ${merged.length} entries`);
} catch (err) {
  console.log('changelog: skipped (' + (err && err.message ? err.message.split('\n')[0] : 'error') + ')');
}

// Keeps <lastmod> in sitemap.xml equal to the last commit that touched each page's files.
try {
  const root = path.join(__dirname, '..');
  const SITEMAP = path.join(root, 'sitemap.xml');
  const PAGES = {
    'https://vinhx.info/': ['index.html', 'style.css', 'script.js'],
    'https://vinhx.info/convert': ['convert'],
    'https://vinhx.info/library': ['library/index.html', 'library/library.js', 'library/library.css', 'library/books']
  };
  let xml = fs.readFileSync(SITEMAP, 'utf8');
  let changed = 0;
  for (const [loc, paths] of Object.entries(PAGES)) {
    const day = execFileSync('git', ['log', '-1', '--format=%cs', '--', ...paths], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) continue;
    const re = new RegExp('(<loc>' + loc.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&') + '</loc>\\s*<lastmod>)[^<]*(</lastmod>)');
    const next = xml.replace(re, '$1' + day + '$2');
    if (next !== xml) { xml = next; changed++; }
  }
  if (changed) fs.writeFileSync(SITEMAP, xml);
  console.log(`sitemap: ${changed} lastmod updated`);
} catch (err) {
  console.log('sitemap: skipped (' + (err && err.message ? err.message.split('\n')[0] : 'error') + ')');
}
