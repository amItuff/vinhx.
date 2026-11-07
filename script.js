// vinhx.info

// Bail out when the page is framed or opened through a source viewer / proxy.
(function guardFraming() {
  const blocked = [
    'view-page-source', 'viewsource', 'page-source', 'codebeautify', 'archive.org',
    'cachedview', 'web-capture', '2read.net', 'urlbox', 'croxyproxy',
    'translate.googleusercontent', 'proxysite', 'hidefree', 'hidester'
  ];
  const ref = (document.referrer || '').toLowerCase();
  const host = (location.hostname || '').toLowerCase();

  let framed = false;
  try { framed = window.self !== window.top; } catch (_) { framed = true; }

  const listed = blocked.some((d) => ref.includes(d) || host.includes(d));

  let badAncestor = false;
  const anc = location.ancestorOrigins;
  if (anc && anc.length) {
    for (let i = 0; i < anc.length; i++) {
      const o = anc[i].toLowerCase();
      if (blocked.some((d) => o.includes(d)) || !o.includes('vinhx.info')) { badAncestor = true; break; }
    }
  }

  if (framed || listed || badAncestor) {
    try {
      document.documentElement.innerHTML = '<head><title>Access Denied</title></head><body style="background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;font-family:monospace;"><h3>Direct Access Only: https://vinhx.info</h3></body>';
    } catch (_) {}
    try { window.top.location.href = 'https://vinhx.info'; } catch (_) { location.href = 'https://vinhx.info'; }
    throw new Error('blocked');
  }
})();

