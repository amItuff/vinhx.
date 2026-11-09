// vinhx.info/library
// A small reader that lives entirely in the browser. Books you add (EPUB or TXT) are parsed
// on your device and kept in IndexedDB; nothing is uploaded. No libraries: EPUB is a zip, which
// is read here with the browser's own DecompressionStream.

(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const root = document.documentElement;

  // ---------------------------------------------------------------------------
  // Language
  // ---------------------------------------------------------------------------
  const STRINGS = {
    vi: {
      kicker: 'Thư viện cá nhân',
      title: 'Đọc sách của bạn, nhớ tiến độ, nghe đọc thành tiếng',
      lead: 'Thêm file EPUB hoặc TXT bạn có quyền dùng. Sách nằm trong trình duyệt của bạn, không tải lên máy chủ.',
      'drop.title': 'Thả file vào đây hoặc bấm để chọn',
      'drop.sub': 'Hỗ trợ .epub và .txt (UTF-8)',
      empty: 'Thư viện đang trống. Hãy thêm sách miễn phí, sách tự viết hoặc sách đã hết thời hạn bản quyền.',
      'src.title': 'Nơi tìm sách miễn phí hợp pháp',
      'src.ws': 'tác phẩm đã hết bản quyền', 'src.pg': 'sách công cộng, tải EPUB', 'src.se': 'EPUB biên tập đẹp, miễn phí', 'src.ia': 'kho tư liệu lớn',
      'src.note': 'Sách còn bản quyền (như truyện của các nhà văn đương đại) hãy mua hoặc mượn từ nhà sách, thư viện.',
      f1: 'Không tải sách lên máy chủ, mọi thứ lưu trong trình duyệt của bạn',
      f2: 'Dọn dữ liệu trình duyệt sẽ xóa sách; hãy giữ file gốc hoặc dùng nút Tải về',
      f3: 'Nghe đọc dùng giọng có sẵn trên thiết bị, cần có giọng tiếng Việt',
      'b.read': 'Đọc', 'b.continue': 'Đọc tiếp', 'b.download': 'Tải về', 'b.delete': 'Xóa', 'b.confirm': 'Bấm lại để xóa',
      'b.chapters': 'chương', 'b.done': 'Đã đọc xong',
      'm.adding': 'Đang thêm', 'm.added': 'Đã thêm', 'm.badType': 'Chỉ nhận .epub và .txt', 'm.bad': 'Không đọc được file này', 'm.noZip': 'Trình duyệt này chưa hỗ trợ đọc EPUB. Hãy dùng Chrome, Edge hoặc Safari mới.',
      'm.empty': 'File không có nội dung đọc được', 'm.big': 'File quá lớn (tối đa 60 MB)', 'm.dup': 'Đã có trong thư viện', 'm.storage': 'Không lưu được, bộ nhớ trình duyệt đầy hoặc bị chặn',
      'r.back': 'Về thư viện', 'r.listen': 'Nghe đọc', 'r.mark': 'Đánh dấu', 'r.toc': 'Mục lục và đánh dấu', 'r.aa': 'Chữ và giao diện',
      'r.prev': 'Chương trước', 'r.next': 'Chương sau', 'r.chapter': 'Chương',
      'mark.added': 'Đã đánh dấu', 'mark.removed': 'Đã bỏ đánh dấu', 'mark.none': 'Chưa có đánh dấu nào. Bấm biểu tượng đánh dấu để lưu vị trí đang đọc.',
      's.chapters': 'Mục lục', 's.marks': 'Đánh dấu',
      'aa.size': 'Cỡ chữ', 'aa.lh': 'Giãn dòng', 'aa.theme': 'Nền', 'aa.dark': 'Tối', 'aa.sepia': 'Vàng', 'aa.light': 'Sáng', 'aa.font': 'Kiểu chữ', 'aa.sans': 'Không chân', 'aa.serif': 'Có chân',
      't.prev': 'Đoạn trước', 't.next': 'Đoạn sau', 't.play': 'Phát', 't.pause': 'Tạm dừng', 't.speed': 'Tốc độ', 't.voice': 'Giọng đọc',
      't.noVoice': 'Thiết bị chưa có giọng đọc. Trên Windows hãy thêm giọng tiếng Việt trong Cài đặt, trên điện thoại kiểm tra cài đặt chuyển văn bản thành giọng nói.',
      't.noVi': 'Chưa thấy giọng tiếng Việt, đang dùng giọng mặc định nên có thể đọc sai.',
      'ui.close': 'Đóng', 'ch.untitled': 'Phần',
      'cat.title': 'Kệ sách miễn phí',
      'cat.sub': 'Các tác phẩm đã hết bản quyền, lấy từ Project Gutenberg và Wikisource. Bấm Thêm vào kệ để đọc ngay trong trang này.',
      'cat.all': 'Tất cả', 'cat.add': 'Thêm vào kệ', 'cat.page': 'Trang sách', 'cat.wiki': 'Đọc trên Wikisource', 'cat.has': 'Đã có trên kệ',
      'cat.busy': 'Đang tải', 'cat.manual': 'Trình duyệt chặn tải trực tiếp nên đã mở trang tải EPUB. Tải xong hãy kéo file vào ô phía trên.',
      'cat.en': 'Sách tiếng Anh',
      'g.en': 'Văn học Anh – Mỹ', 'g.ru': 'Văn học Nga', 'g.fr': 'Văn học Pháp', 'g.eu': 'Văn học châu Âu', 'g.ancient': 'Cổ điển',
      'g.crime': 'Trinh thám & kinh dị', 'g.kids': 'Phiêu lưu & thiếu nhi', 'g.biz': 'Kinh tế & chứng khoán', 'g.phil': 'Triết học & khoa học', 'g.vi': 'Văn học Việt Nam'
    },
    en: {
      kicker: 'Personal library',
      title: 'Read your books, keep your place, listen out loud',
      lead: 'Add EPUB or TXT files you are allowed to use. Books stay in your browser and are never uploaded.',
      'drop.title': 'Drop files here or click to choose',
      'drop.sub': 'Supports .epub and .txt (UTF-8)',
      empty: 'Your library is empty. Add free books, your own writing or works whose copyright has expired.',
      'src.title': 'Where to find free, legal books',
      'src.ws': 'works out of copyright', 'src.pg': 'public domain books, EPUB downloads', 'src.se': 'carefully edited free EPUBs', 'src.ia': 'huge archive',
      'src.note': 'For books still in copyright, please buy or borrow them from a bookshop or library.',
      f1: 'Books are never uploaded; everything is stored in your browser',
      f2: 'Clearing browser data removes your books; keep the original file or use Download',
      f3: 'Listening uses the voices already on your device and needs a matching voice',
      'b.read': 'Read', 'b.continue': 'Continue', 'b.download': 'Download', 'b.delete': 'Delete', 'b.confirm': 'Click again to delete',
      'b.chapters': 'chapters', 'b.done': 'Finished',
      'm.adding': 'Adding', 'm.added': 'Added', 'm.badType': 'Only .epub and .txt are accepted', 'm.bad': 'This file could not be read', 'm.noZip': 'This browser cannot read EPUB yet. Use a recent Chrome, Edge or Safari.',
      'm.empty': 'The file has no readable text', 'm.big': 'File too large (60 MB max)', 'm.dup': 'Already in your library', 'm.storage': 'Could not save, browser storage is full or blocked',
      'r.back': 'Back to library', 'r.listen': 'Listen', 'r.mark': 'Bookmark', 'r.toc': 'Contents and bookmarks', 'r.aa': 'Text and theme',
      'r.prev': 'Previous chapter', 'r.next': 'Next chapter', 'r.chapter': 'Chapter',
      'mark.added': 'Bookmarked', 'mark.removed': 'Bookmark removed', 'mark.none': 'No bookmarks yet. Tap the bookmark icon to save where you are.',
      's.chapters': 'Contents', 's.marks': 'Bookmarks',
      'aa.size': 'Text size', 'aa.lh': 'Line spacing', 'aa.theme': 'Theme', 'aa.dark': 'Dark', 'aa.sepia': 'Sepia', 'aa.light': 'Light', 'aa.font': 'Typeface', 'aa.sans': 'Sans', 'aa.serif': 'Serif',
      't.prev': 'Previous paragraph', 't.next': 'Next paragraph', 't.play': 'Play', 't.pause': 'Pause', 't.speed': 'Speed', 't.voice': 'Voice',
      't.noVoice': 'This device has no speech voices. Add one in system settings (text-to-speech).',
      't.noVi': 'No Vietnamese voice found, using the default voice which may mispronounce.',
      'ui.close': 'Close', 'ch.untitled': 'Part',
      'cat.title': 'Free bookshelf',
      'cat.sub': 'Works whose copyright has expired, from Project Gutenberg and Wikisource. Tap Add to shelf to read right on this page.',
      'cat.all': 'All', 'cat.add': 'Add to shelf', 'cat.page': 'Book page', 'cat.wiki': 'Read on Wikisource', 'cat.has': 'On your shelf',
      'cat.busy': 'Downloading', 'cat.manual': 'Your browser blocked the direct download, so the EPUB page was opened. When it finishes, drop the file in the box above.',
      'cat.en': 'English text',
      'g.en': 'British & American', 'g.ru': 'Russian', 'g.fr': 'French', 'g.eu': 'Other European', 'g.ancient': 'Classics',
      'g.crime': 'Mystery & horror', 'g.kids': 'Adventure & young readers', 'g.biz': 'Economics & markets', 'g.phil': 'Philosophy & science', 'g.vi': 'Vietnamese literature'
    }
  };

  let lang;
  try { lang = localStorage.getItem('lang'); } catch (_) { lang = null; }
  if (!STRINGS[lang]) lang = (navigator.language || 'vi').toLowerCase().startsWith('vi') ? 'vi' : 'en';
  const t = (k) => STRINGS[lang][k] ?? STRINGS.vi[k] ?? k;

  function applyLang(next) {
    lang = STRINGS[next] ? next : 'vi';
    root.lang = lang;
    try { localStorage.setItem('lang', lang); } catch (_) {}
    document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-label]').forEach((el) => {
      const v = t(el.dataset.i18nLabel);
      el.setAttribute('aria-label', v);
      if (el.hasAttribute('title')) el.setAttribute('title', v);
    });
    document.querySelectorAll('.lang-toggle button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    renderShelf();
    renderCatalog();
    if (current) { renderChapterLabel(); renderSheets(); updateTtsUi(); }
  }
  document.querySelectorAll('.lang-toggle button').forEach((b) => b.addEventListener('click', () => applyLang(b.dataset.lang)));

  const toast = $('toast');
  let toastTimer;
  function showToast(text) {
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  // ---------------------------------------------------------------------------
  // Storage (IndexedDB)
  // ---------------------------------------------------------------------------
  let dbp = null;
  function db() {
    if (!dbp) {
      dbp = new Promise((resolve, reject) => {
        const req = indexedDB.open('vinhx-library', 1);
        req.onupgradeneeded = () => {
          const d = req.result;
          d.createObjectStore('books', { keyPath: 'id' });   // meta + parsed chapters
          d.createObjectStore('files');                       // original blobs
          d.createObjectStore('kv');                          // progress, bookmarks
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    }
    return dbp;
  }
  async function tx(store, mode, fn) {
    const d = await db();
    return new Promise((resolve, reject) => {
      const transaction = d.transaction(store, mode);
      const res = fn(transaction);
      transaction.oncomplete = () => resolve(res && res.result !== undefined ? res.result : undefined);
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error || new Error('abort'));
    });
  }
  const getOne = (store, key) => tx(store, 'readonly', (x) => x.objectStore(store).get(key));
  const putOne = (store, value, key) => tx(store, 'readwrite', (x) => (key === undefined ? x.objectStore(store).put(value) : x.objectStore(store).put(value, key)));
  const delOne = (store, key) => tx(store, 'readwrite', (x) => x.objectStore(store).delete(key));
  const allBooks = () => tx('books', 'readonly', (x) => x.objectStore('books').getAll());

  // ---------------------------------------------------------------------------
  // Parsers
  // ---------------------------------------------------------------------------
  const clean = (s) => s.replace(/\s+/g, ' ').trim();

  // --- zip reading with the built-in inflate ---
  async function inflateRaw(bytes) {
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }

  async function readZip(buffer) {
    if (typeof DecompressionStream === 'undefined') throw new Error('nozip');
    const u8 = new Uint8Array(buffer);
    const dv = new DataView(buffer);
    let eocd = -1;
    for (let i = u8.length - 22; i >= Math.max(0, u8.length - 65557); i--) {
      if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    }
    if (eocd < 0) throw new Error('badzip');
    const count = dv.getUint16(eocd + 10, true);
    let p = dv.getUint32(eocd + 16, true);
    const files = new Map();
    const dec = new TextDecoder();
    for (let n = 0; n < count; n++) {
      if (dv.getUint32(p, true) !== 0x02014b50) throw new Error('badzip');
      const method = dv.getUint16(p + 10, true);
      const csize = dv.getUint32(p + 20, true);
      const nlen = dv.getUint16(p + 28, true);
      const elen = dv.getUint16(p + 30, true);
      const clen = dv.getUint16(p + 32, true);
      const off = dv.getUint32(p + 42, true);
      const name = dec.decode(u8.subarray(p + 46, p + 46 + nlen));
      files.set(name, { method, csize, off });
      p += 46 + nlen + elen + clen;
    }
    return {
      has: (name) => files.has(name),
      async text(name) {
        const f = files.get(name);
        if (!f) throw new Error('missing ' + name);
        const nlen = dv.getUint16(f.off + 26, true);
        const elen = dv.getUint16(f.off + 28, true);
        const start = f.off + 30 + nlen + elen;
        const data = u8.subarray(start, start + f.csize);
        const out = f.method === 0 ? data : f.method === 8 ? await inflateRaw(data) : null;
        if (!out) throw new Error('method');
        return dec.decode(out);
      }
    };
  }

  const dirOf = (path) => (path.includes('/') ? path.slice(0, path.lastIndexOf('/') + 1) : '');
  function resolvePath(base, href) {
    const clean = decodeURIComponent(href.split('#')[0]);
    const parts = (base + clean).split('/');
    const out = [];
    for (const seg of parts) {
      if (seg === '..') out.pop();
      else if (seg && seg !== '.') out.push(seg);
    }
    return out.join('/');
  }

  const byLocal = (doc, name) => Array.from(doc.getElementsByTagName('*')).filter((e) => e.localName === name);

  // Turns an XHTML chapter into plain paragraphs. Images and styling are dropped on purpose to keep pages light.
  function htmlToBlocks(htmlText) {
    const doc = new DOMParser().parseFromString(htmlText, 'text/html');
    doc.querySelectorAll('script, style, nav, svg, img').forEach((n) => n.remove());
    const body = doc.body;
    if (!body) return [];
    const blocks = [];
    let title = '';
    const sel = 'h1,h2,h3,h4,h5,h6,p,li,blockquote,pre,dd,dt';
    body.querySelectorAll(sel).forEach((el) => {
      if (el.tagName === 'BLOCKQUOTE' && el.querySelector('p')) return; // its paragraphs are taken individually
      if (el.closest('li') && el.tagName !== 'LI') return;
      if ((el.tagName === 'LI') && el.querySelector('p')) return;
      const text = clean(el.textContent || '');
      if (!text) return;
      const heading = /^H[1-6]$/.test(el.tagName);
      if (heading && !title) title = text;
      blocks.push({ t: text, h: heading ? 1 : 0 });
    });
    if (!blocks.length) {
      (body.innerText || body.textContent || '').split(/\n{1,}/).forEach((line) => {
        const text = clean(line);
        if (text) blocks.push({ t: text, h: 0 });
      });
    }
    return { blocks, title };
  }

  async function parseEpub(buffer, fileName) {
    const zip = await readZip(buffer);
    const container = new DOMParser().parseFromString(await zip.text('META-INF/container.xml'), 'application/xml');
    const rootfile = byLocal(container, 'rootfile')[0];
    if (!rootfile) throw new Error('badepub');
    const opfPath = rootfile.getAttribute('full-path');
    const opf = new DOMParser().parseFromString(await zip.text(opfPath), 'application/xml');
    const base = dirOf(opfPath);

    const manifest = new Map();
    byLocal(opf, 'item').forEach((it) => manifest.set(it.getAttribute('id'), { href: it.getAttribute('href'), type: it.getAttribute('media-type') || '' }));
    const spine = byLocal(opf, 'itemref').map((r) => manifest.get(r.getAttribute('idref'))).filter(Boolean);

    const meta = (name) => { const e = byLocal(opf, name)[0]; return e ? clean(e.textContent) : ''; };
    const title = meta('title') || fileName.replace(/\.epub$/i, '');
    const author = meta('creator');

    const chapters = [];
    for (const item of spine) {
      if (!/html|xml/i.test(item.type)) continue;
      let text;
      try { text = await zip.text(resolvePath(base, item.href)); } catch (_) { continue; }
      const { blocks, title: ct } = htmlToBlocks(text);
      const chars = blocks.reduce((s, b) => s + b.t.length, 0);
      if (!blocks.length || chars < 40) continue; // covers, empty pages
      chapters.push({ title: ct || '', blocks });
    }
    return { title, author, chapters };
  }

  function parseTxt(text, fileName) {
    const lines = text.replace(/\r\n?/g, '\n').split('\n');
    const head = /^\s*(chương|chuong|chapter|phần|hồi|tập)\s+[\w\dIVXLC]+/i;
    const chapters = [];
    let cur = { title: '', blocks: [] };
    const flush = () => { if (cur.blocks.length) chapters.push(cur); };
    for (const raw of lines) {
      const line = clean(raw);
      if (!line) continue;
      if (head.test(line) && line.length < 90) {
        flush();
        cur = { title: line, blocks: [{ t: line, h: 1 }] };
        continue;
      }
      cur.blocks.push({ t: line, h: 0 });
    }
    flush();
    // no headings found: split into parts of about 8000 characters
    if (chapters.length <= 1) {
      const all = chapters.length ? chapters[0].blocks : [];
      chapters.length = 0;
      let part = { title: '', blocks: [] };
      let n = 0;
      let idx = 1;
      for (const b of all) {
        part.blocks.push(b);
        n += b.t.length;
        if (n >= 8000) { part.title = `${t('ch.untitled')} ${idx++}`; chapters.push(part); part = { title: '', blocks: [] }; n = 0; }
      }
      if (part.blocks.length) { part.title = `${t('ch.untitled')} ${idx}`; chapters.push(part); }
    }
    const firstLine = lines.map(clean).find(Boolean) || '';
    return { title: fileName.replace(/\.txt$/i, '') || firstLine.slice(0, 60), author: '', chapters };
  }

  function decodeText(buffer) {
    let text = new TextDecoder('utf-8').decode(buffer);
    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
    return text;
  }

  // ---------------------------------------------------------------------------
  // Shelf
  // ---------------------------------------------------------------------------
  // Free bookshelf: only works whose copyright has expired. id = Project Gutenberg ebook number
  // (cover and EPUB come from gutenberg.org); q = Vietnamese Wikisource search for Vietnamese works.
  const CATEGORIES = ['en', 'ru', 'fr', 'eu', 'ancient', 'crime', 'kids', 'biz', 'phil', 'vi'];
  const CATALOG = [
    { id: 1342, g: 'en', t: 'Pride and Prejudice', a: 'Jane Austen' },
    { id: 1260, g: 'en', t: 'Jane Eyre', a: 'Charlotte Brontë' },
    { id: 768, g: 'en', t: 'Wuthering Heights', a: 'Emily Brontë' },
    { id: 1400, g: 'en', t: 'Great Expectations', a: 'Charles Dickens' },
    { id: 2701, g: 'en', t: 'Moby-Dick', a: 'Herman Melville' },
    { id: 64317, g: 'en', t: 'The Great Gatsby', a: 'F. Scott Fitzgerald' },
    { id: 76, g: 'en', t: 'Adventures of Huckleberry Finn', a: 'Mark Twain' },
    { id: 1513, g: 'en', t: 'Romeo and Juliet', a: 'William Shakespeare' },
    { id: 1524, g: 'en', t: 'Hamlet', a: 'William Shakespeare' },
    { id: 174, g: 'en', t: 'The Picture of Dorian Gray', a: 'Oscar Wilde' },
    { id: 2554, g: 'ru', t: 'Crime and Punishment', v: 'Tội ác và hình phạt', a: 'Fyodor Dostoevsky' },
    { id: 28054, g: 'ru', t: 'The Brothers Karamazov', v: 'Anh em nhà Karamazov', a: 'Fyodor Dostoevsky' },
    { id: 2600, g: 'ru', t: 'War and Peace', v: 'Chiến tranh và hòa bình', a: 'Leo Tolstoy' },
    { id: 1399, g: 'ru', t: 'Anna Karenina', a: 'Leo Tolstoy' },
    { id: 135, g: 'fr', t: 'Les Misérables', v: 'Những người khốn khổ', a: 'Victor Hugo' },
    { id: 1184, g: 'fr', t: 'The Count of Monte Cristo', v: 'Bá tước Monte Cristo', a: 'Alexandre Dumas' },
    { id: 2413, g: 'fr', t: 'Madame Bovary', a: 'Gustave Flaubert' },
    { id: 19942, g: 'fr', t: 'Candide', a: 'Voltaire' },
    { id: 996, g: 'eu', t: 'Don Quixote', v: 'Don Quixote', a: 'Miguel de Cervantes' },
    { id: 5200, g: 'eu', t: 'Metamorphosis', v: 'Hóa thân', a: 'Franz Kafka' },
    { id: 8800, g: 'eu', t: 'The Divine Comedy', v: 'Thần khúc', a: 'Dante Alighieri' },
    { id: 1727, g: 'ancient', t: 'The Odyssey', v: 'Odyssey', a: 'Homer' },
    { id: 6130, g: 'ancient', t: 'The Iliad', v: 'Iliad', a: 'Homer' },
    { id: 1661, g: 'crime', t: 'The Adventures of Sherlock Holmes', v: 'Những cuộc phiêu lưu của Sherlock Holmes', a: 'Arthur Conan Doyle' },
    { id: 345, g: 'crime', t: 'Dracula', a: 'Bram Stoker' },
    { id: 84, g: 'crime', t: 'Frankenstein', a: 'Mary Shelley' },
    { id: 43, g: 'crime', t: 'Strange Case of Dr Jekyll and Mr Hyde', a: 'Robert Louis Stevenson' },
    { id: 11, g: 'kids', t: "Alice's Adventures in Wonderland", v: 'Alice ở xứ sở thần tiên', a: 'Lewis Carroll' },
    { id: 120, g: 'kids', t: 'Treasure Island', v: 'Đảo giấu vàng', a: 'Robert Louis Stevenson' },
    { id: 74, g: 'kids', t: 'The Adventures of Tom Sawyer', v: 'Những cuộc phiêu lưu của Tom Sawyer', a: 'Mark Twain' },
    { id: 37106, g: 'kids', t: 'Little Women', v: 'Những người phụ nữ nhỏ bé', a: 'Louisa May Alcott' },
    { id: 103, g: 'kids', t: 'Around the World in Eighty Days', v: 'Vòng quanh thế giới trong 80 ngày', a: 'Jules Verne' },
    { id: 1257, g: 'kids', t: 'The Three Musketeers', v: 'Ba chàng lính ngự lâm', a: 'Alexandre Dumas' },
    { id: 3300, g: 'biz', t: 'The Wealth of Nations', v: 'Của cải của các quốc gia', a: 'Adam Smith' },
    { id: 24518, g: 'biz', t: 'Extraordinary Popular Delusions and the Madness of Crowds', v: 'Ảo tưởng đám đông và cơn điên của đám đông', a: 'Charles Mackay' },
    { id: 132, g: 'phil', t: 'The Art of War', v: 'Binh pháp Tôn Tử', a: 'Sun Tzu' },
    { id: 1232, g: 'phil', t: 'The Prince', v: 'Quân vương', a: 'Niccolò Machiavelli' },
    { id: 2680, g: 'phil', t: 'Meditations', v: 'Suy tưởng', a: 'Marcus Aurelius' },
    { id: 1998, g: 'phil', t: 'Thus Spake Zarathustra', v: 'Zarathustra đã nói như thế', a: 'Friedrich Nietzsche' },
    { id: 2009, g: 'phil', t: 'On the Origin of Species', v: 'Nguồn gốc các loài', a: 'Charles Darwin' },
    { id: 205, g: 'phil', t: 'Walden', a: 'Henry David Thoreau' },
    { q: 'Truyện Kiều', g: 'vi', t: 'Truyện Kiều', a: 'Nguyễn Du' },
    { q: 'Chinh phụ ngâm', g: 'vi', t: 'Chinh phụ ngâm', a: 'Đặng Trần Côn' },
    { q: 'Số đỏ', g: 'vi', t: 'Số đỏ', a: 'Vũ Trọng Phụng' },
    { q: 'Tắt đèn', g: 'vi', t: 'Tắt đèn', a: 'Ngô Tất Tố' },
    { q: 'Chí Phèo', g: 'vi', t: 'Chí Phèo', a: 'Nam Cao' }
  ];
  let catFilter = 'all';

  function renderCatalog() {
    const tabs = $('cat-tabs');
    const grid = $('cat-grid');
    if (!tabs || !grid) return;
    tabs.textContent = '';
    ['all', ...CATEGORIES].forEach((k) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'ctab';
      b.textContent = k === 'all' ? t('cat.all') : t('g.' + k);
      b.setAttribute('aria-pressed', String(catFilter === k));
      b.addEventListener('click', () => { catFilter = k; renderCatalog(); });
      tabs.appendChild(b);
    });
    grid.textContent = '';
    const have = new Set(books.map((b) => b.fileName));
    CATALOG.filter((it) => catFilter === 'all' || it.g === catFilter).forEach((it) => {
      const li = document.createElement('li');
      li.className = 'citem';
      const hue = Array.from(it.t).reduce((s, c) => s + c.charCodeAt(0), 0) % 360;
      const cv = document.createElement('div');
      cv.className = 'ccover';
      cv.style.setProperty('--h', hue);
      const fallback = document.createElement('span');
      fallback.textContent = it.t;
      cv.appendChild(fallback);
      if (it.id) {
        const img = document.createElement('img');
        img.loading = 'lazy';
        img.decoding = 'async';
        img.alt = '';
        img.src = `https://www.gutenberg.org/cache/epub/${it.id}/pg${it.id}.cover.medium.jpg`;
        img.addEventListener('load', () => { fallback.hidden = true; });
        img.addEventListener('error', () => img.remove());
        cv.appendChild(img);
      }
      const title = document.createElement('h3');
      title.textContent = lang === 'vi' && it.v ? it.v : it.t;
      const sub = document.createElement('p');
      sub.className = 'cauthor';
      sub.textContent = it.a + (it.id ? ' · ' + t('cat.en') : '');
      const act = document.createElement('div');
      act.className = 'cact';
      if (it.id) {
        const add = document.createElement('button');
        add.type = 'button';
        add.className = 'btn primary';
        const fname = `pg${it.id}.epub`;
        if (have.has(fname)) { add.textContent = t('cat.has'); add.disabled = true; }
        else {
          add.textContent = t('cat.add');
          add.addEventListener('click', () => addFromCatalog(it, add));
        }
        const pg = document.createElement('a');
        pg.className = 'btn';
        pg.href = `https://www.gutenberg.org/ebooks/${it.id}`;
        pg.target = '_blank';
        pg.rel = 'noopener noreferrer';
        pg.textContent = t('cat.page');
        act.append(add, pg);
      } else {
        const w = document.createElement('a');
        w.className = 'btn primary';
        w.href = `https://vi.wikisource.org/w/index.php?search=${encodeURIComponent(it.q)}`;
        w.target = '_blank';
        w.rel = 'noopener noreferrer';
        w.textContent = t('cat.wiki');
        act.appendChild(w);
      }
      li.append(cv, title, sub, act);
      grid.appendChild(li);
    });
  }

  async function addFromCatalog(it, btn) {
    btn.disabled = true;
    btn.textContent = t('cat.busy') + '...';
    try {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 25000);
      const res = await fetch(`https://www.gutenberg.org/cache/epub/${it.id}/pg${it.id}-images-3.epub`, { signal: ctl.signal });
      clearTimeout(timer);
      if (!res.ok) throw new Error('http');
      const blob = await res.blob();
      await importFile(new File([blob], `pg${it.id}.epub`, { type: 'application/epub+zip' }));
      await loadShelf();
    } catch (_) {
      window.open(`https://www.gutenberg.org/ebooks/${it.id}.epub3.images`, '_blank', 'noopener');
      importMsg.textContent = t('cat.manual');
      btn.disabled = false;
      btn.textContent = t('cat.add');
    }
  }

  const MAX_BYTES = 60 * 1024 * 1024;
  let books = [];
  let progressMap = {};
  const importMsg = $('import-msg');

  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

  async function importFile(file) {
    const name = file.name || 'book';
    const isEpub = /\.epub$/i.test(name);
    const isTxt = /\.txt$/i.test(name);
    if (!isEpub && !isTxt) { importMsg.textContent = `${name}: ${t('m.badType')}`; return; }
    if (file.size > MAX_BYTES) { importMsg.textContent = `${name}: ${t('m.big')}`; return; }
    importMsg.textContent = `${t('m.adding')} ${name}...`;
    try {
      const buffer = await file.arrayBuffer();
      const parsed = isEpub ? await parseEpub(buffer, name) : parseTxt(decodeText(buffer), name);
      if (!parsed.chapters.length) { importMsg.textContent = `${name}: ${t('m.empty')}`; return; }
      parsed.chapters.forEach((c, i) => { if (!c.title) c.title = `${t('r.chapter')} ${i + 1}`; });
      const sig = `${parsed.title}|${parsed.chapters.length}|${file.size}`;
      if (books.some((b) => b.sig === sig)) { importMsg.textContent = `${parsed.title}: ${t('m.dup')}`; return; }
      const book = { id: uid(), sig, title: parsed.title, author: parsed.author, kind: isEpub ? 'epub' : 'txt', fileName: name, size: file.size, added: Date.now(), chapters: parsed.chapters };
      await putOne('books', book);
      await putOne('files', file, book.id);
      importMsg.textContent = `${t('m.added')}: ${parsed.title}`;
    } catch (e) {
      const m = e && e.message;
      importMsg.textContent = `${name}: ${m === 'nozip' ? t('m.noZip') : e && e.name === 'QuotaExceededError' ? t('m.storage') : t('m.bad')}`;
    }
  }

  async function addFiles(list) {
    for (const f of Array.from(list)) await importFile(f);
    await loadShelf();
  }

  async function loadShelf() {
    try { books = (await allBooks()).sort((a, b) => b.added - a.added); } catch (_) { books = []; }
    progressMap = {};
    for (const b of books) {
      try { progressMap[b.id] = (await getOne('kv', 'p:' + b.id)) || null; } catch (_) { progressMap[b.id] = null; }
    }
    renderShelf();
    renderCatalog();
  }

  function percentOf(book) {
    const p = progressMap[book.id];
    if (!p) return 0;
    return Math.min(100, Math.round(((p.ch + (p.frac || 0)) / book.chapters.length) * 100));
  }

  const armed = new Set();
  function renderShelf() {
    const list = $('books');
    list.textContent = '';
    $('empty').hidden = books.length > 0;
    books.forEach((b) => {
      const pct = percentOf(b);
      const li = document.createElement('li');
      li.className = 'book';

      const cover = document.createElement('div');
      cover.className = 'cover';
      cover.setAttribute('aria-hidden', 'true');
      const hue = Array.from(b.id).reduce((s, c) => s + c.charCodeAt(0), 0) % 360;
      cover.style.setProperty('--h', hue);
      cover.textContent = (b.title.match(/\p{L}/u) || ['?'])[0].toUpperCase();

      const info = document.createElement('div');
      info.className = 'binfo';
      const h = document.createElement('h3');
      h.textContent = b.title;
      const meta = document.createElement('p');
      meta.className = 'bmeta';
      meta.textContent = `${b.author ? b.author + ' · ' : ''}${b.chapters.length} ${t('b.chapters')} · ${b.kind.toUpperCase()}`;
      const bar = document.createElement('div');
      bar.className = 'bbar';
      const fill = document.createElement('i');
      fill.style.width = pct + '%';
      bar.appendChild(fill);
      const pl = document.createElement('span');
      pl.className = 'bpct';
      pl.textContent = pct >= 100 ? t('b.done') : pct + '%';
      info.append(h, meta, bar, pl);

      const act = document.createElement('div');
      act.className = 'bact';
      const read = document.createElement('button');
      read.type = 'button';
      read.className = 'btn primary';
      read.textContent = pct > 0 && pct < 100 ? t('b.continue') : t('b.read');
      read.addEventListener('click', () => openBook(b.id));
      const dl = document.createElement('button');
      dl.type = 'button';
      dl.className = 'btn';
      dl.textContent = t('b.download');
      dl.addEventListener('click', () => downloadBook(b));
      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'btn' + (armed.has(b.id) ? ' danger armed' : ' danger');
      del.textContent = armed.has(b.id) ? t('b.confirm') : t('b.delete');
      del.addEventListener('click', async () => {
        if (!armed.has(b.id)) {
          armed.add(b.id);
          renderShelf();
          setTimeout(() => { armed.delete(b.id); renderShelf(); }, 3500);
          return;
        }
        armed.delete(b.id);
        await Promise.all([delOne('books', b.id), delOne('files', b.id), delOne('kv', 'p:' + b.id), delOne('kv', 'm:' + b.id)]).catch(() => {});
        await loadShelf();
      });
      act.append(read, dl, del);

      li.append(cover, info, act);
      list.appendChild(li);
    });
  }

  async function downloadBook(b) {
    try {
      const blob = await getOne('files', b.id);
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = b.fileName || (b.title + '.' + b.kind);
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (_) { /* ignore */ }
  }

  const drop = $('drop');
  const input = $('file');
  input.addEventListener('change', () => { addFiles(input.files); input.value = ''; });
  drop.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } });
  ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', (e) => { if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files); });
  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => { if (!drop.contains(e.target)) e.preventDefault(); });

  // ---------------------------------------------------------------------------
  // Reader
  // ---------------------------------------------------------------------------
  const page = $('page');
  let current = null;       // book being read
  let chIdx = 0;
  let marks = [];
  let saveTimer = null;

  const prefs = { size: 18, lh: 1.7, theme: 'dark', font: 'sans', rate: 1, voice: '' };
  try { Object.assign(prefs, JSON.parse(localStorage.getItem('libPrefs') || '{}')); } catch (_) {}
  const savePrefs = () => { try { localStorage.setItem('libPrefs', JSON.stringify(prefs)); } catch (_) {} };

  function applyPrefs() {
    document.body.dataset.theme = prefs.theme;
    document.body.dataset.font = prefs.font;
    page.style.setProperty('--fs', prefs.size + 'px');
    page.style.setProperty('--lh', String(prefs.lh));
    $('aa-size').value = prefs.size; $('aa-size-val').textContent = prefs.size;
    $('aa-lh').value = prefs.lh; $('aa-lh-val').textContent = Number(prefs.lh).toFixed(1);
    document.querySelectorAll('#aa-theme button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.theme === prefs.theme)));
    document.querySelectorAll('#aa-font button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.font === prefs.font)));
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta && current) meta.content = { dark: '#0b0c10', sepia: '#f4ecd8', light: '#ffffff' }[prefs.theme];
  }

  function renderChapterLabel() {
    if (!current) return;
    $('r-title').textContent = current.title;
    $('r-chap').textContent = `${chIdx + 1}/${current.chapters.length} · ${current.chapters[chIdx].title}`;
    $('r-prev').disabled = chIdx === 0;
    $('r-next').disabled = chIdx === current.chapters.length - 1;
  }

  function renderChapter(idx, frac, focusPara) {
    stopSpeech(true);
    chIdx = Math.max(0, Math.min(current.chapters.length - 1, idx));
    const ch = current.chapters[chIdx];
    const frag = document.createDocumentFragment();
    ch.blocks.forEach((b, i) => {
      const el = document.createElement(b.h ? 'h2' : 'p');
      el.textContent = b.t;
      el.dataset.i = String(i);
      frag.appendChild(el);
    });
    page.textContent = '';
    page.appendChild(frag);
    renderChapterLabel();
    markBookmarked();
    requestAnimationFrame(() => {
      if (focusPara != null) {
        const el = page.querySelector(`[data-i="${focusPara}"]`);
        if (el) el.scrollIntoView({ block: 'start' });
      } else {
        const max = document.documentElement.scrollHeight - innerHeight;
        window.scrollTo(0, Math.max(0, (frac || 0) * max));
      }
      updateProgress();
    });
  }

  function scrollFrac() {
    const max = document.documentElement.scrollHeight - innerHeight;
    return max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
  }

  function updateProgress() {
    if (!current) return;
    const frac = scrollFrac();
    const total = ((chIdx + frac) / current.chapters.length) * 100;
    $('r-progress').firstElementChild.style.width = total.toFixed(1) + '%';
    $('r-pct').textContent = Math.round(total) + '%';
  }

  function saveProgress() {
    if (!current) return;
    const p = { ch: chIdx, frac: scrollFrac(), t: Date.now() };
    progressMap[current.id] = p;
    putOne('kv', p, 'p:' + current.id).catch(() => {});
  }
  function scheduleSave() { clearTimeout(saveTimer); saveTimer = setTimeout(saveProgress, 500); }

  window.addEventListener('scroll', () => { if (current) { updateProgress(); scheduleSave(); } }, { passive: true });
  window.addEventListener('pagehide', saveProgress);
  document.addEventListener('visibilitychange', () => { if (document.hidden) saveProgress(); });

  async function openBook(id) {
    const book = books.find((b) => b.id === id);
    if (!book) return;
    current = book;
    try { marks = (await getOne('kv', 'm:' + id)) || []; } catch (_) { marks = []; }
    const p = progressMap[id];
    document.body.dataset.view = 'read';
    $('shelf').hidden = true;
    $('reader').hidden = false;
    applyPrefs();
    renderChapter(p ? p.ch : 0, p ? p.frac : 0);
    renderSheets();
    history.replaceState(null, '', '#' + id);
    window.scrollTo(0, 0);
    if (p) requestAnimationFrame(() => requestAnimationFrame(() => { const max = document.documentElement.scrollHeight - innerHeight; window.scrollTo(0, (p.frac || 0) * max); updateProgress(); }));
  }

  function closeBook() {
    saveProgress();
    stopSpeech(true);
    $('tts').hidden = true;
    current = null;
    document.body.dataset.view = 'shelf';
    document.body.dataset.theme = 'dark';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = '#07080b';
    $('reader').hidden = true;
    $('shelf').hidden = false;
    history.replaceState(null, '', location.pathname);
    window.scrollTo(0, 0);
    renderShelf();
  }

  $('r-back').addEventListener('click', closeBook);
  $('r-prev').addEventListener('click', () => { saveProgress(); renderChapter(chIdx - 1, 0); window.scrollTo(0, 0); saveProgress(); });
  $('r-next').addEventListener('click', () => { saveProgress(); renderChapter(chIdx + 1, 0); window.scrollTo(0, 0); saveProgress(); });

  // first paragraph that is at least partly visible below the top bar
  function firstVisibleIndex() {
    const paras = page.children;
    const top = 60;
    for (let i = 0; i < paras.length; i++) {
      if (paras[i].getBoundingClientRect().bottom > top) return i;
    }
    return 0;
  }

  // --- bookmarks ---
  function markKey(m) { return m.ch + ':' + m.i; }
  function markBookmarked() {
    const on = marks.some((m) => m.ch === chIdx);
    $('r-mark').setAttribute('aria-pressed', String(on));
    page.querySelectorAll('.marked').forEach((e) => e.classList.remove('marked'));
    marks.filter((m) => m.ch === chIdx).forEach((m) => { const el = page.querySelector(`[data-i="${m.i}"]`); if (el) el.classList.add('marked'); });
  }
  function saveMarks() { putOne('kv', marks, 'm:' + current.id).catch(() => {}); }

  $('r-mark').addEventListener('click', () => {
    if (!current) return;
    const i = firstVisibleIndex();
    const key = chIdx + ':' + i;
    const at = marks.findIndex((m) => markKey(m) === key);
    if (at >= 0) { marks.splice(at, 1); showToast(t('mark.removed')); }
    else {
      const text = current.chapters[chIdx].blocks[i].t;
      marks.push({ ch: chIdx, i, s: text.slice(0, 80), t: Date.now() });
      showToast(t('mark.added'));
    }
    saveMarks();
    markBookmarked();
    renderSheets();
  });

  // --- sheets ---
  let openSheet = null;
  let opener = null;
  function showSheet(el) { opener = document.activeElement; openSheet = el; el.hidden = false; const f = el.querySelector('button, input'); if (f) f.focus({ preventScroll: true }); }
  function hideSheet() { if (!openSheet) return; openSheet.hidden = true; openSheet = null; if (opener && opener.focus) opener.focus({ preventScroll: true }); }
  document.querySelectorAll('.sheet [data-close]').forEach((el) => el.addEventListener('click', hideSheet));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideSheet(); });

  function renderSheets() {
    if (!current) return;
    const toc = $('toc-list');
    toc.textContent = '';
    current.chapters.forEach((c, i) => {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = c.title;
      if (i === chIdx) b.setAttribute('aria-current', 'true');
      b.addEventListener('click', () => { hideSheet(); saveProgress(); renderChapter(i, 0); window.scrollTo(0, 0); saveProgress(); });
      li.appendChild(b);
      toc.appendChild(li);
    });
    const ml = $('mark-list');
    ml.textContent = '';
    if (!marks.length) {
      const li = document.createElement('li');
      li.className = 'none';
      li.textContent = t('mark.none');
      ml.appendChild(li);
    }
    marks.slice().sort((a, b) => a.ch - b.ch || a.i - b.i).forEach((m) => {
      const li = document.createElement('li');
      li.className = 'mrow';
      const go = document.createElement('button');
      go.type = 'button';
      const head = document.createElement('b');
      head.textContent = current.chapters[m.ch] ? current.chapters[m.ch].title : '';
      const snip = document.createElement('span');
      snip.textContent = m.s;
      go.append(head, snip);
      go.addEventListener('click', () => { hideSheet(); saveProgress(); renderChapter(m.ch, null, m.i); saveProgress(); });
      const rm = document.createElement('button');
      rm.type = 'button';
      rm.className = 'icon-btn';
      rm.setAttribute('aria-label', t('b.delete'));
      rm.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
      rm.addEventListener('click', () => { marks = marks.filter((x) => x !== m); saveMarks(); markBookmarked(); renderSheets(); });
      li.append(go, rm);
      ml.appendChild(li);
    });
  }

  $('r-toc').addEventListener('click', () => { renderSheets(); showSheet($('sheet-toc')); });
  $('r-aa').addEventListener('click', () => showSheet($('sheet-aa')));
  document.querySelectorAll('#toc-tabs button').forEach((b) => b.addEventListener('click', () => {
    document.querySelectorAll('#toc-tabs button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    $('toc-list').hidden = b.dataset.tab !== 'chapters';
    $('mark-list').hidden = b.dataset.tab !== 'marks';
  }));

  $('aa-size').addEventListener('input', (e) => { prefs.size = Number(e.target.value); savePrefs(); applyPrefs(); });
  $('aa-lh').addEventListener('input', (e) => { prefs.lh = Number(e.target.value); savePrefs(); applyPrefs(); });
  document.querySelectorAll('#aa-theme button').forEach((b) => b.addEventListener('click', () => { prefs.theme = b.dataset.theme; savePrefs(); applyPrefs(); }));
  document.querySelectorAll('#aa-font button').forEach((b) => b.addEventListener('click', () => { prefs.font = b.dataset.font; savePrefs(); applyPrefs(); }));

  // ---------------------------------------------------------------------------
  // Listening (Web Speech API)
  // ---------------------------------------------------------------------------
  const synth = window.speechSynthesis;
  let voices = [];
  let speaking = false;
  let paraIdx = 0;
  let chunkIdx = 0;
  let runToken = 0;

  function loadVoices() {
    if (!synth) return;
    voices = synth.getVoices();
    const sel = $('t-voice');
    sel.textContent = '';
    const viFirst = voices.slice().sort((a, b) => Number(/^vi/i.test(b.lang)) - Number(/^vi/i.test(a.lang)));
    viFirst.forEach((v) => {
      const o = document.createElement('option');
      o.value = v.voiceURI;
      o.textContent = `${v.name} (${v.lang})`;
      sel.appendChild(o);
    });
    const saved = voices.find((v) => v.voiceURI === prefs.voice);
    const best = saved || viFirst.find((v) => /^vi/i.test(v.lang)) || viFirst[0];
    if (best) sel.value = best.voiceURI;
    const note = $('t-note');
    if (!voices.length) { note.hidden = false; note.textContent = t('t.noVoice'); }
    else if (!voices.some((v) => /^vi/i.test(v.lang))) { note.hidden = false; note.textContent = t('t.noVi'); }
    else note.hidden = true;
  }
  if (synth) {
    loadVoices();
    if (synth.addEventListener) synth.addEventListener('voiceschanged', loadVoices);
    else synth.onvoiceschanged = loadVoices;
  }

  function chunksOf(text) {
    const parts = text.match(/[^.!?…;:\n]+[.!?…;:]*\s*/g) || [text];
    const out = [];
    let buf = '';
    parts.forEach((p) => {
      if ((buf + p).length > 180 && buf) { out.push(buf.trim()); buf = p; } else buf += p;
    });
    if (buf.trim()) out.push(buf.trim());
    return out.length ? out : [text];
  }

  function updateTtsUi() {
    $('t-play-ic').innerHTML = speaking ? '<path d="M6 4h4v16H6zM14 4h4v16h-4z"/>' : '<path d="M7 4v16l13-8z"/>';
    const label = t(speaking ? 't.pause' : 't.play');
    $('t-play').setAttribute('aria-label', label);
    $('t-play').title = label;
    $('r-listen').setAttribute('aria-pressed', String(!$('tts').hidden));
    $('t-rate-val').textContent = Number(prefs.rate).toFixed(1) + '×';
    $('t-rate').value = prefs.rate;
  }

  function highlight(i) {
    page.querySelectorAll('.reading').forEach((e) => e.classList.remove('reading'));
    const el = page.querySelector(`[data-i="${i}"]`);
    if (!el) return;
    el.classList.add('reading');
    const r = el.getBoundingClientRect();
    if (r.top < 70 || r.bottom > innerHeight - 140) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  function speakCurrent() {
    if (!synth || !current) return;
    const token = ++runToken;
    synth.cancel();
    const blocks = current.chapters[chIdx].blocks;
    if (paraIdx >= blocks.length) { // chapter finished: continue with the next one
      if (chIdx + 1 < current.chapters.length) {
        renderChapter(chIdx + 1, 0);
        window.scrollTo(0, 0);
        saveProgress();
        paraIdx = 0;
        chunkIdx = 0;
        speaking = true;
        return speakCurrent();
      }
      speaking = false;
      updateTtsUi();
      return;
    }
    const chunks = chunksOf(blocks[paraIdx].t);
    if (chunkIdx >= chunks.length) { paraIdx++; chunkIdx = 0; return speakCurrent(); }

    highlight(paraIdx);
    const u = new SpeechSynthesisUtterance(chunks[chunkIdx]);
    const voice = voices.find((v) => v.voiceURI === $('t-voice').value);
    if (voice) { u.voice = voice; u.lang = voice.lang; } else u.lang = 'vi-VN';
    u.rate = Number(prefs.rate);
    u.onend = () => { if (token !== runToken || !speaking) return; chunkIdx++; speakCurrent(); };
    u.onerror = (e) => { if (token !== runToken) return; if (e.error === 'canceled' || e.error === 'interrupted') return; speaking = false; updateTtsUi(); };
    synth.speak(u);
    speaking = true;
    updateTtsUi();
  }

  function stopSpeech(silent) {
    runToken++;
    speaking = false;
    if (synth) synth.cancel();
    if (page) page.querySelectorAll('.reading').forEach((e) => e.classList.remove('reading'));
    if (!silent) updateTtsUi();
  }

  function startListening() {
    $('tts').hidden = false;
    if (!synth) { $('t-note').hidden = false; $('t-note').textContent = t('t.noVoice'); updateTtsUi(); return; }
    paraIdx = firstVisibleIndex();
    chunkIdx = 0;
    speaking = true;
    speakCurrent();
  }

  $('r-listen').addEventListener('click', () => {
    if ($('tts').hidden) startListening();
    else { stopSpeech(); $('tts').hidden = true; updateTtsUi(); }
  });
  $('t-close').addEventListener('click', () => { stopSpeech(); $('tts').hidden = true; updateTtsUi(); });
  $('t-play').addEventListener('click', () => {
    if (speaking) { stopSpeech(); } // stop keeps the paragraph position so play resumes there
    else { speaking = true; speakCurrent(); }
    updateTtsUi();
  });
  $('t-prev').addEventListener('click', () => { paraIdx = Math.max(0, paraIdx - 1); chunkIdx = 0; if (speaking) speakCurrent(); else highlight(paraIdx); });
  $('t-next').addEventListener('click', () => { paraIdx = Math.min(current.chapters[chIdx].blocks.length - 1, paraIdx + 1); chunkIdx = 0; if (speaking) speakCurrent(); else highlight(paraIdx); });
  $('t-rate').addEventListener('input', (e) => {
    prefs.rate = Number(e.target.value);
    savePrefs();
    updateTtsUi();
  });
  $('t-rate').addEventListener('change', () => { if (speaking) speakCurrent(); }); // apply the new speed from the current sentence
  $('t-voice').addEventListener('change', () => { prefs.voice = $('t-voice').value; savePrefs(); if (speaking) speakCurrent(); });

  // tap a paragraph while the listening bar is open to read from there
  page.addEventListener('click', (e) => {
    if ($('tts').hidden || !synth) return;
    const el = e.target.closest('[data-i]');
    if (!el) return;
    paraIdx = Number(el.dataset.i);
    chunkIdx = 0;
    speaking = true;
    speakCurrent();
  });

  document.addEventListener('keydown', (e) => {
    if (!current || openSheet) return;
    if (e.target.matches('input, select, textarea')) return;
    if (e.key === 'ArrowRight') $('r-next').click();
    else if (e.key === 'ArrowLeft') $('r-prev').click();
  });
  window.addEventListener('beforeunload', () => { if (synth) synth.cancel(); });

  // ---------------------------------------------------------------------------
  applyPrefs();
  applyLang(lang);
  updateTtsUi();
  loadShelf().then(() => {
    const id = location.hash.slice(1);
    if (id && books.some((b) => b.id === id)) openBook(id);
  });
})();
