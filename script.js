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
let changelogData = null;
let changelogOpen = false;
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
    'projects.badge': 'Dự án nổi bật',
    'faq.badge': 'Câu hỏi thường gặp',
    'faq.q1': 'Ghi chú trên vinhx note có an toàn không?',
    'faq.q1a': 'Nội dung được mã hóa AES-256-GCM ngay trên trình duyệt trước khi lưu, máy chủ chỉ giữ bản đã mã hóa. Ai có link thì đọc được, nên đừng đăng link công khai. Link dạng /note#tên có phần tên nằm sau dấu #, không gửi lên máy chủ. Nếu đặt mật khẩu thứ hai mà quên, nội dung không khôi phục được.',
    'faq.q2': 'Link chỉ xem khác link chỉnh sửa thế nào?',
    'faq.q2a': 'Link chỉnh sửa cho đọc và sửa. Link chỉ xem cho người nhận đọc nhưng không sửa hay xóa được, vì máy chủ chỉ nhận ghi khi có khóa ghi mà link chỉ xem không chứa.',
    'faq.q3': 'Ghi chú tự xóa khi nào?',
    'faq.q3a': 'Mặc định sau 1 năm không ai chỉnh sửa. Bạn có thể chọn 1 giờ, 1 ngày hoặc 1 tuần trong phần cài đặt, hoặc bật tự hủy sau khi link chỉ xem được mở một lần.',
    'faq.q4': 'File trong vinhx convert có bị tải lên máy chủ không?',
    'faq.q4a': 'Không. Ảnh, âm thanh và video được xử lý ngay trong trình duyệt của bạn. Riêng video được ghi lại theo thời gian thực nên mất đúng bằng độ dài video và cần giữ tab mở.',
    'faq.q5': 'Vì sao có định dạng không xuất được?',
    'faq.q5a': 'Định dạng xuất ra tùy trình duyệt hỗ trợ, Chrome và Edge đầy đủ nhất. Hiện chưa hỗ trợ xuất MP3 hay GIF động.',
    'faq.q6': 'Web có theo dõi mình không?',
    'faq.q6a': 'Trang không dùng cookie theo dõi hay quảng cáo, chỉ lưu ngôn ngữ và bản nháp thư trên máy bạn. Trang có tải phông từ Google Fonts, trạng thái Discord từ Lanyard và trình phát SoundCloud; các dịch vụ này có thể ghi nhận lượt truy cập theo chính sách riêng của họ.',
    'faq.q7': 'Báo lỗi hoặc liên hệ ở đâu?',
    'faq.q7a': 'Dùng nút thư ở góc phải dưới để gửi tin nhắn, hoặc vào server Discord ở phần dự án.',
    'p3.desc': 'Ghi chú mã hóa ngay trên trình duyệt, chia sẻ bằng một link.',
    'p3.open': 'Mở',
    'p4.desc': 'Đổi định dạng ảnh, âm thanh, video ngay trên máy, không tải file lên đâu cả.',
    'p4.open': 'Mở',
    'p5.desc': 'Đọc EPUB/TXT của bạn, đánh dấu, nhớ tiến độ và nghe đọc chỉnh được tốc độ.',
    'p5.open': 'Mở',
    'faq.q8': 'vinhx library có sẵn sách để đọc không?',
    'faq.q8a': 'Không. Thư viện không đăng hay chia sẻ sách nào. Bạn tự thêm file EPUB hoặc TXT mà bạn có quyền dùng (sách miễn phí, sách tự viết, tác phẩm hết bản quyền). Sách chỉ lưu trong trình duyệt của bạn, không tải lên máy chủ.',
    'log.label': 'Cập nhật gần đây',
    'log.all': 'Tất cả commit',
    'log.more': 'Xem thêm',
    'log.less': 'Thu gọn',
    'p2.desc': 'Công cụ Discord: làm nhiệm vụ, treo voice 24/7, giả lập giờ chơi, bảo mật tài khoản.',
    'p.join': 'Vào server',
    'p.features': 'Tính năng',
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
    'mail.title': 'Tin nhắn mới',
    'mail.to': 'Tới',
    'mail.from': 'Từ',
    'mail.fromPh': 'Email của bạn',
    'mail.subjectPh': 'Tiêu đề',
    'mail.bodyPh': 'Nội dung tin nhắn',
    'mail.min': 'Thu nhỏ',
    'mail.attach': 'Đính kèm ảnh',
    'mail.photo': 'Chèn ảnh',
    'mail.discard': 'Bỏ thư',
    'mail.drop': 'Thả ảnh vào đây để đính kèm',
    'mail.limit': 'Tối đa 3 ảnh.',
    'mail.tooBig': 'Ảnh quá nặng, tổng tối đa khoảng 3 MB.',
    'mail.imgFail': 'Không đọc được ảnh này.',
    'mail.badEmail': 'Nhập email hợp lệ.',
    'mail.needSubject': 'Nhập tiêu đề.',
    'mail.needBody': 'Nhập nội dung.',
    'mail.noAttach': 'Chưa gửi được ảnh đính kèm.',
    'mail.sendNoFiles': 'Gửi không kèm ảnh',
    'mail.rate': 'Bạn gửi quá nhiều, thử lại sau.',
    'mail.badFiles': 'Ảnh không hợp lệ, thử ảnh khác.',
    'mail.deliveryFail': 'Máy chủ không chuyển được thư kèm ảnh.',
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
    'projects.badge': 'Featured projects',
    'faq.badge': 'FAQ',
    'faq.q1': 'Is vinhx note safe?',
    'faq.q1a': 'Text is encrypted with AES-256-GCM in your browser before it is saved, so the server only holds the encrypted copy. Anyone with the link can read it, so do not post it publicly. In /note#name links the name sits after the #, which is never sent to the server. If you set a second password and forget it, the content cannot be recovered.',
    'faq.q2': 'What is the difference between the view-only and edit links?',
    'faq.q2a': 'The edit link lets people read and change the note. The view-only link lets them read it but never change or delete it, because the server only accepts writes that carry a write key, and the view-only link does not contain one.',
    'faq.q3': 'When are notes deleted?',
    'faq.q3a': 'By default after 1 year without edits. In settings you can pick 1 hour, 1 day or 1 week, or turn on self-destruct after the view-only link is opened once.',
    'faq.q4': 'Are my files uploaded when I use vinhx convert?',
    'faq.q4a': 'No. Images, audio and video are processed inside your own browser. Video is re-recorded in real time, so it takes as long as the video itself and the tab must stay open.',
    'faq.q5': 'Why can some formats not be exported?',
    'faq.q5a': 'Output formats depend on what your browser supports; Chrome and Edge are the most complete. MP3 output and animated GIFs are not supported yet.',
    'faq.q6': 'Does this site track me?',
    'faq.q6a': 'The site uses no tracking cookies or ads and only stores your language and mail draft on your device. It does load fonts from Google Fonts, Discord status from Lanyard and the SoundCloud player; those services may log visits under their own policies.',
    'faq.q7': 'Where can I report a bug or get in touch?',
    'faq.q7a': 'Use the mail button at the bottom right to send a message, or join the Discord server from the projects section.',
    'p3.desc': 'Notes encrypted in your browser, shared with one link.',
    'p3.open': 'Open',
    'p4.desc': 'Convert images, audio and video right on your device. Nothing is uploaded.',
    'p4.open': 'Open',
    'p5.desc': 'Read your EPUB/TXT files, bookmark, keep your place and listen at your own speed.',
    'p5.open': 'Open',
    'faq.q8': 'Does vinhx library come with books?',
    'faq.q8a': 'No. The library does not publish or share any books. You add EPUB or TXT files you are allowed to use (free books, your own writing, works out of copyright). Books are stored only in your browser and never uploaded.',
    'log.label': 'Recent updates',
    'log.all': 'All commits',
    'log.more': 'Show more',
    'log.less': 'Show less',
    'p2.desc': 'Discord toolkit: quests, 24/7 voice, playtime spoofer, account security.',
    'p.join': 'Join server',
    'p.features': 'Features',
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
    'mail.to': 'To',
    'mail.from': 'From',
    'mail.fromPh': 'Your email',
    'mail.subjectPh': 'Subject',
    'mail.bodyPh': 'Your message',
    'mail.min': 'Minimize',
    'mail.attach': 'Attach images',
    'mail.photo': 'Insert image',
    'mail.discard': 'Discard',
    'mail.drop': 'Drop images here to attach',
    'mail.limit': 'Up to 3 images.',
    'mail.tooBig': 'Images are too large, about 3 MB in total at most.',
    'mail.imgFail': 'Could not read that image.',
    'mail.badEmail': 'Enter a valid email.',
    'mail.needSubject': 'Enter a subject.',
    'mail.needBody': 'Enter a message.',
    'mail.noAttach': 'Image attachments could not be sent.',
    'mail.sendNoFiles': 'Send without images',
    'mail.rate': 'Too many messages, try again later.',
    'mail.badFiles': 'Invalid image, try another one.',
    'mail.deliveryFail': 'The server could not deliver the message with images.',
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
  renderChangelog();
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
  root.classList.add('is-locked', 'modal-open');
  const first = el.querySelector('input, textarea') || el.querySelector(FOCUSABLE);
  setTimeout(() => first && first.focus({ preventScroll: true }), 60);
}