const $ = (id) => document.getElementById(id);
const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------------------------------------------------------------------------
// Language
// ---------------------------------------------------------------------------
const STRINGS = {
  vi: {
    'enter.kicker': 'Portfolio cá nhân',
    'enter.sound': 'Vào trang',
    'enter.silent': 'Vào không nhạc',
    'hero.scroll': 'Cuộn xuống',
    'toast.title': 'Đã sao chép email!',
    'toast.sub': 'Dán vào ứng dụng email để gửi thư.',
    'about.badge': 'Giới thiệu',
    'about.status': 'Nhận làm freelance',
    'about.text': 'Mình là <strong>Vinh (vinhx)</strong>. Chuyên viết bot Discord, script tự động hóa bằng Python và xây dựng giao diện web tối giản, tốc độ cao.',
    'about.contact': 'Gửi tin nhắn',
    'gh.badge': 'Hoạt động GitHub',
    'gh.view': 'Xem hồ sơ',
    'gh.sub': '<strong>42 lượt đóng góp</strong> trong năm qua',
    'gh.less': 'Ít',
    'gh.more': 'Nhiều',
    'skills.badge': 'Kỹ năng & công nghệ',
    'projects.badge': 'Dự án nổi bật',
    'p3.cover': 'Mã hóa đầu cuối · không cần đăng ký',
    'p3.desc': 'Ghi chú trực tuyến mã hóa AES-256 ngay trên trình duyệt. Chia sẻ bằng một link, ai có link đều xem và sửa được.',
    'p3.open': 'Mở Notepad',
    'p2.desc': 'Công cụ tự động hóa Discord: hỗ trợ làm nhiệm vụ, treo stream voice 24/7, spoofer giờ chơi và các tiện ích bảo mật tài khoản.',
    'p.join': 'Vào server',
    'p.features': 'Xem tính năng bot',
    'discord.profile': 'Hồ sơ',
    'fb.label': 'Mạng xã hội',
    'fb.connect': 'Kết nối',
    'player.label': 'Đang phát',
    'bot.title': 'Tính năng bot Discord',
    'bot.join': 'Vào server Discord',
    'f1.desc': 'Hoàn thành nhiệm vụ Discord và tự động claim quà.',
    'f2.desc': 'Tùy chỉnh game & giờ chơi mở khóa huy hiệu, còn lại giữ nguyên hết.',
    'f3.name': 'Treo Stream Voice',
    'f3.desc': 'Phát sóng stream thoại 24/7 cày Streaming Badge.',
    'f4.desc': 'Tùy biến ảnh GIF, game, status & các nút bấm tương tác.',
    'f5.desc': 'Tự động tham gia giveaway & nhận thông báo khi trúng giải.',
    'f6.name': 'Huy Hiệu HypeSquad',
    'f6.desc': 'Trực tiếp gắn huy hiệu Bravery, Brilliance, Balance hoặc gỡ badge.',
    'f7.name': 'Sao Lưu & Dọn Dẹp',
    'f7.desc': 'Xuất dữ liệu tài khoản, dọn sạch tin nhắn & server rác.',
    'f8.name': 'Giám Sát & Bảo Mật',
    'f8.desc': 'Kiểm tra phiên đăng nhập & gom nhắc tên tập trung.',
    'f9.name': 'Quản Lý Token',
    'f9.desc': 'Lưu, kiểm tra hoặc xóa token an toàn.',
    'mail.title': 'Gửi tin nhắn',
    'mail.to': 'Đến:',
    'mail.from': 'Từ:',
    'mail.subject': 'Tiêu đề:',
    'mail.fromPh': 'Email của bạn...',
    'mail.subjectPh': 'Tiêu đề...',
    'mail.bodyPh': 'Nội dung tin nhắn...',
    'mail.send': 'Gửi',
    'mail.sending': 'Đang gửi...',
    'mail.sent': 'Đã gửi thành công!',
    'mail.error': 'Lỗi gửi thư. Vui lòng thử lại!',
    'mail.network': 'Lỗi kết nối!',
    'ui.mute': 'Bật/Tắt âm thanh',
    'ui.copyEmail': 'Sao chép email',
    'ui.prev': 'Bài trước',
    'ui.next': 'Bài tiếp theo',
    'ui.volume': 'Âm lượng',
    'ui.top': 'Lên đầu trang',
    'ui.close': 'Đóng',
    'ui.compose': 'Soạn thư',
    'status.online': 'Đang hoạt động',
    'status.idle': 'Vắng mặt',
    'status.dnd': 'Không làm phiền',
    'status.offline': 'Ngoại tuyến',
    'presence.playing': 'Đang chơi',
    'presence.listening': 'Đang nghe'
  },
  en: {
    'enter.kicker': 'Personal portfolio',
    'enter.sound': 'Enter',
    'enter.silent': 'Enter without sound',
    'hero.scroll': 'Scroll',
    'toast.title': 'Email copied!',
    'toast.sub': 'Paste it into your mail app.',
    'about.badge': 'About me',
    'about.status': 'Available for freelance',
    'about.text': 'I\'m <strong>Vinh (vinhx)</strong>. I build Discord bots, Python automation scripts and minimal, fast websites.',
    'about.contact': 'Send a message',
    'gh.badge': 'GitHub activity',
    'gh.view': 'View profile',
    'gh.sub': '<strong>42 contributions</strong> in the last year',
    'gh.less': 'Less',
    'gh.more': 'More',
    'skills.badge': 'Skills & tech stack',
    'projects.badge': 'Featured projects',
    'p3.cover': 'End-to-end encrypted · no sign-up',
    'p3.desc': 'Online notepad encrypted with AES-256 in your browser. Share one link and anyone who has it can read and edit.',
    'p3.open': 'Open Notepad',
    'p2.desc': 'Discord automation toolkit: quest helper, 24/7 voice streaming, playtime spoofer and account security utilities.',
    'p.join': 'Join server',
    'p.features': 'Bot features',
    'discord.profile': 'Profile',
    'fb.label': 'Social network',
    'fb.connect': 'Connect',
    'player.label': 'Now playing',
    'bot.title': 'Discord bot features',
    'bot.join': 'Join Discord server',
    'f1.desc': 'Completes Discord quests and claims the rewards for you.',
    'f2.desc': 'Set a custom game and playtime to unlock badges; nothing else changes.',
    'f3.name': '24/7 Voice Stream',
    'f3.desc': 'Keeps a voice stream running around the clock for the Streaming badge.',
    'f4.desc': 'Customize GIF art, game, status and interactive buttons.',
    'f5.desc': 'Joins giveaways automatically and notifies you when you win.',
    'f6.name': 'HypeSquad Badge',
    'f6.desc': 'Set Bravery, Brilliance or Balance directly, or remove the badge.',
    'f7.name': 'Backup & Cleanup',
    'f7.desc': 'Export account data, clear messages and leave junk servers.',
    'f8.name': 'Monitoring & Security',
    'f8.desc': 'Review login sessions and collect mentions in one place.',
    'f9.name': 'Token Manager',
    'f9.desc': 'Save, check or delete tokens safely.',
    'mail.title': 'New message',
    'mail.to': 'To:',
    'mail.from': 'From:',
    'mail.subject': 'Subject:',
    'mail.fromPh': 'Your email...',
    'mail.subjectPh': 'Subject...',
    'mail.bodyPh': 'Your message...',
    'mail.send': 'Send',
    'mail.sending': 'Sending...',
    'mail.sent': 'Sent, thank you!',
    'mail.error': 'Couldn\'t send. Please try again.',
    'mail.network': 'Network error.',
    'ui.mute': 'Mute / unmute',
    'ui.copyEmail': 'Copy email',
    'ui.prev': 'Previous track',
    'ui.next': 'Next track',
    'ui.volume': 'Volume',
    'ui.top': 'Back to top',
    'ui.close': 'Close',
    'ui.compose': 'Write a message',
    'status.online': 'Online',
    'status.idle': 'Idle',
    'status.dnd': 'Do not disturb',
    'status.offline': 'Offline',
    'presence.playing': 'Playing',
    'presence.listening': 'Listening to'
  }
};

