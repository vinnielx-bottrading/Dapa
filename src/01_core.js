/* ================= CONFIG ================= */
const TILE = 16, CHUNK = 32, CPX = TILE * CHUNK;
const T_VOID = 0, T_ROAD = 1, T_SIDE = 2, T_PLAZA = 3, T_BLD = 4, T_ALLEY = 5;
const WALKABLE = [0, 1, 1, 1, 0, 1];
const TARGET_SHORT = 300, MAX_LONG = 960;
const PLAYER_SPEED = 74, DASH_SPEED = 200, DASH_T = 0.17, DASH_CD = 1.3;
const ATK_CD = 0.26, ATK_DUR = 0.2, THROW_CD = 0.6;
const COMBO_WINDOW = 3;
const MAX_PARTICLES = 520, MAX_RIOTERS = 34, MAX_COPS = 24;
const TIERS = [[0, 'Du khách tò mò'], [6000, 'Côn đồ vỉa hè'], [30000, 'Kẻ cầm đầu'], [100000, 'Kẻ thù nhà nước'], [300000, 'Huyền thoại Saint-Paperasse']];

const P = {
  out: '#17121c', shadow: 'rgba(14,10,22,0.3)',
  red: '#ff3b4f', blue: '#3b7bff', gold: '#ffd23f', mint: '#5fe0a8', hot: '#ff7a1a',
  road: '#41434f', roadDk: '#383a46', roadLt: '#4b4d5a', lane: '#e8d27a', lineW: '#dcdde3',
  side: '#c4bcae', sideDk: '#ada597', sideLt: '#d3ccbf', curb: '#8c8478', curbLt: '#e3ddd2',
  cob: '#a99d8c', cobDk: '#8f8372', cobLt: '#bdb2a1',
  alley: '#7d7466', alleyDk: '#686052',
  roof: '#3c3f52', roofDk: '#2f3142', roofLt: '#4a4e63',
  water: '#4fa3d8', waterLt: '#a9e0ff', waterDk: '#2f78b0',
  glass: '#9fd8ea', glassLt: '#e6f8ff', glassDk: '#4f8fae', interior: '#1d2230',
  metal: '#8a93a6', metalDk: '#555c6e', metalLt: '#c4cad6',
  wood: '#a8683a', woodDk: '#6e4022', woodLt: '#cf8f55',
  leaf: '#4c9a4f', leafDk: '#356f3a', leafLt: '#76c06a',
  gas: 'rgba(196,224,170,', paint: ['#ff4f8b', '#ffd23f', '#4ab8ff', '#5fe08a', '#b47aff', '#ff8a3a']
};

/* ================= CANVAS ================= */
const wrap = document.getElementById('wrap');
const cv = document.getElementById('game');
let ctx = cv.getContext('2d');
let VW = 640, VH = 360, PIX = 2, DPR = 1;
function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 3);
  const dw = wrap.clientWidth * DPR, dh = wrap.clientHeight * DPR;
  PIX = Math.max(1, Math.floor(Math.min(dw, dh) / (dh > dw * 1.2 ? 240 : TARGET_SHORT)));
  if (Math.max(dw, dh) / PIX > MAX_LONG) PIX = Math.ceil(Math.max(dw, dh) / MAX_LONG);
  VW = Math.ceil(dw / PIX); VH = Math.ceil(dh / PIX);
  cv.width = VW; cv.height = VH;
  cv.style.width = (VW * PIX / DPR) + 'px'; cv.style.height = (VH * PIX / DPR) + 'px';
  ctx.imageSmoothingEnabled = false;
}
addEventListener('resize', resize);
resize();

