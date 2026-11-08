// Small QR code generator for the note share sheet.
// Byte mode, error correction level M, versions 1-10 (up to 213 bytes).
// Written in-house so no third-party script touches pages that hold secret links.

(function (root) {
  'use strict';

  // version -> [EC codewords per block, [[block count, data codewords per block], ...]]
  const SPEC = {
    1: [10, [[1, 16]]],
    2: [16, [[1, 28]]],
    3: [26, [[1, 44]]],
    4: [18, [[2, 32]]],
    5: [24, [[2, 43]]],
    6: [16, [[4, 27]]],
    7: [18, [[4, 31]]],
    8: [22, [[2, 38], [2, 39]]],
    9: [22, [[3, 36], [2, 37]]],
    10: [26, [[4, 43], [1, 44]]]
  };
  const MAX_VERSION = 10;

  const dataCodewords = (v) => SPEC[v][1].reduce((s, g) => s + g[0] * g[1], 0);
  const countBits = (v) => (v < 10 ? 8 : 16);
  const capacity = (v) => Math.floor((dataCodewords(v) * 8 - 4 - countBits(v)) / 8);

  // --- Reed-Solomon over GF(256), polynomial 0x11D -------------------------
  const EXP = new Array(512);
  const LOG = new Array(256);
  (function initGalois() {
    let x = 1;
    for (let i = 0; i < 255; i++) {
      EXP[i] = x;
      LOG[x] = i;
      x <<= 1;
      if (x & 0x100) x ^= 0x11d;
    }
    for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
  })();
  const mul = (a, b) => (a && b ? EXP[LOG[a] + LOG[b]] : 0);

  function generator(degree) {
    let g = [1];
    for (let i = 0; i < degree; i++) {
      const next = new Array(g.length + 1).fill(0);
      for (let j = 0; j < g.length; j++) {
        next[j] ^= g[j];
        next[j + 1] ^= mul(g[j], EXP[i]);
      }
      g = next;
    }
    return g;
  }

  function remainder(data, degree) {
    const gen = generator(degree);
    const res = new Array(degree).fill(0);
    for (const b of data) {
      const factor = b ^ res.shift();
      res.push(0);
      if (factor) for (let i = 0; i < degree; i++) res[i] ^= mul(gen[i + 1], factor);
    }
    return res;
  }

  // --- codewords -------------------------------------------------------------
  function buildCodewords(bytes, ver) {
    const [ecLen, groups] = SPEC[ver];
    const total = dataCodewords(ver) * 8;
    const bits = [];
    const push = (value, len) => { for (let i = len - 1; i >= 0; i--) bits.push((value >>> i) & 1); };

    push(0b0100, 4);
    push(bytes.length, countBits(ver));
    bytes.forEach((b) => push(b, 8));
    push(0, Math.min(4, total - bits.length));
    while (bits.length % 8) bits.push(0);
    for (let pad = 0xec; bits.length < total; pad ^= 0xec ^ 0x11) push(pad, 8);

    const data = [];
    for (let i = 0; i < bits.length; i += 8) {
      let v = 0;
      for (let j = 0; j < 8; j++) v = (v << 1) | bits[i + j];
      data.push(v);
    }

    const blocks = [];
    let offset = 0;
    for (const [count, size] of groups) {
      for (let i = 0; i < count; i++) {
        const block = data.slice(offset, offset + size);
        offset += size;
        blocks.push({ data: block, ec: remainder(block, ecLen) });
      }
    }

    const out = [];
    const longest = Math.max(...groups.map((g) => g[1]));
    for (let i = 0; i < longest; i++) blocks.forEach((b) => { if (i < b.data.length) out.push(b.data[i]); });
    for (let i = 0; i < ecLen; i++) blocks.forEach((b) => out.push(b.ec[i]));
    return out;
  }

  // --- matrix ----------------------------------------------------------------
  function alignmentPositions(ver) {
    if (ver === 1) return [];
    const count = Math.floor(ver / 7) + 2;
    const size = ver * 4 + 17;
    const step = Math.ceil((ver * 4 + 4) / (count * 2 - 2)) * 2;
    const out = [6];
    for (let i = 0, pos = size - 7; i < count - 1; i++, pos -= step) out.splice(1, 0, pos);
    return out;
  }

  const bit = (x, i) => ((x >>> i) & 1) !== 0;

  function maskApplies(mask, x, y) {
    switch (mask) {
      case 0: return (x + y) % 2 === 0;
      case 1: return y % 2 === 0;
      case 2: return x % 3 === 0;
      case 3: return (x + y) % 3 === 0;
      case 4: return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
      case 5: return ((x * y) % 2) + ((x * y) % 3) === 0;
      case 6: return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
      default: return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
    }
  }

  function penalty(mod, size) {
    let score = 0;

    const lineScore = (get) => {
      let s = 0;
      for (let a = 0; a < size; a++) {
        let run = 1;
        for (let b = 1; b < size; b++) {
          if (get(a, b) === get(a, b - 1)) {
            run++;
            if (run === 5) s += 3; else if (run > 5) s += 1;
          } else run = 1;
        }
        // finder-like 1:1:3:1:1 with four light modules on a side
        for (let b = 0; b + 11 <= size; b++) {
          const w = [];
          for (let k = 0; k < 11; k++) w.push(get(a, b + k) ? 1 : 0);
          const s1 = '10111010000';
          const s2 = '00001011101';
          const str = w.join('');
          if (str === s1 || str === s2) s += 40;
        }
      }
      return s;
    };
    score += lineScore((y, x) => mod[y][x]);
    score += lineScore((x, y) => mod[y][x]);

    for (let y = 0; y < size - 1; y++) {
      for (let x = 0; x < size - 1; x++) {
        const c = mod[y][x];
        if (c === mod[y][x + 1] && c === mod[y + 1][x] && c === mod[y + 1][x + 1]) score += 3;
      }
    }

    let dark = 0;
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (mod[y][x]) dark++;
    const total = size * size;
    score += (Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1) * 10;
    return score;
  }

  function makeMatrix(ver, codewords, forcedMask) {
    const size = ver * 4 + 17;
    const mod = Array.from({ length: size }, () => new Array(size).fill(false));
    const fn = Array.from({ length: size }, () => new Array(size).fill(false));
    const set = (x, y, dark) => { mod[y][x] = dark; fn[y][x] = true; };

    for (let i = 0; i < size; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }

    const finder = (cx, cy) => {
      for (let dy = -4; dy <= 4; dy++) {
        for (let dx = -4; dx <= 4; dx++) {
          const x = cx + dx;
          const y = cy + dy;
          if (x < 0 || y < 0 || x >= size || y >= size) continue;
          const dist = Math.max(Math.abs(dx), Math.abs(dy));
          set(x, y, dist !== 2 && dist !== 4);
        }
      }
    };
    finder(3, 3);
    finder(size - 4, 3);
    finder(3, size - 4);

    const pos = alignmentPositions(ver);
    const n = pos.length;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if ((i === 0 && j === 0) || (i === 0 && j === n - 1) || (i === n - 1 && j === 0)) continue;
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) set(pos[j] + dx, pos[i] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
        }
      }
    }

    const drawFormat = (mask) => {
      const data = (0 << 3) | mask; // level M = 0
      let rem = data;
      for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
      const bits = ((data << 10) | rem) ^ 0x5412;

      for (let i = 0; i <= 5; i++) set(8, i, bit(bits, i));
      set(8, 7, bit(bits, 6));
      set(8, 8, bit(bits, 7));
      set(7, 8, bit(bits, 8));
      for (let i = 9; i < 15; i++) set(14 - i, 8, bit(bits, i));

      for (let i = 0; i < 8; i++) set(size - 1 - i, 8, bit(bits, i));
      for (let i = 8; i < 15; i++) set(8, size - 15 + i, bit(bits, i));
      set(8, size - 8, true);
    };
    drawFormat(0);

    if (ver >= 7) {
      let rem = ver;
      for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
      const bits = (ver << 12) | rem;
      for (let i = 0; i < 18; i++) {
        const a = size - 11 + (i % 3);
        const b = Math.floor(i / 3);
        set(a, b, bit(bits, i));
        set(b, a, bit(bits, i));
      }
    }

    // data, zig-zag from the bottom right
    let k = 0;
    for (let right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let vert = 0; vert < size; vert++) {
        for (let j = 0; j < 2; j++) {
          const x = right - j;
          const upward = ((right + 1) & 2) === 0;
          const y = upward ? size - 1 - vert : vert;
          if (!fn[y][x] && k < codewords.length * 8) {
            mod[y][x] = bit(codewords[k >>> 3], 7 - (k & 7));
            k++;
          }
        }
      }
    }

    const applyMask = (mask) => {
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) if (!fn[y][x] && maskApplies(mask, x, y)) mod[y][x] = !mod[y][x];
      }
    };

    let best = forcedMask;
    if (best === undefined) {
      let bestScore = Infinity;
      for (let m = 0; m < 8; m++) {
        applyMask(m);
        drawFormat(m);
        const score = penalty(mod, size);
        if (score < bestScore) { bestScore = score; best = m; }
        applyMask(m); // undo
      }
    }
    applyMask(best);
    drawFormat(best);
    return { size, modules: mod, mask: best };
  }

  // --- public ----------------------------------------------------------------
  function encode(text, options) {
    const bytes = Array.from(new TextEncoder().encode(String(text)));
    let ver = 1;
    while (ver <= MAX_VERSION && bytes.length > capacity(ver)) ver++;
    if (ver > MAX_VERSION) throw new Error('QR: text too long');
    const result = makeMatrix(ver, buildCodewords(bytes, ver), options && options.mask);
    result.version = ver;
    return result;
  }

  function draw(canvas, text, targetPx) {
    const qr = encode(text);
    const quiet = 4;
    const cells = qr.size + quiet * 2;
    const scale = Math.max(2, Math.floor((targetPx || 240) / cells));
    canvas.width = canvas.height = cells * scale;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000000';
    for (let y = 0; y < qr.size; y++) {
      for (let x = 0; x < qr.size; x++) {
        if (qr.modules[y][x]) ctx.fillRect((x + quiet) * scale, (y + quiet) * scale, scale, scale);
      }
    }
    return qr;
  }

  const api = { encode, draw, capacity: () => capacity(MAX_VERSION) };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.QR = api;
})(typeof window !== 'undefined' ? window : globalThis);
