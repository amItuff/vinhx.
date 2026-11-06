/* =========================================================================
   1. ĐỒNG BỘ THỜI GIAN VIỆT NAM (GMT+7)
   ========================================================================= */
function updateVNClock() {
  const now = new Date();
  const timeStr = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(now);
  const el = document.getElementById('vn-clock-display');
  if (el) el.textContent = `VN (GMT+7) ${timeStr}`;
}
setInterval(updateVNClock, 1000);
updateVNClock();

/* =========================================================================
   2. CUỘN TRANG & NÚT LÊN ĐẦU TRANG
   ========================================================================= */
const scrollHintBtn = document.getElementById('scroll-hint-btn');
const backToTopBtn = document.getElementById('back-to-top-btn');

if (scrollHintBtn) {
  scrollHintBtn.addEventListener('click', () => {
    document.getElementById('cards-view').scrollIntoView({ behavior: 'smooth' });
  });
}

if (backToTopBtn) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 350) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* =========================================================================
   3. HIỆU ỨNG CUỘN TỚI (SCROLL REVEAL)
   ========================================================================= */
const revealElements = document.querySelectorAll('.reveal-card');

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -30px 0px'
});

revealElements.forEach((el, index) => {
  el.style.transitionDelay = `${(index % 3) * 0.08}s`;
  revealObserver.observe(el);
});

/* =========================================================================
   4. RENDER BIỂU ĐỒ GITHUB VẼ CHỮ "vinhx" VÀ TRÁI TIM BẰNG CHẤM XANH
   ========================================================================= */
function renderGitHubHeatmap() {
  const container = document.getElementById('gh-heatmap');
  if (!container) return;
  container.innerHTML = '';

  // Ma trận 7 hàng chuẩn GitHub: 1 là chấm xanh sáng, 0 là ô tối
  // Vẽ lần lượt: v - i - n - h - x - khoảng trống - trái tim
  const artPattern = [
    // Hàng 0
    [1,0,0,0,1, 0, 1, 0, 1,1,1,0, 0, 1,0,0,0, 0, 1,0,0,0,1, 0, 0, 0,1,1,0,1,1,0],
    // Hàng 1
    [1,0,0,0,1, 0, 0, 0, 1,0,0,1, 0, 1,0,0,0, 0, 0,1,0,1,0, 0, 0, 1,1,1,1,1,1,1],
    // Hàng 2
    [0,1,0,1,0, 0, 1, 0, 1,0,0,1, 0, 1,1,1,0, 0, 0,0,1,0,0, 0, 0, 1,1,1,1,1,1,1],
    // Hàng 3
    [0,1,0,1,0, 0, 1, 0, 1,0,0,1, 0, 1,0,0,1, 0, 0,1,0,1,0, 0, 0, 0,1,1,1,1,1,0],
    // Hàng 4
    [0,0,1,0,0, 0, 1, 0, 1,0,0,1, 0, 1,0,0,1, 0, 1,0,0,0,1, 0, 0, 0,0,1,1,1,0,0],
    // Hàng 5
    [0,0,0,0,0, 0, 0, 0, 0,0,0,0, 0, 0,0,0,0, 0, 0,0,0,0,0, 0, 0, 0,0,0,1,0,0,0],
    // Hàng 6
    [0,0,0,0,0, 0, 0, 0, 0,0,0,0, 0, 0,0,0,0, 0, 0,0,0,0,0, 0, 0, 0,0,0,0,0,0,0]
  ];

  const rows = 7;
  const cols = artPattern[0].length;

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const cell = document.createElement('div');
      cell.className = 'contrib-cell';

      const val = artPattern[r][c];
      if (val === 1) {
        cell.classList.add('lvl-4'); // Xanh sáng lá cây (#39d353)
      }

      container.appendChild(cell);
    }
  }
}
renderGitHubHeatmap();

/* =========================================================================
   5. SAO CHÉP EMAIL & TOAST POPUP
   ========================================================================= */
const EMAIL_TO_COPY = "nguyenngoctrivinh72@gmail.com";
const copyEmailBtn = document.getElementById('copy-email-btn');
const copyToast = document.getElementById('copy-toast');
let toastTimer = null;

if (copyEmailBtn && copyToast) {
  copyEmailBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(EMAIL_TO_COPY).then(() => {
      copyToast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        copyToast.classList.remove('show');
      }, 2500);
    });
  });
}

