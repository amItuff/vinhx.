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
      lead: 'Đọc sách miễn phí ngay trong web: nhớ tiến độ, đánh dấu, dịch tiếng Việt và nghe đọc.',
      'src.title': 'Nguồn thư viện', 'src.books': 'sách', 'src.pg': 'Kho sách công cộng quốc tế, bản EPUB tiếng Anh', 'src.gh': 'Bản sao Gutenberg trên GitHub, nơi web lấy và chia chương sẵn', 'src.ws': 'Thư viện mở tiếng Việt, đọc trên Wikisource',
      'src.note': 'Chỉ gồm tác phẩm đã hết bản quyền.',
      f1: 'Sách đã mở được lưu trong trình duyệt của bạn',
      f2: 'Nghe đọc dùng giọng có sẵn trên thiết bị',
      'b.read': 'Đọc', 'b.continue': 'Đọc tiếp', 'b.download': 'Tải về', 'b.delete': 'Xóa', 'b.confirm': 'Bấm lại để xóa',
      'b.chapters': 'chương', 'b.done': 'Đã đọc xong',
      'm.adding': 'Đang thêm', 'm.added': 'Đã thêm', 'm.badType': 'Chỉ nhận .epub và .txt', 'm.bad': 'Không đọc được file này', 'm.noZip': 'Trình duyệt này chưa hỗ trợ đọc EPUB. Hãy dùng Chrome, Edge hoặc Safari mới.',
      'm.empty': 'File không có nội dung đọc được', 'm.big': 'File quá lớn (tối đa 60 MB)', 'm.dup': 'Đã có trong thư viện', 'm.storage': 'Không lưu được, bộ nhớ trình duyệt đầy hoặc bị chặn',
      'r.back': 'Về thư viện', 'r.listen': 'Nghe đọc', 'r.mark': 'Đánh dấu', 'r.toc': 'Mục lục và đánh dấu', 'r.aa': 'Chữ và giao diện',
      'r.prev': 'Chương trước', 'r.next': 'Chương sau', 'r.chapter': 'Chương',
      'mark.added': 'Đã đánh dấu', 'mark.removed': 'Đã bỏ đánh dấu', 'mark.none': 'Chưa có đánh dấu nào. Bấm biểu tượng đánh dấu để lưu vị trí đang đọc.',
      's.chapters': 'Mục lục', 's.marks': 'Đánh dấu',
      'aa.size': 'Cỡ chữ', 'aa.lh': 'Giãn dòng', 'aa.theme': 'Nền', 'aa.book': 'Sách', 'aa.dark': 'Tối', 'aa.sepia': 'Vàng', 'aa.light': 'Sáng', 'aa.font': 'Kiểu chữ', 'aa.sans': 'Không chân', 'aa.serif': 'Có chân',
      't.prev': 'Đoạn trước', 't.next': 'Đoạn sau', 't.play': 'Phát', 't.pause': 'Tạm dừng', 't.speed': 'Tốc độ', 't.voice': 'Giọng đọc', 't.vol': 'Âm lượng', 't.mode': 'Phạm vi đọc', 't.mpara': 'Một đoạn', 't.mchap': 'Hết chương', 't.mbook': 'Cả sách', 'ch.n': 'chương',
      't.noVoice': 'Thiết bị chưa có giọng đọc. Trên Windows hãy thêm giọng tiếng Việt trong Cài đặt, trên điện thoại kiểm tra cài đặt chuyển văn bản thành giọng nói.',
      't.noVi': 'Máy chưa có giọng tiếng Việt. Trên Windows: Cài đặt > Thời gian và ngôn ngữ > Giọng nói; trên Android: cài Google Text-to-speech.', 't.noEn': 'Máy chưa có giọng tiếng Anh.', 't.using': 'Đang dùng', 't.vi': 'Giọng Việt', 't.en': 'Giọng Anh',
      'ui.close': 'Đóng', 'ch.untitled': 'Phần',
      'cat.title': 'Kệ sách miễn phí',
      'cat.sub': 'Tác phẩm đã hết bản quyền. Bấm Đọc ngay để mở và đọc ngay trong trang, số chương theo bản gốc.',
      'cat.all': 'Tất cả', 'cat.wiki': 'Đọc trên Wikisource',
      'cat.busy': 'Đang tải', 'cat.read': 'Đọc ngay', 'cat.cont': 'Đọc tiếp', 'cat.more': 'Xem thêm', 'cat.fail': 'Chưa tải được sách này, hãy thử lại sau.',
      'tr.on': 'Dịch sang tiếng Việt', 'tr.off': 'Hiện bản gốc', 'tr.none': 'Trình duyệt này chưa có dịch tích hợp. Hãy dùng Chrome hoặc Edge mới, hoặc nhấp chuột phải rồi chọn Dịch sang tiếng Việt.', 'tr.busy': 'Đang dịch', 'tr.fail': 'Chưa dịch được, hãy thử lại.', 'tr.dl': 'Đang tải gói dịch, lần đầu có thể hơi lâu',
      'g.en': 'Văn học Anh – Mỹ', 'g.ru': 'Văn học Nga', 'g.fr': 'Văn học Pháp', 'g.eu': 'Thế giới khác', 'g.ancient': 'Cổ điển',
      'g.crime': 'Trinh thám & kinh dị', 'g.kids': 'Phiêu lưu & thiếu nhi', 'g.biz': 'Kinh tế & chứng khoán', 'g.phil': 'Triết học & khoa học', 'g.vi': 'Văn học Việt Nam'
    },
    en: {
      kicker: 'Personal library',
      title: 'Read your books, keep your place, listen out loud',
      lead: 'Read free books right on the web: keeps your place, bookmarks, Vietnamese translation and read-aloud.',
      'src.title': 'Library sources', 'src.books': 'books', 'src.pg': 'International public-domain library, English EPUBs', 'src.gh': 'Gutenberg mirror on GitHub; the site takes the text from here and splits chapters ahead of time', 'src.ws': 'Open Vietnamese library, read on Wikisource',
      'src.note': 'Only works whose copyright has expired.',
      f1: 'Books you open are stored in your browser',
      f2: 'Listening uses the voices already on your device',
      'b.read': 'Read', 'b.continue': 'Continue', 'b.download': 'Download', 'b.delete': 'Delete', 'b.confirm': 'Click again to delete',
      'b.chapters': 'chapters', 'b.done': 'Finished',
      'm.adding': 'Adding', 'm.added': 'Added', 'm.badType': 'Only .epub and .txt are accepted', 'm.bad': 'This file could not be read', 'm.noZip': 'This browser cannot read EPUB yet. Use a recent Chrome, Edge or Safari.',
      'm.empty': 'The file has no readable text', 'm.big': 'File too large (60 MB max)', 'm.dup': 'Already in your library', 'm.storage': 'Could not save, browser storage is full or blocked',
      'r.back': 'Back to library', 'r.listen': 'Listen', 'r.mark': 'Bookmark', 'r.toc': 'Contents and bookmarks', 'r.aa': 'Text and theme',
      'r.prev': 'Previous chapter', 'r.next': 'Next chapter', 'r.chapter': 'Chapter',
      'mark.added': 'Bookmarked', 'mark.removed': 'Bookmark removed', 'mark.none': 'No bookmarks yet. Tap the bookmark icon to save where you are.',
      's.chapters': 'Contents', 's.marks': 'Bookmarks',
      'aa.size': 'Text size', 'aa.lh': 'Line spacing', 'aa.theme': 'Theme', 'aa.book': 'Book', 'aa.dark': 'Dark', 'aa.sepia': 'Sepia', 'aa.light': 'Light', 'aa.font': 'Typeface', 'aa.sans': 'Sans', 'aa.serif': 'Serif',
      't.prev': 'Previous paragraph', 't.next': 'Next paragraph', 't.play': 'Play', 't.pause': 'Pause', 't.speed': 'Speed', 't.voice': 'Voice', 't.vol': 'Volume', 't.mode': 'Read range', 't.mpara': 'One paragraph', 't.mchap': 'To chapter end', 't.mbook': 'Whole book', 'ch.n': 'chapters',
      't.noVoice': 'This device has no speech voices. Add one in system settings (text-to-speech).',
      't.noVi': 'No Vietnamese voice on this device. Add one in your system speech settings.', 't.noEn': 'No English voice on this device.', 't.using': 'Using', 't.vi': 'Vietnamese voice', 't.en': 'English voice',
      'ui.close': 'Close', 'ch.untitled': 'Part',
      'cat.title': 'Free bookshelf',
      'cat.sub': 'Works out of copyright. Tap Read now to open it here; chapters follow the original.',
      'cat.all': 'All', 'cat.wiki': 'Read on Wikisource',
      'cat.busy': 'Loading', 'cat.read': 'Read now', 'cat.cont': 'Continue', 'cat.more': 'Show more', 'cat.fail': 'Could not load this book right now, please try again later.',
      'tr.on': 'Translate to Vietnamese', 'tr.off': 'Show original', 'tr.none': 'This browser has no built-in translation. Use a recent Chrome or Edge, or right-click and choose Translate.', 'tr.busy': 'Translating', 'tr.fail': 'Could not translate, please try again.', 'tr.dl': 'Downloading the translation pack, the first time can take a moment',
      'g.en': 'British & American', 'g.ru': 'Russian', 'g.fr': 'French', 'g.eu': 'Rest of the world', 'g.ancient': 'Classics',
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
    renderSources();
    updateTransUi();
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
      if (/(^|\/)(titlepage|halftitlepage|imprint|colophon|uncopyright|toc|cover)\.x?html$/i.test(item.href)) continue;
      let text;
      try { text = await zip.text(resolvePath(base, item.href)); } catch (_) { continue; }
      const { blocks, title: ct } = htmlToBlocks(text);
      const chars = blocks.reduce((s, b) => s + b.t.length, 0);
      if (!blocks.length || chars < 40) continue; // covers, empty pages
      chapters.push({ title: ct || '', blocks });
    }
    return { title, author, lang: meta('language').slice(0, 2).toLowerCase(), chapters };
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
    // g = category, id = Project Gutenberg number (text prepared in /books/<id>.json.gz), q = Wikisource search
    { id: 1342, g: 'en', t: 'Pride and Prejudice', v: 'Kiêu hãnh và định kiến', a: 'Jane Austen' },
    { id: 158, g: 'en', t: 'Emma', a: 'Jane Austen' },
    { id: 161, g: 'en', t: 'Sense and Sensibility', v: 'Lý trí và tình cảm', a: 'Jane Austen' },
    { id: 105, g: 'en', t: 'Persuasion', a: 'Jane Austen' },
    { id: 1260, g: 'en', t: 'Jane Eyre', a: 'Charlotte Brontë' },
    { id: 768, g: 'en', t: 'Wuthering Heights', v: 'Đồi gió hú', a: 'Emily Brontë' },
    { id: 1400, g: 'en', t: 'Great Expectations', v: 'Những kỳ vọng lớn lao', a: 'Charles Dickens' },
    { id: 98, g: 'en', t: 'A Tale of Two Cities', v: 'Chuyện hai thành phố', a: 'Charles Dickens' },
    { id: 730, g: 'en', t: 'Oliver Twist', a: 'Charles Dickens' },
    { id: 46, g: 'en', t: 'A Christmas Carol', v: 'Bài ca Giáng sinh', a: 'Charles Dickens' },
    { id: 110, g: 'en', t: "Tess of the d'Urbervilles", a: 'Thomas Hardy' },
    { id: 145, g: 'en', t: 'Middlemarch', a: 'George Eliot' },
    { id: 2701, g: 'en', t: 'Moby-Dick', v: 'Cá voi trắng', a: 'Herman Melville' },
    { id: 25344, g: 'en', t: 'The Scarlet Letter', v: 'Chữ A đỏ', a: 'Nathaniel Hawthorne' },
    { id: 64317, g: 'en', t: 'The Great Gatsby', v: 'Gatsby vĩ đại', a: 'F. Scott Fitzgerald' },
    { id: 76, g: 'en', t: 'Adventures of Huckleberry Finn', a: 'Mark Twain' },
    { id: 215, g: 'en', t: 'The Call of the Wild', v: 'Tiếng gọi nơi hoang dã', a: 'Jack London' },
    { id: 1513, g: 'en', t: 'Romeo and Juliet', v: 'Romeo và Juliet', a: 'William Shakespeare' },
    { id: 174, g: 'en', t: 'The Picture of Dorian Gray', v: 'Bức chân dung của Dorian Gray', a: 'Oscar Wilde' },
    { id: 844, g: 'en', t: 'The Importance of Being Earnest', a: 'Oscar Wilde' },
    { id: 1952, g: 'en', t: 'The Yellow Wallpaper', a: 'Charlotte Perkins Gilman' },
    { id: 219, g: 'en', t: 'Heart of Darkness', v: 'Trái tim bóng tối', a: 'Joseph Conrad' },
    { id: 2554, g: 'ru', t: 'Crime and Punishment', v: 'Tội ác và hình phạt', a: 'Fyodor Dostoevsky' },
    { id: 28054, g: 'ru', t: 'The Brothers Karamazov', v: 'Anh em nhà Karamazov', a: 'Fyodor Dostoevsky' },
    { id: 600, g: 'ru', t: 'Notes from Underground', v: 'Ghi chép từ căn hầm', a: 'Fyodor Dostoevsky' },
    { id: 36034, g: 'ru', t: 'White Nights, and Other Stories', v: 'Đêm trắng', a: 'Fyodor Dostoevsky' },
    { id: 2600, g: 'ru', t: 'War and Peace', v: 'Chiến tranh và hòa bình', a: 'Leo Tolstoy' },
    { id: 1399, g: 'ru', t: 'Anna Karenina', a: 'Leo Tolstoy' },
    { id: 135, g: 'fr', t: 'Les Misérables', v: 'Những người khốn khổ', a: 'Victor Hugo' },
    { id: 1184, g: 'fr', t: 'The Count of Monte Cristo', v: 'Bá tước Monte Cristo', a: 'Alexandre Dumas' },
    { id: 1259, g: 'fr', t: 'Twenty Years After', v: 'Hai mươi năm sau', a: 'Alexandre Dumas' },
    { id: 996, g: 'eu', t: 'Don Quixote', a: 'Miguel de Cervantes' },
    { id: 5200, g: 'eu', t: 'Metamorphosis', v: 'Hóa thân', a: 'Franz Kafka' },
    { id: 2542, g: 'eu', t: "A Doll's House", v: 'Nhà búp bê', a: 'Henrik Ibsen' },
    { id: 2814, g: 'eu', t: 'Dubliners', a: 'James Joyce' },
    { id: 4300, g: 'eu', t: 'Ulysses', a: 'James Joyce' },
    { id: 24264, g: 'eu', t: '紅樓夢', v: 'Hồng lâu mộng (bản chữ Hán)', a: 'Tào Tuyết Cần' },
    { id: 1727, g: 'ancient', t: 'The Odyssey', v: 'Odyssey', a: 'Homer' },
    { id: 1497, g: 'ancient', t: 'The Republic', v: 'Nhà nước (Cộng hòa)', a: 'Plato' },
    { id: 16328, g: 'ancient', t: 'Beowulf', a: 'Anglo-Saxon epic' },
    { id: 1661, g: 'crime', t: 'The Adventures of Sherlock Holmes', v: 'Sherlock Holmes: Những cuộc phiêu lưu', a: 'Arthur Conan Doyle' },
    { id: 244, g: 'crime', t: 'A Study in Scarlet', v: 'Cuộc điều tra màu đỏ', a: 'Arthur Conan Doyle' },
    { id: 2852, g: 'crime', t: 'The Hound of the Baskervilles', v: 'Chó săn dòng họ Baskerville', a: 'Arthur Conan Doyle' },
    { id: 345, g: 'crime', t: 'Dracula', a: 'Bram Stoker' },
    { id: 84, g: 'crime', t: 'Frankenstein', a: 'Mary Shelley' },
    { id: 43, g: 'crime', t: 'Strange Case of Dr Jekyll and Mr Hyde', a: 'Robert Louis Stevenson' },
    { id: 11, g: 'kids', t: "Alice's Adventures in Wonderland", v: 'Alice ở xứ sở thần tiên', a: 'Lewis Carroll' },
    { id: 12, g: 'kids', t: 'Through the Looking-Glass', v: 'Alice ở xứ sở trong gương', a: 'Lewis Carroll' },
    { id: 120, g: 'kids', t: 'Treasure Island', v: 'Đảo giấu vàng', a: 'Robert Louis Stevenson' },
    { id: 74, g: 'kids', t: 'The Adventures of Tom Sawyer', v: 'Những cuộc phiêu lưu của Tom Sawyer', a: 'Mark Twain' },
    { id: 37106, g: 'kids', t: 'Little Women', v: 'Những người phụ nữ nhỏ bé', a: 'Louisa May Alcott' },
    { id: 45, g: 'kids', t: 'Anne of Green Gables', v: 'Anne tóc đỏ dưới chái nhà xanh', a: 'L. M. Montgomery' },
    { id: 113, g: 'kids', t: 'The Secret Garden', v: 'Khu vườn bí mật', a: 'Frances Hodgson Burnett' },
    { id: 16, g: 'kids', t: 'Peter Pan', a: 'J. M. Barrie' },
    { id: 55, g: 'kids', t: 'The Wonderful Wizard of Oz', v: 'Phù thủy xứ Oz', a: 'L. Frank Baum' },
    { id: 2591, g: 'kids', t: "Grimms' Fairy Tales", v: 'Truyện cổ Grimm', a: 'Brothers Grimm' },
    { id: 829, g: 'kids', t: "Gulliver's Travels", v: 'Gulliver du ký', a: 'Jonathan Swift' },
    { id: 35, g: 'kids', t: 'The Time Machine', v: 'Cỗ máy thời gian', a: 'H. G. Wells' },
    { id: 36, g: 'kids', t: 'The War of the Worlds', v: 'Cuộc chiến giữa các thế giới', a: 'H. G. Wells' },
    { id: 3300, g: 'biz', t: 'The Wealth of Nations', v: 'Của cải của các quốc gia', a: 'Adam Smith' },
    { id: 20203, g: 'biz', t: 'Autobiography of Benjamin Franklin', v: 'Tự truyện Benjamin Franklin', a: 'Benjamin Franklin' },
    { id: 34901, g: 'biz', t: 'On Liberty', v: 'Bàn về tự do', a: 'John Stuart Mill' },
    { id: 132, g: 'phil', t: 'The Art of War', v: 'Binh pháp Tôn Tử', a: 'Sun Tzu' },
    { id: 1232, g: 'phil', t: 'The Prince', v: 'Quân vương', a: 'Niccolò Machiavelli' },
    { id: 2680, g: 'phil', t: 'Meditations', v: 'Suy tưởng', a: 'Marcus Aurelius' },
    { id: 45109, g: 'phil', t: 'The Enchiridion', v: 'Cẩm nang', a: 'Epictetus' },
    { id: 1998, g: 'phil', t: 'Thus Spake Zarathustra', v: 'Zarathustra đã nói như thế', a: 'Friedrich Nietzsche' },
    { id: 4363, g: 'phil', t: 'Beyond Good and Evil', v: 'Bên kia thiện ác', a: 'Friedrich Nietzsche' },
    { id: 1228, g: 'phil', t: 'On the Origin of Species', v: 'Nguồn gốc các loài', a: 'Charles Darwin' },
    { id: 205, g: 'phil', t: 'Walden', a: 'Henry David Thoreau' },
    { q: 'Truyện Kiều', g: 'vi', t: 'Truyện Kiều', a: 'Nguyễn Du' },
    { q: 'Chinh phụ ngâm', g: 'vi', t: 'Chinh phụ ngâm', a: 'Đặng Trần Côn' },
    { q: 'Số đỏ', g: 'vi', t: 'Số đỏ', a: 'Vũ Trọng Phụng' },
    { q: 'Tắt đèn', g: 'vi', t: 'Tắt đèn', a: 'Ngô Tất Tố' },
    { q: 'Chí Phèo', g: 'vi', t: 'Chí Phèo', a: 'Nam Cao' }
  ];
  let catFilter = 'all';
  let catExpanded = false;
  const CAT_LIMIT = 8;
  const catBusy = new Set();
  const coverOf = (it) => `https://www.gutenberg.org/cache/epub/${it.id}/pg${it.id}.cover.medium.jpg`;
  const fileOf = (it) => `gb${it.id}.txt`;
  const onShelf = (it) => books.find((b) => b.fileName === fileOf(it) || b.fileName === `pg${it.id}.epub`);

  // Typeset cover: title and author on paper; the real cover image (if it loads) sits on top.
  function fillCover(box, title, author, url) {
    box.textContent = '';
    box.classList.add('tcover');
    const tt = document.createElement('span'); tt.className = 'tc-t'; tt.textContent = title;
    const ta = document.createElement('span'); ta.className = 'tc-a'; ta.textContent = author || '';
    box.append(tt, ta);
    if (url) {
      const im = document.createElement('img');
      im.alt = ''; im.decoding = 'async'; im.loading = 'lazy'; im.className = 'tc-img';
      im.addEventListener('error', () => im.remove());
      im.src = url;
      box.appendChild(im);
    }
  }

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
      b.addEventListener('click', () => { catFilter = k; catExpanded = false; renderCatalog(); });
      tabs.appendChild(b);
    });
    grid.textContent = '';
    const items = CATALOG.filter((it) => catFilter === 'all' || it.g === catFilter);
    const shown = catFilter === 'all' && !catExpanded ? items.slice(0, CAT_LIMIT) : items;
    shown.forEach((it) => {
      const li = document.createElement('li');
      li.className = 'crow';
      const cv = document.createElement('div');
      cv.className = 'cthumb';
      cv.setAttribute('aria-hidden', 'true');
      fillCover(cv, it.t, it.a, it.id ? coverOf(it) : '');
      const info = document.createElement('div');
      info.className = 'cinfo';
      const title = document.createElement('h3');
      title.textContent = lang === 'vi' && it.v ? it.v : it.t;
      const sub = document.createElement('p');
      sub.textContent = it.a + (lang === 'vi' && it.v ? ' · ' + it.t : '');
      info.append(title, sub);
      let act;
      if (it.id) {
        const mine = onShelf(it);
        act = document.createElement('button');
        act.type = 'button';
        act.className = 'btn primary';
        act.disabled = catBusy.has(it.id);
        act.textContent = catBusy.has(it.id) ? t('cat.busy') + '...' : mine ? t('cat.cont') : t('cat.read');
        act.addEventListener('click', () => readFromCatalog(it));
      } else {
        act = document.createElement('a');
        act.className = 'btn';
        act.href = `https://vi.wikisource.org/w/index.php?search=${encodeURIComponent(it.q)}`;
        act.target = '_blank';
        act.rel = 'noopener noreferrer';
        act.textContent = t('cat.wiki');
      }
      li.append(cv, info, act);
      grid.appendChild(li);
    });
    if (catFilter === 'all' && !catExpanded && items.length > CAT_LIMIT) {
      const li = document.createElement('li');
      li.className = 'cmore';
      const more = document.createElement('button');
      more.type = 'button';
      more.className = 'btn';
      more.textContent = `${t('cat.more')} (${items.length - CAT_LIMIT})`;
      more.addEventListener('click', () => { catExpanded = true; renderCatalog(); });
      li.appendChild(more);
      grid.appendChild(li);
    }
  }

  function renderSources() {
    const box = $('src-list');
    if (!box) return;
    box.textContent = '';
    const rows = [
      ['Project Gutenberg', 'https://www.gutenberg.org/', CATALOG.filter((i) => i.id).length, 'src.pg'],
      ['GITenberg (GitHub)', 'https://github.com/GITenberg', CATALOG.filter((i) => i.id).length, 'src.gh'],
      ['Wikisource', 'https://vi.wikisource.org/', CATALOG.filter((i) => i.q).length, 'src.ws']
    ];
    rows.forEach(([name, href, n, desc]) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = name;
      const c = document.createElement('b');
      c.textContent = ` ${n} ${t('src.books')}`;
      const d = document.createElement('span');
      d.textContent = t(desc);
      li.append(a, c, d);
      box.appendChild(li);
    });
  }

  async function gunzipJson(buf) {
    const u8 = new Uint8Array(buf);
    let text;
    if (u8[0] === 0x1f && u8[1] === 0x8b) {
      const stream = new Blob([u8]).stream().pipeThrough(new DecompressionStream('gzip'));
      text = await new Response(stream).text();
    } else text = new TextDecoder().decode(u8); // already decoded by the network layer
    return JSON.parse(text);
  }

  async function readFromCatalog(it) {
    const have = onShelf(it);
    if (have) { openBook(have.id); return; }
    catBusy.add(it.id);
    renderCatalog();
    try {
      const res = await fetch(`/library/books/${it.id}.json.gz`);
      if (!res.ok) throw new Error('http');
      const data = await gunzipJson(await res.arrayBuffer());
      const chapters = data.ch.map((c, i) => ({ title: c.t || `${t('r.chapter')} ${i + 1}`, blocks: c.p.map((p) => ({ t: p })) }));
      const book = { id: uid(), sig: 'gb' + it.id, title: it.t, author: it.a, kind: 'txt', lang: data.lang || 'en', cover: coverOf(it), fileName: fileOf(it), size: 0, added: Date.now(), chapters };
      await putOne('books', book);
      await loadShelf();
      openBook(book.id);
    } catch (e) {
      showToast(e && e.name === 'QuotaExceededError' ? t('m.storage') : t('cat.fail'));
    } finally {
      catBusy.delete(it.id);
      renderCatalog();
    }
  }

  const MAX_BYTES = 60 * 1024 * 1024;
  let books = [];
  let progressMap = {};
  const importMsg = $('import-msg');

  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

  async function importFile(file, meta) {
    meta = meta || {};
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
      const book = { id: uid(), sig, title: parsed.title, author: parsed.author, kind: isEpub ? 'epub' : 'txt', lang: parsed.lang || meta.lang || '', cover: meta.cover || '', fileName: name, size: file.size, added: Date.now(), chapters: parsed.chapters };
      await putOne('books', book);
      await putOne('files', file, book.id);
      importMsg.textContent = '';
    } catch (e) {
      const m = e && e.message;
      importMsg.textContent = `${name}: ${m === 'nozip' ? t('m.noZip') : e && e.name === 'QuotaExceededError' ? t('m.storage') : t('m.bad')}`;
    }
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
    books.forEach((b) => {
      const pct = percentOf(b);
      const li = document.createElement('li');
      li.className = 'book';
      li.style.setProperty('--h', Array.from(b.id).reduce((n, c) => n + c.charCodeAt(0), 0) % 360);
      if (b.cover) { const bg = document.createElement('div'); bg.className = 'bbg'; bg.style.backgroundImage = `url("${b.cover}")`; li.appendChild(bg); }

      const cover = document.createElement('div');
      cover.className = 'cover';
      cover.setAttribute('aria-hidden', 'true');
      const hue = Array.from(b.id).reduce((s, c) => s + c.charCodeAt(0), 0) % 360;
      cover.style.setProperty('--h', hue);
      fillCover(cover, b.title, b.author, b.cover);

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
      let blob = await getOne('files', b.id);
      if (!blob) blob = new Blob([[b.title, b.author, ''].concat(b.chapters.map((c) => [c.title, ''].concat(c.blocks.map((x) => x.t)).join('\n\n'))).join('\n\n')], { type: 'text/plain;charset=utf-8' });
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

  // ---------------------------------------------------------------------------
  // Reader
  // ---------------------------------------------------------------------------
  const page = $('page');
  let current = null;       // book being read
  let chIdx = 0;
  let marks = [];
  let saveTimer = null;

  const prefs = { size: 18, lh: 1.7, theme: 'book', font: 'serif', rate: 1, voice: '', trans: false, vol: 1, mode: 'book' };
  try { Object.assign(prefs, JSON.parse(localStorage.getItem('libPrefs') || '{}')); } catch (_) {}
  const savePrefs = () => { try { localStorage.setItem('libPrefs', JSON.stringify(prefs)); } catch (_) {} };
  if ((prefs.v || 1) < 2) { prefs.theme = 'book'; prefs.font = 'serif'; prefs.v = 2; savePrefs(); } // new default look for everyone once

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
    if (meta && current) meta.content = { book: '#f6efdf', dark: '#0b0c10', sepia: '#f4ecd8', light: '#ffffff' }[prefs.theme];
  }

  // ---- translation: Chrome's on-device Translator API, nothing is sent to our server ----
  let transOn = false;
  let trRun = 0;
  const trCache = {};
  const translators = {};
  const trKey = () => current.id + ':' + chIdx;
  function textOf(i) {
    const c = transOn && trCache[trKey()];
    return (c && c[i]) || current.chapters[chIdx].blocks[i].t;
  }
  function updateTransUi() {
    const b = $('r-trans');
    if (!b) return;
    const label = t(transOn ? 'tr.off' : 'tr.on');
    b.setAttribute('aria-pressed', String(transOn));
    b.setAttribute('aria-label', label);
    b.title = label;
  }
  async function getTranslator(src) {
    if (!('Translator' in self)) return null;
    if (translators[src]) return translators[src];
    const av = await self.Translator.availability({ sourceLanguage: src, targetLanguage: 'vi' });
    if (av === 'unavailable') return null;
    if (av !== 'available') showToast(t('tr.dl'));
    translators[src] = await self.Translator.create({ sourceLanguage: src, targetLanguage: 'vi' });
    return translators[src];
  }
  function stopTrans() { transOn = false; trRun++; updateTransUi(); }
  async function translateChapter() {
    const token = trRun;
    const book = current;
    const ci = chIdx;
    const key = trKey();
    const blocks = book.chapters[ci].blocks;
    const paint = () => { if (token !== trRun) return; (trCache[key] || []).forEach((v, i) => { const el = page.querySelector(`[data-i="${i}"]`); if (el && v) el.textContent = v; }); };
    let arr = trCache[key];
    if (!arr) {
      let saved = null;
      try { saved = await getOne('kv', 'tr:' + key); } catch (_) {}
      if (token !== trRun) return;
      if (saved && saved.length === blocks.length && saved.every(Boolean)) { trCache[key] = saved; paint(); return; }
      arr = trCache[key] = new Array(blocks.length).fill('');
    }
    let tr;
    try { tr = await getTranslator((book.lang || 'en').slice(0, 2)); } catch (_) { tr = null; }
    if (token !== trRun) return;
    if (!tr) { stopTrans(); showToast(t('tr.none')); renderChapter(ci, scrollFrac()); return; }
    $('r-chap').textContent = `${t('tr.busy')}...`;
    for (let i = 0; i < blocks.length; i++) {
      if (token !== trRun) return;
      if (arr[i]) continue;
      try { arr[i] = await tr.translate(blocks[i].t); } catch (_) { if (token === trRun) { stopTrans(); showToast(t('tr.fail')); renderChapter(ci, scrollFrac()); } return; }
      const el = page.querySelector(`[data-i="${i}"]`);
      if (el && token === trRun) el.textContent = arr[i];
    }
    if (token !== trRun) return;
    renderChapterLabel();
    putOne('kv', arr, 'tr:' + key).catch(() => {});
  }
  $('r-trans').addEventListener('click', () => {
    if (!current) return;
    if (transOn) { stopTrans(); prefs.trans = false; savePrefs(); renderChapter(chIdx, scrollFrac()); return; }
    if (!('Translator' in self)) { showToast(t('tr.none')); return; }
    transOn = true; prefs.trans = true; savePrefs(); updateTransUi();
    renderChapter(chIdx, scrollFrac());
  });

  function bannerEl(b) {
    const d = document.createElement('header');
    d.className = 'rbanner';
    d.style.setProperty('--h', Array.from(b.id).reduce((n, c) => n + c.charCodeAt(0), 0) % 360);
    if (b.cover) { const bg = document.createElement('div'); bg.className = 'bbg'; bg.style.backgroundImage = `url("${b.cover}")`; d.appendChild(bg); }
    const th = document.createElement('div');
    th.className = 'rb-cover';
    fillCover(th, b.title, b.author, b.cover);
    const tx = document.createElement('div');
    const h = document.createElement('p'); h.className = 'rb-title'; h.textContent = b.title;
    const m = document.createElement('p'); m.className = 'rb-meta'; m.textContent = `${b.author ? b.author + ' · ' : ''}${b.chapters.length} ${t('ch.n')}`;
    tx.append(h, m);
    d.append(th, tx);
    return d;
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
    trRun++;
    chIdx = Math.max(0, Math.min(current.chapters.length - 1, idx));
    const ch = current.chapters[chIdx];
    const frag = document.createDocumentFragment();
    ch.blocks.forEach((b, i) => {
      const el = document.createElement(b.h ? 'h2' : 'p');
      el.textContent = textOf(i);
      el.dataset.i = String(i);
      frag.appendChild(el);
    });
    page.textContent = '';
    if (chIdx === 0) page.appendChild(bannerEl(current));
    page.appendChild(frag);
    if (transOn) page.lang = 'vi'; else if (current.lang) page.lang = current.lang; else page.removeAttribute('lang');
    renderChapterLabel();
    if (transOn) translateChapter();
    if (typeof renderVoiceUi === 'function' && voices.length) renderVoiceUi();
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
    const isVi = /^vi/.test(book.lang || '');
    $('r-trans').hidden = isVi;
    transOn = !!prefs.trans && !isVi && 'Translator' in self;
    updateTransUi();
    renderChapter(p ? p.ch : 0, p ? p.frac : 0);
    renderSheets();
    history.replaceState(null, '', '#' + id);
    window.scrollTo(0, 0);
    if (p) requestAnimationFrame(() => requestAnimationFrame(() => { const max = document.documentElement.scrollHeight - innerHeight; window.scrollTo(0, (p.frac || 0) * max); updateProgress(); }));
  }

  function closeBook() {
    saveProgress();
    stopSpeech(true);
    trRun++;
    $('tts').hidden = true;
    current = null;
    document.body.dataset.view = 'shelf';
    document.body.dataset.theme = 'dark';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = '#f2e9d5';
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

  // Only two choices: a Vietnamese and an English voice, each the most natural one the device has.
  let voiceLang = '';  // '' = follow the text
  function voiceScore(v) {
    const n = v.name.toLowerCase();
    let sc = 0;
    if (/natural|neural|online|premium|enhanced|wavenet|studio/.test(n)) sc += 50;
    if (/google/.test(n)) sc += 30;
    if (/hoaimy|namminh|linh|an\b|aria|jenny|ava|andrew|emma|brian|guy|samantha|daniel|serena/.test(n)) sc += 15;
    if (v.localService === false) sc += 5;
    if (/espeak|compact|eloquence/.test(n)) sc -= 40;
    return sc;
  }
  const bestVoice = (l) => voices.filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith(l)).sort((a, b) => voiceScore(b) - voiceScore(a))[0] || null;
  const textLang = () => (transOn || /^vi/.test(current && current.lang || '') ? 'vi' : 'en');
  const activeLang = () => voiceLang || textLang();
  function loadVoices() {
    if (!synth) return;
    voices = synth.getVoices();
    renderVoiceUi();
  }
  function renderVoiceUi() {
    const l = current ? activeLang() : 'vi';
    document.querySelectorAll('#t-lang button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.l === l)));
    const v = bestVoice(l);
    const note = $('t-note');
    if (!voices.length) { note.hidden = false; note.textContent = t('t.noVoice'); }
    else if (!v) { note.hidden = false; note.textContent = t(l === 'vi' ? 't.noVi' : 't.noEn'); }
    else { note.hidden = false; note.textContent = `${t('t.using')}: ${v.name}`; }
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
    $('t-vol').value = prefs.vol;
    $('t-vol-val').textContent = Math.round(prefs.vol * 100) + '%';
    const mode = $('t-mode');
    if (mode.options.length !== 3) { mode.textContent = ''; ['para', 'chapter', 'book'].forEach((k) => mode.appendChild(new Option('', k))); }
    ['t.mpara', 't.mchap', 't.mbook'].forEach((k, i) => { mode.options[i].textContent = t(k); });
    mode.value = prefs.mode;
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
    if (paraIdx >= blocks.length) { // chapter finished
      if (prefs.mode === 'book' && chIdx + 1 < current.chapters.length) {
        renderChapter(chIdx + 1, 0);
        window.scrollTo(0, 0);
        saveProgress();
        paraIdx = 0;
        chunkIdx = 0;
        speaking = true;
        return speakCurrent();
      }
      speaking = false;
      paraIdx = 0;
      chunkIdx = 0;
      updateTtsUi();
      return;
    }
    const chunks = chunksOf(textOf(paraIdx));
    if (chunkIdx >= chunks.length) {
      paraIdx++; chunkIdx = 0;
      if (prefs.mode === 'para') { speaking = false; page.querySelectorAll('.reading').forEach((e) => e.classList.remove('reading')); updateTtsUi(); return; }
      return speakCurrent();
    }

    highlight(paraIdx);
    const u = new SpeechSynthesisUtterance(chunks[chunkIdx]);
    const want = activeLang();
    const voice = bestVoice(want);
    if (voice) { u.voice = voice; u.lang = voice.lang; } else u.lang = want === 'vi' ? 'vi-VN' : 'en-US';
    u.rate = Number(prefs.rate);
    u.volume = Number(prefs.vol);
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
  $('t-vol').addEventListener('input', (e) => { prefs.vol = Number(e.target.value); savePrefs(); updateTtsUi(); });
  $('t-vol').addEventListener('change', () => { if (speaking) speakCurrent(); });
  $('t-mode').addEventListener('change', (e) => { prefs.mode = e.target.value; savePrefs(); });
  document.querySelectorAll('#t-lang button').forEach((b) => b.addEventListener('click', () => {
    voiceLang = b.dataset.l === textLang() ? '' : b.dataset.l;
    renderVoiceUi();
    if (speaking) speakCurrent();
  }));

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