function closeModal(el) {
  el.classList.add('hidden');
  if (activeModal === el) activeModal = null;
  root.classList.remove('is-locked', 'modal-open');
  if (returnFocus && document.contains(returnFocus)) returnFocus.focus({ preventScroll: true });
}

document.addEventListener('keydown', (e) => {
  if (!activeModal) return;
  if (e.key === 'Escape') {
    closeModal(activeModal);
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

// ---------------------------------------------------------------------------
// Contact form: Gmail-style compose window with image attachments
// ---------------------------------------------------------------------------
const gmailModal = $('gmail-modal-container');
const mailFab = $('open-gmail-modal');
const contactForm = $('contact-form');
const formStatus = $('form-status');
const submitBtn = $('form-submit-btn');
const noFilesBtn = $('gd-nofiles');
const filesList = $('gd-files');
const fileInput = $('gd-file');
const dropHint = $('gd-drop');
const DRAFT_KEY = 'mailDraft';
const MAX_FILES = 3;
const MAX_TOTAL = 3 * 1024 * 1024; // keeps the request under Vercel's 4.5 MB body limit once base64-encoded
let attachments = [];
let sending = false;

$('gd-to').textContent = 'Vinh';
['gd-attach', 'gd-photo'].forEach((id) => { $(id).hidden = true; }); // shown only once the server confirms it can deliver images

function saveDraft() {
  try {
    const f = contactForm.elements;
    const d = { email: f.email.value, subject: f.subject.value, message: f.message.value };
    if (d.email || d.subject || d.message) localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
    else localStorage.removeItem(DRAFT_KEY);
  } catch (_) {}
}
function loadDraft() {
  try {
    const d = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
    if (!d) return;
    const f = contactForm.elements;
    if (!f.email.value) f.email.value = d.email || '';
    if (!f.subject.value) f.subject.value = d.subject || '';
    if (!f.message.value) f.message.value = d.message || '';
  } catch (_) {}
}
contactForm.addEventListener('input', saveDraft);

let attachState = 'unknown'; // 'on' once /api/contact says images can be delivered
function applyAttachState() {
  const on = attachState === 'on';
  ['gd-attach', 'gd-photo'].forEach((id) => { $(id).hidden = !on; });
}
async function checkAttachSupport() {
  if (attachState !== 'unknown') return;
  try {
    const res = await fetch('/api/contact', { cache: 'no-store' });
    const data = res.ok ? await res.json() : null;
    attachState = data && data.configured ? 'on' : 'off';
  } catch (_) { attachState = 'off'; }
  applyAttachState();
}

function openGmail() {
  checkAttachSupport();
  mailFab.classList.add('is-hidden');
  gmailModal.classList.remove('hidden', 'min');
  loadDraft();
  const f = contactForm.elements;
  const first = !f.email.value ? f.email : !f.subject.value ? f.subject : f.message;
  setTimeout(() => first.focus({ preventScroll: true }), 60);
}
function closeGmail() {
  gmailModal.classList.add('hidden');
  mailFab.classList.remove('is-hidden');
  saveDraft();
}
function discardGmail() {
  contactForm.reset();
  clearAttachments();
  try { localStorage.removeItem(DRAFT_KEY); } catch (_) {}
  setStatus('', '');
  closeGmail();
}

mailFab.addEventListener('click', openGmail);
$('about-contact-btn').addEventListener('click', openGmail);
$('footer-contact-btn').addEventListener('click', openGmail);
$('close-gmail-btn').addEventListener('click', (e) => { e.stopPropagation(); closeGmail(); });
$('gd-discard').addEventListener('click', discardGmail);
$('gd-min').addEventListener('click', (e) => { e.stopPropagation(); gmailModal.classList.toggle('min'); });
document.querySelector('.gd-head').addEventListener('click', () => { if (gmailModal.classList.contains('min')) gmailModal.classList.remove('min'); });
gmailModal.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeGmail(); });

function setStatus(key, color) {
  formStatus.style.color = color;
  formStatus.textContent = key ? t(key) : '';
}

// --- attachments -----------------------------------------------------------
const fmtKB = (n) => (n < 1048576 ? Math.max(1, Math.round(n / 1024)) + ' KB' : (n / 1048576).toFixed(1) + ' MB');

async function shrinkImage(file) {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const w = Math.max(1, Math.round(bmp.width * scale));
  const h = Math.max(1, Math.round(bmp.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bmp, 0, 0, w, h);
  if (bmp.close) bmp.close();
  const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.82));
  if (!blob) throw new Error('encode');
  return blob;
}