/* ================= UTIL ================= */
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
let RNG = mulberry32(Date.now() & 0xffffff);
const rnd = (a, b) => a + Math.random() * (b - a);
const rint = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
const pick = a => a[(Math.random() * a.length) | 0];
const wpick = (items) => { let s = 0; for (const it of items) s += it[1]; let r = Math.random() * s; for (const it of items) { r -= it[1]; if (r <= 0) return it[0]; } return items[0][0]; };
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
const lerp = (a, b, t) => a + (b - a) * t;
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
const fmtTime = s => { s = Math.floor(s); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
const fmtNum = n => Math.floor(n).toLocaleString('vi-VN');
const fmtEur = n => '€' + Math.floor(n).toLocaleString('de-DE');
function rectsOverlap(ax, ay, aw, ah, b) { return ax < b.x + b.w && ax + aw > b.x && ay < b.y + b.h && ay + ah > b.y; }
function hexRgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function shade(hex, amt) {
  if (hex[0] !== '#') return hex;
  const [r, g, b] = hexRgb(hex); const f = v => clamp(Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt), 0, 255);
  return '#' + [f(r), f(g), f(b)].map(v => v.toString(16).padStart(2, '0')).join('');
}
function R(g, x, y, w, h, c) { g.fillStyle = c; g.fillRect(x, y, w, h); }
function ell(g, cx, cy, rx, ry, c) {
  g.fillStyle = c;
  for (let dy = -ry; dy <= ry; dy++) {
    const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry + 0.0001))));
    g.fillRect(cx - w, cy + dy, w * 2 + 1, 1);
  }
}
function pline(g, x0, y0, x1, y1, c) {
  g.fillStyle = c; x0 |= 0; y0 |= 0; x1 |= 0; y1 |= 0;
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy;
  for (let i = 0; i < 400; i++) { g.fillRect(x0, y0, 1, 1); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
}
function fitText(g, txt, maxW, size, font = 'VT323') {
  let s = size; g.font = `${s}px ${font}`;
  while (g.measureText(txt).width > maxW && s > 6) { s--; g.font = `${s}px ${font}`; }
  return s;
}
function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, w | 0); c.height = Math.max(1, h | 0); return c; }

/* 3x5 bitmap font for numbers in world */
const F3 = { '0': '111101101101111', '1': '010110010010111', '2': '111001111100111', '3': '111001111001111', '4': '101101111001001', '5': '111100111001111', '6': '111100111101111', '7': '111001010010010', '8': '111101111101111', '9': '111101111001111', '+': '000010111010000', 'x': '000101010101000', '!': '010010010000010', '?': '111001011000010', ' ': '000000000000000', '-': '000000111000000', '€': '011100110100011', '.': '000000000000010' };
function drawNum(str, x, y, col, center = true) {
  const w = str.length * 4 - 1; let sx = center ? Math.round(x - w / 2) : Math.round(x); y = Math.round(y);
  for (let pass = 0; pass < 2; pass++) {
    ctx.fillStyle = pass ? col : P.out;
    for (let i = 0; i < str.length; i++) {
      const gl = F3[str[i]] || F3[' '];
      for (let k = 0; k < 15; k++) if (gl[k] === '1') {
        const px = sx + i * 4 + (k % 3), py = y + ((k / 3) | 0);
        if (pass) ctx.fillRect(px, py, 1, 1); else ctx.fillRect(px - 1, py - 1, 3, 3);
      }
    }
  }
}

/* ================= INPUT ================= */
const keys = {};
const input = { mx: 0, my: 0, attack: false, attackPressed: false, dashQ: false, throwQ: false, mouseDown: false, touchHit: false, aimX: null, aimY: null };
const stick = { id: null, ox: 0, oy: 0, dx: 0, dy: 0 };
let isTouch = matchMedia('(pointer:coarse)').matches || 'ontouchstart' in window;

