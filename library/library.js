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
      title: 'Đọc sách của bạn, nhớ tiến độ',
      lead: 'Đọc sách miễn phí ngay trong web: nhớ tiến độ, đánh dấu, dịch tiếng Việt.',
      'src.title': 'Nguồn thư viện', 'src.books': 'sách', 'src.pg': 'Kho sách công cộng quốc tế, bản EPUB tiếng Anh', 'src.gh': 'Bản sao Gutenberg trên GitHub, nơi web lấy và chia chương sẵn', 'src.ws': 'Thư viện mở tiếng Việt, đọc trên Wikisource',
      'src.note': 'Chỉ gồm tác phẩm đã hết bản quyền.',
      f1: 'Sách đã mở được lưu trong trình duyệt của bạn',
      f2: 'Nghe đọc dùng giọng có sẵn trên thiết bị',
      'b.read': 'Đọc', 'b.continue': 'Đọc tiếp', 'b.download': 'Tải về', 'b.delete': 'Xóa', 'b.confirm': 'Bấm lại để xóa',
      'b.chapters': 'chương', 'b.done': 'Đã đọc xong',
      'm.adding': 'Đang thêm', 'm.added': 'Đã thêm', 'm.badType': 'Chỉ nhận .epub và .txt', 'm.bad': 'Không đọc được file này', 'm.noZip': 'Trình duyệt này chưa hỗ trợ đọc EPUB. Hãy dùng Chrome, Edge hoặc Safari mới.',
      'm.empty': 'File không có nội dung đọc được', 'm.big': 'File quá lớn (tối đa 60 MB)', 'm.dup': 'Đã có trong thư viện', 'm.storage': 'Không lưu được, bộ nhớ trình duyệt đầy hoặc bị chặn',
      'r.back': 'Về thư viện', 'r.mark': 'Đánh dấu', 'r.toc': 'Mục lục và đánh dấu', 'r.aa': 'Chữ và giao diện',
      'r.prev': 'Chương trước', 'r.next': 'Chương sau', 'r.chapter': 'Chương',
      'mark.added': 'Đã đánh dấu', 'mark.removed': 'Đã bỏ đánh dấu', 'mark.none': 'Chưa có đánh dấu nào. Bấm biểu tượng đánh dấu để lưu vị trí đang đọc.',
      'bk.title': 'Sao lưu và đồng bộ', 'bk.note': 'Tiến độ đọc và đánh dấu chỉ nằm trên trình duyệt này. Xuất ra file để mang sang máy khác, hoặc dùng mã đồng bộ bên dưới.',
      'bk.export': 'Xuất tiến độ và đánh dấu', 'bk.import': 'Nhập từ file', 'bk.install': 'Cài như ứng dụng',
      'bk.none': 'Chưa có tiến độ hay đánh dấu nào để xuất.', 'bk.exported': 'Đã xuất file sao lưu', 'bk.bad': 'File này không phải bản sao lưu của vinhx library.',
      'bk.done': 'Đã nhập', 'bk.books': 'sách', 'bk.skipped': 'bỏ qua (sách chưa có)',
      's.chapters': 'Mục lục', 's.marks': 'Đánh dấu', 's.search': 'Tìm',
      'q.ph': 'Tìm trong sách...', 'q.none': 'Không thấy kết quả', 'q.min': 'Gõ ít nhất 2 ký tự', 'q.cap': 'Chỉ hiện 100 kết quả đầu tiên',
      'mark.note': 'Ghi chú', 'mark.notePh': 'Ghi chú của bạn...', 'mark.export': 'Xuất đánh dấu (.txt)', 'mark.exported': 'Đã xuất đánh dấu',
      'aa.size': 'Cỡ chữ', 'aa.lh': 'Giãn dòng', 'aa.theme': 'Nền', 'aa.book': 'Sách', 'aa.dark': 'Tối', 'aa.sepia': 'Vàng', 'aa.light': 'Sáng', 'aa.font': 'Kiểu chữ', 'aa.sans': 'Không chân', 'aa.serif': 'Có chân',
      'ch.n': 'chương',
      'sy.title': 'Đồng bộ giữa các máy', 'sy.note': 'Tiến độ và đánh dấu được mã hóa ngay trên máy bạn bằng mã đồng bộ, máy chủ chỉ giữ dữ liệu đã mã hóa và không đọc được. Giữ kín mã này.',
      'sy.create': 'Tạo mã đồng bộ', 'sy.join': 'Kết nối', 'sy.ph': 'Nhập mã từ máy kia', 'sy.yours': 'Mã của bạn', 'sy.copy': 'Chép mã', 'sy.copied': 'Đã chép mã',
      'sy.now': 'Đồng bộ ngay', 'sy.leave': 'Ngắt kết nối', 'sy.wipe': 'Xóa dữ liệu trên máy chủ', 'sy.wipeAgain': 'Bấm lại để xóa',
      'sy.busy': 'Đang đồng bộ...', 'sy.ok': 'Đã đồng bộ lúc', 'sy.never': 'Chưa đồng bộ lần nào', 'sy.bad': 'Mã không đúng định dạng', 'sy.nf': 'Không tìm thấy mã này. Kiểm tra lại mã ở máy kia.',
      'sy.off': 'Máy chủ chưa bật tính năng đồng bộ.', 'sy.net': 'Chưa đồng bộ được, sẽ tự thử lại.', 'sy.limit': 'Thao tác quá nhiều, hãy thử lại sau.', 'sy.joined': 'Đã kết nối', 'sy.left': 'Đã ngắt kết nối', 'sy.wiped': 'Đã xóa dữ liệu trên máy chủ',
      'sy.more': 'Còn sách chưa tải về, bấm Đồng bộ ngay để tải tiếp.',
      'st.title': 'Thói quen đọc', 'st.today': 'Hôm nay', 'st.min': 'phút', 'st.goal': 'Mục tiêu mỗi ngày', 'st.streak': 'ngày liên tiếp', 'st.week': 'Tuần này', 'st.hit': 'Đạt mục tiêu hôm nay!',
      'tts.remote': 'VieNeu (máy chủ)', 'tts.remoteFail': 'Giọng VieNeu chưa phản hồi, tạm dùng giọng của trình duyệt.',
      'tts.on': 'Nghe đọc', 'tts.play': 'Phát', 'tts.pause': 'Tạm dừng', 'tts.prev': 'Đoạn trước', 'tts.next': 'Đoạn sau', 'tts.speed': 'Tốc độ', 'tts.voice': 'Giọng đọc', 'tts.sleep': 'Hẹn giờ tắt', 'tts.off': 'Không', 'tts.chapter': 'Hết chương', 'tts.none': 'Trình duyệt này chưa hỗ trợ nghe đọc.', 'tts.auto': 'Tự động', 'tts.min': 'phút', 'tts.close': 'Đóng nghe đọc',
      'ui.close': 'Đóng', 'ch.untitled': 'Phần',
      'cat.title': 'Kệ sách miễn phí',
      'cat.sub': 'Tác phẩm đã hết bản quyền, lấy từ Project Gutenberg và Wikisource.',
      'cat.all': 'Tất cả', 'cat.wiki': 'Đọc trên Wikisource',
      'cat.busy': 'Đang tải', 'cat.read': 'Đọc ngay', 'cat.cont': 'Đọc tiếp', 'cat.more': 'Xem thêm', 'cat.fail': 'Chưa tải được sách này, hãy thử lại sau.',
      'cat.prev': 'Cuốn trước', 'cat.next': 'Cuốn sau', 'cat.search': 'Tìm truyện...', 'cat.empty': 'Không tìm thấy truyện nào khớp.',
      'tr.on': 'Dịch sang tiếng Việt', 'tr.off': 'Hiện bản gốc', 'tr.none': 'Trình duyệt này chưa có dịch tích hợp. Hãy dùng Chrome hoặc Edge mới, hoặc nhấp chuột phải rồi chọn Dịch sang tiếng Việt.', 'tr.busy': 'Đang dịch', 'tr.fail': 'Chưa dịch được, hãy thử lại.', 'tr.dl': 'Đang tải gói dịch, lần đầu có thể hơi lâu',
      'g.en': 'Văn học Anh – Mỹ', 'g.ru': 'Văn học Nga', 'g.fr': 'Văn học Pháp', 'g.eu': 'Thế giới khác', 'g.ancient': 'Cổ điển',
      'g.crime': 'Trinh thám & kinh dị', 'g.kids': 'Phiêu lưu & thiếu nhi', 'g.biz': 'Kinh tế & chứng khoán', 'g.phil': 'Triết học & khoa học', 'g.vi': 'Văn học Việt Nam'
    },
    en: {
      kicker: 'Personal library',
      title: 'Read your books, keep your place',
      lead: 'Read free books right on the web: keeps your place, bookmarks, and Vietnamese translation.',
      'src.title': 'Library sources', 'src.books': 'books', 'src.pg': 'International public-domain library, English EPUBs', 'src.gh': 'Gutenberg mirror on GitHub; the site takes the text from here and splits chapters ahead of time', 'src.ws': 'Open Vietnamese library, read on Wikisource',
      'src.note': 'Only works whose copyright has expired.',
      f1: 'Books you open are stored in your browser',
      f2: 'Books are read in your browser, nothing is uploaded',
      'b.read': 'Read', 'b.continue': 'Continue', 'b.download': 'Download', 'b.delete': 'Delete', 'b.confirm': 'Click again to delete',
      'b.chapters': 'chapters', 'b.done': 'Finished',
      'm.adding': 'Adding', 'm.added': 'Added', 'm.badType': 'Only .epub and .txt are accepted', 'm.bad': 'This file could not be read', 'm.noZip': 'This browser cannot read EPUB yet. Use a recent Chrome, Edge or Safari.',
      'm.empty': 'The file has no readable text', 'm.big': 'File too large (60 MB max)', 'm.dup': 'Already in your library', 'm.storage': 'Could not save, browser storage is full or blocked',
      'r.back': 'Back to library', 'r.mark': 'Bookmark', 'r.toc': 'Contents and bookmarks', 'r.aa': 'Text and theme',
      'r.prev': 'Previous chapter', 'r.next': 'Next chapter', 'r.chapter': 'Chapter',
      'mark.added': 'Bookmarked', 'mark.removed': 'Bookmark removed', 'mark.none': 'No bookmarks yet. Tap the bookmark icon to save where you are.',
      'bk.title': 'Backup and sync', 'bk.note': 'Reading progress and bookmarks live only in this browser. Export them to a file for another device, or use the sync code below.',
      'bk.export': 'Export progress and bookmarks', 'bk.import': 'Import from file', 'bk.install': 'Install as an app',
      'bk.none': 'No progress or bookmarks to export yet.', 'bk.exported': 'Backup file saved', 'bk.bad': 'That file is not a vinhx library backup.',
      'bk.done': 'Imported', 'bk.books': 'books', 'bk.skipped': 'skipped (book not found)',
      's.chapters': 'Contents', 's.marks': 'Bookmarks', 's.search': 'Search',
      'q.ph': 'Search in this book...', 'q.none': 'No results', 'q.min': 'Type at least 2 characters', 'q.cap': 'Showing the first 100 results',
      'mark.note': 'Note', 'mark.notePh': 'Your note...', 'mark.export': 'Export bookmarks (.txt)', 'mark.exported': 'Bookmarks exported',
      'aa.size': 'Text size', 'aa.lh': 'Line spacing', 'aa.theme': 'Theme', 'aa.book': 'Book', 'aa.dark': 'Dark', 'aa.sepia': 'Sepia', 'aa.light': 'Light', 'aa.font': 'Typeface', 'aa.sans': 'Sans', 'aa.serif': 'Serif',
      'ch.n': 'chapters',
      'sy.title': 'Sync between devices', 'sy.note': 'Progress and bookmarks are encrypted on your device with the sync code. The server only keeps encrypted data it cannot read. Keep the code private.',
      'sy.create': 'Create a sync code', 'sy.join': 'Connect', 'sy.ph': 'Enter the code from your other device', 'sy.yours': 'Your code', 'sy.copy': 'Copy code', 'sy.copied': 'Code copied',
      'sy.now': 'Sync now', 'sy.leave': 'Disconnect', 'sy.wipe': 'Delete data on the server', 'sy.wipeAgain': 'Click again to delete',
      'sy.busy': 'Syncing...', 'sy.ok': 'Synced at', 'sy.never': 'Not synced yet', 'sy.bad': 'That code is not in the right format', 'sy.nf': 'Code not found. Check the code on your other device.',
      'sy.off': 'Sync is not switched on on the server.', 'sy.net': 'Could not sync, will retry automatically.', 'sy.limit': 'Too many requests, try again later.', 'sy.joined': 'Connected', 'sy.left': 'Disconnected', 'sy.wiped': 'Server data deleted',
      'sy.more': 'Some books are still to download. Press Sync now to continue.',
      'st.title': 'Reading habit', 'st.today': 'Today', 'st.min': 'min', 'st.goal': 'Daily goal', 'st.streak': 'day streak', 'st.week': 'This week', 'st.hit': 'Goal reached today!',
      'tts.remote': 'VieNeu (server)', 'tts.remoteFail': 'The VieNeu voice did not respond, using the browser voice for now.',
      'tts.on': 'Read aloud', 'tts.play': 'Play', 'tts.pause': 'Pause', 'tts.prev': 'Previous paragraph', 'tts.next': 'Next paragraph', 'tts.speed': 'Speed', 'tts.voice': 'Voice', 'tts.sleep': 'Sleep timer', 'tts.off': 'Off', 'tts.chapter': 'End of chapter', 'tts.none': 'This browser does not support read aloud.', 'tts.auto': 'Automatic', 'tts.min': 'min', 'tts.close': 'Close read aloud',
      'ui.close': 'Close', 'ch.untitled': 'Part',
      'cat.title': 'Free bookshelf',
      'cat.sub': 'Works out of copyright, from Project Gutenberg and Wikisource.',
      'cat.all': 'All', 'cat.wiki': 'Read on Wikisource',
      'cat.busy': 'Loading', 'cat.read': 'Read now', 'cat.cont': 'Continue', 'cat.more': 'Show more', 'cat.fail': 'Could not load this book right now, please try again later.',
      'cat.prev': 'Previous book', 'cat.next': 'Next book', 'cat.search': 'Search books...', 'cat.empty': 'No books match that search.',
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
    document.querySelectorAll('[data-i18n-ph]').forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
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
    { id: 766, g: 'en', t: 'David Copperfield', a: 'Charles Dickens' },
    { id: 1023, g: 'en', t: 'Bleak House', v: 'Ngôi nhà hoang vắng', a: 'Charles Dickens' },
    { id: 2641, g: 'en', t: 'A Room with a View', v: 'Căn phòng có tầm nhìn', a: 'E. M. Forster' },
    { id: 2891, g: 'en', t: 'Howards End', a: 'E. M. Forster' },
    { id: 4217, g: 'en', t: 'A Portrait of the Artist as a Young Man', v: 'Chân dung người nghệ sĩ thời trẻ', a: 'James Joyce' },
    { id: 521, g: 'en', t: 'Robinson Crusoe', a: 'Daniel Defoe' },
    { id: 2554, g: 'ru', t: 'Crime and Punishment', v: 'Tội ác và hình phạt', a: 'Fyodor Dostoevsky' },
    { id: 28054, g: 'ru', t: 'The Brothers Karamazov', v: 'Anh em nhà Karamazov', a: 'Fyodor Dostoevsky' },
    { id: 600, g: 'ru', t: 'Notes from Underground', v: 'Ghi chép từ căn hầm', a: 'Fyodor Dostoevsky' },
    { id: 36034, g: 'ru', t: 'White Nights, and Other Stories', v: 'Đêm trắng', a: 'Fyodor Dostoevsky' },
    { id: 2600, g: 'ru', t: 'War and Peace', v: 'Chiến tranh và hòa bình', a: 'Leo Tolstoy' },
    { id: 1399, g: 'ru', t: 'Anna Karenina', a: 'Leo Tolstoy' },
    { id: 2638, g: 'ru', t: 'The Idiot', v: 'Kẻ ngốc', a: 'Fyodor Dostoevsky' },
    { id: 135, g: 'fr', t: 'Les Misérables', v: 'Những người khốn khổ', a: 'Victor Hugo' },
    { id: 1184, g: 'fr', t: 'The Count of Monte Cristo', v: 'Bá tước Monte Cristo', a: 'Alexandre Dumas' },
    { id: 1259, g: 'fr', t: 'Twenty Years After', v: 'Hai mươi năm sau', a: 'Alexandre Dumas' },
    { id: 1257, g: 'fr', t: 'The Three Musketeers', v: 'Ba chàng lính ngự lâm', a: 'Alexandre Dumas' },
    { id: 103, g: 'fr', t: 'Around the World in 80 Days', v: 'Vòng quanh thế giới trong 80 ngày', a: 'Jules Verne' },
    { id: 164, g: 'fr', t: 'Twenty Thousand Leagues under the Sea', v: 'Hai vạn dặm dưới đáy biển', a: 'Jules Verne' },
    { id: 18857, g: 'fr', t: 'A Journey to the Centre of the Earth', v: 'Journey to the Centre of the Earth', a: 'Jules Verne' },
    { id: 996, g: 'eu', t: 'Don Quixote', a: 'Miguel de Cervantes' },
    { id: 5200, g: 'eu', t: 'Metamorphosis', v: 'Hóa thân', a: 'Franz Kafka' },
    { id: 2542, g: 'eu', t: "A Doll's House", v: 'Nhà búp bê', a: 'Henrik Ibsen' },
    { id: 2814, g: 'eu', t: 'Dubliners', a: 'James Joyce' },
    { id: 4300, g: 'eu', t: 'Ulysses', a: 'James Joyce' },
    { id: 24264, g: 'eu', t: '紅樓夢', v: 'Hồng lâu mộng (bản chữ Hán)', a: 'Tào Tuyết Cần' },
    { id: 2500, g: 'eu', t: 'Siddhartha', a: 'Hermann Hesse' },
    { id: 1727, g: 'ancient', t: 'The Odyssey', v: 'Odyssey', a: 'Homer' },
    { id: 1497, g: 'ancient', t: 'The Republic', v: 'Nhà nước (Cộng hòa)', a: 'Plato' },
    { id: 16328, g: 'ancient', t: 'Beowulf', a: 'Anglo-Saxon epic' },
    { id: 1656, g: 'ancient', t: 'Apology', v: 'Biện hộ của Socrates', a: 'Plato' },
    { id: 1600, g: 'ancient', t: 'Symposium', v: 'Bữa tiệc', a: 'Plato' },
    { id: 8438, g: 'ancient', t: 'Nicomachean Ethics', v: 'Đạo đức học Nicomachus', a: 'Aristotle' },
    { id: 6130, g: 'ancient', t: 'The Iliad', v: 'Iliad', a: 'Homer' },
    { id: 1661, g: 'crime', t: 'The Adventures of Sherlock Holmes', v: 'Sherlock Holmes: Những cuộc phiêu lưu', a: 'Arthur Conan Doyle' },
    { id: 244, g: 'crime', t: 'A Study in Scarlet', v: 'Cuộc điều tra màu đỏ', a: 'Arthur Conan Doyle' },
    { id: 2852, g: 'crime', t: 'The Hound of the Baskervilles', v: 'Chó săn dòng họ Baskerville', a: 'Arthur Conan Doyle' },
    { id: 345, g: 'crime', t: 'Dracula', a: 'Bram Stoker' },
    { id: 84, g: 'crime', t: 'Frankenstein', a: 'Mary Shelley' },
    { id: 43, g: 'crime', t: 'Strange Case of Dr Jekyll and Mr Hyde', a: 'Robert Louis Stevenson' },
    { id: 2097, g: 'crime', t: 'The Sign of the Four', v: 'Dấu bộ tứ', a: 'Arthur Conan Doyle' },
    { id: 834, g: 'crime', t: 'The Memoirs of Sherlock Holmes', v: 'Hồi ký Sherlock Holmes', a: 'Arthur Conan Doyle' },
    { id: 108, g: 'crime', t: 'The Return of Sherlock Holmes', v: 'Sherlock Holmes trở lại', a: 'Arthur Conan Doyle' },
    { id: 175, g: 'crime', t: 'The Phantom of the Opera', v: 'Bóng ma nhà hát', a: 'Gaston Leroux' },
    { id: 863, g: 'crime', t: 'The Mysterious Affair at Styles', v: 'Vụ án bí ẩn ở Styles', a: 'Agatha Christie' },
    { id: 1155, g: 'crime', t: 'The Secret Adversary', v: 'Kẻ thù bí mật', a: 'Agatha Christie' },
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
    { id: 5230, g: 'kids', t: 'The Invisible Man', v: 'Người vô hình', a: 'H. G. Wells' },
    { id: 910, g: 'kids', t: 'White Fang', v: 'Nanh Trắng', a: 'Jack London' },
    { id: 3300, g: 'biz', t: 'The Wealth of Nations', v: 'Của cải của các quốc gia', a: 'Adam Smith' },
    { id: 20203, g: 'biz', t: 'Autobiography of Benjamin Franklin', v: 'Tự truyện Benjamin Franklin', a: 'Benjamin Franklin' },
    { id: 34901, g: 'biz', t: 'On Liberty', v: 'Bàn về tự do', a: 'John Stuart Mill' },
    { id: 61, g: 'biz', t: 'The Communist Manifesto', v: 'Tuyên ngôn của Đảng Cộng sản', a: 'Karl Marx & Friedrich Engels' },
    { id: 132, g: 'phil', t: 'The Art of War', v: 'Binh pháp Tôn Tử', a: 'Sun Tzu' },
    { id: 1232, g: 'phil', t: 'The Prince', v: 'Quân vương', a: 'Niccolò Machiavelli' },
    { id: 2680, g: 'phil', t: 'Meditations', v: 'Suy tưởng', a: 'Marcus Aurelius' },
    { id: 45109, g: 'phil', t: 'The Enchiridion', v: 'Cẩm nang', a: 'Epictetus' },
    { id: 1998, g: 'phil', t: 'Thus Spake Zarathustra', v: 'Zarathustra đã nói như thế', a: 'Friedrich Nietzsche' },
    { id: 4363, g: 'phil', t: 'Beyond Good and Evil', v: 'Bên kia thiện ác', a: 'Friedrich Nietzsche' },
    { id: 1228, g: 'phil', t: 'On the Origin of Species', v: 'Nguồn gốc các loài', a: 'Charles Darwin' },
    { id: 205, g: 'phil', t: 'Walden', a: 'Henry David Thoreau' },
    { id: 3207, g: 'phil', t: 'Leviathan', a: 'Thomas Hobbes' },
    { id: 7370, g: 'phil', t: 'Second Treatise of Government', v: 'Khảo luận thứ hai về chính quyền', a: 'John Locke' },
    { id: 4705, g: 'phil', t: 'A Treatise of Human Nature', v: 'Luận về bản tính con người', a: 'David Hume' },
    { id: 5827, g: 'phil', t: 'The Problems of Philosophy', v: 'Các vấn đề của triết học', a: 'Bertrand Russell' },
    { id: 4280, g: 'phil', t: 'Critique of Pure Reason', v: 'Phê phán lý tính thuần túy', a: 'Immanuel Kant' },
    { q: 'Truyện Kiều', g: 'vi', t: 'Truyện Kiều', a: 'Nguyễn Du' },
    { q: 'Chinh phụ ngâm', g: 'vi', t: 'Chinh phụ ngâm', a: 'Đặng Trần Côn' },
    { q: 'Số đỏ', g: 'vi', t: 'Số đỏ', a: 'Vũ Trọng Phụng' },
    { q: 'Tắt đèn', g: 'vi', t: 'Tắt đèn', a: 'Ngô Tất Tố' },
    { q: 'Chí Phèo', g: 'vi', t: 'Chí Phèo', a: 'Nam Cao' }
  ];
  const catBusy = new Set();
  let catActive = 'all';
  let catQuery = '';
  let catIdx = 0;
  const coverOf = (it) => `https://www.gutenberg.org/cache/epub/${it.id}/pg${it.id}.cover.medium.jpg`;
  const fileOf = (it) => `gb${it.id}.txt`;
  const onShelf = (it) => books.find((b) => b.fileName === fileOf(it) || b.fileName === `pg${it.id}.epub`);

  // Cover: a generated landscape (library/covers.js) with the title and author typeset over it.
  // A real cover image is only used for books you added yourself (the EPUB's own cover).
  const artOfItem = (it) => (window.VXCover ? window.VXCover.get(it.id || it.t, it.g) : null);
  function artOfBook(b) {
    if (!window.VXCover) return null;
    if (b.cover && !/gutenberg\.org/.test(b.cover)) return null;
    const c = CATALOG.find((x) => 'gb' + x.id === b.sig);
    return window.VXCover.get(c ? c.id : (b.sig || b.id), c && c.g);
  }
  function bgOf(b) {
    const art = artOfBook(b);
    if (!art && !b.cover) return null;
    const bg = document.createElement('div');
    bg.className = 'bbg' + (art ? ' art' : '');
    bg.style.backgroundImage = art ? art.uri : `url("${b.cover}")`;
    return bg;
  }
  function fillCover(box, title, author, url, art) {
    box.textContent = '';
    box.classList.add('tcover');
    if (art) {
      box.classList.add('tc-art');
      box.style.backgroundImage = art.uri;
      box.style.setProperty('--ti', art.title);
      box.style.setProperty('--au', art.author);
    }
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

  // Primary action for a catalog entry: a "Read now / Continue" button that loads the
  // prepared text, or a plain link to Wikisource for entries that only carry a search term.
  function actionFor(it) {
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
    return act;
  }

  function titleOf(it) { return lang === 'vi' && it.v ? it.v : it.t; }

  function filteredCatalog() {
    const q = catQuery.trim().toLowerCase();
    // A search term looks across every category; the pill only narrows when the box is empty.
    return CATALOG.filter((it) => {
      if (!q) return catActive === 'all' || it.g === catActive;
      return titleOf(it).toLowerCase().includes(q) || it.t.toLowerCase().includes(q) || (it.a || '').toLowerCase().includes(q);
    });
  }

  function renderPills() {
    const box = $('cat-pills');
    if (!box) return;
    box.textContent = '';
    [['all', 'cat.all'], ...CATEGORIES.map((k) => [k, 'g.' + k])].forEach(([key, labelKey]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'pill';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-pressed', String(catActive === key));
      b.textContent = t(labelKey);
      b.addEventListener('click', () => {
        if (catActive === key) return;
        catActive = key;
        catIdx = 0;
        renderCatalog();
      });
      box.appendChild(b);
    });
  }

  function setActiveSpine(idx, list) {
    const spines = $('cat-shelf').children;
    if (!spines.length) return;
    catIdx = Math.max(0, Math.min(idx, spines.length - 1));
    Array.from(spines).forEach((el, i) => el.classList.toggle('active', i === catIdx));
    spines[catIdx].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    renderFeat(list[catIdx]);
  }

  function renderFeat(it) {
    const box = $('cat-feat');
    box.textContent = '';
    if (!it) return;
    const h = document.createElement('h3');
    h.textContent = titleOf(it);
    const p = document.createElement('p');
    p.textContent = (it.a || '') + ' · ' + t('g.' + it.g);
    box.append(h, p, actionFor(it));
  }

  // The generated art, cropped to the spine's width, sitting under the vertical title.
  function addSpineCover(box, art) {
    if (!art) return;
    box.classList.add('has-art');
    box.style.backgroundImage = art.uri;
  }

  function renderShelfStrip(list) {
    const box = $('cat-shelf');
    box.textContent = '';
    list.forEach((it, i) => {
      const d = document.createElement('div');
      d.className = 'spine' + (i === catIdx ? ' active' : '');
      d.setAttribute('role', 'listitem');
      d.style.setProperty('--h', Array.from(it.t).reduce((n, c) => n + c.charCodeAt(0), 0) % 360);
      if (i === catIdx) {
        fillCover(d, it.t, it.a, '', artOfItem(it));
      } else {
        const span = document.createElement('span');
        span.textContent = titleOf(it);
        d.appendChild(span);
        addSpineCover(d, artOfItem(it));
      }
      d.addEventListener('click', () => setActiveSpine(i, list));
      box.appendChild(d);
    });
  }

  function renderCardGrid(list) {
    const box = $('cat-grid');
    box.textContent = '';
    list.forEach((it) => {
      const li = document.createElement('li');
      li.className = 'card';
      const cv = document.createElement('div');
      cv.className = 'cover';
      cv.setAttribute('aria-hidden', 'true');
      fillCover(cv, it.t, it.a, '', artOfItem(it));
      const h = document.createElement('h3');
      h.textContent = titleOf(it);
      const p = document.createElement('p');
      p.textContent = it.a || '';
      li.append(cv, h, p, actionFor(it));
      box.appendChild(li);
    });
  }

  function renderCatalog() {
    renderPills();
    const list = filteredCatalog();
    const empty = $('cat-empty');
    const hero = $('catalog');
    if (!list.length) {
      hero.classList.add('is-empty');
      $('cat-shelf').textContent = '';
      $('cat-feat').textContent = '';
      $('cat-grid').textContent = '';
      if (empty) empty.hidden = false;
      return;
    }
    hero.classList.remove('is-empty');
    if (empty) empty.hidden = true;
    if (catIdx >= list.length) catIdx = 0;
    renderShelfStrip(list);
    renderFeat(list[catIdx]);
    renderCardGrid(list);
  }

  $('sh-prev').addEventListener('click', () => setActiveSpine(catIdx - 1, filteredCatalog()));
  $('sh-next').addEventListener('click', () => setActiveSpine(catIdx + 1, filteredCatalog()));
  $('cat-search').addEventListener('input', (e) => {
    catQuery = e.target.value;
    catIdx = 0;
    renderCatalog();
  });

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
      const bgl = bgOf(b);
      if (bgl) li.appendChild(bgl);

      const cover = document.createElement('div');
      cover.className = 'cover';
      cover.setAttribute('aria-hidden', 'true');
      const hue = Array.from(b.id).reduce((s, c) => s + c.charCodeAt(0), 0) % 360;
      cover.style.setProperty('--h', hue);
      fillCover(cover, b.title, b.author, artOfBook(b) ? '' : b.cover, artOfBook(b));

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

  const prefs = { size: 18, lh: 1.7, theme: 'book', font: 'serif', rate: 1, voice: '', trans: false, vol: 1, mode: 'book', goal: 15 };
  try { Object.assign(prefs, JSON.parse(localStorage.getItem('libPrefs') || '{}')); } catch (_) {}
  const savePrefs = () => { try { localStorage.setItem('libPrefs', JSON.stringify(prefs)); } catch (_) {} };
  if ((prefs.v || 1) < 3) { prefs.theme = 'book'; prefs.font = 'serif'; prefs.v = 3; savePrefs(); } // new dim default look, applied once

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
    if (meta && current) meta.content = { book: '#1c1915', dark: '#0b0c10', sepia: '#f4ecd8', light: '#ffffff' }[prefs.theme];
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
  const srcLang = (b) => { const l = (b.lang || 'en').slice(0, 2).toLowerCase(); return l === 'zh' ? 'zh-CN' : l; };
  // Server first (Google's web translator, batched, fast); the browser's own translator is the fallback.
  let trNetDown = false;
  async function netTranslate(sl, texts) {
    const r = await fetch('/api/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sl, texts }) });
    if (!r.ok) throw new Error('http');
    const j = await r.json();
    if (!j.texts || j.texts.length !== texts.length) throw new Error('shape');
    return j.texts;
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
  async function translateTexts(book, texts) {
    if (!trNetDown) {
      try { return await netTranslate(srcLang(book), texts); } catch (_) { trNetDown = true; }
    }
    const tr = await getTranslator(srcLang(book).slice(0, 2));
    if (!tr) throw new Error('none');
    const out = [];
    for (const x of texts) out.push(await tr.translate(x));
    return out;
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
    // translate what is on screen first, then the rest of the chapter, in batches of up to 20 paragraphs
    const start = Math.max(0, Math.min(blocks.length - 1, firstVisibleIndex()));
    const order = [];
    for (let i = start; i < blocks.length; i++) order.push(i);
    for (let i = 0; i < start; i++) order.push(i);
    const batches = [];
    let cur = [];
    let chars = 0;
    order.filter((i) => !arr[i]).forEach((i) => {
      const len = blocks[i].t.length;
      if (cur.length && (cur.length >= 20 || chars + len > 3500)) { batches.push(cur); cur = []; chars = 0; }
      cur.push(i); chars += len;
    });
    if (cur.length) batches.push(cur);
    let done = 0;
    const total = batches.length;
    if (total) $('r-chap').textContent = `${t('tr.busy')}...`;
    let failed = false;
    const worker = async () => {
      while (batches.length && !failed) {
        const idxs = batches.shift();
        let out;
        try { out = await translateTexts(book, idxs.map((i) => blocks[i].t)); } catch (_) { failed = true; return; }
        if (token !== trRun) return;
        idxs.forEach((i, k) => { arr[i] = out[k] || blocks[i].t; const el = page.querySelector(`[data-i="${i}"]`); if (el && chIdx === ci) el.textContent = arr[i]; });
        done++;
        $('r-chap').textContent = `${t('tr.busy')} ${Math.round((done / total) * 100)}%`;
      }
    };
    await Promise.all([worker(), worker()]);
    if (token !== trRun) return;
    if (failed) { stopTrans(); showToast(trNetDown && !('Translator' in self) ? t('tr.none') : t('tr.fail')); renderChapter(ci, scrollFrac()); return; }
    renderChapterLabel();
    putOne('kv', arr, 'tr:' + key).catch(() => {});
  }
  $('r-trans').addEventListener('click', () => {
    if (!current) return;
    if (transOn) { stopTrans(); prefs.trans = false; savePrefs(); renderChapter(chIdx, scrollFrac()); return; }
    transOn = true; prefs.trans = true; savePrefs(); updateTransUi();
    renderChapter(chIdx, scrollFrac());
  });

  function bannerEl(b) {
    const d = document.createElement('header');
    d.className = 'rbanner';
    d.style.setProperty('--h', Array.from(b.id).reduce((n, c) => n + c.charCodeAt(0), 0) % 360);
    const bgr = bgOf(b);
    if (bgr) { d.appendChild(bgr); if (bgr.classList.contains('art')) d.classList.add('has-art'); }
    const th = document.createElement('div');
    th.className = 'rb-cover';
    fillCover(th, b.title, b.author, artOfBook(b) ? '' : b.cover, artOfBook(b));
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
    if (ttsOn && !ttsAdvancing) ttsStop(); else if (!ttsAdvancing) { ttsChunks = []; }
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
    scheduleSyncPush();
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
    transOn = !!prefs.trans && !isVi;
    updateTransUi();
    renderChapter(p ? p.ch : 0, p ? p.frac : 0);
    renderSheets();
    history.replaceState(null, '', '#' + id);
    window.scrollTo(0, 0);
    if (p) requestAnimationFrame(() => requestAnimationFrame(() => { const max = document.documentElement.scrollHeight - innerHeight; window.scrollTo(0, (p.frac || 0) * max); updateProgress(); }));
  }

  function closeBook() {
    saveProgress();
    ttsOpen = false; ttsStop(); flushStats();
    trRun++;
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
    renderStats();
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
  function saveMarks() { putOne('kv', marks, 'm:' + current.id).catch(() => {}); scheduleSyncPush(); }

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
      if (m.n) { const nt = document.createElement('em'); nt.className = 'mnote'; nt.textContent = m.n; go.appendChild(nt); }
      go.addEventListener('click', () => { hideSheet(); saveProgress(); renderChapter(m.ch, null, m.i); saveProgress(); });
      const ed = document.createElement('button');
      ed.type = 'button';
      ed.className = 'icon-btn';
      ed.setAttribute('aria-label', t('mark.note'));
      ed.title = t('mark.note');
      ed.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>';
      ed.addEventListener('click', () => editNote(m, li));
      const rm = document.createElement('button');
      rm.type = 'button';
      rm.className = 'icon-btn';
      rm.setAttribute('aria-label', t('b.delete'));
      rm.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
      rm.addEventListener('click', () => { marks = marks.filter((x) => x !== m); saveMarks(); markBookmarked(); renderSheets(); });
      li.append(go, ed, rm);
      ml.appendChild(li);
    });
  }


  // --- notes on bookmarks ---
  function editNote(m, li) {
    if (li.querySelector('.nedit')) return;
    const box = document.createElement('input');
    box.type = 'text';
    box.className = 'nedit';
    box.maxLength = 300;
    box.value = m.n || '';
    box.placeholder = t('mark.notePh');
    const finish = (keep) => {
      if (keep) { m.n = box.value.trim(); if (!m.n) delete m.n; saveMarks(); }
      renderSheets();
    };
    box.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); finish(true); } else if (e.key === 'Escape') { e.stopPropagation(); finish(false); } });
    box.addEventListener('blur', () => finish(true));
    li.style.flexWrap = 'wrap';
    li.appendChild(box);
    box.focus();
  }

  // --- export bookmarks as a plain text file ---
  $('mark-export').addEventListener('click', () => {
    if (!current || !marks.length) return;
    const lines = [current.title, '='.repeat(Math.min(60, current.title.length)), ''];
    marks.slice().sort((a, b) => a.ch - b.ch || a.i - b.i).forEach((m) => {
      const ch = current.chapters[m.ch];
      const full = ch && ch.blocks[m.i] ? ch.blocks[m.i].t : m.s;
      lines.push(`[${ch ? ch.title : ''}]`, full.length > 400 ? full.slice(0, 400) + '…' : full);
      if (m.n) lines.push('> ' + m.n);
      lines.push(new Date(m.t).toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US'), '');
    });
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = (current.title.replace(/[\\/:*?"<>|]+/g, ' ').trim().slice(0, 60) || 'book') + ' - bookmarks.txt';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    showToast(t('mark.exported'));
  });

  // --- search inside the open book (ignores case and Vietnamese accents) ---
  const fold = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
  let qTimer = null;
  function runSearch() {
    const list = $('q-list');
    list.textContent = '';
    const raw = $('q').value.trim();
    const note = (msg) => { const li = document.createElement('li'); li.className = 'none'; li.textContent = msg; list.appendChild(li); };
    if (!current) return;
    if (raw.length < 2) { if (raw.length) note(t('q.min')); return; }
    const q = fold(raw);
    let n = 0;
    outer: for (let c = 0; c < current.chapters.length; c++) {
      const blocks = current.chapters[c].blocks;
      for (let i = 0; i < blocks.length; i++) {
        const text = blocks[i].t;
        const at = fold(text).indexOf(q);
        if (at < 0) continue;
        if (++n > 100) break outer;
        const li = document.createElement('li');
        li.className = 'mrow';
        const go = document.createElement('button');
        go.type = 'button';
        const head = document.createElement('b');
        head.textContent = current.chapters[c].title;
        const snip = document.createElement('span');
        const from = Math.max(0, at - 40);
        snip.textContent = (from ? '…' : '') + text.slice(from, at + raw.length + 70) + (at + raw.length + 70 < text.length ? '…' : '');
        go.append(head, snip);
        go.addEventListener('click', () => {
          hideSheet(); saveProgress(); renderChapter(c, null, i); saveProgress();
          requestAnimationFrame(() => { const el = page.querySelector(`[data-i="${i}"]`); if (el) { el.classList.add('found'); setTimeout(() => el.classList.remove('found'), 2600); } });
        });
        li.appendChild(go);
        list.appendChild(li);
      }
    }
    if (!n) note(t('q.none'));
    else if (n > 100) note(t('q.cap'));
  }
  $('q').addEventListener('input', () => { clearTimeout(qTimer); qTimer = setTimeout(runSearch, 200); });
  $('r-search').addEventListener('click', () => {
    renderSheets();
    showSheet($('sheet-toc'));
    const tab = document.querySelector('#toc-tabs button[data-tab="search"]');
    if (tab) tab.click();
    $('q').focus();
  });

  $('r-toc').addEventListener('click', () => { renderSheets(); showSheet($('sheet-toc')); });
  $('r-aa').addEventListener('click', () => showSheet($('sheet-aa')));
  document.querySelectorAll('#toc-tabs button').forEach((b) => b.addEventListener('click', () => {
    document.querySelectorAll('#toc-tabs button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    $('toc-list').hidden = b.dataset.tab !== 'chapters';
    $('mark-list').hidden = b.dataset.tab !== 'marks';
    $('mark-tools').hidden = b.dataset.tab !== 'marks' || !marks.length;
    $('search-pane').hidden = b.dataset.tab !== 'search';
  }));

  $('aa-size').addEventListener('input', (e) => { prefs.size = Number(e.target.value); savePrefs(); applyPrefs(); });
  $('aa-lh').addEventListener('input', (e) => { prefs.lh = Number(e.target.value); savePrefs(); applyPrefs(); });
  document.querySelectorAll('#aa-theme button').forEach((b) => b.addEventListener('click', () => { prefs.theme = b.dataset.theme; savePrefs(); applyPrefs(); }));
  document.querySelectorAll('#aa-font button').forEach((b) => b.addEventListener('click', () => { prefs.font = b.dataset.font; savePrefs(); applyPrefs(); }));

  document.addEventListener('keydown', (e) => {
    if (!current || openSheet) return;
    if (e.target.matches('input, select, textarea')) return;
    if (e.key === 'ArrowRight') $('r-next').click();
    else if (e.key === 'ArrowLeft') $('r-prev').click();
  });


  // ---------------------------------------------------------------------------
  // Backup: export / import reading progress, bookmarks and reading settings
  // ---------------------------------------------------------------------------
  const PREF_KEYS = { size: 'number', lh: 'number', theme: 'string', font: 'string', rate: 'number', vol: 'number', mode: 'string', goal: 'number' };

  async function addCatalogBook(it) { // same as "Read now" but without opening it
    const res = await fetch(`/library/books/${it.id}.json.gz`);
    if (!res.ok) throw new Error('http');
    const data = await gunzipJson(await res.arrayBuffer());
    const chapters = data.ch.map((c, i) => ({ title: c.t || `${t('r.chapter')} ${i + 1}`, blocks: c.p.map((p) => ({ t: p })) }));
    const book = { id: uid(), sig: 'gb' + it.id, title: it.t, author: it.a, kind: 'txt', lang: data.lang || 'en', cover: coverOf(it), fileName: fileOf(it), size: 0, added: Date.now(), chapters };
    await putOne('books', book);
    return book;
  }

  async function buildBackup() {
    const out = { app: 'vinhx-library', v: 2, exported: new Date().toISOString(), prefs: {}, books: [], stats: { days: statsDays } };
    for (const k of Object.keys(PREF_KEYS)) if (prefs[k] !== undefined) out.prefs[k] = prefs[k];
    for (const b of books) {
      let m = [];
      try { m = (await getOne('kv', 'm:' + b.id)) || []; } catch (_) {}
      const p = progressMap[b.id] || null;
      if (!p && !m.length) continue;
      out.books.push({ sig: b.sig, title: b.title, author: b.author || '', p, marks: m });
    }
    return out;
  }

  async function exportBackup() {
    const out = await buildBackup();
    if (!out.books.length && !Object.keys(statsDays).length) { showToast(t('bk.none')); return; }
    const url = URL.createObjectURL(new Blob([JSON.stringify(out, null, 1)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `vinhx-library-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    showToast(t('bk.exported'));
  }

  const num = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : null);
  const validBackup = (data) => !!data && typeof data === 'object' && data.app === 'vinhx-library' && Array.isArray(data.books) && data.books.length <= 1000;

  // Merges a backup into this device: newest progress wins, bookmarks are joined, reading time takes the larger value.
  // opts.prefs: also take the reading preferences (file import yes, background sync no); opts.maxAdd: cap on books fetched.
  async function mergeBackup(data, opts = {}) {
    let done = 0, skipped = 0, added = 0, more = false;
    for (const e of data.books) {
      if (!e || typeof e !== 'object') continue;
      const sig = typeof e.sig === 'string' ? e.sig.slice(0, 300) : '';
      let book = books.find((b) => b.sig === sig) || books.find((b) => e.title && b.title === e.title && (b.author || '') === (e.author || ''));
      const m = /^gb(\d+)$/.exec(sig);
      if (!book && m) {
        const it = CATALOG.find((c) => c.id === Number(m[1]));
        if (it && added >= (opts.maxAdd || Infinity)) { more = true; continue; }
        if (it) { try { book = await addCatalogBook(it); books.push(book); added++; } catch (_) { /* offline or missing file */ } }
      }
      if (!book) { skipped++; continue; }
      const p = e.p && num(e.p.ch) !== null ? { ch: Math.max(0, Math.min(book.chapters.length - 1, Math.floor(e.p.ch))), frac: Math.max(0, Math.min(1, num(e.p.frac) || 0)), t: num(e.p.t) || 0 } : null;
      const cur = progressMap[book.id];
      if (p && (!cur || p.t > (cur.t || 0))) { progressMap[book.id] = p; await putOne('kv', p, 'p:' + book.id).catch(() => {}); }
      if (Array.isArray(e.marks)) {
        let mine = [];
        try { mine = (await getOne('kv', 'm:' + book.id)) || []; } catch (_) {}
        const seen = new Set(mine.map(markKey));
        let grew = false;
        for (const x of e.marks.slice(0, 500)) {
          if (!x || num(x.ch) === null || num(x.i) === null || !book.chapters[x.ch]) continue;
          const mk = { ch: Math.floor(x.ch), i: Math.floor(x.i), s: String(x.s || '').slice(0, 200), t: num(x.t) || Date.now() };
          if (typeof x.n === 'string' && x.n.trim()) mk.n = x.n.slice(0, 300);
          if (seen.has(markKey(mk))) continue;
          seen.add(markKey(mk)); mine.push(mk); grew = true;
        }
        if (grew) await putOne('kv', mine, 'm:' + book.id).catch(() => {});
      }
      done++;
    }
    if (data.stats && data.stats.days && typeof data.stats.days === 'object') {
      let changed = false;
      for (const [k, v] of Object.entries(data.stats.days)) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(k) || num(v) === null) continue;
        const secs = Math.max(0, Math.min(86400, Math.floor(v)));
        if (secs > (statsDays[k] || 0)) { statsDays[k] = secs; changed = true; }
      }
      if (changed) { pruneStats(); await putOne('kv', statsDays, 'stats').catch(() => {}); }
    }
    if (opts.prefs && data.prefs && typeof data.prefs === 'object') {
      for (const [k, ty] of Object.entries(PREF_KEYS)) if (typeof data.prefs[k] === ty) prefs[k] = data.prefs[k];
      savePrefs(); applyPrefs();
    }
    if (current) { try { marks = (await getOne('kv', 'm:' + current.id)) || marks; } catch (_) {} }
    return { done, skipped, more };
  }

  async function importBackup(file) {
    let data;
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error('big');
      data = JSON.parse(await file.text());
      if (!validBackup(data)) throw new Error('bad');
    } catch (_) { showToast(t('bk.bad')); return; }
    const { done, skipped } = await mergeBackup(data, { prefs: true });
    await loadShelf();
    renderShelf();
    renderStats();
    showToast(`${t('bk.done')} ${done} ${t('bk.books')}${skipped ? `, ${skipped} ${t('bk.skipped')}` : ''}`);
  }
  $('bk-export').addEventListener('click', exportBackup);
  $('bk-import').addEventListener('click', () => $('bk-file').click());
  $('bk-file').addEventListener('change', () => { const f = $('bk-file').files[0]; $('bk-file').value = ''; if (f) importBackup(f); });

  // ---------------------------------------------------------------------------
  // Reading habit: minutes read per day (counted only while the tab is visible and you are active)
  // ---------------------------------------------------------------------------
  let statsDays = {};     // 'YYYY-MM-DD' -> seconds
  let statsDirty = false;
  let statsTimer = null;
  let lastAct = 0;
  const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const shiftDay = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return dayKey(d); };

  function pruneStats() {
    const keys = Object.keys(statsDays).sort();
    keys.slice(0, Math.max(0, keys.length - 400)).forEach((k) => { delete statsDays[k]; });
  }
  async function loadStats() {
    try { statsDays = (await getOne('kv', 'stats')) || {}; } catch (_) { statsDays = {}; }
    if (typeof statsDays !== 'object' || Array.isArray(statsDays)) statsDays = {};
  }
  function flushStats() {
    clearTimeout(statsTimer); statsTimer = null;
    if (!statsDirty) return;
    statsDirty = false;
    pruneStats();
    putOne('kv', statsDays, 'stats').catch(() => {});
    scheduleSyncPush();
  }
  ['scroll', 'keydown', 'pointerdown', 'touchstart', 'wheel'].forEach((ev) => window.addEventListener(ev, () => { lastAct = Date.now(); }, { passive: true }));
  setInterval(() => {
    if (!current || document.hidden) return;
    if (Date.now() - lastAct > 90000 && !ttsOn) return; // idle: not reading
    const k = dayKey();
    statsDays[k] = Math.min(86400, (statsDays[k] || 0) + 5);
    statsDirty = true;
    if (!statsTimer) statsTimer = setTimeout(flushStats, 30000);
  }, 5000);
  window.addEventListener('pagehide', flushStats);
  document.addEventListener('visibilitychange', () => { if (document.hidden) flushStats(); });

  const minutesOf = (k) => Math.floor((statsDays[k] || 0) / 60);
  function streakDays() {
    let n = 0;
    let i = (statsDays[dayKey()] || 0) >= 60 ? 0 : -1; // today may still be in progress
    while ((statsDays[shiftDay(i)] || 0) >= 60) { n++; i--; }
    return n;
  }
  function renderStats() {
    const box = $('stats');
    if (!box) return;
    const goal = Math.max(5, Number(prefs.goal) || 15);
    const today = minutesOf(dayKey());
    $('st-today').textContent = String(today);
    $('st-goal-val').textContent = String(goal);
    $('st-bar').style.width = Math.min(100, (today / goal) * 100) + '%';
    $('st-streak').textContent = String(streakDays());
    $('st-hit').hidden = today < goal;
    const days = [];
    let weekTotal = 0;
    for (let i = 6; i >= 0; i--) { const k = shiftDay(-i); const m = minutesOf(k); weekTotal += m; days.push([k, m]); }
    $('st-week').textContent = String(weekTotal);
    const peak = Math.max(goal, ...days.map((d) => d[1]));
    const chart = $('st-chart');
    chart.textContent = '';
    days.forEach(([k, m], idx) => {
      const col = document.createElement('div');
      col.className = 'st-col' + (idx === 6 ? ' now' : '');
      col.title = `${k}: ${m} ${t('st.min')}`;
      const bar = document.createElement('i');
      bar.style.height = Math.max(m > 0 ? 6 : 2, (m / peak) * 100) + '%';
      if (m >= goal) bar.className = 'hit';
      const lab = document.createElement('span');
      lab.textContent = String(new Date(k + 'T12:00:00').getDate());
      col.append(bar, lab);
      chart.appendChild(col);
    });
    $('st-goal').value = String(goal);
  }
  $('st-goal').addEventListener('change', () => { prefs.goal = Number($('st-goal').value) || 15; savePrefs(); renderStats(); scheduleSyncPush(); });
  setInterval(() => { if (!current && !document.hidden) renderStats(); }, 60000);

  // ---------------------------------------------------------------------------
  // Sync between devices. The code never leaves the browser: an id (hash of the code) is used to look
  // the data up and a key derived from the code encrypts it, so /api/sync only stores ciphertext.
  // ---------------------------------------------------------------------------
  const SYNC_LS = 'vxLibSync';
  const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 32 symbols without look-alikes (no I, O, 0, 1)
  const enc = new TextEncoder();
  const hex = (buf) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
  const toB64 = (buf) => { let s = ''; const u = new Uint8Array(buf); for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
  const fromB64 = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  let syncBusy = false;
  let syncTimer = null;
  let syncAt = 0;

  const getSync = () => { try { const x = JSON.parse(localStorage.getItem(SYNC_LS) || 'null'); return x && typeof x.code === 'string' ? x : null; } catch (_) { return null; } };
  const setSync = (x) => { try { if (x) localStorage.setItem(SYNC_LS, JSON.stringify(x)); else localStorage.removeItem(SYNC_LS); } catch (_) {} };
  const genCode = () => {
    const r = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(r, (b) => CODE_CHARS[b & 31]).join('').replace(/(.{4})(?=.)/g, '$1-');
  };
  const normCode = (txt) => {
    const c = String(txt || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    return c.length === 16 && [...c].every((ch) => CODE_CHARS.includes(ch)) ? c.replace(/(.{4})(?=.)/g, '$1-') : '';
  };
  async function syncKeys(code) {
    const id = hex(await crypto.subtle.digest('SHA-256', enc.encode('vx-lib-id|' + code))).slice(0, 32);
    const mat = await crypto.subtle.importKey('raw', enc.encode(code), 'PBKDF2', false, ['deriveKey']);
    const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: enc.encode('vx-lib-key|v1'), iterations: 150000, hash: 'SHA-256' }, mat, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    return { id, key };
  }
  async function seal(key, obj) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(JSON.stringify(obj)));
    return { iv: toB64(iv), ct: toB64(ct) };
  }
  async function unseal(key, d) {
    const raw = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(d.iv) }, key, fromB64(d.ct));
    return JSON.parse(new TextDecoder().decode(raw));
  }
  async function syncApi(method, qs, body) {
    const r = await fetch('/api/sync' + qs, { method, headers: body ? { 'Content-Type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined });
    let json = null;
    try { json = await r.json(); } catch (_) {}
    return { status: r.status, json: json || {} };
  }
  // what is compared to decide whether anything changed (the export time and book order do not matter)
  const stableBackup = (d) => JSON.stringify({ p: d.prefs && d.prefs.goal, s: d.stats && d.stats.days, b: d.books.map((b) => ({ g: b.sig, p: b.p, m: (b.marks || []).map(markKey).sort() })).sort((x, y) => (x.g < y.g ? -1 : 1)) });

  function syncStatus(text, bad) {
    const el = $('sy-status');
    if (!el) return;
    el.textContent = text;
    el.classList.toggle('bad', !!bad);
  }
  function renderSync() {
    const st = getSync();
    $('sy-off').hidden = !!st;
    $('sy-on').hidden = !st;
    if (st) {
      $('sy-show').textContent = st.code;
      syncStatus(st.last ? `${t('sy.ok')} ${new Date(st.last).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : t('sy.never'));
    }
  }

  // pull, merge, push. Returns 'ok' | 'notfound' | 'off' | 'limit' | 'net'
  async function syncNow() {
    const st = getSync();
    if (!st || syncBusy) return 'net';
    syncBusy = true;
    syncStatus(t('sy.busy'));
    let result = 'net';
    try {
      const { id, key } = await syncKeys(st.code);
      for (let attempt = 0; attempt < 3; attempt++) {
        const r = await syncApi('GET', '?id=' + id);
        if (r.status === 503) { result = 'off'; break; }
        if (r.status === 429) { result = 'limit'; break; }
        if (r.status !== 200 && r.status !== 404) break;
        let remote = null;
        let rev = 0;
        let more = false;
        if (r.status === 200) {
          rev = r.json.data.rev;
          try { remote = await unseal(key, r.json.data); } catch (_) { break; }
          if (!validBackup(remote)) break;
          more = (await mergeBackup(remote, { maxAdd: 25 })).more;
        } else if (st.known) { result = 'notfound'; break; } // it existed before and is gone: do not silently re-create
        const mine = await buildBackup();
        if (remote && stableBackup(remote) === stableBackup(mine) && !more) { result = 'ok'; break; }
        const put = await syncApi('PUT', '', { id, base: rev, data: await seal(key, mine) });
        if (put.status === 409) continue;
        if (put.status === 503) { result = 'off'; break; }
        if (put.status === 429) { result = 'limit'; break; }
        if (put.status !== 200) break;
        result = more ? 'more' : 'ok';
        break;
      }
    } catch (_) { result = 'net'; }
    syncBusy = false;
    if (result === 'ok' || result === 'more') {
      syncAt = Date.now();
      setSync({ code: st.code, known: true, last: syncAt });
      loadShelf().then(() => { if (!current) renderShelf(); renderStats(); });
    }
    renderSync();
    if (result === 'more') syncStatus(t('sy.more'), true);
    else if (result === 'off') syncStatus(t('sy.off'), true);
    else if (result === 'limit') syncStatus(t('sy.limit'), true);
    else if (result === 'notfound') syncStatus(t('sy.nf'), true);
    else if (result === 'net') syncStatus(t('sy.net'), true);
    return result;
  }

  function scheduleSyncPush() {
    if (!getSync()) return;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => { syncNow(); }, 25000);
  }

  $('sy-create').addEventListener('click', async () => {
    if (!window.crypto || !crypto.subtle) { showToast(t('sy.off')); return; }
    setSync({ code: genCode(), known: false, last: 0 });
    renderSync();
    const r = await syncNow();
    if (r !== 'ok' && r !== 'more') { setSync(null); renderSync(); showToast(r === 'off' ? t('sy.off') : r === 'limit' ? t('sy.limit') : t('sy.net')); }
  });
  $('sy-join').addEventListener('click', async () => {
    if (!window.crypto || !crypto.subtle) { showToast(t('sy.off')); return; }
    const code = normCode($('sy-code').value);
    if (!code) { showToast(t('sy.bad')); return; }
    try {
      const { id } = await syncKeys(code);
      const r = await syncApi('GET', '?id=' + id);
      if (r.status === 404) { showToast(t('sy.nf')); return; }
      if (r.status === 503) { showToast(t('sy.off')); return; }
      if (r.status === 429) { showToast(t('sy.limit')); return; }
      if (r.status !== 200) { showToast(t('sy.net')); return; }
    } catch (_) { showToast(t('sy.net')); return; }
    setSync({ code, known: true, last: 0 });
    $('sy-code').value = '';
    renderSync();
    showToast(t('sy.joined'));
    syncNow();
  });
  $('sy-code').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('sy-join').click(); });
  $('sy-now').addEventListener('click', () => { syncNow(); });
  $('sy-copy').addEventListener('click', async () => {
    const st = getSync();
    if (!st) return;
    try { await navigator.clipboard.writeText(st.code); showToast(t('sy.copied')); } catch (_) { showToast(st.code); }
  });
  $('sy-leave').addEventListener('click', () => { clearTimeout(syncTimer); setSync(null); renderSync(); showToast(t('sy.left')); });
  let wipeArmed = null;
  $('sy-wipe').addEventListener('click', async () => {
    const st = getSync();
    if (!st) return;
    if (!wipeArmed) {
      $('sy-wipe').textContent = t('sy.wipeAgain');
      wipeArmed = setTimeout(() => { wipeArmed = null; $('sy-wipe').textContent = t('sy.wipe'); }, 3000);
      return;
    }
    clearTimeout(wipeArmed); wipeArmed = null;
    $('sy-wipe').textContent = t('sy.wipe');
    try { const { id } = await syncKeys(st.code); await syncApi('DELETE', '?id=' + id); } catch (_) {}
    clearTimeout(syncTimer); setSync(null); renderSync(); showToast(t('sy.wiped'));
  });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && getSync() && Date.now() - syncAt > 60000) syncNow(); });

  // ---------------------------------------------------------------------------
  // Read aloud: the device's own speech voices, paragraph by paragraph, with speed, voice and a sleep timer
  // ---------------------------------------------------------------------------
  const synth = window.speechSynthesis;
  const ttsOk = !!(synth && window.SpeechSynthesisUtterance);
  let ttsOn = false;          // speaking right now
  let ttsOpen = false;        // control bar visible
  let ttsIdx = 0;             // paragraph being read
  let ttsChunks = [];         // sentences of that paragraph
  let ttsC = 0;               // chunk being read
  let ttsToken = 0;
  let ttsSleepAt = 0;         // timestamp, 0 = no timer
  let ttsSleepChapter = false;
  let ttsAdvancing = false;

  const splitChunks = (text) => {
    const parts = text.match(/[^.!?…。]+[.!?…。]+["”’')\]]*\s*|[^.!?…。]+$/g) || [text];
    const out = [];
    let cur = '';
    parts.forEach((p) => {
      if (cur && (cur + p).length > 220) { out.push(cur.trim()); cur = ''; }
      cur += p;
      while (cur.length > 300) { const cut = cur.lastIndexOf(' ', 260); const at = cut > 80 ? cut : 260; out.push(cur.slice(0, at).trim()); cur = cur.slice(at); }
    });
    if (cur.trim()) out.push(cur.trim());
    return out;
  };

  function ttsVoices() {
    if (!ttsOk) return [];
    const all = synth.getVoices() || [];
    const want = ((page.lang || (current && current.lang) || 'en') + '').slice(0, 2).toLowerCase();
    const match = all.filter((v) => (v.lang || '').slice(0, 2).toLowerCase() === want);
    // natural-sounding voices first (Edge/Windows "Natural" voices such as HoaiMy and NamMinh, Google, Apple), so "Automatic" picks the best one
    const score = (v) => (/natural|neural|online/i.test(v.name) ? 3 : 0) + (/hoaimy|namminh|google|siri|premium|enhanced/i.test(v.name) ? 2 : 0) + (v.localService ? 0 : 1);
    return (match.length ? match : all).slice().sort((x, y) => score(y) - score(x));
  }
  // VieNeu-TTS server behind /api/tts (optional): found out once, the first time the read-aloud bar opens
  const ttsRemote = { configured: false, voices: [], default: '', asked: false, failedAt: 0 };
  let ttsAudio = null;
  const ttsCache = new Map();
  async function askRemote() {
    if (ttsRemote.asked) return;
    ttsRemote.asked = true;
    try {
      const r = await fetch('/api/tts');
      const j = await r.json();
      ttsRemote.configured = !!j.configured;
      ttsRemote.voices = Array.isArray(j.voices) ? j.voices : [];
      ttsRemote.default = j.default || '';
    } catch (_) { /* stays off */ }
    fillVoices();
  }
  // which VieNeu voice to use for the current text, or null for the browser voice
  function remoteVoice() {
    if (!ttsRemote.configured || Date.now() - ttsRemote.failedAt < 300000) return null;
    if (prefs.voice && prefs.voice.startsWith('vx:')) return prefs.voice.slice(3);
    if (!prefs.voice && /^vi/i.test(page.lang || (current && current.lang) || '')) return ttsRemote.default || ttsRemote.voices[0] || '';
    return null;
  }
  function remoteFetch(text, voice) {
    const key = voice + '|' + text;
    if (ttsCache.has(key)) return ttsCache.get(key);
    const p = fetch('/api/tts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, voice }) })
      .then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.blob(); });
    ttsCache.set(key, p);
    p.catch(() => ttsCache.delete(key));
    if (ttsCache.size > 8) ttsCache.delete(ttsCache.keys().next().value);
    return p;
  }
  // the sentence that will be read after this one, fetched while the current one plays
  function peekNext() {
    if (ttsC + 1 < ttsChunks.length) return ttsChunks[ttsC + 1];
    const nx = current && current.chapters[chIdx].blocks[ttsIdx + 1] ? (textOf(ttsIdx + 1) || '').trim() : '';
    return nx ? splitChunks(nx)[0] : '';
  }

  function fillVoices() {
    const sel = $('tts-voice');
    if (!sel) return;
    const list = ttsVoices();
    sel.textContent = '';
    const auto = document.createElement('option');
    auto.value = ''; auto.textContent = t('tts.auto');
    sel.appendChild(auto);
    if (ttsRemote.configured) {
      const grp = document.createElement('optgroup');
      grp.label = t('tts.remote');
      (ttsRemote.voices.length ? ttsRemote.voices : [ttsRemote.default || '']).forEach((n) => { const o = document.createElement('option'); o.value = 'vx:' + n; o.textContent = n || 'VieNeu'; grp.appendChild(o); });
      sel.appendChild(grp);
    }
    list.forEach((v) => { const o = document.createElement('option'); o.value = v.name; o.textContent = `${v.name} (${v.lang})`; sel.appendChild(o); });
    sel.value = Array.from(sel.options).some((o) => o.value === prefs.voice) ? prefs.voice : '';
  }
  if (ttsOk && synth.addEventListener) synth.addEventListener('voiceschanged', fillVoices);

  function clearSpeaking() { page.querySelectorAll('.speaking').forEach((el) => el.classList.remove('speaking')); }
  function ttsStop() {
    ttsToken++;
    ttsOn = false;
    ttsSleepAt = 0;
    if (ttsAudio) ttsAudio.pause();
    if (ttsOk) synth.cancel();
    clearSpeaking();
    updateTtsUi();
  }
  function ttsPause() {
    ttsToken++;
    ttsOn = false;
    if (ttsAudio) ttsAudio.pause();
    if (ttsOk) synth.cancel();
    updateTtsUi();
  }
  function ttsLoadParagraph() {
    const ch = current.chapters[chIdx];
    while (ttsIdx < ch.blocks.length) {
      const txt = (textOf(ttsIdx) || '').trim();
      if (txt) { ttsChunks = splitChunks(txt); ttsC = 0; return true; }
      ttsIdx++;
    }
    return false;
  }
  function ttsSpeak() {
    if (!ttsOn || !current) return;
    if (!ttsChunks.length || ttsC >= ttsChunks.length) {
      if (ttsChunks.length) ttsIdx++;
      ttsChunks = [];
      if (!ttsLoadParagraph()) {
        // end of the chapter: stop, or carry on into the next one
        if (ttsSleepChapter || chIdx >= current.chapters.length - 1) { ttsStop(); return; }
        ttsAdvancing = true;
        saveProgress();
        renderChapter(chIdx + 1, 0);
        window.scrollTo(0, 0);
        ttsAdvancing = false;
        saveProgress();
        ttsIdx = 0;
        ttsChunks = [];
        if (!ttsLoadParagraph()) { ttsStop(); return; }
      }
    }
    if (ttsSleepAt && Date.now() >= ttsSleepAt) { ttsStop(); return; }
    clearSpeaking();
    const el = page.querySelector(`[data-i="${ttsIdx}"]`);
    if (el) { el.classList.add('speaking'); if (ttsC === 0) { const r = el.getBoundingClientRect(); if (r.top < 80 || r.bottom > innerHeight - 90) el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } }
    const tok = ++ttsToken;
    const next = () => { if (tok !== ttsToken || !ttsOn) return; ttsC++; ttsSpeak(); };
    const rv = remoteVoice();
    if (rv !== null) {
      if (!ttsAudio) ttsAudio = new Audio();
      const audio = ttsAudio;
      const fallback = () => {
        if (tok !== ttsToken) return;
        ttsRemote.failedAt = Date.now();
        showToast(t('tts.remoteFail'));
        ttsC = Math.max(0, ttsC); // read this sentence again with the browser voice
        ttsSpeak();
      };
      remoteFetch(ttsChunks[ttsC], rv).then((blob) => {
        if (tok !== ttsToken) return;
        const url = URL.createObjectURL(blob);
        audio.onended = () => { URL.revokeObjectURL(url); next(); };
        audio.onerror = () => { URL.revokeObjectURL(url); fallback(); };
        audio.src = url;
        audio.playbackRate = Math.max(0.5, Math.min(2, Number(prefs.rate) || 1));
        audio.play().catch(fallback);
        const ahead = peekNext();
        if (ahead) remoteFetch(ahead, rv).catch(() => {});
      }).catch(fallback);
      return;
    }
    const u = new SpeechSynthesisUtterance(ttsChunks[ttsC]);
    u.lang = page.lang || current.lang || 'en';
    u.rate = Math.max(0.5, Math.min(2.5, Number(prefs.rate) || 1));
    const vs = ttsVoices();
    const v = vs.find((x) => x.name === prefs.voice) || (vs[0] && (vs[0].lang || '').slice(0, 2).toLowerCase() === (u.lang || '').slice(0, 2).toLowerCase() ? vs[0] : null);
    if (v) { u.voice = v; u.lang = v.lang; }
    u.onend = next;
    u.onerror = (e) => { if (tok !== ttsToken) return; if (e && (e.error === 'interrupted' || e.error === 'canceled')) return; next(); };
    synth.cancel();
    synth.speak(u);
  }
  function ttsPlay() {
    if (!ttsOk || !current) { showToast(t('tts.none')); return; }
    if (!ttsChunks.length) { ttsIdx = firstVisibleIndex(); ttsLoadParagraph(); }
    ttsOn = true;
    if (ttsRemote.configured) { // a click is what lets the browser play sound later, so touch the audio element now
      if (!ttsAudio) ttsAudio = new Audio();
      ttsAudio.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=';
      ttsAudio.play().catch(() => {});
    }
    updateTtsUi();
    ttsSpeak();
  }
  function ttsSkip(dir) {
    if (!ttsOk || !current) return;
    const ch = current.chapters[chIdx];
    ttsIdx = Math.max(0, Math.min(ch.blocks.length - 1, ttsIdx + dir));
    ttsChunks = [];
    ttsLoadParagraph();
    if (ttsOn) { ttsToken++; synth.cancel(); ttsSpeak(); } else { clearSpeaking(); const el = page.querySelector(`[data-i="${ttsIdx}"]`); if (el) { el.classList.add('speaking'); el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } }
  }
  function updateTtsUi() {
    const bar = $('tts-bar');
    if (!bar) return;
    bar.hidden = !(ttsOpen && current);
    document.body.classList.toggle('has-tts', ttsOpen && !!current);
    $('r-tts').setAttribute('aria-pressed', String(ttsOpen));
    $('tts-play').setAttribute('aria-label', ttsOn ? t('tts.pause') : t('tts.play'));
    $('tts-play').title = ttsOn ? t('tts.pause') : t('tts.play');
    $('tts-play').classList.toggle('playing', ttsOn);
    $('tts-play').firstElementChild.innerHTML = ttsOn ? '<path d="M8 5v14M16 5v14"/>' : '<path d="M7 4l13 8-13 8z" fill="currentColor"/>';
    $('tts-speed').setAttribute('aria-label', t('tts.speed')); $('tts-voice').setAttribute('aria-label', t('tts.voice')); $('tts-sleep').setAttribute('aria-label', t('tts.sleep'));
    const sl = $('tts-sleep');
    [['0', t('tts.off')], ['15', '15 ' + t('tts.min')], ['30', '30 ' + t('tts.min')], ['60', '60 ' + t('tts.min')], ['ch', t('tts.chapter')]].forEach(([, txt], i) => { if (sl.options[i]) sl.options[i].textContent = txt; });
    $('tts-prev').setAttribute('aria-label', t('tts.prev')); $('tts-next').setAttribute('aria-label', t('tts.next')); $('tts-close').setAttribute('aria-label', t('tts.close'));
  }
  $('r-tts').addEventListener('click', () => {
    if (!ttsOk) { showToast(t('tts.none')); return; }
    ttsOpen = !ttsOpen;
    if (ttsOpen) { fillVoices(); askRemote(); $('tts-speed').value = String(prefs.rate || 1); } else ttsStop();
    updateTtsUi();
  });
  $('tts-close').addEventListener('click', () => { ttsOpen = false; ttsStop(); });
  $('tts-play').addEventListener('click', () => { if (ttsOn) ttsPause(); else ttsPlay(); });
  $('tts-prev').addEventListener('click', () => ttsSkip(-1));
  $('tts-next').addEventListener('click', () => ttsSkip(1));
  $('tts-speed').addEventListener('change', () => { prefs.rate = Number($('tts-speed').value) || 1; savePrefs(); if (ttsAudio && ttsOn) ttsAudio.playbackRate = prefs.rate; });
  $('tts-voice').addEventListener('change', () => { prefs.voice = $('tts-voice').value; savePrefs(); });
  $('tts-sleep').addEventListener('change', () => {
    const v = $('tts-sleep').value;
    ttsSleepChapter = v === 'ch';
    ttsSleepAt = /^\d+$/.test(v) && Number(v) > 0 ? Date.now() + Number(v) * 60000 : 0;
  });
  document.addEventListener('keydown', (e) => {
    if (!ttsOpen || e.target.closest('input, textarea, select')) return;
    if (e.code === 'Space' && e.shiftKey) { e.preventDefault(); if (ttsOn) ttsPause(); else ttsPlay(); }
  });

  // ---------------------------------------------------------------------------
  // Install as an app (PWA) and offline support
  // ---------------------------------------------------------------------------
  let installEvent = null;
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvent = e; $('install-btn').hidden = false; });
  window.addEventListener('appinstalled', () => { installEvent = null; $('install-btn').hidden = true; });
  $('install-btn').addEventListener('click', async () => {
    if (!installEvent) return;
    installEvent.prompt();
    try { await installEvent.userChoice; } catch (_) {}
    installEvent = null;
    $('install-btn').hidden = true;
  });
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('/library-sw.js', { scope: '/library' }).catch(() => {}); });
  }

  // ---------------------------------------------------------------------------
  applyPrefs();
  applyLang(lang);
  renderSync();
  loadStats().then(renderStats);
  loadShelf().then(() => {
    if (getSync()) syncNow();
    const id = location.hash.slice(1);
    if (id && books.some((b) => b.id === id)) openBook(id);
  });
})();
