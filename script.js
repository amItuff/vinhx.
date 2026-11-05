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
  document.getElementById('vn-clock-display').textContent = `VN (GMT+7) ${timeStr}`;
}
setInterval(updateVNClock, 1000);
updateVNClock();

/* =========================================================================
   2. CUỘN TRANG MƯỢT
   ========================================================================= */
document.getElementById('scroll-hint-btn').addEventListener('click', () => {
  document.getElementById('cards-view').scrollIntoView({ behavior: 'smooth' });
});

/* =========================================================================
   3. PLAYLIST SOUNDCLOUD & QUẢN LÝ PHÁT NHẠC
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

// Chạm để vào trang và kích hoạt âm thanh
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
   4. NÚT BẬT TẮT ÂM THANH NỔI (FLOATING SOUND TOGGLE)
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
   5. XỬ LÝ SUBMIT FORM LIÊN HỆ GMAIL TRỰC TIẾP
   ========================================================================= */
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');
const formSubmitBtn = document.getElementById('form-submit-btn');

contactForm.addEventListener('submit', async function (e) {
  e.preventDefault();
  formSubmitBtn.disabled = true;
  formStatus.style.color = '#eab308';
  formStatus.textContent = 'Đang gửi thư...';

  const formData = new FormData(contactForm);

  try {
    const response = await fetch(contactForm.action, {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      formStatus.style.color = '#22c55e';
      formStatus.textContent = 'Đã gửi thành công vào hộp thư!';
      contactForm.reset();
    } else {
      formStatus.style.color = '#ef4444';
      formStatus.textContent = 'Lỗi gửi thư. Vui lòng thử lại sau.';
    }
  } catch (err) {
    formStatus.style.color = '#ef4444';
    formStatus.textContent = 'Không thể kết nối. Thử lại sau!';
  } finally {
    formSubmitBtn.disabled = false;
    setTimeout(() => { formStatus.textContent = ''; }, 6000);
  }
});

/* =========================================================================
   6. CỐ ĐỊNH AVATAR
   ========================================================================= */
const FIXED_AVATAR = "https://i.pinimg.com/1200x/05/ab/a9/05aba97b6124199235026b5a962f049b.jpg";
document.getElementById('main-avatar').src = FIXED_AVATAR;
document.getElementById('card-avatar').src = FIXED_AVATAR;

/* =========================================================================
   7. BẢO VỆ NỘI DUNG CƠ BẢN
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