/* ================= AUDIO ================= */
const AUDIO = (() => {
  let ac = null, master = null, sfxBus = null, musBus = null, noiseBuf = null, amb = null, ambF = null;
  let muted = lsGet('dapa_mute', '0') === '1';
  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ac = new AC();
    master = ac.createGain(); master.gain.value = muted ? 0 : 0.6; master.connect(ac.destination);
    const comp = ac.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4; comp.connect(master);
    sfxBus = ac.createGain(); sfxBus.gain.value = 0.9; sfxBus.connect(comp);
    musBus = ac.createGain(); musBus.gain.value = 0.32; musBus.connect(comp);
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ac.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
    ambF = ac.createBiquadFilter(); ambF.type = 'bandpass'; ambF.frequency.value = 700; ambF.Q.value = 0.6;
    amb = ac.createGain(); amb.gain.value = 0.0;
    src.connect(ambF); ambF.connect(amb); amb.connect(sfxBus); src.start();
  }
  function env(g, t, vol, dur, a = 0.004) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); }
  function tone(f, dur, type = 'square', vol = 0.08, f2 = 0, delay = 0, bus = null, vib = 0) {
    if (!ac) return; const t = ac.currentTime + delay;
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    if (vib) { const l = ac.createOscillator(), lg = ac.createGain(); l.frequency.value = vib; lg.gain.value = f * 0.03; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + dur + 0.05); }
    env(g, t, vol, dur); o.connect(g); g.connect(bus || sfxBus); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(dur, vol = 0.2, type = 'lowpass', freq = 1200, f2 = 0, delay = 0, q = 0.8, bus = null) {
    if (!ac) return; const t = ac.currentTime + delay;
    const s = ac.createBufferSource(); s.buffer = noiseBuf;
    const f = ac.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q;
    if (f2) f.frequency.exponentialRampToValueAtTime(f2, t + dur);
    const g = ac.createGain(); env(g, t, vol, dur);
    s.connect(f); f.connect(g); g.connect(bus || sfxBus); s.start(t, Math.random() * 1.5); s.stop(t + dur + 0.05);
  }
  // crowd "HEY!" — a short vowel-like burst
  function shout(delay = 0, pitch = 1) {
    if (!ac) return; const t = ac.currentTime + delay;
    for (const [fq, q] of [[700 * pitch, 6], [1150 * pitch, 8]]) {
      const s = ac.createBufferSource(); s.buffer = noiseBuf; const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = fq; f.Q.value = q;
      const g = ac.createGain(); env(g, t, 0.35, 0.22, 0.02); s.connect(f); f.connect(g); g.connect(sfxBus); s.start(t, Math.random()); s.stop(t + 0.3);
    }
  }
  const lib = {
    click() { tone(880, 0.05, 'square', 0.05); },
    whoosh() { noise(0.12, 0.08, 'bandpass', 600, 2400, 0, 1.2); },
    hit(mat) {
      if (mat === 'glass') { tone(1800, 0.06, 'triangle', 0.06); noise(0.07, 0.12, 'highpass', 3000); }
      else if (mat === 'metal' || mat === 'car') { tone(260, 0.12, 'square', 0.06, 180); noise(0.06, 0.14, 'bandpass', 1800); }
      else if (mat === 'stone') { tone(110, 0.1, 'triangle', 0.12, 70); noise(0.08, 0.18, 'lowpass', 900); }
      else { tone(150, 0.08, 'square', 0.06, 90); noise(0.07, 0.15, 'lowpass', 1400); }
    },
    break(mat) {
      if (mat === 'glass') { noise(0.45, 0.22, 'highpass', 2500); for (let i = 0; i < 5; i++) tone(rnd(2000, 4200), 0.12, 'sine', 0.04, 0, i * 0.04 + Math.random() * 0.03); }
      else if (mat === 'metal') { noise(0.3, 0.2, 'bandpass', 1400, 400, 0, 2); tone(320, 0.35, 'square', 0.05, 120); }
      else if (mat === 'stone') { noise(0.55, 0.28, 'lowpass', 900, 120); tone(70, 0.5, 'triangle', 0.14, 35); }
      else { noise(0.3, 0.22, 'lowpass', 1800, 300); tone(120, 0.2, 'square', 0.06, 55); }
    },
    boing() { tone(180, 0.28, 'sine', 0.16, 520, 0, null, 18); tone(90, 0.08, 'square', 0.05, 60); },
    bonk() { tone(320, 0.07, 'square', 0.07, 160); noise(0.05, 0.12, 'bandpass', 1500); },
    clang() { tone(1240, 0.18, 'square', 0.04, 900); tone(1650, 0.14, 'triangle', 0.04); },
    slideUp() { tone(400, 0.35, 'sine', 0.08, 1600); },
    slideDown() { tone(1500, 0.45, 'sine', 0.08, 300); },
    kazoo(n = 0) { tone(330 * Math.pow(1.122, n), 0.14, 'sawtooth', 0.04, 0, 0, null, 7); },
    trombone() { [392, 370, 349, 294].forEach((f, i) => tone(f, i === 3 ? 0.9 : 0.32, 'sawtooth', 0.07, i === 3 ? 220 : 0, i * 0.34, null, i === 3 ? 6 : 0)); },
    cheer(big) { for (let i = 0; i < (big ? 6 : 3); i++) shout(i * 0.07 + Math.random() * 0.05, rnd(0.8, 1.25)); noise(big ? 1.2 : 0.6, 0.12, 'bandpass', 1100, 900, 0, 0.7); },
    whistle() { tone(2600, 0.18, 'sine', 0.07, 0, 0, null, 30); tone(2600, 0.35, 'sine', 0.07, 0, 0.24, null, 30); },
    bell() { tone(2100, 0.12, 'sine', 0.05); tone(2100, 0.12, 'sine', 0.05, 0, 0.14); },
    gasPop() { noise(0.12, 0.16, 'lowpass', 900); tone(140, 0.08, 'square', 0.04); },
    gasHiss() { noise(0.6, 0.06, 'highpass', 3000); },
    cough() { noise(0.09, 0.08, 'bandpass', 500, 300, 0, 2); noise(0.09, 0.07, 'bandpass', 450, 300, 0.14, 2); },
    splat() { noise(0.1, 0.18, 'lowpass', 600, 200); tone(90, 0.06, 'sine', 0.06); },
    throw() { noise(0.1, 0.06, 'bandpass', 1400, 3000, 0, 1); },
    water() { noise(0.2, 0.06, 'highpass', 1800, 0, 0, 0.6); },
    flip() { noise(0.6, 0.3, 'lowpass', 1400, 150); tone(80, 0.5, 'sawtooth', 0.08, 40); for (let i = 0; i < 6; i++) tone(i % 2 ? 720 : 960, 0.16, 'square', 0.025, 0, 0.5 + i * 0.18); },
    paper() { noise(0.18, 0.1, 'highpass', 4000, 2000, 0, 0.5); },
    hoof() { tone(180, 0.04, 'triangle', 0.05); tone(150, 0.04, 'triangle', 0.04, 0, 0.09); },
    grab() { tone(200, 0.1, 'square', 0.07, 120); tone(600, 0.06, 'square', 0.05, 0, 0.08); },
    struggle() { tone(rnd(500, 800), 0.05, 'square', 0.04, rnd(300, 500)); },
    free() { tone(400, 0.08, 'square', 0.06); tone(600, 0.08, 'square', 0.06, 0, 0.08); tone(900, 0.14, 'square', 0.06, 0, 0.16); },
    clink() { tone(2600, 0.15, 'sine', 0.05); tone(3300, 0.12, 'sine', 0.04, 0, 0.02); },
    burp() { tone(110, 0.35, 'sawtooth', 0.07, 70, 0, null, 14); },
    combo(n) { tone(440 * Math.pow(1.122, Math.min(n, 10)), 0.08, 'square', 0.05); },
    alert() { tone(660, 0.1, 'square', 0.06); tone(880, 0.14, 'square', 0.06, 0, 0.12); },
    victory() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.16, 'square', 0.06, 0, i * 0.1)); setTimeout(() => lib.cheer(true), 200); },
    defeat() { [440, 415, 392].forEach((f, i) => tone(f, 0.25, 'square', 0.05, 0, i * 0.2)); },
    dash() { noise(0.14, 0.1, 'bandpass', 900, 300, 0, 1); },
    honk() { const f = rnd(330, 480); tone(f, 0.12, 'square', 0.016); tone(f * 1.26, 0.12, 'square', 0.012); },
    arrest() { lib.trombone(); noise(0.06, 0.2, 'highpass', 4000, 0, 0.02); },
  };
  return {
    init, lib, get ac() { return ac; }, get musBus() { return musBus; }, tone, noise,
    play(n, a) { if (ac && lib[n]) lib[n](a); },
    get muted() { return muted; },
    setMuted(m) { muted = m; lsSet('dapa_mute', m ? '1' : '0'); if (master) master.gain.value = m ? 0 : 0.6; },
    crowd(level) { if (amb) amb.gain.setTargetAtTime(level * 0.05, ac.currentTime, 0.4); },
    suspend(p) { if (!ac) return; if (p) ac.suspend(); else ac.resume(); }
  };
})();