function storedLang() {
  try { return localStorage.getItem('lang'); } catch (_) { return null; }
}

let lang = storedLang() || ((navigator.language || 'vi').toLowerCase().startsWith('vi') ? 'vi' : 'en');
const t = (key) => STRINGS[lang][key] ?? STRINGS.vi[key] ?? key;

function applyLang(next) {
  lang = STRINGS[next] ? next : 'vi';
  root.lang = lang;
  try { localStorage.setItem('lang', lang); } catch (_) {}

  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => { el.placeholder = t(el.dataset.i18nPlaceholder); });
  document.querySelectorAll('[data-i18n-label]').forEach((el) => {
    const v = t(el.dataset.i18nLabel);
    el.setAttribute('aria-label', v);
    if (el.hasAttribute('title')) el.title = v;
  });
  document.querySelectorAll('.lang-toggle button').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
  });

  renderPresence();
}

document.querySelectorAll('.lang-toggle button').forEach((b) => {
  b.addEventListener('click', (e) => {
    e.stopPropagation();
    applyLang(b.dataset.lang);
  });
});

// ---------------------------------------------------------------------------
// Intro screen
// ---------------------------------------------------------------------------
const enterScreen = $('enter-screen');
let entered = false;
let soundStarted = false;

root.classList.add('is-locked');

function enterSite(withSound) {
  if (entered) return;
  entered = true;

  if (withSound) {
    soundStarted = true;
    if (widget) widget.play();
  }

  enterScreen.classList.add('is-leaving');
  document.body.classList.add('is-entered');
  root.classList.remove('is-locked');
  setTimeout(() => enterScreen.classList.add('is-gone'), reduceMotion ? 700 : 1200);
}

enterScreen.addEventListener('click', (e) => {
  if (e.target.closest('.lang-toggle')) return;
  enterSite(!e.target.closest('#enter-silent'));
});

document.addEventListener('keydown', (e) => {
  if (!entered && e.key === 'Enter' && !e.target.closest('.lang-toggle, #enter-silent')) {
    e.preventDefault();
    enterSite(true);
  }
});

// ---------------------------------------------------------------------------
// Clock
// ---------------------------------------------------------------------------
const clockFmt = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Ho_Chi_Minh', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'
});
function tickClock() {
  $('vn-clock-display').textContent = `VN (GMT+7) ${clockFmt.format(new Date())}`;
}
setInterval(tickClock, 1000);
tickClock();

