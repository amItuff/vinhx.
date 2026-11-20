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
    'faq.q1a': 'Có. Nội dung được mã hóa trên trình duyệt trước khi lưu, máy chủ chỉ giữ bản mã hóa. Ai có link thì đọc được nên đừng đăng công khai. Quên mật khẩu thứ hai thì không khôi phục được.',
    'faq.q2': 'Link chỉ xem khác link chỉnh sửa thế nào?',
    'faq.q2a': 'Link chỉnh sửa cho đọc và sửa. Link chỉ xem chỉ cho đọc, không sửa hay xóa được.',
    'faq.q3': 'Ghi chú tự xóa khi nào?',
    'faq.q3a': 'Mặc định sau 1 năm không chỉnh sửa. Bạn có thể chọn 1 giờ, 1 ngày, 1 tuần hoặc tự hủy sau lần mở đầu tiên.',
    'faq.q4': 'File trong vinhx convert có bị tải lên máy chủ không?',
    'faq.q4a': 'Không. Mọi thứ xử lý ngay trong trình duyệt. Video đổi theo thời gian thực nên cần giữ tab mở.',
    'faq.q5': 'Vì sao có định dạng không xuất được?',
    'faq.q5a': 'Tùy trình duyệt hỗ trợ, Chrome và Edge đầy đủ nhất. MP3 (từ âm thanh hoặc video) và GIF động (từ video, tối đa 20 giây) đã được hỗ trợ.',
    'faq.q6': 'Web có theo dõi mình không?',
    'faq.q6a': 'Không có cookie theo dõi hay quảng cáo. Chỉ lưu ngôn ngữ và bản nháp thư trên máy bạn. Trang đếm lượt xem ẩn danh bằng Vercel Analytics (không cookie, không ghi nhận nội dung ghi chú). Phông Google, Discord (Lanyard) và SoundCloud có chính sách riêng.',
    'faq.q7': 'Báo lỗi hoặc liên hệ ở đâu?',
    'faq.q7a': 'Dùng nút thư ở góc phải dưới, hoặc mở vinhx hub ở phần dự án (có link vào server Discord).',
    'p3.desc': 'Ghi chú mã hóa, chia sẻ bằng một link.',
    'p3.open': 'Mở',
    'p4.desc': 'Đổi định dạng ảnh, âm thanh, video ngay trên máy.',
    'p4.open': 'Mở',
    'p5.desc': 'Đọc sách miễn phí trong web, có dịch tiếng Việt.',
    'p5.open': 'Mở',
    'faq.q8': 'Sách trong vinhx library lấy từ đâu?',
    'faq.q8a': 'Từ Project Gutenberg và Wikisource, chỉ gồm tác phẩm đã hết bản quyền. Sách đọc ngay trong web, bản dịch tiếng Việt là dịch máy trên trình duyệt.',
    'log.label': 'Cập nhật gần đây',
    'log.all': 'Tất cả commit',
    'log.more': 'Xem thêm',
    'log.less': 'Thu gọn',
    'p2.desc': 'Công cụ Discord: nhiệm vụ, treo voice, bảo mật.',
    'p.join': 'Vào server',
    'p.hub': 'Mở hub',
    'p.features': 'Tính năng',
    'discord.profile': 'Hồ sơ',
    'fb.label': 'Mạng xã hội',
    'fb.connect': 'Kết nối',
    'player.label': 'Đang phát',
    'bot.title': 'Tính năng bot Discord',
    'bot.join': 'Mở vinhx hub',
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
    'mail.attach': 'Đính kèm tệp (ảnh, Word, Excel, PDF...)',
    'mail.photo': 'Chèn ảnh',
    'mail.discard': 'Bỏ thư',
    'mail.drop': 'Thả tệp vào đây để đính kèm',
    'mail.fmt': 'Định dạng', 'mail.bold': 'Đậm', 'mail.italic': 'Nghiêng', 'mail.underline': 'Gạch chân', 'mail.ul': 'Danh sách chấm', 'mail.ol': 'Danh sách số', 'mail.link': 'Chèn link', 'mail.clear': 'Xóa định dạng',
    'mail.linkPrompt': 'Dán link (https://...)', 'mail.badType': 'Loại tệp này chưa được hỗ trợ.',
    'mail.limit': 'Tối đa 5 tệp.',
    'mail.tooBig': 'Tệp quá nặng, tổng tối đa khoảng 3 MB.',
    'mail.imgFail': 'Không đọc được ảnh này.',
    'mail.badEmail': 'Nhập email hợp lệ.',
    'mail.needSubject': 'Nhập tiêu đề.',
    'mail.needBody': 'Nhập nội dung.',
    'mail.noAttach': 'Chưa gửi được tệp đính kèm.',
    'mail.sendNoFiles': 'Gửi không kèm tệp',
    'mail.rate': 'Bạn gửi quá nhiều, thử lại sau.',
    'mail.badFiles': 'Tệp không hợp lệ, thử tệp khác.',
    'mail.deliveryFail': 'Máy chủ không chuyển được thư kèm tệp.',
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
    'faq.q1a': 'Yes. Text is encrypted in your browser before it is saved, so the server only holds the encrypted copy. Anyone with the link can read it, so do not post it publicly. A forgotten second password cannot be recovered.',
    'faq.q2': 'What is the difference between the view-only and edit links?',
    'faq.q2a': 'The edit link lets people read and change the note. The view-only link only lets them read it.',
    'faq.q3': 'When are notes deleted?',
    'faq.q3a': 'By default after 1 year without edits. You can pick 1 hour, 1 day, 1 week or self-destruct after the first open.',
    'faq.q4': 'Are my files uploaded when I use vinhx convert?',
    'faq.q4a': 'No. Everything is processed in your browser. Video is converted in real time, so keep the tab open.',
    'faq.q5': 'Why can some formats not be exported?',
    'faq.q5a': 'It depends on your browser; Chrome and Edge are the most complete. MP3 (from audio or video) and animated GIF (from video, up to 20 seconds) are supported.',
    'faq.q6': 'Does this site track me?',
    'faq.q6a': 'No tracking cookies or ads. Only your language and mail draft are stored on your device. Page views are counted anonymously with Vercel Analytics (no cookies, note contents are never recorded). Google Fonts, Discord (Lanyard) and SoundCloud have their own policies.',
    'faq.q7': 'Where can I report a bug or get in touch?',
    'faq.q7a': 'Use the mail button at the bottom right, or open vinhx hub from the projects section (it links to the Discord server).',
    'p3.desc': 'Encrypted notes, shared with one link.',
    'p3.open': 'Open',
    'p4.desc': 'Convert images, audio and video on your device.',
    'p4.open': 'Open',
    'p5.desc': 'Read free books on the web, with Vietnamese translation.',
    'p5.open': 'Open',
    'faq.q8': 'Where do the books in vinhx library come from?',
    'faq.q8a': 'From Project Gutenberg and Wikisource, only works out of copyright. Books are read in the page; the Vietnamese translation is machine translation in your browser.',
    'log.label': 'Recent updates',
    'log.all': 'All commits',
    'log.more': 'Show more',
    'log.less': 'Show less',
    'p2.desc': 'Discord toolkit: quests, voice, security.',
    'p.join': 'Join server',
    'p.hub': 'Open hub',
    'p.features': 'Features',
    'discord.profile': 'Profile',
    'fb.label': 'Social network',
    'fb.connect': 'Connect',
    'player.label': 'Now playing',
    'bot.title': 'Discord bot features',
    'bot.join': 'Open vinhx hub',
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
    'mail.attach': 'Attach files (images, Word, Excel, PDF...)',
    'mail.photo': 'Insert image',
    'mail.discard': 'Discard',
    'mail.drop': 'Drop files here to attach',
    'mail.fmt': 'Formatting', 'mail.bold': 'Bold', 'mail.italic': 'Italic', 'mail.underline': 'Underline', 'mail.ul': 'Bulleted list', 'mail.ol': 'Numbered list', 'mail.link': 'Insert link', 'mail.clear': 'Clear formatting',
    'mail.linkPrompt': 'Paste a link (https://...)', 'mail.badType': 'That file type is not supported.',
    'mail.limit': 'Up to 5 files.',
    'mail.tooBig': 'Files are too large, about 3 MB in total at most.',
    'mail.imgFail': 'Could not read that image.',
    'mail.badEmail': 'Enter a valid email.',
    'mail.needSubject': 'Enter a subject.',
    'mail.needBody': 'Enter a message.',
    'mail.noAttach': 'Attachments could not be sent.',
    'mail.sendNoFiles': 'Send without files',
    'mail.rate': 'Too many messages, try again later.',
    'mail.badFiles': 'Invalid file, try another one.',
    'mail.deliveryFail': 'The server could not deliver the message with files.',
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
// Contact form: Gmail-style compose window with rich text and file attachments
// ---------------------------------------------------------------------------
const gmailModal = $('gmail-modal-container');
const mailFab = $('open-gmail-modal');
const contactForm = $('contact-form');
const formStatus = $('form-status');
const submitBtn = $('form-submit-btn');
const noFilesBtn = $('gd-nofiles');
const filesList = $('gd-files');
const fileInput = $('gd-file');
const photoInput = $('gd-photo-file');
const dropHint = $('gd-drop');
const editor = $('gd-editor');
const fmtBar = $('gd-fmt');
const DRAFT_KEY = 'mailDraft';
const MAX_FILES = 5;
const MAX_TOTAL = 3 * 1024 * 1024; // keeps the request under Vercel's 4.5 MB body limit once base64-encoded
const FILE_EXT = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'csv', 'txt', 'mp3', 'wav', 'm4a', 'mp4', 'mov', 'webm'];
let attachments = [];
let sending = false;