/* ================= MUSIC (original tunes, synthesized) ================= */
const MUSIC = (() => {
  // melody: 8 bars; numbers = MIDI, '-' = hold, null = rest. chords: per bar [bassRoot, [chord notes]]
  const C = [48, [52, 55, 60]], G7 = [43, [53, 55, 59]], F = [41, [53, 57, 60]], Gm = [43, [55, 59, 62]], D7 = [38, [54, 57, 60]], Cc = [36, [52, 55, 60]], Bb = [46, [53, 58, 62]], C7 = [36, [52, 58, 60]], Fm = [41, [53, 57, 60]];
  const TRACKS = {
    calm: { // waltz, accordion — "Café de la Paperasse"
      bpm: 300, steps: 6, lead: 'accordion', drums: 'waltz',
      mel: [[76, '-', '-', 79, 77, 76], [74, '-', '-', 71, 72, 74], [77, '-', 76, '-', 74, '-'], [72, '-', '-', '-', 67, '-'], [81, '-', '-', 79, 77, 81], [79, '-', '-', 76, 72, 76], [74, '-', 77, '-', 71, '-'], [72, '-', '-', '-', null, null]],
      ch: [C, G7, G7, C, F, C, G7, C]
    },
    riot: { // polka — "Polka der Pflastersteine"
      bpm: 320, steps: 8, lead: 'clarinet', drums: 'polka',
      mel: [[67, 71, 74, 71, 79, '-', 74, '-'], [78, 76, 74, 72, 69, '-', 66, '-'], [69, 72, 78, 72, 81, '-', 78, '-'], [79, 78, 79, 74, 71, '-', 67, '-'], [76, 76, 79, 76, 72, '-', 76, '-'], [74, 74, 79, 74, 71, '-', 74, '-'], [72, 71, 69, 67, 66, 69, 74, 78], [79, '-', 74, '-', 67, '-', null, null]],
      ch: [Gm, D7, D7, Gm, Cc, Gm, D7, Gm]
    },
    chase: { // silent-film chase — "Les Flics Arrivent"
      bpm: 400, steps: 8, lead: 'kazoo', drums: 'chase',
      mel: [[67, 68, 69, 72, '-', 69, 72, '-'], [74, 73, 72, 69, 67, '-', 64, '-'], [65, 66, 67, 69, '-', 72, 74, '-'], [76, 75, 76, 72, 69, '-', 67, '-'], [71, 72, 74, 71, 67, '-', 74, '-'], [76, 74, 72, 69, 72, '-', 76, '-'], [79, 78, 77, 74, 71, '-', 67, '-'], [72, '-', 67, '-', 60, '-', null, null]],
      ch: [Cc, Cc, F, Cc, G7, Cc, G7, Cc]
    },
    party: { // drinking song — "Noch ein Bier, s'il vous plaît"
      bpm: 270, steps: 8, lead: 'brass', drums: 'party',
      mel: [[69, '-', 69, 72, '-', 69, 65, '-'], [67, '-', 67, 70, '-', 67, 64, '-'], [64, 65, 67, 70, 72, '-', 70, '-'], [69, '-', 65, '-', 60, '-', null, null], [70, '-', 70, 74, '-', 70, 65, '-'], [69, '-', 69, 72, '-', 69, 65, '-'], [67, 69, 70, 67, 64, '-', 67, '-'], [65, '-', 60, '-', 65, '-', null, null]],
      ch: [Fm, C7, C7, Fm, Bb, Fm, C7, Fm]
    }
  };
  let cur = null, want = null, step = 0, bar = 0, nextT = 0, timer = null, on = false;
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  function voice(inst, m, t, dur, vol) {
    const ac = AUDIO.ac, bus = AUDIO.musBus; const f = mtof(m);
    const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t);
    const a = inst === 'brass' ? 0.03 : 0.008;
    g.gain.exponentialRampToValueAtTime(vol, t + a); g.gain.setValueAtTime(vol * 0.8, t + Math.max(a, dur - 0.05)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const filt = ac.createBiquadFilter();
    let types = ['square'];
    if (inst === 'accordion') { types = ['sawtooth', 'sawtooth']; filt.type = 'lowpass'; filt.frequency.value = 2400; }
    else if (inst === 'clarinet') { types = ['square']; filt.type = 'lowpass'; filt.frequency.value = 1900; }
    else if (inst === 'kazoo') { types = ['sawtooth']; filt.type = 'bandpass'; filt.frequency.value = 1300; filt.Q.value = 1.3; }
    else if (inst === 'brass') { types = ['sawtooth']; filt.type = 'lowpass'; filt.frequency.setValueAtTime(600, t); filt.frequency.linearRampToValueAtTime(2200, t + 0.06); }
    else if (inst === 'tuba') { types = ['triangle', 'square']; filt.type = 'lowpass'; filt.frequency.value = 520; }
    else if (inst === 'stab') { types = ['square']; filt.type = 'lowpass'; filt.frequency.value = 1500; }
    filt.connect(g); g.connect(bus);
    types.forEach((ty, i) => {
      const o = ac.createOscillator(); o.type = ty; o.frequency.value = f; if (i === 1) o.detune.value = inst === 'accordion' ? 9 : 0;
      if (inst === 'kazoo' || inst === 'accordion') { const l = ac.createOscillator(), lg = ac.createGain(); l.frequency.value = inst === 'kazoo' ? 6.5 : 5.2; lg.gain.value = f * (inst === 'kazoo' ? 0.018 : 0.006); l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + dur + 0.05); }
      o.connect(filt); o.start(t); o.stop(t + dur + 0.05);
    });
  }
  function drum(kind, t, vol = 1) {
    const ac = AUDIO.ac, bus = AUDIO.musBus;
    if (kind === 'kick') { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.12); g.gain.setValueAtTime(0.5 * vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16); o.connect(g); g.connect(bus); o.start(t); o.stop(t + 0.2); return; }
    const s = ac.createBufferSource(); s.buffer = (AUDIO._nb || (AUDIO._nb = (() => { const b = ac.createBuffer(1, ac.sampleRate * 0.5, ac.sampleRate); const d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })()));
    const f = ac.createBiquadFilter(), g = ac.createGain();
    let dur = 0.08, v = 0.18;
    if (kind === 'snare') { f.type = 'bandpass'; f.frequency.value = 1900; f.Q.value = 0.7; dur = 0.12; v = 0.22; }
    else if (kind === 'hat') { f.type = 'highpass'; f.frequency.value = 7000; dur = 0.03; v = 0.08; }
    else if (kind === 'clap') { f.type = 'bandpass'; f.frequency.value = 1200; f.Q.value = 1.2; dur = 0.1; v = 0.26; }
    g.gain.setValueAtTime(v * vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(bus); s.start(t); s.stop(t + dur + 0.02);
  }
  function schedule() {
    const ac = AUDIO.ac; if (!ac || !on) return;
    while (nextT < ac.currentTime + 0.12) {
      if (step === 0 && bar % 8 === 0 && want && want !== cur) { cur = want; bar = 0; }
      if (step === 0 && want && want !== cur && bar % 2 === 0) { cur = want; bar = 0; }
      const tr = TRACKS[cur]; if (!tr) { nextT = ac.currentTime + 0.1; break; }
      const stepDur = 60 / tr.bpm; const b = bar % 8; const row = tr.mel[b]; const n = row[step];
      if (typeof n === 'number') { let len = 1; while (row[step + len] === '-') len++; voice(tr.lead, n, nextT, stepDur * len * 0.95, tr.lead === 'kazoo' ? 0.11 : tr.lead === 'brass' ? 0.1 : 0.085); }
      const [root, chord] = tr.ch[b];
      if (tr.steps === 6) { // waltz: oom-pah-pah
        if (step === 0) voice('tuba', root, nextT, stepDur * 1.6, 0.2);
        if (step === 2 || step === 4) chord.forEach(c => voice('stab', c, nextT, stepDur * 0.6, 0.03));
        if (tr.drums === 'waltz' && step === 0) drum('kick', nextT, 0.5);
      } else {
        if (step % 4 === 0) voice('tuba', step === 0 ? root : root + 7, nextT, stepDur * 1.5, 0.22);
        if (step % 4 === 2) chord.forEach(c => voice('stab', c, nextT, stepDur * 0.5, 0.03));
        if (tr.drums === 'polka') { if (step % 4 === 0) drum('kick', nextT); if (step % 4 === 2) drum('snare', nextT); }
        if (tr.drums === 'chase') { if (step % 4 === 0) drum('kick', nextT); if (step % 4 === 2) drum('snare', nextT); drum('hat', nextT); }
        if (tr.drums === 'party') { if (step % 4 === 0) drum('kick', nextT); if (step % 4 === 2) drum('clap', nextT); if (b === 3 && step === 6) { AUDIO.lib.cheer(false); } }
      }
      nextT += stepDur; step++;
      if (step >= tr.steps) { step = 0; bar++; }
    }
  }
  return {
    play(name) { want = name; if (!cur) cur = name; },
    start() { const ac = AUDIO.ac; if (!ac) return; if (!on) { on = true; nextT = ac.currentTime + 0.05; step = 0; bar = 0; } if (!timer) timer = setInterval(schedule, 25); },
    stop() { on = false; if (timer) { clearInterval(timer); timer = null; } },
    get track() { return want; }
  };
})();
