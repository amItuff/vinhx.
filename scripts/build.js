// Vercel build: regenerate changelog.json, then write a minified + obfuscated copy of the site to dist/.
// The source files in the repo stay readable; only the files served to visitors are scrambled.
// (Obfuscation only makes the code harder to read. Nothing secret may live in the browser code:
//  keys and webhook URLs stay in environment variables and are used only by api/*.js.)
//
//   node scripts/build.js            -> build dist/
//   node scripts/build.js --no-obf   -> minify only (handy for debugging a build)

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'dist');
const NO_OBF = process.argv.includes('--no-obf');

try { execFileSync('node', [path.join(__dirname, 'changelog.js')], { cwd: ROOT, stdio: 'inherit' }); } catch (_) { /* never fail the deploy */ }

const SKIP = new Set(['node_modules', '.git', '.vercel', 'dist', 'api', 'scripts', 'package.json', 'package-lock.json', 'vercel.json', '.gitignore', '.vercelignore', 'README.md']);
const JS_FILES = new Set(['script.js', 'convert/convert.js', 'library/library.js', 'library/covers.js', 'note/note.js', 'note/qr.js']);

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
(function copy(dir) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.relative(ROOT, path.join(dir, name.name));
    if (dir === ROOT && SKIP.has(name.name)) continue;
    if (name.isDirectory()) { fs.mkdirSync(path.join(OUT, rel), { recursive: true }); copy(path.join(dir, name.name)); }
    else fs.copyFileSync(path.join(ROOT, rel), path.join(OUT, rel));
  }
})(ROOT);

// If the build tools are missing the site is still copied to dist/, just not minified.
let JavaScriptObfuscator, CleanCSS, minifyHtml;
try {
  JavaScriptObfuscator = require('javascript-obfuscator');
  CleanCSS = require('clean-css');
  ({ minify: minifyHtml } = require('html-minifier-terser'));
} catch (e) {
  console.warn('build: minify tools not installed, shipping readable files:', e.message);
  process.exit(0);
}

const OBF = {
  compact: true, simplify: true, target: 'browser',
  identifierNamesGenerator: 'hexadecimal', renameGlobals: true,
  stringArray: true, stringArrayThreshold: 0.8, stringArrayEncoding: ['base64'], stringArrayWrappersCount: 2,
  rotateStringArray: true, shuffleStringArray: true, splitStrings: false,
  controlFlowFlattening: false, deadCodeInjection: false, selfDefending: false, debugProtection: false,
  transformObjectKeys: false, unicodeEscapeSequence: false, sourceMap: false
};

(async () => {
  let n = 0;
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      const rel = path.relative(OUT, full).split(path.sep).join('/');
      if (e.isDirectory()) { if (rel !== 'library/books') walk(full); continue; }
      if (JS_FILES.has(rel)) {
        const src = fs.readFileSync(full, 'utf8');
        fs.writeFileSync(full, NO_OBF ? src : JavaScriptObfuscator.obfuscate(src, OBF).getObfuscatedCode());
        n++;
      } else if (rel.endsWith('.css')) {
        const out = new CleanCSS({ level: 1 }).minify(fs.readFileSync(full, 'utf8'));
        if (!out.errors.length) { fs.writeFileSync(full, out.styles); n++; }
      }
    }
  })(OUT);
  for (const f of fs.readdirSync(OUT, { recursive: true })) {
    if (!String(f).endsWith('.html') || String(f).startsWith('library/books')) continue;
    const full = path.join(OUT, String(f));
    try {
      fs.writeFileSync(full, await minifyHtml(fs.readFileSync(full, 'utf8'), { collapseWhitespace: true, conservativeCollapse: true, removeComments: true, minifyCSS: false, minifyJS: false }));
      n++;
    } catch (e) { console.warn('html minify skipped for', f, e.message); }
  }
  console.log(`build: ${n} files processed -> dist/`);
})();