$('gd-to').textContent = 'Vinh';
['gd-attach', 'gd-photo'].forEach((id) => { $(id).hidden = true; }); // shown only once the server confirms it can deliver files

// --- rich text: the editor keeps HTML; the hidden "message" field gets Discord-style markdown ---
function toMarkdown(root) {
  const esc = (s) => s.replace(/([\\*_`~|])/g, '\\$1');
  let out = '';
  const block = (n) => /^(DIV|P|LI|UL|OL|BLOCKQUOTE|H[1-6])$/.test(n.nodeName);
  function walk(node, ctx) {
    node.childNodes.forEach((n) => {
      if (n.nodeType === 3) { out += esc(n.nodeValue.replace(/ /g, ' ')); return; }
      if (n.nodeType !== 1) return;
      const tag = n.nodeName;
      if (tag === 'BR') { out += '\n'; return; }
      if (tag === 'UL' || tag === 'OL') {
        if (out && !out.endsWith('\n')) out += '\n';
        let i = 0;
        n.childNodes.forEach((li) => {
          if (li.nodeName !== 'LI') return;
          out += (tag === 'OL' ? `${++i}. ` : '- ');
          walk(li, ctx);
          if (!out.endsWith('\n')) out += '\n';
        });
        return;
      }
      let pre = '', post = '';
      if (tag === 'B' || tag === 'STRONG') pre = post = '**';
      else if (tag === 'I' || tag === 'EM') pre = post = '*';
      else if (tag === 'U') pre = post = '__';
      else if (tag === 'S' || tag === 'STRIKE') pre = post = '~~';
      if (/font-weight:\s*(bold|[6-9]00)/i.test(n.getAttribute('style') || '')) pre = post = '**';
      if (tag === 'A' && /^https?:\/\//i.test(n.getAttribute('href') || '')) {
        out += '[';
        walk(n, ctx);
        out += `](${n.getAttribute('href')})`;
        return;
      }
      if (block(n) && out && !out.endsWith('\n')) out += '\n';
      const start = out.length;
      out += pre;
      walk(n, ctx);
      if (pre && out.slice(start + pre.length).trim() === '') out = out.slice(0, start); // never emit empty "****"
      else out += post;
      if (block(n) && !out.endsWith('\n')) out += '\n';
    });
  }
  walk(root, {});
  return out.replace(/\n{3,}/g, '\n\n').trim();
}
function syncMessage() { contactForm.elements.message.value = toMarkdown(editor); }
const editorEmpty = () => !editor.textContent.trim() && !editor.querySelector('img');

function saveDraft() {
  try {
    const f = contactForm.elements;
    const d = { email: f.email.value, subject: f.subject.value, html: editor.innerHTML };
    if (d.email || d.subject || !editorEmpty()) localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
    else localStorage.removeItem(DRAFT_KEY);
  } catch (_) {}
}
function loadDraft() {
  try {
    const d = JSON.parse(localStorage.getItem('mailDraft') || 'null');
    if (!d) return;
    const f = contactForm.elements;
    if (!f.email.value) f.email.value = d.email || '';
    if (!f.subject.value) f.subject.value = d.subject || '';
    if (editorEmpty()) {
      if (d.html) {
        // the draft is only ever our own sanitised markup, but rebuild it as plain text + basic tags anyway
        const tmp = document.createElement('div');
        tmp.innerHTML = d.html;
        tmp.querySelectorAll('*').forEach((el) => {
          if (!/^(B|STRONG|I|EM|U|S|A|UL|OL|LI|BR|DIV|P|SPAN)$/.test(el.nodeName)) el.replaceWith(document.createTextNode(el.textContent));
          else Array.from(el.attributes).forEach((at) => { if (!(el.nodeName === 'A' && at.name === 'href' && /^https?:\/\//i.test(at.value))) el.removeAttribute(at.name); });
        });
        editor.innerHTML = tmp.innerHTML;
      } else if (d.message) editor.textContent = d.message;
      syncMessage();
    }
  } catch (_) {}
}
contactForm.addEventListener('input', () => { syncMessage(); saveDraft(); });

// formatting bar (opened with the "Aa" button, like Gmail)
$('gd-fmt-toggle').addEventListener('click', () => {
  const open = fmtBar.hidden;
  fmtBar.hidden = !open;
  $('gd-fmt-toggle').setAttribute('aria-pressed', String(open));
  editor.focus();
});
fmtBar.addEventListener('mousedown', (e) => e.preventDefault()); // keep the selection in the editor
fmtBar.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-cmd]');
  if (!btn) return;
  const cmd = btn.dataset.cmd;
  if (document.activeElement !== editor) editor.focus();
  if (cmd === 'createLink') {
    const url = (window.prompt(t('mail.linkPrompt'), 'https://') || '').trim();
    if (/^https?:\/\/\S+$/i.test(url)) document.execCommand('createLink', false, url);
  } else document.execCommand(cmd, false, null);
  syncMessage(); saveDraft();
});
// paste as plain text (no stray styles from Word or web pages)
editor.addEventListener('paste', (e) => {
  const files = Array.from((e.clipboardData && e.clipboardData.files) || []);
  if (files.length) { e.preventDefault(); addFiles(files); return; }
  e.preventDefault();
  const text = (e.clipboardData && e.clipboardData.getData('text/plain')) || '';
  document.execCommand('insertText', false, text);
});

let attachState = 'unknown'; // 'on' once /api/contact says files can be delivered
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
  try { document.execCommand('defaultParagraphSeparator', false, 'div'); } catch (_) {}
  mailFab.classList.add('is-hidden');
  gmailModal.classList.remove('hidden', 'min');
  loadDraft();
  const f = contactForm.elements;
  const first = !f.email.value ? f.email : !f.subject.value ? f.subject : editor;
  setTimeout(() => first.focus({ preventScroll: true }), 60);
}
function closeGmail() {
  gmailModal.classList.add('hidden');
  mailFab.classList.remove('is-hidden');
  saveDraft();
}
function discardGmail() {
  contactForm.reset();
  editor.innerHTML = '';
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
const extOf = (name) => ((name || '').split('.').pop() || '').toLowerCase();
const isRaster = (f) => /^image\/(jpeg|png|webp|bmp|avif)$/.test(f.type);

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
    let thumb;
    if (a.url) { thumb = document.createElement('img'); thumb.src = a.url; thumb.alt = ''; }
    else { thumb = document.createElement('span'); thumb.className = 'gd-ext'; thumb.textContent = extOf(a.name).slice(0, 4).toUpperCase(); }
    const name = document.createElement('b');
    name.textContent = a.name;
    const size = document.createElement('em');
    size.textContent = fmtKB(a.blob.size);
    const rm = document.createElement('button');
    rm.type = 'button';
    rm.setAttribute('aria-label', t('ui.close'));
    rm.innerHTML = '<svg class="ic" aria-hidden="true" focusable="false"><use href="/assets/icons.svg#s-xmark"></use></svg>';
    rm.addEventListener('click', () => {
      if (a.url) URL.revokeObjectURL(a.url);
      attachments = attachments.filter((x) => x !== a);
      renderAttachments();
    });
    li.append(thumb, name, size, rm);
    filesList.appendChild(li);
  });
  noFilesBtn.hidden = true;
}

function clearAttachments() {
  attachments.forEach((a) => { if (a.url) URL.revokeObjectURL(a.url); });
  attachments = [];
  renderAttachments();
}

async function addFiles(list, imagesOnly) {
  if (attachState !== 'on') return;
  const files = Array.from(list).filter((f) => (imagesOnly ? f.type.startsWith('image/') : true));
  if (!files.length) return;
  setStatus('', '');
  for (const f of files) {
    if (attachments.length >= MAX_FILES) { setStatus('mail.limit', '#f28b82'); break; }
    const ext = extOf(f.name) || (f.type.startsWith('image/') ? f.type.slice(6) : '');
    if (!FILE_EXT.includes(ext) && !isRaster(f)) { setStatus('mail.badType', '#f28b82'); continue; }
    try {
      let blob = f;
      let name = (f.name || 'file').replace(/[\\/:*?"<>|]+/g, '_');
      if (isRaster(f)) { // photos are resized to JPEG so they stay small
        blob = await shrinkImage(f);
        name = name.replace(/\.[^.]+$/, '') + '.jpg';
      } else if (!extOf(name)) name += '.' + ext;
      const total = attachments.reduce((s, x) => s + x.blob.size, 0) + blob.size;
      if (total > MAX_TOTAL) { setStatus('mail.tooBig', '#f28b82'); continue; }
      attachments.push({ name, blob, url: blob.type.startsWith('image/') ? URL.createObjectURL(blob) : '' });
    } catch (_) {
      setStatus('mail.imgFail', '#f28b82');
    }
  }
  renderAttachments();
}

$('gd-attach').addEventListener('click', () => fileInput.click());
$('gd-photo').addEventListener('click', () => photoInput.click());
fileInput.addEventListener('change', () => { addFiles(fileInput.files); fileInput.value = ''; });
photoInput.addEventListener('change', () => { addFiles(photoInput.files, true); photoInput.value = ''; });

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
  addFiles(e.dataTransfer.files);
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
  syncMessage();
  if (!f.email.value || !f.email.checkValidity()) { f.email.focus(); setStatus('mail.badEmail', '#f28b82'); return false; }
  if (!f.subject.value.trim()) { f.subject.focus(); setStatus('mail.needSubject', '#f28b82'); return false; }
  if (!f.message.value.trim()) { editor.focus(); setStatus('mail.needBody', '#f28b82'); return false; }
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

async function sendWithFiles() { // own endpoint, supports attachments
  const f = contactForm.elements;
  const files = [];
  for (const a of attachments) files.push({ name: a.name, type: a.blob.type, data: await blobToBase64(a.blob) });
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
  editor.innerHTML = '';
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
    const r = withFiles && attachments.length ? await sendWithFiles() : await sendText();
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
function setIcon(svg, id) { const u = svg.querySelector('use'); if (u) u.setAttribute('href', '/assets/icons.svg#' + id); }
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
    const body = document.createElement('div');
    body.className = 'log-body';
    const top = document.createElement('div');
    top.className = 'log-top';
    top.appendChild(msg);
    if (c.add || c.del) {
      const st = document.createElement('span');
      st.className = 'log-stat';
      st.title = `${c.files || 0} file${c.files === 1 ? '' : 's'}`;
      const plus = document.createElement('b');
      plus.className = 'log-add';
      plus.textContent = `+${c.add || 0}`;
      const minus = document.createElement('b');
      minus.className = 'log-del';
      minus.textContent = `\u2212${c.del || 0}`;
      st.append(plus, minus);
      if (c.top) st.append(document.createTextNode(' ' + c.top));
      top.appendChild(st);
    }
    body.appendChild(top);
    const desc = (lang === 'vi' && c.descVi) || c.desc;
    if (desc) {
      const p = document.createElement('div');
      p.className = 'log-desc';
      p.textContent = desc;
      body.appendChild(p);
    }
    li.append(time, body);
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

// ---------------------------------------------------------------------------
// Featured projects: a tab bar on top scrolls a one-at-a-time slide track below,
// same pill + horizontal-scroller pattern as the category filter in vinhx library.
// ---------------------------------------------------------------------------
(() => {
  const tabs = $('proj-tabs');
  const track = $('proj-track');
  const dotsBox = $('proj-dots');
  if (!tabs || !track || !dotsBox) return;

  const tabEls = Array.from(tabs.querySelectorAll('.proj-tab'));
  const slideEls = Array.from(track.children);
  const accentOf = (el) => getComputedStyle(el).getPropertyValue('--accent').trim();

  slideEls.forEach(() => {
    const dot = document.createElement('i');
    dotsBox.appendChild(dot);
  });
  const dotEls = Array.from(dotsBox.children);

  let active = 0;
  let scrolling = false;

  function setActive(i) {
    active = i;
    tabEls.forEach((el, j) => el.setAttribute('aria-selected', String(j === i)));
    dotEls.forEach((el, j) => {
      el.classList.toggle('on', j === i);
      if (j === i) el.style.setProperty('--dot-accent', accentOf(slideEls[i]));
    });
  }

  tabEls.forEach((el, i) => {
    el.addEventListener('click', () => {
      scrolling = true;
      setActive(i);
      slideEls[i].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
      setTimeout(() => { scrolling = false; }, 500);
    });
  });

  // Swiping the track by hand (touch or trackpad) should move the tabs too.
  let raf = null;
  track.addEventListener('scroll', () => {
    if (scrolling) return;
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = null;
      const i = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
      if (i !== active && i >= 0 && i < slideEls.length) setActive(i);
    });
  });

  setActive(0);
})();


// ---------------------------------------------------------------------------
// Background GIF: attached after the page has loaded, and skipped on Save-Data,
// slow (2g) connections and reduced-motion, which keep the dark placeholder.
// To self-host it, drop the file in /assets and point BG_GIF at it.
// ---------------------------------------------------------------------------
(() => {
  const BG_GIF = 'https://i.pinimg.com/originals/b9/4e/18/b94e18ea40626f10bc67eaba042ec415.gif';
  const layer = document.querySelector('.bg-layer');
  const conn = navigator.connection;
  if (!layer || reduceMotion || (conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '')))) return;
  const attach = () => {
    const img = new Image();
    img.onload = () => { layer.style.backgroundImage = `url("${BG_GIF}")`; layer.classList.add('ready'); };
    img.src = BG_GIF;
  };
  if (document.readyState === 'complete') attach(); else window.addEventListener('load', attach, { once: true });
})();