function renderAttachments() {
  filesList.textContent = '';
  attachments.forEach((a) => {
    const li = document.createElement('li');
    li.className = 'gd-file';
    const img = document.createElement('img');
    img.src = a.url;
    img.alt = '';
    const name = document.createElement('b');
    name.textContent = a.name;
    const size = document.createElement('em');
    size.textContent = fmtKB(a.blob.size);
    const rm = document.createElement('button');
    rm.type = 'button';
    rm.setAttribute('aria-label', t('ui.close'));
    rm.innerHTML = '<svg class="ic" aria-hidden="true" focusable="false"><use href="/icons.svg#s-xmark"></use></svg>';
    rm.addEventListener('click', () => {
      URL.revokeObjectURL(a.url);
      attachments = attachments.filter((x) => x !== a);
      renderAttachments();
    });
    li.append(img, name, size, rm);
    filesList.appendChild(li);
  });
  noFilesBtn.hidden = true;
}

function clearAttachments() {
  attachments.forEach((a) => URL.revokeObjectURL(a.url));
  attachments = [];
  renderAttachments();
}

async function addImages(list) {
  if (attachState !== 'on') return;
  const imgs = Array.from(list).filter((f) => f.type.startsWith('image/'));
  if (!imgs.length) return;
  setStatus('', '');
  for (const f of imgs) {
    if (attachments.length >= MAX_FILES) { setStatus('mail.limit', '#f28b82'); break; }
    try {
      const blob = await shrinkImage(f);
      const total = attachments.reduce((s, x) => s + x.blob.size, 0) + blob.size;
      if (total > MAX_TOTAL) { setStatus('mail.tooBig', '#f28b82'); break; }
      const base = (f.name || 'image').replace(/\.[^.]+$/, '') || 'image';
      attachments.push({ name: base + '.jpg', blob, url: URL.createObjectURL(blob) });
    } catch (_) {
      setStatus('mail.imgFail', '#f28b82');
    }
  }
  renderAttachments();
}