/* =========================================================================
   6. QUẢN LÝ GMAIL POPUP MODAL (ĐEN MỜ, KHÔNG ĐÈ THẺ)
   ========================================================================= */
const openGmailBtn = document.getElementById('open-gmail-modal');
const closeGmailBtn = document.getElementById('close-gmail-btn');
const gmailModalContainer = document.getElementById('gmail-modal-container');
const aboutContactBtn = document.getElementById('about-contact-btn');

function toggleGmailPopup(show) {
  if (show) {
    gmailModalContainer.classList.remove('hidden');
    openGmailBtn.style.display = 'none';
  } else {
    gmailModalContainer.classList.add('hidden');
    openGmailBtn.style.display = 'flex';
  }
}

if (openGmailBtn) openGmailBtn.addEventListener('click', () => toggleGmailPopup(true));
if (closeGmailBtn) closeGmailBtn.addEventListener('click', () => toggleGmailPopup(false));
if (aboutContactBtn) aboutContactBtn.addEventListener('click', () => toggleGmailPopup(true));

if (gmailModalContainer) {
  gmailModalContainer.addEventListener('click', (e) => {
    if (e.target === gmailModalContainer) toggleGmailPopup(false);
  });
}

/* =========================================================================
   7. XỬ LÝ GỬI THƯ QUA FORMSPREE (mrppjobo)
   ========================================================================= */
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');
const formSubmitBtn = document.getElementById('form-submit-btn');

if (contactForm) {
  contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    formSubmitBtn.disabled = true;
    formStatus.style.color = '#eab308';
    formStatus.textContent = 'Đang gửi...';

    const formData = new FormData(contactForm);

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        formStatus.style.color = '#3fb950';
        formStatus.textContent = 'Đã gửi thành công!';
        contactForm.reset();
        setTimeout(() => {
          toggleGmailPopup(false);
          formStatus.textContent = '';
        }, 2000);
      } else {
        const data = await response.json();
        formStatus.style.color = '#ef4444';
        if (data && data.errors) {
          formStatus.textContent = data.errors.map(err => err.message).join(', ');
        } else {
          formStatus.textContent = 'Lỗi gửi thư. Vui lòng thử lại!';
        }
      }
    } catch (err) {
      formStatus.style.color = '#ef4444';
      formStatus.textContent = 'Lỗi kết nối!';
    } finally {
      formSubmitBtn.disabled = false;
    }
  });
}

/* =========================================================================
   8. BẬT / TẮT MODAL TÍNH NĂNG BOT DISCORD
   ========================================================================= */
const openBotFeaturesBtn = document.getElementById('open-bot-features-btn');
const closeBotFeaturesBtn = document.getElementById('close-bot-features-btn');
const botFeaturesModal = document.getElementById('bot-features-modal');
const botModalOverlay = document.querySelector('.bot-modal-overlay');

function toggleBotModal(show) {
  if (show) {
    botFeaturesModal.classList.remove('hidden');
  } else {
    botFeaturesModal.classList.add('hidden');
  }
}

if (openBotFeaturesBtn) openBotFeaturesBtn.addEventListener('click', () => toggleBotModal(true));
if (closeBotFeaturesBtn) closeBotFeaturesBtn.addEventListener('click', () => toggleBotModal(false));
if (botModalOverlay) botModalOverlay.addEventListener('click', () => toggleBotModal(false));

/* =========================================================================
   9. PLAYLIST SOUNDCLOUD & QUẢN LÝ PHÁT NHẠC
   ========================================================================= */
const PLAYLIST = [
  {
    title: "PAR SG - cigarette ft. Cigar",
    url: "https://soundcloud.com/parsg/par-sg-cigarette-ft-cigar"
  },
  {
    title: "Hành Tinh Buồn Tênh",
    url: "https://soundcloud.com/viet-music-chill/hanh-tinh-buon-tenh"
  },
  {
    title: "Lofi Hip Hop Chill Beats",
    url: "https://soundcloud.com/chillhopdotcom/chillhop-essentials-spring-2023"
  }
];

let currentTrackIndex = 0;
let soundStarted = false;
let isMuted = false;
let currentVolume = 85;
let maxTrackMs = 162000;

const iframe = document.getElementById('sc-hidden-frame');
const widget = SC.Widget(iframe);
const diskImage = document.getElementById('disk-image');
const diskBox = document.querySelector('.disk-container');
const playIcon = document.getElementById('ctrl-play-icon');
const trackNameEl = document.getElementById('track-name');
const trackCounterEl = document.getElementById('track-counter');
const floatingToggleBtn = document.getElementById('floating-audio-toggle');
const floatIcon = document.getElementById('float-audio-icon');

