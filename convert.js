// vinhx.info/convert
// Everything runs in the browser: images through canvas, audio through WebAudio,
// video through MediaRecorder. Nothing is uploaded.

(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const root = document.documentElement;

  const STRINGS = {
    vi: {
      kicker: 'Chuyển đổi tệp',
      title: 'Đổi định dạng ảnh, âm thanh và video',
      lead: 'Mọi thứ chạy ngay trên máy của bạn. File không được tải lên máy chủ nào.',
      'drop.title': 'Thả file vào đây hoặc bấm để chọn',
      'drop.sub': 'Ảnh, âm thanh, video. Chọn được nhiều file cùng lúc.',
      'o.image': 'Ảnh', 'o.audio': 'Âm thanh', 'o.video': 'Video',
      'o.format': 'Định dạng', 'o.quality': 'Chất lượng',
      'o.maxw': 'Chiều rộng tối đa (px, để trống = giữ nguyên)',
      'o.mono': 'Gộp thành mono (nhỏ hơn một nửa)',
      'o.qHigh': 'Cao', 'o.qMid': 'Vừa', 'o.qLow': 'Thấp (nhỏ nhất)',
      'o.videoNote': 'Video được ghi lại theo thời gian thực nên đổi mất đúng bằng độ dài video. Giữ tab này mở.',
      'o.wavOnly': 'Chỉ lấy âm thanh (WAV)',
      'a.go': 'Chuyển đổi', 'a.zip': 'Tải tất cả (.zip)', 'a.clear': 'Xóa danh sách',
      'a.download': 'Tải về', 'a.remove': 'Bỏ file này',
      f1: 'Xử lý bằng chính trình duyệt, không tải file lên máy chủ',
      f2: 'Định dạng xuất ra tùy trình duyệt của bạn hỗ trợ (Chrome và Edge đầy đủ nhất)',
      f3: 'Chưa hỗ trợ xuất MP3 hoặc GIF động',
      'st.ready': 'Sẵn sàng', 'st.working': 'Đang chuyển đổi...', 'st.done': 'Xong',
      'err.type': 'Không phải ảnh, âm thanh hay video',
      'err.decode': 'Trình duyệt không đọc được file này',
      'err.encode': 'Trình duyệt không xuất được định dạng này',
      'err.video': 'Không chuyển đổi được video này',
      'err.big': 'File quá lớn để xử lý trên trình duyệt',
      'toast.zip': 'Đã tạo file zip'
    },
    en: {
      kicker: 'File converter',
      title: 'Convert images, audio and video',
      lead: 'Everything runs on your own device. Files are never uploaded to any server.',
      'drop.title': 'Drop files here or click to choose',
      'drop.sub': 'Images, audio, video. You can pick several at once.',
      'o.image': 'Images', 'o.audio': 'Audio', 'o.video': 'Video',
      'o.format': 'Format', 'o.quality': 'Quality',
      'o.maxw': 'Max width (px, empty = keep original)',
      'o.mono': 'Mix down to mono (about half the size)',
      'o.qHigh': 'High', 'o.qMid': 'Medium', 'o.qLow': 'Low (smallest)',
      'o.videoNote': 'Video is re-recorded in real time, so converting takes as long as the video itself. Keep this tab open.',
      'o.wavOnly': 'Audio only (WAV)',
      'a.go': 'Convert', 'a.zip': 'Download all (.zip)', 'a.clear': 'Clear list',
      'a.download': 'Download', 'a.remove': 'Remove this file',
      f1: 'Processed by your own browser, files are never uploaded',
      f2: 'Output formats depend on what your browser supports (Chrome and Edge are the most complete)',
      f3: 'MP3 output and animated GIFs are not supported yet',
      'st.ready': 'Ready', 'st.working': 'Converting...', 'st.done': 'Done',
      'err.type': 'Not an image, audio or video file',
      'err.decode': 'This browser could not read the file',
      'err.encode': 'This browser cannot export that format',
      'err.video': 'This video could not be converted',
      'err.big': 'File is too large to process in the browser',
      'toast.zip': 'Zip created'
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
    document.querySelectorAll('.lang-toggle button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    renderList();
    fillFormats();
  }
  document.querySelectorAll('.lang-toggle button').forEach((b) => b.addEventListener('click', () => applyLang(b.dataset.lang)));

  // ---------------------------------------------------------------------------
  // Capabilities
  // ---------------------------------------------------------------------------
  const IMAGE_TARGETS = [
    { id: 'png', mime: 'image/png', ext: 'png', label: 'PNG' },
    { id: 'jpeg', mime: 'image/jpeg', ext: 'jpg', label: 'JPG' },
    { id: 'webp', mime: 'image/webp', ext: 'webp', label: 'WebP' },
    { id: 'avif', mime: 'image/avif', ext: 'avif', label: 'AVIF' }
  ];
  const VIDEO_TARGETS = [
    { id: 'webm', ext: 'webm', label: 'WebM', mimes: ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'] },
    { id: 'mp4', ext: 'mp4', label: 'MP4', mimes: ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4;codecs=avc1,mp4a.40.2', 'video/mp4'] }
  ];
  let imageTargets = IMAGE_TARGETS.filter((x) => x.id !== 'avif'); // avif is probed below
  let videoTargets = [];

  function probeCapabilities() {
    try {
      const c = document.createElement('canvas');
      c.width = c.height = 2;
      c.toBlob((b) => {
        if (b && b.type === 'image/avif') { imageTargets = IMAGE_TARGETS.slice(); fillFormats(); }
      }, 'image/avif');
    } catch (_) { /* ignore */ }

    if (window.MediaRecorder && MediaRecorder.isTypeSupported) {
      videoTargets = VIDEO_TARGETS.map((x) => ({ ...x, mime: x.mimes.find((m) => MediaRecorder.isTypeSupported(m)) })).filter((x) => x.mime);
    }
  }

  const imgFmt = $('img-fmt');
  const audFmt = $('aud-fmt');
  const vidFmt = $('vid-fmt');

  function fillSelect(sel, options) {
    const keep = sel.value;
    sel.textContent = '';
    options.forEach((o) => {
      const opt = document.createElement('option');
      opt.value = o.id;
      opt.textContent = o.label;
      sel.appendChild(opt);
    });
    if (options.some((o) => o.id === keep)) sel.value = keep;
  }
  function fillFormats() {
    fillSelect(imgFmt, imageTargets);
    fillSelect(audFmt, [{ id: 'wav', label: 'WAV' }]);
    fillSelect(vidFmt, [...videoTargets, { id: 'wav', label: t('o.wavOnly') }]);
  }

  // ---------------------------------------------------------------------------
  // Files
  // ---------------------------------------------------------------------------
  const MAX_BYTES = 1024 * 1024 * 1024;
  let items = [];
  let seq = 0;
  let busy = false;

  const kindOf = (file) => {
    const ty = file.type || '';
    if (ty.startsWith('image/')) return 'image';
    if (ty.startsWith('audio/')) return 'audio';
    if (ty.startsWith('video/')) return 'video';
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'avif', 'svg', 'heic', 'heif'].includes(ext)) return 'image';
    if (['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac', 'opus'].includes(ext)) return 'audio';
    if (['mp4', 'webm', 'mov', 'mkv', 'm4v'].includes(ext)) return 'video';
    return null;
  };

  function fmtSize(n) {
    if (n < 1024) return n + ' B';
    if (n < 1048576) return (n / 1024).toFixed(1) + ' KB';
    return (n / 1048576).toFixed(1) + ' MB';
  }

  function addFiles(fileList) {
    Array.from(fileList).forEach((file) => {
      const kind = kindOf(file);
      const item = { id: ++seq, file, kind, state: 'ready', error: '', blob: null, name: '', progress: 0 };
      if (!kind) { item.state = 'error'; item.error = 'err.type'; }
      else if (file.size > MAX_BYTES) { item.state = 'error'; item.error = 'err.big'; }
      items.push(item);
    });
    renderAll();
  }

  function renderAll() {
    renderList();
    const kinds = new Set(items.filter((i) => i.kind).map((i) => i.kind));
    $('opts').hidden = kinds.size === 0;
    ['image', 'audio', 'video'].forEach((k) => { $('opt-' + k).hidden = !kinds.has(k); });
    $('bar').hidden = items.length === 0;
    $('go').disabled = busy || !items.some((i) => i.state !== 'error');
    $('zip').disabled = busy || !items.some((i) => i.blob);
  }

  function renderList() {
    const list = $('list');
    list.textContent = '';
    items.forEach((it) => {
      const li = document.createElement('li');
      li.className = 'fitem';
      li.dataset.id = it.id;

      const name = document.createElement('span');
      name.className = 'fname';
      name.textContent = it.file.name;

      const meta = document.createElement('span');
      meta.className = 'fmeta';
      if (it.state === 'error') { meta.classList.add('err'); meta.textContent = t(it.error); }
      else if (it.state === 'working') meta.textContent = t('st.working');
      else if (it.state === 'done') {
        meta.classList.add('ok');
        meta.textContent = `${t('st.done')} · ${fmtSize(it.file.size)} → ${fmtSize(it.blob.size)}`;
      } else meta.textContent = `${t('st.ready')} · ${fmtSize(it.file.size)}`;

      const btns = document.createElement('div');
      btns.className = 'fbtns';
      if (it.state === 'done') {
        const a = document.createElement('a');
        a.className = 'btn';
        a.textContent = t('a.download');
        a.download = it.name;
        a.href = it.url || (it.url = URL.createObjectURL(it.blob));
        btns.appendChild(a);
      }
      if (!busy) {
        const rm = document.createElement('button');
        rm.type = 'button';
        rm.className = 'icon-btn';
        rm.setAttribute('aria-label', t('a.remove'));
        rm.title = t('a.remove');
        rm.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
        rm.addEventListener('click', () => { dropItem(it); });
        btns.appendChild(rm);
      }

      li.append(name, meta, btns);
      if (it.state === 'working') {
        const bar = document.createElement('div');
        bar.className = 'fprog';
        const i = document.createElement('i');
        i.style.width = Math.round(it.progress * 100) + '%';
        bar.appendChild(i);
        li.appendChild(bar);
      }
      list.appendChild(li);
    });
  }

  function dropItem(it) {
    if (it.url) URL.revokeObjectURL(it.url);
    items = items.filter((x) => x !== it);
    renderAll();
  }

  function setProgress(it, p) {
    it.progress = p;
    const bar = document.querySelector(`.fitem[data-id="${it.id}"] .fprog > i`);
    if (bar) bar.style.width = Math.round(p * 100) + '%';
  }

  // ---------------------------------------------------------------------------
  // Converters
  // ---------------------------------------------------------------------------
  const baseName = (n) => n.replace(/\.[^.]+$/, '') || 'file';

  async function loadBitmap(file) {
    try { return await createImageBitmap(file); } catch (_) { /* svg and odd formats */ }
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      return img;
    } finally { setTimeout(() => URL.revokeObjectURL(url), 0); }
  }

  async function convertImage(it) {
    const target = imageTargets.find((x) => x.id === imgFmt.value) || imageTargets[0];
    let src;
    try { src = await loadBitmap(it.file); } catch (_) { throw new Error('err.decode'); }

    const w0 = src.width || src.naturalWidth;
    const h0 = src.height || src.naturalHeight;
    if (!w0 || !h0) throw new Error('err.decode');
    const maxW = parseInt($('img-w').value, 10);
    const scale = maxW > 0 && maxW < w0 ? maxW / w0 : 1;
    const w = Math.max(1, Math.round(w0 * scale));
    const h = Math.max(1, Math.round(h0 * scale));

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (target.id === 'jpeg') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h); } // no alpha in JPEG
    ctx.drawImage(src, 0, 0, w, h);
    if (src.close) src.close();

    const quality = Number($('img-q').value) / 100;
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, target.mime, quality));
    if (!blob || blob.type !== target.mime) throw new Error('err.encode');
    return { blob, ext: target.ext };
  }

  function encodeWav(buffer, mono) {
    const channels = mono ? 1 : Math.min(buffer.numberOfChannels, 2);
    const len = buffer.length;
    const rate = buffer.sampleRate;
    const data = new DataView(new ArrayBuffer(44 + len * channels * 2));
    const str = (o, s) => { for (let i = 0; i < s.length; i++) data.setUint8(o + i, s.charCodeAt(i)); };
    str(0, 'RIFF'); data.setUint32(4, 36 + len * channels * 2, true); str(8, 'WAVE');
    str(12, 'fmt '); data.setUint32(16, 16, true); data.setUint16(20, 1, true); data.setUint16(22, channels, true);
    data.setUint32(24, rate, true); data.setUint32(28, rate * channels * 2, true);
    data.setUint16(32, channels * 2, true); data.setUint16(34, 16, true);
    str(36, 'data'); data.setUint32(40, len * channels * 2, true);

    const chans = [];
    for (let c = 0; c < buffer.numberOfChannels; c++) chans.push(buffer.getChannelData(c));
    let o = 44;
    for (let i = 0; i < len; i++) {
      for (let c = 0; c < channels; c++) {
        let s;
        if (mono) {
          s = 0;
          for (let k = 0; k < chans.length; k++) s += chans[k][i];
          s /= chans.length;
        } else s = chans[c][i];
        s = Math.max(-1, Math.min(1, s));
        data.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true);
        o += 2;
      }
    }
    return new Blob([data], { type: 'audio/wav' });
  }

  async function convertToWav(it, mono) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) throw new Error('err.encode');
    const ctx = new AC();
    try {
      const raw = await it.file.arrayBuffer();
      const buf = await ctx.decodeAudioData(raw);
      setProgress(it, 0.9);
      return { blob: encodeWav(buf, mono), ext: 'wav' };
    } catch (e) {
      throw new Error(e && e.message && e.message.startsWith('err.') ? e.message : 'err.decode');
    } finally {
      if (ctx.close) ctx.close().catch(() => {});
    }
  }

  async function convertVideo(it) {
    if (vidFmt.value === 'wav') return convertToWav(it, false);
    const target = videoTargets.find((x) => x.id === vidFmt.value) || videoTargets[0];
    if (!target) throw new Error('err.encode');

    const url = URL.createObjectURL(it.file);
    const video = document.createElement('video');
    video.src = url;
    video.playsInline = true;
    video.preload = 'auto';
    let ac = null;

    try {
      await new Promise((resolve, reject) => {
        video.onloadedmetadata = resolve;
        video.onerror = () => reject(new Error('err.decode'));
      });
      const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;

      const capture = video.captureStream || video.mozCaptureStream;
      if (!capture) throw new Error('err.encode');
      const stream = capture.call(video);

      // Route the audio through WebAudio so it is recorded but not played out loud.
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        try {
          ac = new AC();
          const dest = ac.createMediaStreamDestination();
          ac.createMediaElementSource(video).connect(dest);
          stream.getAudioTracks().forEach((tr) => stream.removeTrack(tr));
          dest.stream.getAudioTracks().forEach((tr) => stream.addTrack(tr));
          if (ac.state === 'suspended') await ac.resume();
        } catch (_) { /* fall back to the element's own audio track */ }
      }

      const rec = new MediaRecorder(stream, { mimeType: target.mime, videoBitsPerSecond: Number($('vid-q').value) });
      const chunks = [];
      rec.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
      const finished = new Promise((resolve, reject) => {
        rec.onstop = resolve;
        rec.onerror = () => reject(new Error('err.video'));
      });

      const tick = setInterval(() => { if (duration) setProgress(it, Math.min(0.99, video.currentTime / duration)); }, 300);
      const ended = new Promise((resolve) => { video.onended = resolve; });

      rec.start(1000);
      await video.play();
      await ended;
      clearInterval(tick);
      rec.stop();
      await finished;

      const blob = new Blob(chunks, { type: target.mime.split(';')[0] });
      if (!blob.size) throw new Error('err.video');
      return { blob, ext: target.ext };
    } catch (e) {
      throw new Error(e && e.message && e.message.startsWith('err.') ? e.message : 'err.video');
    } finally {
      video.pause();
      video.removeAttribute('src');
      video.load();
      URL.revokeObjectURL(url);
      if (ac && ac.close) ac.close().catch(() => {});
    }
  }

  async function runItem(it) {
    it.state = 'working';
    it.progress = 0;
    it.error = '';
    if (it.url) { URL.revokeObjectURL(it.url); it.url = null; }
    it.blob = null;
    renderList();
    try {
      const out = it.kind === 'image' ? await convertImage(it)
        : it.kind === 'audio' ? await convertToWav(it, $('aud-mono').checked)
        : await convertVideo(it);
      it.blob = out.blob;
      it.name = `${baseName(it.file.name)}.${out.ext}`;
      it.state = 'done';
    } catch (e) {
      it.state = 'error';
      it.error = e && e.message && e.message.startsWith('err.') ? e.message : 'err.decode';
    }
    renderList();
  }

  async function runAll() {
    if (busy) return;
    busy = true;
    renderAll();
    const used = new Set();
    for (const it of items.slice()) {
      if (it.state === 'error' && !it.kind) continue;
      if (it.state === 'error' && it.error === 'err.big') continue;
      await runItem(it);
      if (it.blob) { // unique names inside the zip
        let n = it.name; let k = 1;
        while (used.has(n)) n = it.name.replace(/(\.[^.]+)$/, ` (${k++})$1`);
        used.add(n);
        it.name = n;
      }
    }
    busy = false;
    renderAll();
  }

  // ---------------------------------------------------------------------------
  // Zip (store only, no compression, so no library is needed)
  // ---------------------------------------------------------------------------
  const CRC = (() => {
    const tbl = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      tbl[n] = c >>> 0;
    }
    return (bytes) => {
      let c = 0xffffffff;
      for (let i = 0; i < bytes.length; i++) c = tbl[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
      return (c ^ 0xffffffff) >>> 0;
    };
  })();

  async function buildZip(files) {
    const enc = new TextEncoder();
    const d = new Date();
    const time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
    const date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    const parts = [];
    const central = [];
    let offset = 0;

    for (const f of files) {
      const name = enc.encode(f.name);
      const data = new Uint8Array(await f.blob.arrayBuffer());
      const crc = CRC(data);

      const lh = new DataView(new ArrayBuffer(30));
      lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true);
      lh.setUint16(8, 0, true); lh.setUint16(10, time, true); lh.setUint16(12, date, true);
      lh.setUint32(14, crc, true); lh.setUint32(18, data.length, true); lh.setUint32(22, data.length, true);
      lh.setUint16(26, name.length, true); lh.setUint16(28, 0, true);
      parts.push(lh, name, data);

      const ch = new DataView(new ArrayBuffer(46));
      ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true);
      ch.setUint16(10, 0, true); ch.setUint16(12, time, true); ch.setUint16(14, date, true);
      ch.setUint32(16, crc, true); ch.setUint32(20, data.length, true); ch.setUint32(24, data.length, true);
      ch.setUint16(28, name.length, true); ch.setUint32(42, offset, true);
      central.push(ch, name);

      offset += 30 + name.length + data.length;
    }
    const centralSize = central.reduce((s, p) => s + (p.byteLength ?? p.length), 0);
    const end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true);
    end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
    end.setUint32(12, centralSize, true); end.setUint32(16, offset, true);
    return new Blob([...parts, ...central, end], { type: 'application/zip' });
  }

  async function downloadZip() {
    const done = items.filter((i) => i.blob);
    if (!done.length) return;
    const blob = await buildZip(done);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vinhx-convert.zip';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    showToast(t('toast.zip'));
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
  // Wiring
  // ---------------------------------------------------------------------------
  const drop = $('drop');
  const input = $('file');
  input.addEventListener('change', () => { addFiles(input.files); input.value = ''; });
  drop.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } });
  ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', (e) => { if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files); });
  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => { if (!drop.contains(e.target)) e.preventDefault(); });

  $('img-q').addEventListener('input', () => { $('img-q-val').textContent = $('img-q').value; });
  $('go').addEventListener('click', runAll);
  $('zip').addEventListener('click', downloadZip);
  $('clear').addEventListener('click', () => {
    if (busy) return;
    items.forEach((i) => { if (i.url) URL.revokeObjectURL(i.url); });
    items = [];
    renderAll();
  });
  window.addEventListener('beforeunload', (e) => { if (busy) { e.preventDefault(); e.returnValue = ''; } });

  probeCapabilities();
  applyLang(lang);
  renderAll();
})();
