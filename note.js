// vinhx.info/note
//
// The note id (the string after /note/) never goes to the server. From it the
// browser derives, with PBKDF2:
//   - an AES-256-GCM key that encrypts the text, and
//   - a separate lookup token used as the storage key.
// The server therefore only holds ciphertext under a token it cannot reverse.

(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const root = document.documentElement;
  const enc = new TextEncoder();
  const dec = new TextDecoder();

  const SALT = enc.encode('vinhx.info/note/v1');
  const ITERATIONS = 150000;
  const MAX_CHARS = 100000;
  const AUTOSAVE_MS = 900;
  const POLL_MS = 6000;
  const ID_RE = /^[A-Za-z0-9_-]{3,64}$/;
  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  // ---------------------------------------------------------------------------
  // Language
  // ---------------------------------------------------------------------------
  const STRINGS = {
    vi: {
      's.kicker': 'Notepad online',
      's.title': 'Ghi chú mã hóa, chia sẻ bằng một đường link',
      's.lead': 'Nội dung được mã hóa ngay trên trình duyệt bằng chính đoạn ký tự trong link. Máy chủ chỉ lưu dữ liệu đã mã hóa và không đọc được.',
      's.new': 'Tạo ghi chú mới',
      's.or': 'Hoặc mở / đặt tên riêng',
      's.open': 'Mở',
      's.ph': 'ten-ghi-chu-dai-kho-doan',
      's.f1': 'Mã hóa AES-256-GCM, khóa sinh ra từ đoạn ký tự trong link',
      's.f2': 'Ai có link đều xem và sửa được, tự đồng bộ giữa các thiết bị',
      's.f3': 'Tự xóa sau 1 năm không ai chỉnh sửa',
      's.weak': 'Tên ngắn dễ bị đoán: ai biết tên là mở được ghi chú. Nên dùng chuỗi dài, ngẫu nhiên.',
      's.bad': 'Chỉ dùng chữ, số, dấu - và _ (3 đến 64 ký tự).',
      'e.copy': 'Sao chép link',
      'e.copied': 'Đã sao chép link',
      'e.copyFail': 'Không sao chép được, hãy copy từ thanh địa chỉ',
      'e.new': 'Mới',
      'e.del': 'Xóa',
      'e.delConfirm': 'Bấm lại để xóa',
      'e.deleted': 'Đã xóa ghi chú',
      'e.ph': 'Gõ nội dung ghi chú ở đây...',
      'e.label': 'Nội dung ghi chú',
      'e.enc': 'Mã hóa AES-256-GCM trên trình duyệt. Máy chủ chỉ thấy dữ liệu đã mã hóa.',
      'st.loading': 'Đang tải...',
      'st.new': 'Ghi chú mới',
      'st.saved': 'Đã lưu',
      'st.saving': 'Đang lưu...',
      'st.dirty': 'Chưa lưu',
      'st.error': 'Lưu lỗi, đang thử lại',
      'st.conflict': 'Có thay đổi từ nơi khác',
      'c.msg': 'Ghi chú vừa được sửa ở nơi khác.',
      'c.take': 'Dùng bản mới',
      'c.keep': 'Giữ bản của tôi',
      'e.synced': 'Đã cập nhật từ thiết bị khác',
      'err.nostore': 'Máy chủ chưa kết nối cơ sở dữ liệu nên chưa lưu được ghi chú.',
      'err.crypto': 'Trình duyệt không hỗ trợ mã hóa. Hãy mở bằng trình duyệt mới và kết nối HTTPS.',
      'err.decrypt': 'Không giải mã được nội dung ghi chú này.',
      'err.load': 'Không tải được ghi chú. Hãy tải lại trang.'
    },
    en: {
      's.kicker': 'Online notepad',
      's.title': 'Encrypted notes, shared with a single link',
      's.lead': 'Your text is encrypted in the browser using the characters in the link itself. The server only stores encrypted data and cannot read it.',
      's.new': 'Create new note',
      's.or': 'Or open / pick your own name',
      's.open': 'Open',
      's.ph': 'a-long-hard-to-guess-name',
      's.f1': 'AES-256-GCM encryption, key derived from the characters in the link',
      's.f2': 'Anyone with the link can read and edit, synced across devices',
      's.f3': 'Deleted automatically after 1 year without edits',
      's.weak': 'Short names are easy to guess: anyone who knows the name can open the note. Use a long, random string.',
      's.bad': 'Letters, numbers, - and _ only (3 to 64 characters).',
      'e.copy': 'Copy link',
      'e.copied': 'Link copied',
      'e.copyFail': 'Couldn\'t copy, use the address bar instead',
      'e.new': 'New',
      'e.del': 'Delete',
      'e.delConfirm': 'Click again to delete',
      'e.deleted': 'Note deleted',
      'e.ph': 'Start typing your note here...',
      'e.label': 'Note content',
      'e.enc': 'AES-256-GCM encrypted in your browser. The server only sees encrypted data.',
      'st.loading': 'Loading...',
      'st.new': 'New note',
      'st.saved': 'Saved',
      'st.saving': 'Saving...',
      'st.dirty': 'Unsaved',
      'st.error': 'Save failed, retrying',
      'st.conflict': 'Changed elsewhere',
      'c.msg': 'This note was just edited somewhere else.',
      'c.take': 'Use the new version',
      'c.keep': 'Keep mine',
      'e.synced': 'Updated from another device',
      'err.nostore': 'The server has no database connected yet, so notes can\'t be saved.',
      'err.crypto': 'This browser can\'t do encryption. Use a recent browser over HTTPS.',
      'err.decrypt': 'This note could not be decrypted.',
      'err.load': 'Couldn\'t load the note. Please reload the page.'
    }
  };

  function storedLang() {
    try { return localStorage.getItem('lang'); } catch (_) { return null; }
  }
  let lang = storedLang();
  if (!STRINGS[lang]) lang = (navigator.language || 'vi').toLowerCase().startsWith('vi') ? 'vi' : 'en';
  const t = (key) => STRINGS[lang][key] ?? STRINGS.vi[key] ?? key;

  let statusName = 'loading';
  let bannerState = null; // { text key | raw, buttons }

  function applyLang(next) {
    lang = STRINGS[next] ? next : 'vi';
    root.lang = lang;
    try { localStorage.setItem('lang', lang); } catch (_) {}

    document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => { el.placeholder = t(el.dataset.i18nPlaceholder); });
    document.querySelectorAll('[data-i18n-label]').forEach((el) => { el.setAttribute('aria-label', t(el.dataset.i18nLabel)); });
    document.querySelectorAll('.lang-toggle button').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
    });

    setStatus(statusName);
    renderBanner();
    if (armed) $('delete-label').textContent = t('e.delConfirm');
    updateHint();
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

  function go(id) { location.href = '/note/' + encodeURIComponent(id); }

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

  const toast = $('toast');
  let toastTimer;
  function showToast(text) {
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2300);
  }

  // ---------------------------------------------------------------------------
  // Routing: /note shows the start screen, /note/<id> opens a note
  // ---------------------------------------------------------------------------
  const match = location.pathname.match(/^\/note\/([^/]+)\/?$/);
  let noteId = null;
  if (match) {
    try { noteId = decodeURIComponent(match[1]); } catch (_) { noteId = null; }
  }
  const validId = noteId !== null && ID_RE.test(noteId);

  // ---------------------------------------------------------------------------
  // Start screen
  // ---------------------------------------------------------------------------
  const customInput = $('custom-id');
  const customHint = $('custom-hint');
  let forcedBad = !validId && !!match;

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
  // Editor
  // ---------------------------------------------------------------------------
  const pad = $('pad');
  const statusEl = $('status');
  const banner = $('banner');
  const bannerA = $('banner-a');
  const bannerB = $('banner-b');

  let aesKey = null;
  let lookup = '';
  let ver = '';           // version token of the copy we last synced with
  let savedText = '';
  let ready = false;
  let saving = false;
  let saveTimer = null;
  let conflictRemote = null;
  let fatalKey = null;

  function setStatus(name) {
    statusName = name;
    statusEl.dataset.state = name === 'new' ? 'saved' : name;
    $('status-text').textContent = t('st.' + name);
  }

  function refreshStatus() {
    if (conflictRemote) setStatus('conflict');
    else if (pad.value !== savedText) setStatus('dirty');
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

  function fatal(key) {
    fatalKey = key;
    ready = false;
    pad.disabled = true;
    bannerState = { text: key, buttons: false };
    renderBanner();
    setStatus('error');
  }

  function updateCount() {
    $('count').textContent = `${pad.value.length.toLocaleString('en-US')} / ${MAX_CHARS.toLocaleString('en-US')}`;
  }

  async function derive(id) {
    const base = await crypto.subtle.importKey('raw', enc.encode(id), 'PBKDF2', false, ['deriveBits']);
    const bits = new Uint8Array(await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: SALT, iterations: ITERATIONS, hash: 'SHA-256' }, base, 512));
    const key = await crypto.subtle.importKey('raw', bits.slice(0, 32), 'AES-GCM', false, ['encrypt', 'decrypt']);
    const token = Array.from(bits.slice(32), (x) => x.toString(16).padStart(2, '0')).join('');
    return { key, token };
  }

  async function encrypt(text) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, enc.encode(text));
    return { iv: b64(iv), ct: b64(ct) };
  }

  async function decrypt(note) {
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(note.iv) }, aesKey, unb64(note.ct));
    return dec.decode(plain);
  }

  function schedule(ms = AUTOSAVE_MS) {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(save, ms);
  }

  async function save() {
    clearTimeout(saveTimer);
    if (!ready || conflictRemote) return;
    if (saving) { schedule(300); return; }

    const text = pad.value;
    if (text === savedText) { refreshStatus(); return; }
    if (!text && !ver) { refreshStatus(); return; } // nothing worth creating

    saving = true;
    setStatus('saving');
    let failed = false;

    try {
      const body = JSON.stringify({ k: lookup, base: ver, ...(await encrypt(text)) });
      const res = await fetch('/api/note', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body
      });

      if (res.status === 409) {
        await onConflict(await res.json());
        return;
      }
      if (res.status === 503) { fatal('err.nostore'); return; }
      if (!res.ok) throw new Error('save ' + res.status);

      const json = await res.json();
      ver = json.ver;
      savedText = text;
    } catch (_) {
      failed = true;
      setStatus('error');
      schedule(5000);
    } finally {
      saving = false;
    }

    if (failed || conflictRemote || fatalKey) return;
    if (pad.value !== savedText) schedule(300);
    refreshStatus();
  }

  async function onConflict(remote) {
    let text;
    try { text = await decrypt(remote); } catch (_) { fatal('err.decrypt'); return; }

    if (text === pad.value) { // same content, just adopt their version
      ver = remote.ver;
      savedText = text;
      refreshStatus();
      return;
    }
    conflictRemote = { ver: remote.ver, text };
    bannerState = { text: 'c.msg', buttons: true };
    renderBanner();
    setStatus('conflict');
  }

  bannerA.addEventListener('click', () => { // take theirs
    if (!conflictRemote) return;
    pad.value = conflictRemote.text;
    savedText = conflictRemote.text;
    ver = conflictRemote.ver;
    conflictRemote = null;
    bannerState = null;
    renderBanner();
    updateCount();
    refreshStatus();
  });

  bannerB.addEventListener('click', () => { // keep mine, overwrite theirs
    if (!conflictRemote) return;
    ver = conflictRemote.ver;
    conflictRemote = null;
    bannerState = null;
    renderBanner();
    save();
  });

  async function poll() {
    if (!ready || document.hidden || saving || conflictRemote || pad.value !== savedText) return;
    try {
      const res = await fetch(`/api/note?k=${lookup}&ver=${encodeURIComponent(ver)}`, { cache: 'no-store' });
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

      // The user may have started typing while the request was in flight.
      if (saving || conflictRemote || pad.value !== savedText) return;

      const text = removed ? '' : await decrypt(remote);
      if (pad.value !== savedText) return;

      if (text !== pad.value) {
        const { selectionStart: a, selectionEnd: b } = pad;
        pad.value = text;
        pad.setSelectionRange(Math.min(a, text.length), Math.min(b, text.length));
        updateCount();
        showToast(t('e.synced'));
      }
      savedText = text;
      ver = removed ? '' : remote.ver;
      refreshStatus();
    } catch (_) { /* try again on the next tick */ }
  }

  // actions
  async function copyLink() {
    const url = location.href;
    try {
      await navigator.clipboard.writeText(url);
      showToast(t('e.copied'));
      return;
    } catch (_) { /* fall through */ }
    try {
      const tmp = document.createElement('textarea');
      tmp.value = url;
      tmp.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(tmp);
      tmp.select();
      const ok = document.execCommand('copy');
      tmp.remove();
      showToast(ok ? t('e.copied') : t('e.copyFail'));
    } catch (_) {
      showToast(t('e.copyFail'));
    }
  }

  let armed = false;
  let armTimer;
  async function deleteNote() {
    const label = $('delete-label');
    const btn = $('delete');
    if (!armed) {
      armed = true;
      btn.classList.add('armed');
      label.textContent = t('e.delConfirm');
      armTimer = setTimeout(disarm, 4000);
      return;
    }
    disarm();
    clearTimeout(saveTimer);
    try {
      const res = await fetch(`/api/note?k=${lookup}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      pad.value = '';
      savedText = '';
      ver = '';
      conflictRemote = null;
      bannerState = null;
      renderBanner();
      updateCount();
      refreshStatus();
      showToast(t('e.deleted'));
    } catch (_) {
      setStatus('error');
    }
  }
  function disarm() {
    armed = false;
    clearTimeout(armTimer);
    $('delete').classList.remove('armed');
    $('delete-label').textContent = t('e.del');
  }

  async function initEditor() {
    $('editor').hidden = false;
    setStatus('loading');

    if (!window.crypto || !crypto.subtle) { fatal('err.crypto'); return; }

    try {
      const keys = await derive(noteId);
      aesKey = keys.key;
      lookup = keys.token;
    } catch (_) { fatal('err.crypto'); return; }

    try {
      const res = await fetch(`/api/note?k=${lookup}`, { cache: 'no-store' });
      if (res.status === 503) { fatal('err.nostore'); return; }
      if (res.status === 200) {
        const note = await res.json();
        const text = await decrypt(note);
        pad.value = text;
        savedText = text;
        ver = note.ver;
      } else if (res.status !== 404) {
        throw new Error('load ' + res.status);
      }
    } catch (e) {
      fatal(e && e.name === 'OperationError' ? 'err.decrypt' : 'err.load');
      return;
    }

    ready = true;
    pad.disabled = false;
    pad.focus({ preventScroll: true });
    updateCount();
    refreshStatus();
    setInterval(poll, POLL_MS);
  }

  function bindEditor() {
    pad.addEventListener('input', () => {
      updateCount();
      if (!ready) return;
      refreshStatus();
      if (pad.value !== savedText) schedule();
    });

    $('copy-link').addEventListener('click', copyLink);
    $('new-note-2').addEventListener('click', () => go(randomId()));
    $('delete').addEventListener('click', deleteNote);

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        save();
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && pad.value !== savedText) save();
      else if (!document.hidden) poll();
    });

    window.addEventListener('beforeunload', (e) => {
      if (ready && pad.value !== savedText && !conflictRemote) {
        e.preventDefault();
        e.returnValue = '';
      }
    });
  }

  // ---------------------------------------------------------------------------
  if (validId) {
    bindEditor();
    initEditor();
  } else {
    initStart();
  }
  applyLang(lang);
})();
