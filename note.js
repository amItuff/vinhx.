// vinhx.info/note  (v2)
//
// From the note id the browser derives three independent secrets with PBKDF2:
//   - a content key (AES-256-GCM) that encrypts the text,
//   - a lookup token, the storage key the server sees,
//   - a write token. The server keeps only its hash, so a read-only link
//     (content key + lookup token, no write token) can read but never change a note.
// An optional password adds an inner AES layer inside the encrypted payload.
// Links of the form /note#<id> keep the id in the URL fragment, which browsers never send.

(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const root = document.documentElement;
  const enc = new TextEncoder();
  const dec = new TextDecoder();

  const SALT = enc.encode('vinhx.info/note/v2');
  const ITERATIONS = 150000;
  const MAX_CHARS = 100000;
  const AUTOSAVE_MS = 900;
  const POLL_FAST = 20000;
  const POLL_SLOW = 90000;
  const IDLE_MS = 60000;
  const MIN_PW = 6;
  const ID_RE = /^[A-Za-z0-9_-]{3,64}$/;
  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  // ---------------------------------------------------------------------------
  // Language
  // ---------------------------------------------------------------------------
  const STRINGS = {
    vi: {
      's.kicker': 'Notepad online',
      's.title': 'Ghi chú mã hóa, chia sẻ bằng một đường link',
      's.lead': 'Nội dung được mã hóa ngay trên trình duyệt bằng chính đoạn ký tự trong link. Cơ sở dữ liệu chỉ lưu bản đã mã hóa.',
      's.new': 'Tạo ghi chú mới',
      's.or': 'Hoặc mở / đặt tên riêng',
      's.open': 'Mở',
      's.ph': 'ten-ghi-chu-dai-kho-doan',
      's.f1': 'Mã hóa AES-256-GCM, khóa sinh ra từ đoạn ký tự trong link',
      's.f2': 'Ai có link đều xem và sửa được, tự đồng bộ giữa các thiết bị',
      's.f4': 'Link chỉ xem, mật khẩu thứ hai, đặt thời hạn hoặc tự hủy sau khi đọc',
      's.f3': 'Tự xóa sau 1 năm không ai chỉnh sửa',
      's.weak': 'Tên ngắn dễ bị đoán: ai biết tên là mở được ghi chú. Nên dùng chuỗi dài, ngẫu nhiên.',
      's.bad': 'Chỉ dùng chữ, số, dấu - và _ (3 đến 64 ký tự).',
      'e.copy': 'Sao chép link',
      'e.copied': 'Đã sao chép link',
      'e.copyFail': 'Không sao chép được, hãy copy từ thanh địa chỉ',
      'e.delConfirm': 'Bấm lại để xóa ghi chú',
      'e.deleted': 'Đã xóa ghi chú',
      'e.ph': 'Gõ nội dung ghi chú ở đây...',
      'e.label': 'Nội dung ghi chú',
      'e.enc': 'Mã hóa AES-256-GCM trên trình duyệt trước khi lưu.',
      'e.synced': 'Đã cập nhật từ thiết bị khác',
      't.preview': 'Xem trước Markdown',
      't.download': 'Tải về .txt',
      't.share': 'Chia sẻ',
      't.settings': 'Cài đặt',
      't.new': 'Ghi chú mới',
      't.delete': 'Xóa ghi chú',
      'ui.close': 'Đóng',
      'dl.done': 'Đã tải về',
      'st.loading': 'Đang tải...',
      'st.new': 'Ghi chú mới',
      'st.saved': 'Đã lưu',
      'st.saving': 'Đang lưu...',
      'st.dirty': 'Chưa lưu',
      'st.error': 'Lưu lỗi, đang thử lại',
      'st.conflict': 'Có thay đổi từ nơi khác',
      'st.view': 'Chỉ xem',
      'st.locked': 'Đã khóa',
      'c.msg': 'Ghi chú vừa được sửa ở nơi khác.',
      'c.take': 'Dùng bản mới',
      'c.keep': 'Giữ bản của tôi',
      'lk.title': 'Ghi chú được bảo vệ bằng mật khẩu',
      'lk.ph': 'Nhập mật khẩu',
      'lk.open': 'Mở khóa',
      'lk.wrong': 'Sai mật khẩu.',
      'lk.busy': 'Đang kiểm tra...',
      'sh.title': 'Chia sẻ ghi chú',
      'sh.edit': 'Link chỉnh sửa',
      'sh.editHint': 'Ai có link này đều xem và sửa được.',
      'sh.frag': 'Link kín: tên ghi chú nằm sau dấu # nên không gửi lên máy chủ',
      'sh.view': 'Link chỉ xem',
      'sh.viewHint': 'Người nhận chỉ đọc được, không sửa được.',
      'sh.viewHintBurn': 'Chỉ đọc được và chỉ mở được một lần, sau đó ghi chú tự hủy.',
      'sh.copy': 'Sao chép',
      'sh.qrEdit': 'Chỉnh sửa',
      'sh.qrView': 'Chỉ xem',
      'sh.qr': 'Quét bằng điện thoại để mở ghi chú.',
      'sh.empty': 'Hãy nhập nội dung trước khi chia sẻ',
      'se.title': 'Cài đặt ghi chú',
      'se.ttl': 'Thời hạn',
      'se.t1h': '1 giờ',
      'se.t1d': '1 ngày',
      'se.t1w': '1 tuần',
      'se.t1y': '1 năm',
      'se.ttlHint': 'Tính từ lần chỉnh sửa cuối. Hết hạn thì ghi chú bị xóa.',
      'se.burn': 'Tự hủy sau khi link chỉ xem được mở một lần',
      'se.burnHint': 'Link chỉnh sửa của bạn không làm ghi chú bị hủy.',
      'se.pw': 'Mật khẩu',
      'se.pwPh': 'Mật khẩu mới (ít nhất 6 ký tự)',
      'se.pwSet': 'Đặt mật khẩu',
      'se.pwClear': 'Gỡ mật khẩu',
      'se.pwOn': 'Đang bảo vệ bằng mật khẩu',
      'se.pwOff': 'Chưa đặt mật khẩu',
      'se.pwHint': 'Mã hóa thêm một lớp bằng mật khẩu. Quên mật khẩu thì không khôi phục được nội dung.',
      'se.pwShort': 'Mật khẩu cần ít nhất 6 ký tự.',
      'se.pwDone': 'Đã đặt mật khẩu',
      'se.pwCleared': 'Đã gỡ mật khẩu',
      'se.pwBusy': 'Đang mã hóa...',
      'fl.exp': 'Hết hạn',
      'fl.expIn': 'Hết hạn sau',
      'fl.burn': 'Tự hủy khi đọc',
      'fl.pw': 'Có mật khẩu',
      'err.nostore': 'Máy chủ chưa kết nối cơ sở dữ liệu nên chưa lưu được ghi chú.',
      'err.crypto': 'Trình duyệt không hỗ trợ mã hóa. Hãy mở bằng trình duyệt mới và kết nối HTTPS.',
      'err.decrypt': 'Không giải mã được nội dung ghi chú này.',
      'err.load': 'Không tải được ghi chú. Hãy tải lại trang.',
      'err.gone': 'Ghi chú không tồn tại, đã hết hạn hoặc đã tự hủy sau khi được đọc.',
      'err.badview': 'Link chỉ xem không hợp lệ.',
      'err.pwchanged': 'Mật khẩu ghi chú đã đổi ở nơi khác. Hãy tải lại trang.',
      'err.toolarge': 'Ghi chú quá lớn sau khi mã hóa. Hãy rút gọn nội dung.',
      'err.limit': 'Đã đạt giới hạn tạo ghi chú (theo kết nối hoặc toàn hệ thống). Hãy xóa bớt ghi chú cũ hoặc thử lại sau.',
      'err.rate': 'Thao tác quá nhanh, vui lòng chờ một lát.',
      'err.forbidden': 'Không có quyền sửa ghi chú này.',
      'burned': 'Ghi chú này đã tự hủy ngay khi bạn mở. Hãy tải về nếu cần giữ lại, tải lại trang sẽ không còn nữa.'
    },
    en: {
      's.kicker': 'Online notepad',
      's.title': 'Encrypted notes, shared with a single link',
      's.lead': 'Your text is encrypted in the browser using the characters in the link itself. The database only stores the encrypted copy.',
      's.new': 'Create new note',
      's.or': 'Or open / pick your own name',
      's.open': 'Open',
      's.ph': 'a-long-hard-to-guess-name',
      's.f1': 'AES-256-GCM encryption, key derived from the characters in the link',
      's.f2': 'Anyone with the link can read and edit, synced across devices',
      's.f4': 'View-only links, a second password, expiry or self-destruct after reading',
      's.f3': 'Deleted automatically after 1 year without edits',
      's.weak': 'Short names are easy to guess: anyone who knows the name can open the note. Use a long, random string.',
      's.bad': 'Letters, numbers, - and _ only (3 to 64 characters).',
      'e.copy': 'Copy link',
      'e.copied': 'Link copied',
      'e.copyFail': 'Couldn\'t copy, use the address bar instead',
      'e.delConfirm': 'Click again to delete the note',
      'e.deleted': 'Note deleted',
      'e.ph': 'Start typing your note here...',
      'e.label': 'Note content',
      'e.enc': 'AES-256-GCM encrypted in your browser before it is saved.',
      'e.synced': 'Updated from another device',
      't.preview': 'Markdown preview',
      't.download': 'Download .txt',
      't.share': 'Share',
      't.settings': 'Settings',
      't.new': 'New note',
      't.delete': 'Delete note',
      'ui.close': 'Close',
      'dl.done': 'Downloaded',
      'st.loading': 'Loading...',
      'st.new': 'New note',
      'st.saved': 'Saved',
      'st.saving': 'Saving...',
      'st.dirty': 'Unsaved',
      'st.error': 'Save failed, retrying',
      'st.conflict': 'Changed elsewhere',
      'st.view': 'View only',
      'st.locked': 'Locked',
      'c.msg': 'This note was just edited somewhere else.',
      'c.take': 'Use the new version',
      'c.keep': 'Keep mine',
      'lk.title': 'This note is protected by a password',
      'lk.ph': 'Enter password',
      'lk.open': 'Unlock',
      'lk.wrong': 'Wrong password.',
      'lk.busy': 'Checking...',
      'sh.title': 'Share note',
      'sh.edit': 'Edit link',
      'sh.editHint': 'Anyone with this link can read and edit.',
      'sh.frag': 'Private link: the note name sits after # so it is never sent to the server',
      'sh.view': 'View-only link',
      'sh.viewHint': 'Recipients can read the note but not change it.',
      'sh.viewHintBurn': 'Read-only and opens just once, then the note destroys itself.',
      'sh.copy': 'Copy',
      'sh.qrEdit': 'Edit',
      'sh.qrView': 'View only',
      'sh.qr': 'Scan with a phone to open the note.',
      'sh.empty': 'Write something before sharing',
      'se.title': 'Note settings',
      'se.ttl': 'Expiry',
      'se.t1h': '1 hour',
      'se.t1d': '1 day',
      'se.t1w': '1 week',
      'se.t1y': '1 year',
      'se.ttlHint': 'Counted from the last edit. The note is deleted when it expires.',
      'se.burn': 'Destroy after the view-only link is opened once',
      'se.burnHint': 'Opening your own edit link never destroys the note.',
      'se.pw': 'Password',
      'se.pwPh': 'New password (at least 6 characters)',
      'se.pwSet': 'Set password',
      'se.pwClear': 'Remove password',
      'se.pwOn': 'Protected by a password',
      'se.pwOff': 'No password set',
      'se.pwHint': 'Adds a second encryption layer. If you forget the password the content cannot be recovered.',
      'se.pwShort': 'The password needs at least 6 characters.',
      'se.pwDone': 'Password set',
      'se.pwCleared': 'Password removed',
      'se.pwBusy': 'Encrypting...',
      'fl.exp': 'Expires',
      'fl.expIn': 'Expires after',
      'fl.burn': 'Self-destructs when read',
      'fl.pw': 'Password protected',
      'err.nostore': 'The server has no database connected yet, so notes can\'t be saved.',
      'err.crypto': 'This browser can\'t do encryption. Use a recent browser over HTTPS.',
      'err.decrypt': 'This note could not be decrypted.',
      'err.load': 'Couldn\'t load the note. Please reload the page.',
      'err.gone': 'This note does not exist, has expired, or destroyed itself after being read.',
      'err.badview': 'This view-only link is not valid.',
      'err.pwchanged': 'The note password was changed elsewhere. Please reload the page.',
      'err.toolarge': 'The note is too large once encrypted. Please shorten it.',
      'err.limit': 'The note creation limit was reached (per connection or site-wide). Delete older notes or try again later.',
      'err.rate': 'Too many requests, please wait a moment.',
      'err.forbidden': 'You are not allowed to change this note.',
      'burned': 'This note destroyed itself the moment you opened it. Download it if you need to keep it; reloading the page will not bring it back.'
    }
  };

  function storedLang() {
    try { return localStorage.getItem('lang'); } catch (_) { return null; }
  }
  let lang = storedLang();
  if (!STRINGS[lang]) lang = (navigator.language || 'vi').toLowerCase().startsWith('vi') ? 'vi' : 'en';
  const t = (key) => STRINGS[lang][key] ?? STRINGS.vi[key] ?? key;

  let statusName = 'loading';
  let bannerState = null; // { text: i18n key, buttons: bool }

  function applyLang(next) {
    lang = STRINGS[next] ? next : 'vi';
    root.lang = lang;
    try { localStorage.setItem('lang', lang); } catch (_) {}

    document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => { el.placeholder = t(el.dataset.i18nPlaceholder); });
    document.querySelectorAll('[data-i18n-label]').forEach((el) => {
      el.setAttribute('aria-label', t(el.dataset.i18nLabel));
      if (el.hasAttribute('title')) el.setAttribute('title', t(el.dataset.i18nLabel));
    });
    document.querySelectorAll('.lang-toggle button').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
    });

    setStatus(statusName);
    renderBanner();
    updateHint();
    renderFlags();
    renderSettingsState();
    renderShareHints();
  }

  document.querySelectorAll('.lang-toggle button').forEach((b) => {
    b.addEventListener('click', () => applyLang(b.dataset.lang));
  });

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  function randomId(len = 22) {
    let out = '';
    while (out.length < len) {
      const bytes = crypto.getRandomValues(new Uint8Array(len));
      for (const b of bytes) {
        if (b < 248 && out.length < len) out += ALPHABET[b % 62]; // 248 = 62 * 4, no modulo bias
      }
    }
    return out;
  }

  // New and custom notes use the fragment form so the name stays out of server logs.
  function go(id) {
    const target = '/note#' + encodeURIComponent(id);
    if (location.pathname === '/note') {
      location.hash = '#' + encodeURIComponent(id);
      location.reload();
    } else {
      location.href = target;
    }
  }

  function b64(buf) {
    const bytes = new Uint8Array(buf);
    let s = '';
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(s);
  }
  function unb64(str) {
    const s = atob(str);
    const out = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
    return out;
  }
  const b64url = (bytes) => b64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  function unb64url(str) {
    let s = str.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    return unb64(s);
  }
  const hex = (bytes) => Array.from(bytes, (x) => x.toString(16).padStart(2, '0')).join('');

  const toast = $('toast');
  let toastTimer;
  function showToast(text) {
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2300);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) { /* fall through */ }
    try {
      const tmp = document.createElement('textarea');
      tmp.value = text;
      tmp.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(tmp);
      tmp.select();
      const ok = document.execCommand('copy');
      tmp.remove();
      return ok;
    } catch (_) { return false; }
  }

  // ---------------------------------------------------------------------------
  // Routing
  //   /note              start screen
  //   /note#<id>         edit (private link)
  //   /note/<id>         edit (older style, id appears in the request path)
  //   /note/v#<token>    view only
  // ---------------------------------------------------------------------------
  let mode = 'start';
  let noteId = null;
  let viewToken = null;
  let forcedBad = false;

  (function route() {
    const path = location.pathname.replace(/\/+$/, '');
    const hash = location.hash.slice(1);
    let id = null;
    let bad = false;

    if (path === '/note/v') {
      if (hash) { mode = 'view'; viewToken = hash; } else { bad = true; }
    } else {
      const m = path.match(/^\/note\/([^/]+)$/);
      if (m) {
        try { id = decodeURIComponent(m[1]); } catch (_) { id = null; }
        bad = id === null || !ID_RE.test(id);
      } else if (path === '/note' && hash) {
        try { id = decodeURIComponent(hash); } catch (_) { id = null; }
        bad = id === null || !ID_RE.test(id);
      }
      if (id && !bad) { mode = 'edit'; noteId = id; }
    }
    forcedBad = bad;
    document.body.dataset.mode = mode === 'view' ? 'view' : 'edit';
  })();

  window.addEventListener('hashchange', () => location.reload());

  // ---------------------------------------------------------------------------
  // Start screen
  // ---------------------------------------------------------------------------
  const customInput = $('custom-id');
  const customHint = $('custom-hint');

  function updateHint() {
    const v = customInput.value.trim();
    if (forcedBad && !v) customHint.textContent = t('s.bad');
    else if (v && !ID_RE.test(v)) customHint.textContent = t('s.bad');
    else if (v && v.length < 12) customHint.textContent = t('s.weak');
    else customHint.textContent = '';
  }

  function initStart() {
    $('start').hidden = false;
    $('new-note').addEventListener('click', () => go(randomId()));
    customInput.addEventListener('input', () => { forcedBad = false; updateHint(); });
    $('custom-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const v = customInput.value.trim();
      if (!ID_RE.test(v)) { forcedBad = false; customHint.textContent = t('s.bad'); return; }
      go(v);
    });
  }

  // ---------------------------------------------------------------------------
  // Editor state
  // ---------------------------------------------------------------------------
  const pad = $('pad');
  const preview = $('preview');
  const statusEl = $('status');
  const banner = $('banner');
  const bannerA = $('banner-a');
  const bannerB = $('banner-b');
  const readOnly = mode === 'view';

  let contentKey = null;  // AES key for the payload
  let keyBytes = null;    // raw bytes of it, used to build the view-only link
  let lookup = '';        // hex storage token
  let lookupBytes = null;
  let writeToken = '';    // hex, only present for edit links

  let ver = '';           // version token of the copy we last synced with
  let savedText = '';
  let savedAt = 0;
  let ttlVal = 31536000;
  let burnVal = false;
  let settingsDirty = false;

  let pwKey = null;       // AES key from the optional password
  let pwSalt = '';        // base64 salt belonging to pwKey
  let locked = null;      // { pw } while waiting for the password

  let ready = false;
  let saving = false;
  let saveTimer = null;
  let pollTimer = null;
  let conflictRemote = null;
  let fatalKey = null;
  let blockedKey = null;  // limits and similar: banner shown, text kept locally
  let burnedView = false;
  let lastActive = Date.now();

  function setStatus(name) {
    statusName = name;
    statusEl.dataset.state = name === 'new' || name === 'view' ? 'saved' : name;
    $('status-text').textContent = t('st.' + name);
  }

  function refreshStatus() {
    if (locked) setStatus('locked');
    else if (readOnly && ready) setStatus('view');
    else if (conflictRemote) setStatus('conflict');
    else if (pad.value !== savedText || settingsDirty) setStatus('dirty');
    else if (!ver && !pad.value) setStatus('new');
    else setStatus('saved');
  }

  function renderBanner() {
    if (!bannerState) { banner.hidden = true; return; }
    banner.hidden = false;
    $('banner-text').textContent = t(bannerState.text);
    bannerA.hidden = bannerB.hidden = !bannerState.buttons;
    if (bannerState.buttons) {
      bannerA.textContent = t('c.take');
      bannerB.textContent = t('c.keep');
    }
  }
  function setBanner(key, buttons) { bannerState = key ? { text: key, buttons: !!buttons } : null; renderBanner(); }

  function fatal(key) {
    fatalKey = key;
    ready = false;
    pad.disabled = true;
    clearTimeout(pollTimer);
    setBanner(key, false);
    setStatus('error');
  }

  function updateCount() {
    $('count').textContent = `${pad.value.length.toLocaleString('en-US')} / ${MAX_CHARS.toLocaleString('en-US')}`;
  }

  const TTL_KEYS = { 3600: 'se.t1h', 86400: 'se.t1d', 604800: 'se.t1w', 31536000: 'se.t1y' };

  function renderFlags() {
    const el = $('meta-flags');
    if (!el) return;
    const parts = [];
    if (ready || locked) {
      if (savedAt) {
        parts.push(`${t('fl.exp')} ${new Date(savedAt + ttlVal * 1000).toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' })}`);
      } else {
        parts.push(`${t('fl.expIn')} ${t(TTL_KEYS[ttlVal] || 'se.t1y')}`);
      }
      if (burnVal) parts.push(t('fl.burn'));
      if (pwKey || locked) parts.push(t('fl.pw'));
    }
    el.textContent = parts.join(' · ');
  }

  // ---------------------------------------------------------------------------
  // Crypto
  // ---------------------------------------------------------------------------
  async function deriveFromId(id) {
    const base = await crypto.subtle.importKey('raw', enc.encode(id), 'PBKDF2', false, ['deriveBits']);
    const bits = new Uint8Array(await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: SALT, iterations: ITERATIONS, hash: 'SHA-256' }, base, 768));
    keyBytes = bits.slice(0, 32);
    lookupBytes = bits.slice(32, 64);
    lookup = hex(lookupBytes);
    writeToken = hex(bits.slice(64, 96));
    contentKey = await crypto.subtle.importKey('raw', keyBytes, 'AES-GCM', false, ['encrypt', 'decrypt']);
  }

  async function loadFromViewToken(token) {
    let raw;
    try { raw = unb64url(token); } catch (_) { return false; }
    if (raw.length !== 64) return false;
    keyBytes = raw.slice(0, 32);
    lookupBytes = raw.slice(32, 64);
    lookup = hex(lookupBytes);
    contentKey = await crypto.subtle.importKey('raw', keyBytes, 'AES-GCM', false, ['encrypt', 'decrypt']);
    return true;
  }

  async function passwordKey(password, saltBytes) {
    const base = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: saltBytes, iterations: ITERATIONS, hash: 'SHA-256' },
      base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }

  // The payload is JSON: { v:1, t:text } or, with a password, { v:1, pw:{ s, i, c } }.
  async function sealPayload(text) {
    let payload;
    if (pwKey) {
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, pwKey, enc.encode(text));
      payload = { v: 1, pw: { s: pwSalt, i: b64(iv), c: b64(ct) } };
    } else {
      payload = { v: 1, t: text };
    }
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, contentKey, enc.encode(JSON.stringify(payload)));
    return { iv: b64(iv), ct: b64(ct) };
  }

  async function pwDecrypt(pw, key) {
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(pw.i) }, key, unb64(pw.c));
    return dec.decode(plain);
  }

  // Returns { text } or { locked: pw } when the password is still needed.
  async function openNote(note) {
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(note.iv) }, contentKey, unb64(note.ct));
    let env;
    try { env = JSON.parse(dec.decode(plain)); } catch (_) { throw new Error('format'); }
    if (!env || typeof env !== 'object') throw new Error('format');
    if (env.pw) {
      if (pwKey && pwSalt === env.pw.s) return { text: await pwDecrypt(env.pw, pwKey) };
      return { locked: env.pw };
    }
    return { text: String(env.t == null ? '' : env.t) };
  }

  function adopt(note) {
    ver = note.ver;
    ttlVal = note.ttl || ttlVal;
    burnVal = !!note.burn;
    savedAt = note.t || savedAt;
    $('s-ttl').value = String(ttlVal);
    $('s-burn').checked = burnVal;
    renderFlags();
  }

  // ---------------------------------------------------------------------------
  // Saving
  // ---------------------------------------------------------------------------
  function schedule(ms = AUTOSAVE_MS) {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(save, ms);
  }

  function retryDelay(res) {
    const n = Number(res.headers.get('Retry-After'));
    return Number.isFinite(n) && n > 0 ? Math.min(n, 300) * 1000 : 30000;
  }

  async function save() {
    clearTimeout(saveTimer);
    if (!ready || readOnly || conflictRemote || fatalKey) return;
    if (saving) { schedule(300); return; }

    const text = pad.value;
    if (text === savedText && !settingsDirty) { refreshStatus(); return; }
    if (!text && !ver) { refreshStatus(); return; } // nothing worth creating

    saving = true;
    setStatus('saving');
    let failed = false;
    let wait = 5000;

    try {
      const sealed = await sealPayload(text);
      const res = await fetch('/api/note', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ k: lookup, w: writeToken, base: ver, ...sealed, ttl: ttlVal, burn: burnVal })
      });

      if (res.status === 409) {
        await onConflict(await res.json());
        return;
      }
      if (res.status === 503) { fatal('err.nostore'); return; }
      if (res.status === 413) { blockedKey = 'err.toolarge'; setBanner(blockedKey); setStatus('error'); return; }
      if (res.status === 403) { fatal('err.forbidden'); return; }
      if (res.status === 429) {
        let body = {};
        try { body = await res.json(); } catch (_) { /* ignore */ }
        if (body.error === 'note_limit' || body.error === 'too_many_notes' || body.error === 'busy') {
          blockedKey = 'err.limit';
          setBanner(blockedKey);
          setStatus('error');
          return;
        }
        wait = retryDelay(res);
        setBanner('err.rate');
        throw new Error('rate');
      }
      if (!res.ok) throw new Error('save ' + res.status);

      const json = await res.json();
      ver = json.ver;
      savedText = text;
      savedAt = Date.now();
      settingsDirty = false;
      blockedKey = null;
      if (bannerState && !conflictRemote) setBanner(null);
      renderFlags();
    } catch (_) {
      failed = true;
      setStatus('error');
      schedule(wait);
    } finally {
      saving = false;
    }

    if (failed || conflictRemote || fatalKey || blockedKey) return;
    if (pad.value !== savedText) schedule(300);
    refreshStatus();
  }

  async function onConflict(remote) {
    let opened;
    try { opened = await openNote(remote); } catch (_) { fatal('err.decrypt'); return; }
    if (opened.locked) { fatal('err.pwchanged'); return; }

    if (opened.text === pad.value) { // same content, just adopt their version
      adopt(remote);
      savedText = opened.text;
      settingsDirty = false;
      refreshStatus();
      return;
    }
    conflictRemote = { note: remote, text: opened.text };
    setBanner('c.msg', true);
    setStatus('conflict');
  }

  bannerA.addEventListener('click', () => { // take theirs
    if (!conflictRemote) return;
    pad.value = conflictRemote.text;
    savedText = conflictRemote.text;
    adopt(conflictRemote.note);
    settingsDirty = false;
    conflictRemote = null;
    setBanner(null);
    updateCount();
    renderPreview();
    refreshStatus();
  });

  bannerB.addEventListener('click', () => { // keep mine, overwrite theirs
    if (!conflictRemote) return;
    ver = conflictRemote.note.ver;
    conflictRemote = null;
    setBanner(null);
    save();
  });

  // ---------------------------------------------------------------------------
  // Polling (slower when the user has been idle)
  // ---------------------------------------------------------------------------
  ['keydown', 'pointerdown', 'touchstart'].forEach((ev) => {
    window.addEventListener(ev, () => { lastActive = Date.now(); }, { passive: true });
  });

  function noteHeaders() {
    return writeToken ? { 'X-Note-Write': writeToken } : {};
  }

  async function poll() {
    if (!ready || locked || document.hidden || saving || conflictRemote || fatalKey) return;
    if (!readOnly && (pad.value !== savedText || settingsDirty)) return;
    if (readOnly && (burnedView || burnVal)) return; // opening a burn note again would not work anyway

    try {
      const res = await fetch(`/api/note?k=${lookup}&ver=${encodeURIComponent(ver)}`, { cache: 'no-store', headers: noteHeaders() });
      let remote = null;
      let removed = false;

      if (res.status === 200) {
        remote = await res.json();
        if (remote.unchanged) return;
      } else if (res.status === 404 && ver) {
        removed = true;
      } else {
        return;
      }

      if (saving || conflictRemote) return;
      if (!readOnly && (pad.value !== savedText || settingsDirty)) return;

      let text = '';
      if (!removed) {
        const opened = await openNote(remote);
        if (opened.locked) { fatal('err.pwchanged'); return; }
        text = opened.text;
      }
      if (!readOnly && pad.value !== savedText) return;

      if (removed && readOnly) { fatal('err.gone'); return; }

      if (text !== pad.value) {
        const { selectionStart: a, selectionEnd: b } = pad;
        pad.value = text;
        try { pad.setSelectionRange(Math.min(a, text.length), Math.min(b, text.length)); } catch (_) { /* readonly ok */ }
        updateCount();
        renderPreview();
        showToast(t('e.synced'));
      }
      savedText = text;
      if (removed) { ver = ''; savedAt = 0; } else adopt(remote);
      refreshStatus();
    } catch (_) { /* try again on the next tick */ }
  }

  function pollLoop() {
    const idle = Date.now() - lastActive > IDLE_MS;
    pollTimer = setTimeout(async () => { await poll(); pollLoop(); }, idle ? POLL_SLOW : POLL_FAST);
  }

  // ---------------------------------------------------------------------------
  // Markdown preview. Input is HTML-escaped first and only a small set of tags is
  // produced, links limited to http(s) and mailto.
  // ---------------------------------------------------------------------------
  const escHtml = (s) => s.replace(/\u0000|\u0001/g, '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  function emphasis(s) {
    return s
      .replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>')
      .replace(/__([^_\n]+?)__/g, '<strong>$1</strong>')
      .replace(/~~([^~\n]+?)~~/g, '<del>$1</del>')
      .replace(/\*([^*\n]+?)\*/g, '<em>$1</em>')
      .replace(/(^|[^\w])_([^_\n]+?)_(?=[^\w]|$)/g, '$1<em>$2</em>');
  }

  function inlineMd(raw) {
    const stash = [];
    const hold = (html) => { stash.push(html); return '\u0001' + (stash.length - 1) + '\u0001'; };
    let s = escHtml(raw);
    s = s.replace(/`([^`\n]+)`/g, (m, c) => hold('<code>' + c + '</code>'));
    s = s.replace(/\[([^\]\n]+)\]\(((?:https?:\/\/|mailto:)[^\s)]+)\)/g, (m, label, url) =>
      hold('<a href="' + url + '" target="_blank" rel="noopener noreferrer nofollow">' + emphasis(label) + '</a>'));
    s = emphasis(s);
    return s.replace(/\u0001(\d+)\u0001/g, (m, i) => stash[Number(i)]);
  }

  const RE_FENCE = /^\s*```/;
  const RE_HEAD = /^(#{1,6})\s+(.*)$/;
  const RE_HR = /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/;
  const RE_QUOTE = /^\s*>\s?(.*)$/;
  const RE_ITEM = /^\s*([-*+]|\d+[.)])\s+(.*)$/;

  function renderMarkdown(src) {
    const lines = src.replace(/\r\n?/g, '\n').split('\n');
    const out = [];
    let i = 0;

    const startsBlock = (l) => RE_FENCE.test(l) || RE_HEAD.test(l) || RE_HR.test(l) || RE_QUOTE.test(l) || RE_ITEM.test(l);

    while (i < lines.length) {
      const line = lines[i];

      if (!line.trim()) { i++; continue; }

      if (RE_FENCE.test(line)) {
        const code = [];
        i++;
        while (i < lines.length && !RE_FENCE.test(lines[i])) code.push(lines[i++]);
        i++;
        out.push('<pre><code>' + escHtml(code.join('\n')) + '</code></pre>');
        continue;
      }

      let m = line.match(RE_HEAD);
      if (m) {
        const level = m[1].length;
        out.push(`<h${level}>${inlineMd(m[2].replace(/\s+#+\s*$/, ''))}</h${level}>`);
        i++;
        continue;
      }

      if (RE_HR.test(line)) { out.push('<hr>'); i++; continue; }

      if (RE_QUOTE.test(line)) {
        const inner = [];
        while (i < lines.length && RE_QUOTE.test(lines[i])) inner.push(lines[i++].match(RE_QUOTE)[1]);
        out.push('<blockquote>' + renderMarkdown(inner.join('\n')) + '</blockquote>');
        continue;
      }

      m = line.match(RE_ITEM);
      if (m) {
        const ordered = /\d/.test(m[1]);
        const items = [];
        while (i < lines.length) {
          const mm = lines[i].match(RE_ITEM);
          if (!mm || /\d/.test(mm[1]) !== ordered || RE_HR.test(lines[i])) break;
          items.push('<li>' + inlineMd(mm[2]) + '</li>');
          i++;
        }
        out.push((ordered ? '<ol>' : '<ul>') + items.join('') + (ordered ? '</ol>' : '</ul>'));
        continue;
      }

      const para = [];
      while (i < lines.length && lines[i].trim() && !(para.length && startsBlock(lines[i]))) para.push(inlineMd(lines[i++]));
      out.push('<p>' + para.join('<br>') + '</p>');
    }
    return out.join('');
  }

  let previewOn = false;
  function renderPreview() {
    if (previewOn) preview.innerHTML = renderMarkdown(pad.value);
  }
  function setPreview(on) {
    previewOn = on;
    $('t-preview').setAttribute('aria-pressed', String(on));
    preview.hidden = !on;
    pad.hidden = on;
    if (on) renderPreview();
    else if (!readOnly && ready) pad.focus({ preventScroll: true });
  }

  // ---------------------------------------------------------------------------
  // Download
  // ---------------------------------------------------------------------------
  function downloadTxt() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    const name = `note-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}.txt`;
    const blob = new Blob([pad.value], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    showToast(t('dl.done'));
  }

  // ---------------------------------------------------------------------------
  // Sheets (share, settings)
  // ---------------------------------------------------------------------------
  let openSheet = null;
  let sheetOpener = null;

  function showSheet(el) {
    sheetOpener = document.activeElement;
    openSheet = el;
    el.hidden = false;
    const first = el.querySelector('input:not([readonly]), select, button');
    if (first) first.focus({ preventScroll: true });
  }
  function hideSheet() {
    if (!openSheet) return;
    openSheet.hidden = true;
    openSheet = null;
    if (sheetOpener && sheetOpener.focus) sheetOpener.focus({ preventScroll: true });
  }
  document.querySelectorAll('.sheet [data-close]').forEach((el) => el.addEventListener('click', hideSheet));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideSheet();
    if (e.key === 'Tab' && openSheet) { // keep focus inside the open sheet
      const items = Array.from(openSheet.querySelectorAll('button, input, select')).filter((x) => !x.disabled && x.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  let qrKind = 'edit';

  function editUrl() {
    return $('sh-frag').checked
      ? `${location.origin}/note#${encodeURIComponent(noteId)}`
      : `${location.origin}/note/${encodeURIComponent(noteId)}`;
  }
  function viewUrl() {
    if (readOnly) return location.href;
    const bytes = new Uint8Array(64);
    bytes.set(keyBytes, 0);
    bytes.set(lookupBytes, 32);
    return `${location.origin}/note/v#${b64url(bytes)}`;
  }

  function drawQr() {
    const canvas = $('qr');
    const url = readOnly || qrKind === 'view' ? viewUrl() : editUrl();
    document.querySelectorAll('#qr-tabs button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.qr === (readOnly ? 'view' : qrKind))));
    try {
      if (!window.QR) throw new Error('qr');
      window.QR.draw(canvas, url, 240);
      canvas.hidden = false;
      canvas.setAttribute('aria-label', url);
    } catch (_) {
      canvas.hidden = true;
    }
  }

  function fillShare() {
    if (!readOnly) $('in-edit').value = editUrl();
    $('in-view').value = viewUrl();
    drawQr();
  }

  function renderShareHints() {
    const hint = $('view-hint');
    if (hint) hint.textContent = t(burnVal && !readOnly ? 'sh.viewHintBurn' : 'sh.viewHint');
  }

  async function openShare() {
    if (!readOnly) {
      if (!ready) return;
      if (pad.value !== savedText || settingsDirty) await save();
      if (!ver) { showToast(t('sh.empty')); return; }
    }
    renderShareHints();
    fillShare();
    showSheet($('sheet-share'));
  }

  function renderSettingsState() {
    const on = !!pwKey || !!locked;
    const state = $('s-pw-state');
    if (!state) return;
    state.textContent = t(on ? 'se.pwOn' : 'se.pwOff');
    $('s-pw-clear').hidden = !on;
  }

  async function setPassword() {
    const input = $('s-pw');
    const value = input.value;
    if (value.length < MIN_PW) { $('s-pw-state').textContent = t('se.pwShort'); return; }
    const btn = $('s-pw-set');
    btn.disabled = true;
    $('s-pw-state').textContent = t('se.pwBusy');
    try {
      const salt = crypto.getRandomValues(new Uint8Array(16));
      pwKey = await passwordKey(value, salt);
      pwSalt = b64(salt);
      input.value = '';
      settingsDirty = true;
      renderFlags();
      refreshStatus();
      schedule(200);
      showToast(t('se.pwDone'));
    } finally {
      btn.disabled = false;
      renderSettingsState();
    }
  }

  function clearPassword() {
    pwKey = null;
    pwSalt = '';
    settingsDirty = true;
    renderFlags();
    renderSettingsState();
    refreshStatus();
    schedule(200);
    showToast(t('se.pwCleared'));
  }

  // ---------------------------------------------------------------------------
  // Lock screen (password protected notes)
  // ---------------------------------------------------------------------------
  let pendingNote = null;

  function showLock(pw, note) {
    locked = pw;
    pendingNote = note;
    ready = false;
    $('locked').hidden = false;
    $('pane').hidden = true;
    document.querySelector('.meta .lock').hidden = false;
    ['t-preview', 't-download'].forEach((id) => { $(id).disabled = true; });
    setStatus('locked');
    renderFlags();
    renderSettingsState();
    $('unlock-pw').focus({ preventScroll: true });
  }

  async function unlock(e) {
    e.preventDefault();
    const pw = $('unlock-pw').value;
    if (!pw || !locked) return;
    const err = $('unlock-err');
    err.textContent = t('lk.busy');
    try {
      const key = await passwordKey(pw, unb64(locked.s));
      const text = await pwDecrypt(locked, key);
      pwKey = key;
      pwSalt = locked.s;
      locked = null;
      $('locked').hidden = true;
      $('pane').hidden = false;
      $('unlock-pw').value = '';
      err.textContent = '';
      ['t-preview', 't-download'].forEach((id) => { $(id).disabled = false; });
      pad.value = text;
      savedText = text;
      startSession();
    } catch (_) {
      err.textContent = t('lk.wrong');
      $('unlock-pw').select();
    }
  }

  // ---------------------------------------------------------------------------
  // Delete
  // ---------------------------------------------------------------------------
  let armed = false;
  let armTimer;
  async function deleteNote() {
    const btn = $('t-delete');
    if (!armed) {
      armed = true;
      btn.classList.add('armed');
      showToast(t('e.delConfirm'));
      armTimer = setTimeout(disarm, 4000);
      return;
    }
    disarm();
    clearTimeout(saveTimer);
    try {
      const res = await fetch(`/api/note?k=${lookup}`, { method: 'DELETE', headers: noteHeaders() });
      if (!res.ok) throw new Error();
      pad.value = '';
      savedText = '';
      ver = '';
      savedAt = 0;
      settingsDirty = false;
      conflictRemote = null;
      setBanner(null);
      updateCount();
      renderPreview();
      renderFlags();
      refreshStatus();
      showToast(t('e.deleted'));
    } catch (_) {
      setStatus('error');
    }
  }
  function disarm() {
    armed = false;
    clearTimeout(armTimer);
    $('t-delete').classList.remove('armed');
  }

  // ---------------------------------------------------------------------------
  // Boot
  // ---------------------------------------------------------------------------
  function startSession() {
    ready = true;
    pad.disabled = false;
    pad.readOnly = readOnly;
    if (!readOnly) pad.focus({ preventScroll: true });
    updateCount();
    renderPreview();
    renderFlags();
    renderSettingsState();
    refreshStatus();
    clearTimeout(pollTimer);
    if (!(readOnly && burnedView)) pollLoop();
  }

  async function initEditor() {
    $('editor').hidden = false;
    setStatus('loading');

    if (!window.crypto || !crypto.subtle) { fatal('err.crypto'); return; }

    try {
      if (readOnly) {
        if (!(await loadFromViewToken(viewToken))) { fatal('err.badview'); return; }
      } else {
        await deriveFromId(noteId);
      }
    } catch (_) { fatal('err.crypto'); return; }

    let note = null;
    try {
      const res = await fetch(`/api/note?k=${lookup}`, { cache: 'no-store', headers: noteHeaders() });
      if (res.status === 503) { fatal('err.nostore'); return; }
      if (res.status === 429) { fatal('err.rate'); return; }
      if (res.status === 200) note = await res.json();
      else if (res.status === 404) {
        if (readOnly) { fatal('err.gone'); return; }
      } else throw new Error('load ' + res.status);
    } catch (_) {
      fatal('err.load');
      return;
    }

    if (note) {
      let opened;
      try { opened = await openNote(note); } catch (_) { fatal('err.decrypt'); return; }
      adopt(note);
      if (note.burned) {
        burnedView = true;
        setBanner('burned');
      }
      if (opened.locked) {
        showLock(opened.locked, note);
        return;
      }
      pad.value = opened.text;
      savedText = opened.text;
    }
    startSession();
  }

  function bindEditor() {
    pad.addEventListener('input', () => {
      updateCount();
      if (!ready || readOnly) return;
      blockedKey = null;
      if (bannerState && !conflictRemote && !fatalKey) setBanner(null);
      refreshStatus();
      if (pad.value !== savedText) schedule();
    });

    $('copy-link').addEventListener('click', async () => {
      const url = readOnly ? location.href : (location.pathname.startsWith('/note/') ? location.href : `${location.origin}/note#${encodeURIComponent(noteId)}`);
      showToast(t(await copyText(url) ? 'e.copied' : 'e.copyFail'));
    });
    $('t-preview').addEventListener('click', () => setPreview(!previewOn));
    $('t-download').addEventListener('click', downloadTxt);
    $('t-share').addEventListener('click', openShare);
    $('t-settings').addEventListener('click', () => { renderSettingsState(); showSheet($('sheet-settings')); });
    $('t-new').addEventListener('click', () => go(randomId()));
    $('t-delete').addEventListener('click', deleteNote);

    // share sheet
    $('sh-frag').checked = !location.pathname.startsWith('/note/');
    $('sh-frag').addEventListener('change', fillShare);
    $('cp-edit').addEventListener('click', async () => showToast(t(await copyText($('in-edit').value) ? 'e.copied' : 'e.copyFail')));
    $('cp-view').addEventListener('click', async () => showToast(t(await copyText($('in-view').value) ? 'e.copied' : 'e.copyFail')));
    document.querySelectorAll('#qr-tabs button').forEach((b) => b.addEventListener('click', () => { qrKind = b.dataset.qr; drawQr(); }));
    ['in-edit', 'in-view'].forEach((id) => $(id).addEventListener('focus', (e) => e.target.select()));

    // settings sheet
    $('s-ttl').addEventListener('change', () => {
      ttlVal = Number($('s-ttl').value) || 31536000;
      settingsDirty = true;
      renderFlags();
      refreshStatus();
      schedule(300);
    });
    $('s-burn').addEventListener('change', () => {
      burnVal = $('s-burn').checked;
      settingsDirty = true;
      renderFlags();
      renderShareHints();
      refreshStatus();
      schedule(300);
    });
    $('s-pw-set').addEventListener('click', setPassword);
    $('s-pw').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); setPassword(); } });
    $('s-pw-clear').addEventListener('click', clearPassword);
    $('unlock-form').addEventListener('submit', unlock);

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (!readOnly) save();
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && !readOnly && pad.value !== savedText) save();
      else if (!document.hidden) poll();
    });

    window.addEventListener('beforeunload', (e) => {
      if (ready && !readOnly && (pad.value !== savedText || settingsDirty) && !conflictRemote) {
        e.preventDefault();
        e.returnValue = '';
      }
    });
  }

  // ---------------------------------------------------------------------------
  if (mode === 'start') {
    initStart();
  } else {
    bindEditor();
    initEditor();
  }
  applyLang(lang);
})();