$('gd-attach').addEventListener('click', () => fileInput.click());
$('gd-photo').addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => { addImages(fileInput.files); fileInput.value = ''; });

let dragDepth = 0;
const hasFiles = (e) => e.dataTransfer && Array.from(e.dataTransfer.types || []).includes('Files');
gmailModal.addEventListener('dragenter', (e) => { if (hasFiles(e)) { e.preventDefault(); dragDepth++; dropHint.hidden = false; } });
gmailModal.addEventListener('dragover', (e) => { if (hasFiles(e)) e.preventDefault(); });
gmailModal.addEventListener('dragleave', () => { dragDepth = Math.max(0, dragDepth - 1); if (!dragDepth) dropHint.hidden = true; });
gmailModal.addEventListener('drop', (e) => {
  if (!hasFiles(e)) return;
  e.preventDefault();
  dragDepth = 0;
  dropHint.hidden = true;
  addImages(e.dataTransfer.files);
});
contactForm.elements.message.addEventListener('paste', (e) => {
  const files = Array.from((e.clipboardData && e.clipboardData.files) || []);
  if (files.some((f) => f.type.startsWith('image/'))) { e.preventDefault(); addImages(files); }
});

// --- sending ---------------------------------------------------------------
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1]);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

function validate() {
  const f = contactForm.elements;
  if (!f.email.value || !f.email.checkValidity()) { f.email.focus(); setStatus('mail.badEmail', '#f28b82'); return false; }
  if (!f.subject.value.trim()) { f.subject.focus(); setStatus('mail.needSubject', '#f28b82'); return false; }
  if (!f.message.value.trim()) { f.message.focus(); setStatus('mail.needBody', '#f28b82'); return false; }
  return true;
}

async function sendText() { // Formspree, text only
  const res = await fetch(contactForm.action, {
    method: 'POST',
    body: new FormData(contactForm),
    headers: { Accept: 'application/json' }
  });
  if (res.ok) return { ok: true };
  const data = await res.json().catch(() => null);
  return { ok: false, text: data?.errors ? data.errors.map((er) => er.message).join(', ') : '' };
}

