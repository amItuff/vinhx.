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
   2. CUỘN TRANG MƯỢT KHÔNG DÍNH HASH #CARDS-VIEW TRÊN URL
   ========================================================================= */
document.getElementById('scroll-hint-btn').addEventListener('click', () => {
  document.getElementById('cards-view').scrollIntoView({ behavior: 'smooth' });
});

/* =========================================================================
   3. ĐIỀU KHIỂN SOUNDCLOUD & CHỈ XOAY ĐĨA KHI PHÁT THẬT
   ========================================================================= */
const iframe = document.getElementById('sc-hidden-frame');
const widget = SC.Widget(iframe);
const diskImage = document.getElementById('disk-image');
const diskBox = document.querySelector('.disk-container');
const playIcon = document.getElementById('ctrl-play-icon');

let maxTrackMs = 162000;
let soundStarted = false;

function formatSec(ms) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

widget.bind(SC.Widget.Events.READY, () => {
  widget.setVolume(85);

  widget.getDuration((d) => {
    if (d > 0) {
      maxTrackMs = d;
      document.getElementById('time-max').textContent = formatSec(d);
    }
  });

  widget.getCurrentSound((sound) => {
    if (sound?.artwork_url) {
      const art = sound.artwork_url.replace('-large', '-t500x500');
      document.getElementById('sc-thumb').src = art;
      diskImage.src = art;
    }
  });
});

// Chạm để vào trang và phát nhạc
document.getElementById('enter-screen').addEventListener('click', function () {
  this.classList.add('dismissed');
  soundStarted = true;
  widget.play();
});

// Bắt tương tác chạm phòng trường hợp người dùng lướt thẳng
['touchstart', 'click'].forEach((event) => {
  window.addEventListener(event, () => {
    if (!soundStarted) {
      soundStarted = true;
      document.getElementById('enter-screen').classList.add('dismissed');
      widget.play();
    }
  }, { once: true, passive: true });
});

// CHỈ XOAY ĐĨA KHI SOUNDCLOUD THỰC SỰ ĐANG PHÁT ÂM THANH
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
  widget.seekTo(0);
  widget.play();
});

document.getElementById('ctrl-play').addEventListener('click', () => widget.toggle());
document.getElementById('ctrl-prev').addEventListener('click', () => { widget.seekTo(0); widget.play(); });
document.getElementById('ctrl-next').addEventListener('click', () => { widget.seekTo(0); widget.play(); });

document.getElementById('progress-bar-slot').addEventListener('click', function (e) {
  const rect = this.getBoundingClientRect();
  const ratio = (e.clientX - rect.left) / rect.width;
  widget.seekTo(ratio * maxTrackMs);
});

document.getElementById('vol-range').addEventListener('input', function () {
  widget.setVolume(Number(this.value));
});

/* =========================================================================
   4. CHỐNG COPY VÀ BẢO VỆ SOURCE CODE
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