// ---------------------------------------------------------------------------
// Scrolling
// ---------------------------------------------------------------------------
const backToTopBtn = $('back-to-top-btn');

$('scroll-hint-btn').addEventListener('click', () => {
  $('cards-view').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
});

window.addEventListener('scroll', () => {
  backToTopBtn.classList.toggle('visible', window.scrollY > 350);
}, { passive: true });

backToTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
});

// Cards fade in as they enter the viewport; cards arriving together are staggered.
const revealObserver = new IntersectionObserver((entries, obs) => {
  let n = 0;
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.style.transitionDelay = `${n++ * 90}ms`;
    entry.target.classList.add('revealed');
    obs.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal-card').forEach((el) => revealObserver.observe(el));

// ---------------------------------------------------------------------------
// GitHub grid (draws "vinhx" and a heart)
// ---------------------------------------------------------------------------
(function drawHeatmap() {
  const grid = $('gh-heatmap');
  const art = [
    [1,0,0,0,1, 0, 1, 0, 1,1,1,0, 0, 1,0,0,0, 0, 1,0,0,0,1, 0, 0, 0,1,1,0,1,1,0],
    [1,0,0,0,1, 0, 0, 0, 1,0,0,1, 0, 1,0,0,0, 0, 0,1,0,1,0, 0, 0, 1,1,1,1,1,1,1],
    [0,1,0,1,0, 0, 1, 0, 1,0,0,1, 0, 1,1,1,0, 0, 0,0,1,0,0, 0, 0, 1,1,1,1,1,1,1],
    [0,1,0,1,0, 0, 1, 0, 1,0,0,1, 0, 1,0,0,1, 0, 0,1,0,1,0, 0, 0, 0,1,1,1,1,1,0],
    [0,0,1,0,0, 0, 1, 0, 1,0,0,1, 0, 1,0,0,1, 0, 1,0,0,0,1, 0, 0, 0,0,1,1,1,0,0],
    [0,0,0,0,0, 0, 0, 0, 0,0,0,0, 0, 0,0,0,0, 0, 0,0,0,0,0, 0, 0, 0,0,0,1,0,0,0],
    [0,0,0,0,0, 0, 0, 0, 0,0,0,0, 0, 0,0,0,0, 0, 0,0,0,0,0, 0, 0, 0,0,0,0,0,0,0]
  ];
  const frag = document.createDocumentFragment();
  for (let c = 0; c < art[0].length; c++) {
    for (let r = 0; r < art.length; r++) {
      const cell = document.createElement('div');
      cell.className = art[r][c] ? 'contrib-cell lvl-4' : 'contrib-cell';
      cell.style.setProperty('--c', c);
      frag.appendChild(cell);
    }
  }
  grid.appendChild(frag);
})();

// ---------------------------------------------------------------------------
// Email (kept out of the HTML so scrapers don't pick it up)
// ---------------------------------------------------------------------------
const emailAddress = ['nguyenngoctrivinh72', 'gmail.com'].join('@');
const toast = $('copy-toast');
let toastTimer;

$('copy-email-btn').addEventListener('click', () => {
  navigator.clipboard.writeText(emailAddress).then(() => {
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
  }).catch(() => openGmail());
});

// ---------------------------------------------------------------------------
// Modals
// ---------------------------------------------------------------------------
const FOCUSABLE = 'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';
let activeModal = null;
let returnFocus = null;

function openModal(el) {
  returnFocus = document.activeElement;
  activeModal = el;
  el.classList.remove('hidden');
  root.classList.add('is-locked');
  const first = el.querySelector('input, textarea') || el.querySelector(FOCUSABLE);
  setTimeout(() => first && first.focus({ preventScroll: true }), 60);
}

function closeModal(el) {
  el.classList.add('hidden');
  if (activeModal === el) activeModal = null;
  root.classList.remove('is-locked');
  if (returnFocus && document.contains(returnFocus)) returnFocus.focus({ preventScroll: true });
}

document.addEventListener('keydown', (e) => {
  if (!activeModal) return;
  if (e.key === 'Escape') {
    activeModal === gmailModal ? closeGmail() : closeModal(activeModal);
    return;
  }
  if (e.key !== 'Tab') return;
  const items = [...activeModal.querySelectorAll(FOCUSABLE)].filter((n) => n.offsetParent !== null);
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

// contact form
const gmailModal = $('gmail-modal-container');
const mailFab = $('open-gmail-modal');

function openGmail() { mailFab.classList.add('is-hidden'); openModal(gmailModal); }
function closeGmail() { mailFab.classList.remove('is-hidden'); closeModal(gmailModal); }

mailFab.addEventListener('click', openGmail);
$('about-contact-btn').addEventListener('click', openGmail);
$('footer-contact-btn').addEventListener('click', openGmail);
$('close-gmail-btn').addEventListener('click', closeGmail);
gmailModal.addEventListener('click', (e) => { if (e.target === gmailModal) closeGmail(); });

const contactForm = $('contact-form');
const formStatus = $('form-status');
const submitBtn = $('form-submit-btn');

function setStatus(key, color) {
  formStatus.style.color = color;
  formStatus.textContent = key ? t(key) : '';
}

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  submitBtn.disabled = true;
  setStatus('mail.sending', '#eab308');

  try {
    const res = await fetch(contactForm.action, {
      method: 'POST',
      body: new FormData(contactForm),
      headers: { Accept: 'application/json' }
    });

    if (res.ok) {
      setStatus('mail.sent', '#3fb950');
      contactForm.reset();
      setTimeout(() => { closeGmail(); setStatus('', ''); }, 2000);
    } else {
      const data = await res.json().catch(() => null);
      formStatus.style.color = '#ef4444';
      formStatus.textContent = data?.errors ? data.errors.map((er) => er.message).join(', ') : t('mail.error');
    }
  } catch (_) {
    setStatus('mail.network', '#ef4444');
  } finally {
    submitBtn.disabled = false;
  }
});

// bot features
const botModal = $('bot-features-modal');
botModal.querySelectorAll('.feature-card').forEach((card, i) => card.style.setProperty('--i', i));

$('open-bot-features-btn').addEventListener('click', () => openModal(botModal));
$('close-bot-features-btn').addEventListener('click', () => closeModal(botModal));
botModal.querySelector('.bot-modal-overlay').addEventListener('click', () => closeModal(botModal));

// ---------------------------------------------------------------------------
// Discord presence via Lanyard (https://github.com/Phineas/lanyard)
// Only works while the account is in the Lanyard Discord server;
// otherwise the card keeps its default look.
// ---------------------------------------------------------------------------
const DISCORD_ID = '1054712893037355018';
const statusDot = $('discord-status');
const presenceEl = $('discord-presence');
let presence = null;

function renderPresence() {
  if (!presence) return;
  const status = presence.discord_status || 'offline';
  statusDot.className = `status-indicator ${status}`;
  statusDot.title = t(`status.${status}`);

  const acts = presence.activities || [];
  const game = acts.find((a) => a.type === 0);
  const custom = acts.find((a) => a.type === 4 && a.state);

  let line = t(`status.${status}`);
  if (presence.listening_to_spotify && presence.spotify) {
    line = `${t('presence.listening')} ${presence.spotify.song} — ${presence.spotify.artist.replace(/;/g, ',')}`;
  } else if (game) {
    line = `${t('presence.playing')} ${game.name}`;
  } else if (custom) {
    line = custom.state;
  }
  presenceEl.textContent = line;
  presenceEl.title = line;
}

async function fetchPresence() {
  try {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`);
    if (!res.ok) return;
    const json = await res.json();
    if (!json.success) return;
    presence = json.data;
    renderPresence();
  } catch (_) {}
}

fetchPresence();
setInterval(() => { if (!document.hidden) fetchPresence(); }, 30000);

// ---------------------------------------------------------------------------
// Music player (SoundCloud widget)
// ---------------------------------------------------------------------------
const PLAYLIST = [
  { title: 'PAR SG - cigarette ft. Cigar', url: 'https://soundcloud.com/parsg/par-sg-cigarette-ft-cigar' },
  { title: 'Hành Tinh Buồn Tênh', url: 'https://soundcloud.com/viet-music-chill/hanh-tinh-buon-tenh' },
  { title: 'Lofi Hip Hop Chill Beats', url: 'https://soundcloud.com/chillhopdotcom/chillhop-essentials-spring-2023' }
];

const widget = window.SC ? SC.Widget($('sc-hidden-frame')) : null;
const diskImage = $('disk-image');
const diskBox = document.querySelector('.disk-container');
const playIcon = $('ctrl-play-icon');
const progressVal = $('progress-bar-val');
const muteBtn = $('floating-audio-toggle');
const muteIcon = $('float-audio-icon');

let trackIndex = 0;
let isMuted = false;
let volume = 85;
let durationMs = 162000;

const fmtTime = (ms) => {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

function showTrack() {
  $('track-name').textContent = PLAYLIST[trackIndex].title;
  $('track-counter').textContent = `${trackIndex + 1} / ${PLAYLIST.length}`;
}

function refreshMeta() {
  widget.getDuration((d) => {
    if (d > 0) { durationMs = d; $('time-max').textContent = fmtTime(d); }
  });
  widget.getCurrentSound((sound) => {
    if (sound?.artwork_url) diskImage.src = sound.artwork_url.replace('-large', '-t500x500');
  });
}

function loadTrack(i) {
  trackIndex = (i + PLAYLIST.length) % PLAYLIST.length;
  showTrack();
  progressVal.style.transform = 'scaleX(0)';
  $('time-curr').textContent = '0:00';
  widget.load(PLAYLIST[trackIndex].url, {
    auto_play: true,
    show_artwork: true,
    callback: () => {
      widget.setVolume(isMuted ? 0 : volume);
      refreshMeta();
    }
  });
}

if (widget) {
  widget.bind(SC.Widget.Events.READY, () => {
    widget.setVolume(volume);
    showTrack();
    refreshMeta();
    if (soundStarted) widget.play();
  });

  widget.bind(SC.Widget.Events.PLAY, () => {
    playIcon.className = 'fa-solid fa-pause';
    diskImage.classList.add('running');
    diskBox.classList.add('playing');
  });

  widget.bind(SC.Widget.Events.PAUSE, () => {
    playIcon.className = 'fa-solid fa-play';
    diskImage.classList.remove('running');
    diskBox.classList.remove('playing');
  });

  widget.bind(SC.Widget.Events.PLAY_PROGRESS, (data) => {
    $('time-curr').textContent = fmtTime(data.currentPosition);
    if (durationMs > 0) progressVal.style.transform = `scaleX(${Math.min(1, data.currentPosition / durationMs)})`;
  });

  widget.bind(SC.Widget.Events.FINISH, () => loadTrack(trackIndex + 1));

  $('ctrl-play').addEventListener('click', () => { soundStarted = true; widget.toggle(); });
  $('ctrl-next').addEventListener('click', () => loadTrack(trackIndex + 1));
  $('ctrl-prev').addEventListener('click', () => loadTrack(trackIndex - 1));

  $('progress-bar-slot').addEventListener('click', function (e) {
    const rect = this.getBoundingClientRect();
    widget.seekTo(((e.clientX - rect.left) / rect.width) * durationMs);
  });

  $('vol-range').addEventListener('input', function () {
    volume = Number(this.value);
    if (!isMuted) widget.setVolume(volume);
  });

  muteBtn.addEventListener('click', () => {
    isMuted = !isMuted;
    widget.setVolume(isMuted ? 0 : volume);
    muteIcon.className = isMuted ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high';
    muteBtn.classList.toggle('muted', isMuted);
  });
}

applyLang(lang);
