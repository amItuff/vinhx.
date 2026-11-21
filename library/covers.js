// vinhx.info/library: generated book covers.
// Every book gets a calm, soft landscape (hills, sea, mountains, a quiet sun or moon) painted as SVG
// from its id, so the same book always looks the same, nothing is downloaded and it works offline.
// Palettes are low-saturation on purpose: easy on the eyes for long reading sessions.

(() => {
  'use strict';

  const W = 200;
  const H = 300;

  const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rng = (seed) => () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const n1 = (x) => (Math.round(x * 10) / 10).toString();
  const hsl = (h, s, l) => `hsl(${Math.round(((h % 360) + 360) % 360)},${s}%,${l}%)`;

  // base hue, whether it is a night scene, and which landscape to paint
  const GROUPS = {
    en: { h: 212, night: false, scene: 'hills' },
    ru: { h: 205, night: true, scene: 'snow' },
    fr: { h: 340, night: false, scene: 'town' },
    eu: { h: 150, night: false, scene: 'mount' },
    ancient: { h: 36, night: false, scene: 'columns' },
    crime: { h: 236, night: true, scene: 'city' },
    kids: { h: 188, night: false, scene: 'sea' },
    biz: { h: 208, night: false, scene: 'chart' },
    phil: { h: 262, night: true, scene: 'moon' },
    vi: { h: 134, night: false, scene: 'terrace' }
  };
  const FALLBACK = ['en', 'eu', 'kids', 'phil', 'vi', 'fr'];

  function ridge(r, y, amp, n, sharp, fill, op) {
    const p = [];
    for (let i = 0; i <= n; i++) {
      const x = (i * W) / n;
      p.push([x, sharp ? y - (i % 2 ? amp * (0.55 + r() * 0.45) : r() * amp * 0.25) : y + (r() - 0.5) * 2 * amp]);
    }
    let d = `M0,${H}L0,${n1(p[0][1])}`;
    if (sharp) p.forEach((q) => { d += `L${n1(q[0])},${n1(q[1])}`; });
    else {
      for (let i = 1; i < p.length; i++) {
        d += `Q${n1(p[i - 1][0])},${n1(p[i - 1][1])} ${n1((p[i - 1][0] + p[i][0]) / 2)},${n1((p[i - 1][1] + p[i][1]) / 2)}`;
      }
      d += `L${W},${n1(p[p.length - 1][1])}`;
    }
    return `<path d="${d}L${W},${H}Z" fill="${fill}"${op ? ` opacity="${op}"` : ''}/>`;
  }
  const mist = (y) => `<rect x="0" y="${n1(y - 16)}" width="${W}" height="34" fill="url(#m)"/>`;
  const disc = (x, y, rad, fill, glow) =>
    `<circle cx="${n1(x)}" cy="${n1(y)}" r="${n1(rad * 3.2)}" fill="url(#g)" opacity="${glow}"/><circle cx="${n1(x)}" cy="${n1(y)}" r="${n1(rad)}" fill="${fill}"/>`;
  function stars(r, n, maxY) {
    let s = '';
    for (let i = 0; i < n; i++) s += `<circle cx="${n1(r() * W)}" cy="${n1(r() * maxY)}" r="${n1(0.5 + r() * 1.1)}" fill="#fff" opacity="${n1(0.35 + r() * 0.5)}"/>`;
    return s;
  }
  function cloud(x, y, k, op) {
    return `<g opacity="${op}" fill="#fff"><ellipse cx="${n1(x)}" cy="${n1(y)}" rx="${n1(22 * k)}" ry="${n1(6 * k)}"/><ellipse cx="${n1(x - 9 * k)}" cy="${n1(y - 4 * k)}" rx="${n1(11 * k)}" ry="${n1(7 * k)}"/><ellipse cx="${n1(x + 8 * k)}" cy="${n1(y - 5 * k)}" rx="${n1(13 * k)}" ry="${n1(8 * k)}"/></g>`;
  }
  function birds(r, n, y0) {
    let s = '';
    for (let i = 0; i < n; i++) {
      const x = 30 + r() * 140;
      const y = y0 + r() * 40;
      const k = 3 + r() * 3;
      s += `<path d="M${n1(x - k)},${n1(y)}Q${n1(x - k / 2)},${n1(y - k / 1.5)} ${n1(x)},${n1(y)}Q${n1(x + k / 2)},${n1(y - k / 1.5)} ${n1(x + k)},${n1(y)}" fill="none" stroke="rgba(30,45,70,.55)" stroke-width="1" stroke-linecap="round"/>`;
    }
    return s;
  }
  function pines(r, y, n, fill) {
    let s = '';
    for (let i = 0; i < n; i++) {
      const x = 10 + r() * 180;
      const k = 0.7 + r() * 0.8;
      const yy = y + r() * 12;
      s += `<path d="M${n1(x)},${n1(yy - 28 * k)}L${n1(x + 7 * k)},${n1(yy - 10 * k)}L${n1(x + 4 * k)},${n1(yy - 10 * k)}L${n1(x + 10 * k)},${n1(yy)}L${n1(x - 10 * k)},${n1(yy)}L${n1(x - 4 * k)},${n1(yy - 10 * k)}L${n1(x - 7 * k)},${n1(yy - 10 * k)}Z" fill="${fill}"/>`;
    }
    return s;
  }
  function skyline(r, base, minH, maxH, fill, lit) {
    let s = '';
    let x = -4;
    while (x < W) {
      const w = 10 + r() * 16;
      const h = minH + r() * (maxH - minH);
      s += `<rect x="${n1(x)}" y="${n1(base - h)}" width="${n1(w)}" height="${n1(h + 40)}" fill="${fill}"/>`;
      if (lit) for (let k = 0; k < 3; k++) if (r() > 0.55) s += `<rect x="${n1(x + 2 + r() * (w - 6))}" y="${n1(base - h + 5 + r() * (h - 10))}" width="2" height="3" fill="hsl(44,80%,76%)" opacity=".85"/>`;
      x += w + 1 + r() * 3;
    }
    return s;
  }
  function roofs(r, base, fill) {
    let s = '';
    let x = -6;
    while (x < W) {
      const w = 16 + r() * 16;
      const h = 16 + r() * 22;
      s += `<path d="M${n1(x)},${n1(base)}L${n1(x)},${n1(base - h)}L${n1(x + w / 2)},${n1(base - h - 9 - r() * 6)}L${n1(x + w)},${n1(base - h)}L${n1(x + w)},${n1(base)}Z" fill="${fill}"/>`;
      x += w + r() * 4;
    }
    return s;
  }
  function waves(y, step, count, fill, op, phase) {
    let s = '';
    for (let i = 0; i < count; i++) {
      const yy = y + i * step;
      const a = 3 + i * 0.6;
      s += `<path d="M0,${H}L0,${n1(yy)}`;
      for (let x = 0; x <= W; x += 25) s += `Q${x + 12.5},${n1(yy + (((x / 25 + i + phase) % 2) ? -a : a))} ${x + 25},${n1(yy)}`;
      s += `L${W},${H}Z" fill="${fill(i)}" opacity="${op}"/>`;
    }
    return s;
  }

  function art(key, group) {
    const g = GROUPS[group] || GROUPS[FALLBACK[hash(key) % FALLBACK.length]];
    const sh = hash(String(key) + '|vx');
    const r = rng(sh);
    const hue = g.h + ((sh % 36) - 18);
    const night = g.night;
    const sc = g.scene;

    const top = night ? hsl(hue, 34, sc === 'snow' ? 34 : 20) : hsl(hue, 40, 66);
    const mid = night ? hsl(hue + 12, 34, sc === 'snow' ? 52 : 34) : hsl(hue + 12, 52, 80);
    const bot = night ? hsl(hue + 24, 38, sc === 'snow' ? 74 : 56) : hsl(hue + 26, 60, 90);
    const land = (i) => (night ? hsl(hue + 8, 26 - i * 3, 30 - i * 7) : hsl(hue + 8, 26 - i * 2, 60 - i * 12));

    let body = '';
    const sunX = 40 + r() * 120;
    const sunY = 100 + r() * 28;

    if (night) body += stars(r, sc === 'city' ? 22 : 30, 150);
    else body += cloud(25 + r() * 40, 50 + r() * 20, 1 + r() * 0.5, 0.55) + cloud(120 + r() * 50, 85 + r() * 20, 0.8 + r() * 0.5, 0.45);

    let au = 'rgba(255,248,232,.92)';
    switch (sc) {
      case 'hills':
        body += disc(sunX, sunY, 15, hsl(hue + 50, 70, 94), 0.5) + birds(r, 3, 60);
        body += ridge(r, 190, 16, 5, false, land(0), 0.85) + mist(196) + ridge(r, 222, 16, 5, false, land(1)) + ridge(r, 252, 12, 5, false, land(2));
        break;
      case 'snow':
        body += disc(sunX, 104, 11, hsl(hue, 30, 94), 0.55);
        body += ridge(r, 196, 14, 5, true, hsl(hue, 20, 58), 0.9) + ridge(r, 224, 10, 5, false, hsl(hue, 30, 90)) + pines(r, 246, 9, hsl(hue + 10, 28, 24)) + ridge(r, 262, 6, 5, false, hsl(hue, 30, 96));
        au = 'rgba(28,44,70,.85)';
        break;
      case 'town':
        body += disc(sunX, 150, 24, hsl(hue + 36, 80, 92), 0.6) + birds(r, 3, 60);
        body += roofs(r, 214, hsl(hue, 24, 40)) + roofs(r, 226, hsl(hue, 26, 28)) + waves(236, 12, 4, (i) => hsl(hue + 10, 28, 36 - i * 5), 0.95, 0);
        break;
      case 'mount':
        body += disc(sunX, sunY, 14, hsl(hue + 60, 70, 94), 0.5);
        body += ridge(r, 178, 60, 6, true, land(0), 0.7) + mist(188) + ridge(r, 214, 50, 6, true, land(1)) + mist(222) + ridge(r, 252, 30, 6, true, land(2));
        break;
      case 'columns': {
        body += disc(150 - r() * 70, 132, 28, hsl(hue + 6, 70, 93), 0.55);
        body += ridge(r, 232, 12, 4, false, land(1));
        let c = '';
        for (let i = 0; i < 5; i++) {
          const x = 24 + i * 34;
          const hh = 60 + (i % 2) * 6;
          c += `<rect x="${x}" y="${232 - hh}" width="12" height="${hh + 20}" fill="${hsl(hue, 28, 72)}"/><rect x="${x - 3}" y="${232 - hh - 4}" width="18" height="5" fill="${hsl(hue, 28, 78)}"/>`;
        }
        body += `<g opacity=".85">${c}</g>` + ridge(r, 256, 10, 4, false, land(2));
        break;
      }
      case 'city':
        body += disc(60 + r() * 80, 104, 16, hsl(hue, 20, 94), 0.5);
        body += `<rect y="232" width="${W}" height="${H}" fill="${hsl(hue, 26, 28)}"/>` + skyline(r, 232, 30, 78, hsl(hue, 26, 28), false) + mist(228) + `<rect y="262" width="${W}" height="${H}" fill="${hsl(hue, 28, 16)}"/>` + skyline(r, 262, 16, 44, hsl(hue, 28, 16), true);
        break;
      case 'sea':
        body += disc(sunX, 142, 18, hsl(hue + 40, 85, 94), 0.6) + birds(r, 2, 58);
        body += waves(170, 20, 5, (i) => hsl(hue + 6, 32 - i * 3, 70 - i * 9), 0.95, Math.floor(r() * 2));
        {
          const bx = 60 + r() * 80;
          body += `<path d="M${n1(bx)},176L${n1(bx)},150L${n1(bx + 16)},176Z" fill="#fff" opacity=".9"/><path d="M${n1(bx - 1)},177L${n1(bx + 20)},177L${n1(bx + 14)},182L${n1(bx + 3)},182Z" fill="${hsl(hue + 150, 30, 36)}"/>`;
        }
        break;
      case 'chart': {
        body += disc(sunX, sunY, 13, hsl(hue + 60, 80, 94), 0.5);
        let p = 'M14,218';
        for (let i = 1; i <= 7; i++) p += `L${n1(14 + i * 25)},${n1(218 - i * 12 - (r() - 0.4) * 22)}`;
        body += `<rect y="240" width="${W}" height="${H}" fill="${hsl(hue, 24, 46)}"/>` + skyline(r, 240, 30, 90, hsl(hue, 24, 46), false) + mist(236) + `<rect y="268" width="${W}" height="${H}" fill="${hsl(hue, 26, 30)}"/>` + skyline(r, 268, 16, 56, hsl(hue, 26, 30), false);
        body += `<path d="${p}" fill="none" stroke="hsl(44,85%,80%)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/>`;
        break;
      }
      case 'moon':
        body += `<circle cx="${n1(sunX)}" cy="118" r="38" fill="none" stroke="#fff" stroke-width=".8" opacity=".28"/><circle cx="${n1(sunX)}" cy="118" r="28" fill="none" stroke="#fff" stroke-width=".8" opacity=".35"/>` + disc(sunX, 118, 18, hsl(hue, 24, 94), 0.6);
        body += waves(196, 15, 5, (i) => hsl(hue + 12, 30 - i * 2, 40 - i * 6), 0.9, Math.floor(r() * 2));
        break;
      default: // terrace: rice fields stepping down a hill
        body += disc(sunX, sunY, 16, hsl(hue + 52, 70, 94), 0.5) + birds(r, 3, 58);
        for (let i = 0; i < 5; i++) body += ridge(r, 178 + i * 24, 10, 4, false, hsl(hue + i * 5, 34 - i * 2, 62 - i * 9), 0.95) + (i < 4 ? mist(180 + i * 24) : '');
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">`
      + `<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset=".55" stop-color="${mid}"/><stop offset="1" stop-color="${bot}"/></linearGradient>`
      + '<radialGradient id="g"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>'
      + '<linearGradient id="m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".28"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>'
      + `<rect width="${W}" height="${H}" fill="url(#s)"/>${body}</svg>`;

    return {
      uri: `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`,
      title: night ? 'rgba(255,250,238,.95)' : 'rgba(24,40,66,.9)',
      author: au
    };
  }

  const cache = new Map();
  window.VXCover = {
    // key: stable id of the book; group: catalog category (optional)
    get(key, group) {
      const k = key + '|' + (group || '');
      if (!cache.has(k)) cache.set(k, art(String(key), group));
      return cache.get(k);
    }
  };
})();
