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

  const out = execFileSync('git', ['log', '-n', '40', '--no-merges', '--format=%h%x1f%cI%x1f%s'], {
    cwd: path.join(__dirname, '..'), encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']
  });

  const fresh = out.split('\n').filter(Boolean).map((line) => {
    const [hash, date, raw] = line.split('\x1f');
    // Commit subjects may carry a Vietnamese version after " | ": "English text | Tiếng Việt"
    const [subject, vi] = (raw || '').split(' | ').map((x) => x.trim());
    const old = existing.find((e) => e && e.hash === hash);
    return { hash, date, subject, vi: vi || (old && old.vi) || '' };
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
