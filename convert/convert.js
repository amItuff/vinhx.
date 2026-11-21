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
      title: 'Đổi định dạng, nén ảnh, cắt video thành GIF, gộp PDF',
      lead: 'Mọi thứ chạy ngay trên máy của bạn. File không được tải lên máy chủ nào.',
      'drop.title': 'Thả file vào đây hoặc bấm để chọn',
      'drop.sub': 'Ảnh, âm thanh, video, PDF. Chọn được nhiều file cùng lúc.',
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
      f3: 'Xuất được MP3 (từ âm thanh hoặc video) và GIF động (từ video)',
      'o.bitrate': 'Chất lượng MP3', 'o.mp3Only': 'Chỉ lấy âm thanh (MP3)', 'o.gif': 'GIF động',
      'o.fps': 'Số khung hình mỗi giây', 'o.gifw': 'Chiều rộng (px)',
      'o.same': 'Giữ nguyên định dạng (nén nhỏ lại)', 'o.toPdf': 'PDF (gộp thành 1 file)', 'o.pdf': 'PDF',
      'o.pdfNote': 'Các file PDF (và ảnh, nếu bạn chọn xuất PDF) được gộp thành một file theo thứ tự trong danh sách. Dùng mũi tên để đổi thứ tự.',
      'o.page': 'Khổ trang PDF', 'o.pageFit': 'Vừa với ảnh', 'o.pageA4': 'A4',
      'o.gifStart': 'Bắt đầu từ giây thứ', 'o.gifLen': 'Độ dài (giây, tối đa 20)',
      'o.gifNote': 'GIF cắt đúng đoạn bạn chọn (tối đa 20 giây), không có tiếng.',
      't.convert': 'Đổi định dạng', 't.compress': 'Nén ảnh', 't.gif': 'Video thành GIF', 't.pdf': 'Gộp PDF',
      'th.compress': 'Giữ nguyên định dạng rồi kéo thanh chất lượng xuống để file nhẹ hơn. Giảm thêm bằng cách đặt chiều rộng tối đa. File không bao giờ nặng hơn bản gốc.',
      'th.gif': 'Thả video vào, chọn giây bắt đầu và độ dài đoạn muốn cắt, rồi bấm Chuyển đổi.',
      'th.pdf': 'Thả nhiều file PDF (hoặc ảnh) vào, chúng được gộp thành một file PDF theo thứ tự trong danh sách.',
      'st.merged': 'đã gộp vào file PDF', 'st.kept': 'đã nhỏ sẵn, giữ nguyên',
      'err.pdf': 'Không đọc được PDF này (có thể bị khóa mật khẩu hoặc hỏng)', 'err.pdf1': 'Cần ít nhất 2 file PDF để gộp',
      'a.up': 'Chuyển lên', 'a.down': 'Chuyển xuống',
      f4: 'Nén ảnh hàng loạt và gộp nhiều PDF hoặc ảnh thành một file PDF',
      'err.lib': 'Không tải được bộ mã hóa, kiểm tra mạng rồi thử lại',
      'st.ready': 'Sẵn sàng', 'st.working': 'Đang chuyển đổi...', 'st.done': 'Xong',
      'err.type': 'Không phải ảnh, âm thanh, video hay PDF',
      'err.decode': 'Trình duyệt không đọc được file này',
      'err.encode': 'Trình duyệt không xuất được định dạng này',
      'err.video': 'Không chuyển đổi được video này',
      'err.big': 'File quá lớn để xử lý trên trình duyệt',
      'toast.zip': 'Đã tạo file zip'
    },
    en: {
      kicker: 'File converter',
      title: 'Convert, compress, make GIFs and merge PDFs',
      lead: 'Everything runs on your own device. Files are never uploaded to any server.',
      'drop.title': 'Drop files here or click to choose',
      'drop.sub': 'Images, audio, video, PDF. You can pick several at once.',
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
      f3: 'MP3 (from audio or video) and animated GIF (from video) are supported',
      'o.bitrate': 'MP3 quality', 'o.mp3Only': 'Audio only (MP3)', 'o.gif': 'Animated GIF',
      'o.fps': 'Frames per second', 'o.gifw': 'Width (px)',
      'o.same': 'Keep format (compress)', 'o.toPdf': 'PDF (merge into one file)', 'o.pdf': 'PDF',
      'o.pdfNote': 'PDF files (and images, if you choose PDF output) are merged into one file in list order. Use the arrows to reorder.',
      'o.page': 'PDF page size', 'o.pageFit': 'Fit the image', 'o.pageA4': 'A4',
      'o.gifStart': 'Start at second', 'o.gifLen': 'Length (seconds, max 20)',
      'o.gifNote': 'The GIF covers exactly the part you pick (up to 20 seconds) and has no sound.',
      't.convert': 'Convert', 't.compress': 'Compress images', 't.gif': 'Video to GIF', 't.pdf': 'Merge PDF',
      'th.compress': 'Keep the format and drag quality down to shrink the file. Set a max width to shrink it further. A file never ends up bigger than the original.',
      'th.gif': 'Drop a video, pick the start second and length of the clip, then press Convert.',
      'th.pdf': 'Drop several PDFs (or images); they are merged into one PDF in list order.',
      'st.merged': 'merged into the PDF', 'st.kept': 'already small, kept as is',
      'err.pdf': 'This PDF could not be read (it may be password-protected or damaged)', 'err.pdf1': 'Add at least 2 PDF files to merge',
      'a.up': 'Move up', 'a.down': 'Move down',
      f4: 'Batch image compression, and merging PDFs or images into one PDF',
      'err.lib': 'Could not load the encoder, check your connection and try again',
      'st.ready': 'Ready', 'st.working': 'Converting...', 'st.done': 'Done',
      'err.type': 'Not an image, audio, video or PDF file',
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
    if (typeof setTool === 'function' && tool && tool !== 'convert') { $('tool-hint').textContent = t('th.' + tool); }
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
    fillSelect(imgFmt, [...imageTargets, { id: 'same', label: t('o.same') }, { id: 'pdf', label: t('o.toPdf') }]);
    fillSelect(audFmt, [{ id: 'wav', label: 'WAV' }, { id: 'mp3', label: 'MP3' }]);
    fillSelect(vidFmt, [...videoTargets, { id: 'gif', label: t('o.gif') }, { id: 'mp3', label: t('o.mp3Only') }, { id: 'wav', label: t('o.wavOnly') }]);
    syncOpts();
  }

  // show only the options that matter for the chosen output format
  function syncOpts() {
    const v = vidFmt.value;
    $('mp3-opts').hidden = audFmt.value !== 'mp3';
    $('gif-opts').hidden = v !== 'gif';
    $('pdf-opts').hidden = imgFmt.value !== 'pdf';
    $('vid-rec').hidden = v === 'gif' || v === 'mp3' || v === 'wav';
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
    if (ty === 'application/pdf') return 'pdf';
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'avif', 'svg', 'heic', 'heif'].includes(ext)) return 'image';
    if (['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac', 'opus'].includes(ext)) return 'audio';
    if (['mp4', 'webm', 'mov', 'mkv', 'm4v'].includes(ext)) return 'video';
    if (ext === 'pdf') return 'pdf';
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
    ['image', 'audio', 'video', 'pdf'].forEach((k) => { $('opt-' + k).hidden = !kinds.has(k); });
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
      else if (it.state === 'done' && it.merged) { meta.classList.add('ok'); meta.textContent = `${t('st.done')} · ${t('st.merged')}`; }
      else if (it.state === 'done') {
        meta.classList.add('ok');
        const saved = it.file.size > 0 ? Math.round((1 - it.blob.size / it.file.size) * 100) : 0;
        meta.textContent = `${t('st.done')} · ${fmtSize(it.file.size)} → ${fmtSize(it.blob.size)}` + (saved >= 1 ? ` (-${saved}%)` : '') + (it.kept ? ` · ${t('st.kept')}` : '');
      } else meta.textContent = `${t('st.ready')} · ${fmtSize(it.file.size)}`;

      const btns = document.createElement('div');
      btns.className = 'fbtns';
      if (it.state === 'done' && it.blob) {
        const a = document.createElement('a');
        a.className = 'btn';
        a.textContent = t('a.download');
        a.download = it.name;
        a.href = it.url || (it.url = URL.createObjectURL(it.blob));
        btns.appendChild(a);
      }
      if (!busy && items.length > 1) {
        const idx = items.indexOf(it);
        [['a.up', -1, 'M6 15l6-6 6 6'], ['a.down', 1, 'M6 9l6 6 6-6']].forEach(([key, dir, path]) => {
          const mv = document.createElement('button');
          mv.type = 'button';
          mv.className = 'icon-btn';
          mv.setAttribute('aria-label', t(key));
          mv.title = t(key);
          mv.disabled = idx + dir < 0 || idx + dir >= items.length;
          mv.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${path}"/></svg>`;
          mv.addEventListener('click', () => { items.splice(idx, 1); items.splice(idx + dir, 0, it); renderList(); });
          btns.appendChild(mv);
        });
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
    let target = imageTargets.find((x) => x.id === imgFmt.value) || imageTargets[0];
    const same = imgFmt.value === 'same';
    if (same) {
      const ty = it.file.type;
      const want = ty === 'image/jpeg' ? 'jpeg' : ty === 'image/png' ? 'png' : ty === 'image/avif' ? 'avif' : 'webp';
      target = imageTargets.find((x) => x.id === want) || imageTargets.find((x) => x.id === 'webp') || imageTargets[0];
    }
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
    // compressing must never make a file bigger: keep the original if the result is not smaller
    if (same && it.file.type === target.mime && blob.size >= it.file.size && !(maxW > 0 && maxW < w0)) {
      it.kept = true;
      return { blob: it.file, ext: (it.file.name.split('.').pop() || target.ext).toLowerCase() };
    }
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

  // ---- MP3 (lamejs, loaded on first use) ----
  let lamePromise = null;
  function loadLame() {
    if (window.lamejs) return Promise.resolve();
    if (!lamePromise) {
      lamePromise = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = '/convert/vendor/lame.min.js?v=1';
        s.onload = resolve;
        s.onerror = () => { lamePromise = null; reject(new Error('err.lib')); };
        document.head.appendChild(s);
      });
    }
    return lamePromise;
  }

  // MP3 only allows certain sample rates; resample anything else to 44.1 kHz
  async function ensureMp3Rate(buf) {
    if ([48000, 44100, 32000, 24000, 22050, 16000, 12000, 11025, 8000].includes(buf.sampleRate)) return buf;
    const rate = 44100;
    const off = new OfflineAudioContext(Math.min(buf.numberOfChannels, 2), Math.ceil(buf.duration * rate), rate);
    const src = off.createBufferSource();
    src.buffer = buf;
    src.connect(off.destination);
    src.start();
    return off.startRendering();
  }

  async function encodeMp3(buffer, mono, kbps, onProgress) {
    await loadLame();
    const buf = await ensureMp3Rate(buffer);
    const channels = mono ? 1 : Math.min(buf.numberOfChannels, 2);
    const left = new Int16Array(buf.length);
    const right = channels === 2 ? new Int16Array(buf.length) : null;
    const toI16 = (f) => { const s = Math.max(-1, Math.min(1, f)); return s < 0 ? s * 0x8000 : s * 0x7fff; };
    const chans = [];
    for (let c = 0; c < buf.numberOfChannels; c++) chans.push(buf.getChannelData(c));
    for (let i = 0; i < buf.length; i++) {
      if (mono) {
        let s = 0;
        for (let k = 0; k < chans.length; k++) s += chans[k][i];
        left[i] = toI16(s / chans.length);
      } else {
        left[i] = toI16(chans[0][i]);
        if (right) right[i] = toI16(chans[1][i]);
      }
    }
    const enc = new window.lamejs.Mp3Encoder(channels, buf.sampleRate, kbps);
    const out = [];
    const BLOCK = 1152;
    for (let i = 0; i < buf.length; i += BLOCK) {
      const chunk = right
        ? enc.encodeBuffer(left.subarray(i, i + BLOCK), right.subarray(i, i + BLOCK))
        : enc.encodeBuffer(left.subarray(i, i + BLOCK));
      if (chunk.length) out.push(chunk);
      if ((i / BLOCK) % 400 === 0) { onProgress(0.9 + 0.09 * (i / buf.length)); await new Promise((r) => setTimeout(r)); }
    }
    const tail = enc.flush();
    if (tail.length) out.push(tail);
    return new Blob(out, { type: 'audio/mpeg' });
  }

  async function convertAudio(it, mono, fmt) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) throw new Error('err.encode');
    const ctx = new AC();
    try {
      const raw = await it.file.arrayBuffer();
      const buf = await ctx.decodeAudioData(raw);
      setProgress(it, 0.9);
      if (fmt === 'mp3') {
        const kbps = it.kind === 'audio' ? Number($('aud-br').value) || 128 : 128;
        return { blob: await encodeMp3(buf, mono, kbps, (p) => setProgress(it, p)), ext: 'mp3' };
      }
      return { blob: encodeWav(buf, mono), ext: 'wav' };
    } catch (e) {
      throw new Error(e && e.message && e.message.startsWith('err.') ? e.message : 'err.decode');
    } finally {
      if (ctx.close) ctx.close().catch(() => {});
    }
  }

  // ---- animated GIF from a video (gifenc, loaded on first use) ----
  const GIF_MAX_SECONDS = 20;
  function seekTo(video, time) {
    return new Promise((resolve) => {
      const done = () => { video.removeEventListener('seeked', done); clearTimeout(to); resolve(); };
      const to = setTimeout(done, 3000);
      video.addEventListener('seeked', done);
      video.currentTime = time;
    });
  }

  async function convertGif(it) {
    let lib;
    try { lib = await import('/convert/vendor/gifenc.esm.js'); } catch (_) { throw new Error('err.lib'); }
    const { GIFEncoder, quantize, applyPalette } = lib;

    const url = URL.createObjectURL(it.file);
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.src = url;
    try {
      await new Promise((resolve, reject) => {
        video.onloadeddata = resolve;
        video.onerror = () => reject(new Error('err.decode'));
      });
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (!vw || !vh) throw new Error('err.decode');
      const total = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 1;
      const start = Math.min(Math.max(0, parseFloat($('gif-start').value) || 0), Math.max(0, total - 0.2));
      const len = Math.min(GIF_MAX_SECONDS, Math.max(0.5, parseFloat($('gif-len').value) || 10));
      const dur = Math.max(0.2, Math.min(len, total - start));
      const fps = Number($('gif-fps').value) || 12;
      const maxW = parseInt($('gif-w').value, 10) || 480;
      const w = Math.max(16, Math.min(maxW, vw));
      const h = Math.max(16, Math.round(vh * (w / vw)));
      const frames = Math.max(1, Math.floor(dur * fps));

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      const gif = GIFEncoder();
      for (let i = 0; i < frames; i++) {
        await seekTo(video, Math.min(start + i / fps, Math.max(0, total - 0.05)));
        ctx.drawImage(video, 0, 0, w, h);
        const { data } = ctx.getImageData(0, 0, w, h);
        const palette = quantize(data, 256);
        gif.writeFrame(applyPalette(data, palette), w, h, { palette, delay: Math.round(1000 / fps) });
        setProgress(it, (i + 1) / frames);
        if (i % 4 === 0) await new Promise((r) => setTimeout(r));
      }
      gif.finish();
      return { blob: new Blob([gif.bytes()], { type: 'image/gif' }), ext: 'gif' };
    } catch (e) {
      throw new Error(e && e.message && e.message.startsWith('err.') ? e.message : 'err.video');
    } finally {
      video.removeAttribute('src');
      video.load();
      URL.revokeObjectURL(url);
    }
  }

  async function convertVideo(it) {
    if (vidFmt.value === 'wav' || vidFmt.value === 'mp3') return convertAudio(it, false, vidFmt.value);
    if (vidFmt.value === 'gif') return convertGif(it);
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

  // ---- PDF: merge PDFs (and images) into one file (pdf-lib, loaded on first use) ----
  let pdfPromise = null;
  function loadPdfLib() {
    if (window.PDFLib) return Promise.resolve();
    if (!pdfPromise) {
      pdfPromise = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = '/convert/vendor/pdf-lib.min.js?v=1';
        s.onload = resolve;
        s.onerror = () => { pdfPromise = null; reject(new Error('err.lib')); };
        document.head.appendChild(s);
      });
    }
    return pdfPromise;
  }

  // Draw through a canvas so phone photos come out the right way up, and cap the size to keep the PDF light.
  async function imageForPdf(file) {
    const src = await loadBitmap(file);
    const w0 = src.width || src.naturalWidth;
    const h0 = src.height || src.naturalHeight;
    if (!w0 || !h0) throw new Error('err.decode');
    const cap = parseInt($('img-w').value, 10) > 0 ? parseInt($('img-w').value, 10) : 2400;
    const k = Math.min(1, cap / Math.max(w0, h0));
    const w = Math.max(1, Math.round(w0 * k));
    const h = Math.max(1, Math.round(h0 * k));
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    const png = file.type === 'image/png' || file.type === 'image/webp' || file.type === 'image/gif';
    if (!png) { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h); }
    ctx.drawImage(src, 0, 0, w, h);
    if (src.close) src.close();
    const blob = await new Promise((resolve) => c.toBlob(resolve, png ? 'image/png' : 'image/jpeg', 0.9));
    if (!blob) throw new Error('err.encode');
    return { bytes: new Uint8Array(await blob.arrayBuffer()), png, w, h };
  }

  async function runPdfGroup(group) {
    group.forEach((it) => {
      it.state = 'working'; it.progress = 0; it.error = ''; it.merged = false; it.kept = false; it.blob = null;
      if (it.url) { URL.revokeObjectURL(it.url); it.url = null; }
    });
    renderList();
    let current = null;
    try {
      try { await loadPdfLib(); } catch (_) { throw new Error('err.lib'); }
      const { PDFDocument } = window.PDFLib;
      const out = await PDFDocument.create();
      const a4 = $('pdf-page').value === 'a4';
      for (let i = 0; i < group.length; i++) {
        const it = current = group[i];
        if (it.kind === 'pdf') {
          let src;
          try { src = await PDFDocument.load(await it.file.arrayBuffer()); } catch (_) { throw new Error('err.pdf'); }
          (await out.copyPages(src, src.getPageIndices())).forEach((pg) => out.addPage(pg));
        } else {
          let img;
          try { img = await imageForPdf(it.file); } catch (e) { throw new Error(e && e.message === 'err.encode' ? 'err.encode' : 'err.decode'); }
          const emb = img.png ? await out.embedPng(img.bytes) : await out.embedJpg(img.bytes);
          if (a4) {
            const PW = 595.28, PH = 841.89, M = 24;
            const k = Math.min((PW - 2 * M) / img.w, (PH - 2 * M) / img.h);
            const dw = img.w * k, dh = img.h * k;
            out.addPage([PW, PH]).drawImage(emb, { x: (PW - dw) / 2, y: (PH - dh) / 2, width: dw, height: dh });
          } else {
            const pg = out.addPage([img.w * 0.75, img.h * 0.75]);
            pg.drawImage(emb, { x: 0, y: 0, width: pg.getWidth(), height: pg.getHeight() });
          }
        }
        group.forEach((g) => setProgress(g, (i + 1) / (group.length + 1)));
        await new Promise((r) => setTimeout(r));
      }
      const bytes = await out.save();
      const first = group[0];
      first.blob = new Blob([bytes], { type: 'application/pdf' });
      first.name = 'vinhx-merged.pdf';
      first.state = 'done';
      group.slice(1).forEach((g) => { g.state = 'done'; g.merged = true; });
    } catch (e) {
      const msg = e && e.message && e.message.startsWith('err.') ? e.message : 'err.pdf';
      group.forEach((g) => { g.state = 'ready'; });
      const bad = msg === 'err.lib' || !current ? group[0] : current;
      bad.state = 'error';
      bad.error = msg;
    }
    renderList();
  }

  async function runItem(it) {
    it.state = 'working';
    it.progress = 0;
    it.error = '';
    if (it.url) { URL.revokeObjectURL(it.url); it.url = null; }
    it.blob = null;
    it.merged = false;
    it.kept = false;
    renderList();
    try {
      const out = it.kind === 'image' ? await convertImage(it)
        : it.kind === 'audio' ? await convertAudio(it, $('aud-mono').checked, audFmt.value)
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
    const inPdf = (it) => it.kind === 'pdf' || (it.kind === 'image' && imgFmt.value === 'pdf');
    const runnable = (it) => !(it.state === 'error' && (!it.kind || it.error === 'err.big'));
    const group = items.filter((it) => inPdf(it) && runnable(it));
    let groupDone = false;
    for (const it of items.slice()) {
      if (!runnable(it)) continue;
      if (inPdf(it)) {
        if (groupDone) continue;
        groupDone = true;
        if (group.length === 1 && group[0].kind === 'pdf') { group[0].state = 'error'; group[0].error = 'err.pdf1'; renderList(); }
        else await runPdfGroup(group);
        const first = group[0];
        if (first.blob) { used.add(first.name); }
        continue;
      }
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

  imgFmt.addEventListener('change', syncOpts);
  audFmt.addEventListener('change', syncOpts);
  vidFmt.addEventListener('change', syncOpts);
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

  // ---- tool shortcuts: preset the options and the file picker for a common job ----
  const TOOLS = {
    convert: { accept: 'image/*,audio/*,video/*,application/pdf,.pdf' },
    compress: { accept: 'image/*', img: 'same' },
    gif: { accept: 'video/*', vid: 'gif' },
    pdf: { accept: 'application/pdf,.pdf,image/*', img: 'pdf' }
  };
  let tool = 'convert';
  function setTool(name, openPicker) {
    if (!TOOLS[name]) name = 'convert';
    tool = name;
    const cfg = TOOLS[name];
    input.accept = cfg.accept;
    if (cfg.img) imgFmt.value = cfg.img;
    if (cfg.vid) vidFmt.value = cfg.vid;
    syncOpts();
    document.querySelectorAll('.tool').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tool === name)));
    const hint = $('tool-hint');
    hint.hidden = name === 'convert';
    hint.textContent = name === 'convert' ? '' : t('th.' + name);
    try { history.replaceState(null, '', name === 'convert' ? location.pathname : '#' + name); } catch (_) { /* ignore */ }
    if (openPicker) input.click();
  }
  document.querySelectorAll('.tool').forEach((b) => b.addEventListener('click', () => setTool(b.dataset.tool, true)));

  probeCapabilities();
  applyLang(lang);
  setTool(location.hash.slice(1), false);
  renderAll();
})();