function formatSec(ms) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function updateTrackUI() {
  trackNameEl.textContent = PLAYLIST[currentTrackIndex].title;
  trackCounterEl.textContent = `${currentTrackIndex + 1} / ${PLAYLIST.length}`;
}

function loadTrack(index) {
  currentTrackIndex = index;
  updateTrackUI();
  widget.load(PLAYLIST[currentTrackIndex].url, {
    auto_play: true,
    show_artwork: true,
    callback: () => {
      widget.setVolume(isMuted ? 0 : currentVolume);
    }
  });
}

widget.bind(SC.Widget.Events.READY, () => {
  widget.setVolume(currentVolume);
  updateTrackUI();

  widget.getDuration((d) => {
    if (d > 0) {
      maxTrackMs = d;
      document.getElementById('time-max').textContent = formatSec(d);
    }
  });

  widget.getCurrentSound((sound) => {
    if (sound?.artwork_url) {
      const art = sound.artwork_url.replace('-large', '-t500x500');
      diskImage.src = art;
    }
  });
});

document.getElementById('enter-screen').addEventListener('click', function () {
  this.classList.add('dismissed');
  soundStarted = true;
  widget.play();
});

['touchstart', 'click'].forEach((event) => {
  window.addEventListener(event, () => {
    if (!soundStarted) {
      soundStarted = true;
      document.getElementById('enter-screen').classList.add('dismissed');
      widget.play();
    }
  }, { once: true, passive: true });
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
  document.getElementById('time-curr').textContent = formatSec(data.currentPosition);
  if (maxTrackMs > 0) {
    const pct = (data.currentPosition / maxTrackMs) * 100;
    document.getElementById('progress-bar-val').style.width = `${Math.min(100, pct)}%`;
  }
});

widget.bind(SC.Widget.Events.FINISH, () => {
  nextTrack();
});

function nextTrack() {
  currentTrackIndex = (currentTrackIndex + 1) % PLAYLIST.length;
  loadTrack(currentTrackIndex);
}

function prevTrack() {
  currentTrackIndex = (currentTrackIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
  loadTrack(currentTrackIndex);
}

document.getElementById('ctrl-play').addEventListener('click', () => widget.toggle());
document.getElementById('ctrl-next').addEventListener('click', nextTrack);
document.getElementById('ctrl-prev').addEventListener('click', prevTrack);

document.getElementById('progress-bar-slot').addEventListener('click', function (e) {
  const rect = this.getBoundingClientRect();
  const ratio = (e.clientX - rect.left) / rect.width;
  widget.seekTo(ratio * maxTrackMs);
});

document.getElementById('vol-range').addEventListener('input', function () {
  currentVolume = Number(this.value);
  if (!isMuted) widget.setVolume(currentVolume);
});

/* =========================================================================
   10. NÚT ÂM THANH NỔI (MUTE/UNMUTE)
   ========================================================================= */
floatingToggleBtn.addEventListener('click', () => {
  isMuted = !isMuted;
  if (isMuted) {
    widget.setVolume(0);
    floatIcon.className = 'fa-solid fa-volume-xmark';
    floatingToggleBtn.classList.add('muted');
  } else {
    widget.setVolume(currentVolume);
    floatIcon.className = 'fa-solid fa-volume-high';
    floatingToggleBtn.classList.remove('muted');
  }
});

/* =========================================================================
   11. CỐ ĐỊNH AVATAR
   ========================================================================= */
const FIXED_AVATAR = "https://i.pinimg.com/1200x/05/ab/a9/05aba97b6124199235026b5a962f049b.jpg";
document.getElementById('main-avatar').src = FIXED_AVATAR;
document.getElementById('card-avatar').src = FIXED_AVATAR;

/* =========================================================================
   12. BẢO VỆ SOURCE CODE
   ========================================================================= */
if (window.top !== window.self) window.top.location = window.self.location;
document.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('keydown', (e) => {
  const k = e.key?.toLowerCase();
  if (
    e.key === 'F12' ||
    (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(k)) ||
    (e.ctrlKey && ['u', 's', 'c', 'a', 'p'].includes(k))
  ) {
    e.preventDefault();
    return false;
  }
});