async function sendWithImages() { // own endpoint, supports attachments
  const f = contactForm.elements;
  const files = [];
  for (const a of attachments) files.push({ name: a.name, type: 'image/jpeg', data: await blobToBase64(a.blob) });
  const res = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: f.email.value.trim(), subject: f.subject.value.trim(), message: f.message.value, hp: f._gotcha.value, files })
  });
  if (res.ok) return { ok: true };
  const data = await res.json().catch(() => ({}));
  return { ok: false, code: data.error || '', status: res.status };
}

function finishSent() {
  setStatus('mail.sent', '#81c995');
  contactForm.reset();
  clearAttachments();
  try { localStorage.removeItem(DRAFT_KEY); } catch (_) {}
  setTimeout(() => { closeGmail(); setStatus('', ''); }, 1800);
}

async function submitMail(withFiles) {
  if (sending || !validate()) return;
  sending = true;
  submitBtn.disabled = true;
  noFilesBtn.hidden = true;
  setStatus('mail.sending', '#fdd663');
  try {
    const r = withFiles && attachments.length ? await sendWithImages() : await sendText();
    if (r.ok) { finishSent(); return; }
    if (withFiles && (r.status === 503 || r.status === 404)) {
      setStatus('mail.noAttach', '#f28b82');
      noFilesBtn.hidden = false;
    } else if (r.status === 429) {
      setStatus('mail.rate', '#f28b82');
    } else if (withFiles && (r.code || r.status)) {
      const key = r.status === 413 ? 'mail.tooBig' : r.code === 'bad_files' ? 'mail.badFiles' : r.code === 'delivery_failed' ? 'mail.deliveryFail' : r.code === 'bad_email' ? 'mail.badEmail' : 'mail.error';
      setStatus(key, '#f28b82');
      if (key === 'mail.deliveryFail' || key === 'mail.error') noFilesBtn.hidden = false;
    } else {
      formStatus.style.color = '#f28b82';
      formStatus.textContent = r.text || t('mail.error');
    }
  } catch (_) {
    setStatus('mail.network', '#f28b82');
  } finally {
    sending = false;
    submitBtn.disabled = false;
  }
}

contactForm.addEventListener('submit', (e) => { e.preventDefault(); submitMail(true); });
noFilesBtn.addEventListener('click', () => { clearAttachments(); submitMail(false); });

// bot features
const botModal = $('bot-features-modal');

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
function setIcon(svg, id) { const u = svg.querySelector('use'); if (u) u.setAttribute('href', '/icons.svg#' + id); }
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
    setIcon(playIcon, 's-pause');
    diskImage.classList.add('running');
    diskBox.classList.add('playing');
  });

  widget.bind(SC.Widget.Events.PAUSE, () => {
    setIcon(playIcon, 's-play');
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
    setIcon(muteIcon, isMuted ? 's-volume-xmark' : 's-volume-high');
    muteBtn.classList.toggle('muted', isMuted);
  });
}

applyLang(lang);

// ---------------------------------------------------------------------------
// Recent updates (changelog.json is generated from git history at build time)
// ---------------------------------------------------------------------------
function renderChangelog() {
  const card = $('changelog-card');
  const list = $('changelog-list');
  if (!card || !list || !changelogData || !changelogData.length) return;

  const fmt = new Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-GB', { day: '2-digit', month: '2-digit' });
  const shown = changelogOpen ? 8 : 3;
  list.textContent = '';
  changelogData.slice(0, shown).forEach((c) => {
    const li = document.createElement('li');
    const time = document.createElement('time');
    time.dateTime = c.date;
    time.textContent = fmt.format(new Date(c.date));
    const msg = document.createElement('span');
    msg.className = 'log-msg';
    msg.textContent = (lang === 'vi' && c.vi) || c.subject;
    li.append(time, msg);
    list.appendChild(li);
  });

  const more = $('changelog-more');
  more.hidden = changelogData.length <= 3;
  more.textContent = changelogOpen ? t('log.less') : `${t('log.more')} (${Math.min(changelogData.length, 8) - 3})`;

  if (card.hidden) {
    card.hidden = false;
    revealObserver.observe(card);
  }
}

$('changelog-more').addEventListener('click', () => { changelogOpen = !changelogOpen; renderChangelog(); });

fetch('/changelog.json', { cache: 'no-cache' })
  .then((r) => (r.ok ? r.json() : []))
  .then((data) => {
    if (!Array.isArray(data)) return;
    changelogData = data.filter((c) => c && typeof c.subject === 'string' && typeof c.date === 'string' && typeof c.hash === 'string');
    renderChangelog();
  })
  .catch(() => { /* the card simply stays hidden */ });
