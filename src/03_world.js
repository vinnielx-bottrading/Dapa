/* ================= WORLD: tiles in chunks ================= */
let chunks = new Map();
const ckey = (cx, cy) => cx + ',' + cy;
function getChunk(cx, cy, create) {
  const k = ckey(cx, cy); let c = chunks.get(k);
  if (!c && create) { c = { cx, cy, t: new Uint8Array(CHUNK * CHUNK), cv: null, used: 0 }; chunks.set(k, c); }
  return c;
}
function getT(tx, ty) { const c = chunks.get(ckey(tx >> 5, ty >> 5)); return c ? c.t[((ty & 31) << 5) | (tx & 31)] : T_VOID; }
function setT(tx, ty, v) { const c = getChunk(tx >> 5, ty >> 5, true); c.t[((ty & 31) << 5) | (tx & 31)] = v; c.cv = null; }
function walkableAt(px, py) { return WALKABLE[getT(Math.floor(px / TILE), Math.floor(py / TILE))] === 1; }
function fillT(x0, y0, x1, y1, type, mode) { // mode: 'hard' overwrite all, 'soft' only void
  for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) {
    const cur = getT(x, y);
    if (mode === 'hard' || cur === T_VOID || (mode === 'side' && cur === T_SIDE)) setT(x, y, type);
  }
}

/* ================= ROUTE (endless winding street) ================= */
const STREETS = ['RUE DE LA PAPERASSE', 'BOULEVARD DU CHAOS', 'AVENUE DES GRÈVES', 'KAFKASTRASSE', 'VIA DEL CAOS', 'RUE DU LUNDI', 'PLATZ DER PAUSE', 'QUAI DES FORMULAIRES', 'RUE SANS FIN', 'STRADA DELLA SIESTA', 'BÜROKRATENWEG', 'AVENUE DU BURN-OUT', 'CALLE DE LA HUELGA', 'RUE DU CROISSANT', 'STEMPELGASSE', 'RUE DES TAMPONS'];
const SHOPS = ['BOULANGERIE OVERPRICED', 'BANK OF NEGATIVE INTEREST', 'KEBAB HAUS 24/7', 'CAFÉ ESPRESSO 9€', 'PHARMACIE OUVERT PARFOIS', 'LUXUS HANDTASCHEN GMBH', 'PIZZERIA MAMMA MIA', 'SALON DE THÉ PRÉTENTIEUX', 'TABAC · LOTTO · REGRETS', 'IMMOBILIEN 2-ZI 3000€', 'GELATERIA FREDDO', 'HOTEL ZUR LETZTEN NACHT', 'BÜRO FÜR BÜROS', 'LIBRAIRIE TRISTE', 'FROMAGERIE ODEUR', 'STEUERBERATUNG HAPPY TAX', 'OPTIQUE VISION FLOUE', 'ARTISAN DÖNER', 'BOUTIQUE NON', 'COIFFEUR HAIR FORCE ONE', 'CAFÉ LE BURN-OUT', 'MINISTÈRE DES FORMULAIRES', 'BIERGARTEN ZUM DURST', 'CHOCOLATERIE KILO', 'WURSTKÖNIG', 'PATISSERIE 12€ LE CROISSANT', 'MAISON DU SELFIE', 'SUPERMARCHÉ FERMÉ', 'ANTIQUITÄTEN ALT', 'TRATTORIA SIESTA'];
const GRAFFITI = ['NON!', 'PAUSE!', '?!', 'LUNCH', 'NEIN', 'VIVA SIESTA', 'ZZZ', 'MERCI?', 'NOPE'];
let route = [];
function genSeg() {
  const i = route.length, prev = route[i - 1];
  let s;
  if (!prev) s = { i, dir: 'H', c: 0, lo: 0, hi: 46 };
  else if (prev.dir === 'H') { const sign = Math.random() < 0.5 ? -1 : 1; s = { i, dir: 'V', c: prev.hi, lo: prev.c, hi: prev.c + sign * rint(28, 36), sign }; }
  else { s = { i, dir: 'H', c: prev.hi, lo: prev.c, hi: prev.c + rint(42, 54) }; }
  if (s.dir === 'H' && i > 0 && i % 4 === 2) { const px0 = s.lo + 14; s.plaza = { x0: px0, x1: px0 + 19, y0: s.c - 16, y1: s.c - 5 }; }
  s.name = STREETS[i % STREETS.length];
  s.props = []; s.buildings = []; s.decor = []; s.alleys = []; s.painted = false; s.populated = false;
  // geometry helpers (px)
  if (s.dir === 'H') {
    s.bar = { x: (s.hi - 7) * TILE, y: (s.c - 4) * TILE, w: 10, h: 9 * TILE };
    s.rally = { x: (s.hi - 18) * TILE, y: s.c * TILE };
    s.van = { x: (s.hi - 11) * TILE, y: (s.c + 2) * TILE - 4, orient: 'h' };
    s.start = { x: s.lo * TILE, y: s.c * TILE }; s.end = { x: s.hi * TILE, y: s.c * TILE };
    s.box = { x0: (s.lo - 4) * TILE, y0: (s.plaza ? s.plaza.y0 : s.c - 4) * TILE, x1: (s.hi + 4) * TILE, y1: (s.c + 5) * TILE };
    s.rear = { x: (s.lo + 5) * TILE, y: (s.c - 4) * TILE, w: 10, h: 9 * TILE };
  } else {
    const sg = s.sign;
    s.bar = { x: (s.c - 4) * TILE, y: (s.hi - sg * 7) * TILE, w: 8 * TILE, h: 10 };
    s.rally = { x: s.c * TILE, y: (s.hi - sg * 18) * TILE };
    s.van = { x: (s.c + 2) * TILE - 12, y: (s.hi - sg * 11) * TILE, orient: 'v' };
    s.start = { x: s.c * TILE, y: s.lo * TILE }; s.end = { x: s.c * TILE, y: s.hi * TILE };
    s.box = { x0: (s.c - 4) * TILE, y0: (Math.min(s.lo, s.hi) - 4) * TILE, x1: (s.c + 4) * TILE, y1: (Math.max(s.lo, s.hi) + 5) * TILE };
    s.rear = { x: (s.c - 4) * TILE, y: (s.lo + sg * 5) * TILE, w: 8 * TILE, h: 10 };
  }
  route.push(s); return s;
}
function paintSeg(s) {
  if (s.painted) return; s.painted = true;
  if (s.dir === 'H') {
    fillT(s.lo - 4, s.c - 4, s.hi + 3, s.c + 4, T_SIDE, 'soft');
    fillT(s.lo - 2, s.c - 2, s.hi + 1, s.c + 1, T_ROAD, 'hard');
    if (s.plaza) fillT(s.plaza.x0, s.plaza.y0, s.plaza.x1, s.plaza.y1, T_PLAZA, 'side');
  } else {
    const y0 = Math.min(s.lo, s.hi), y1 = Math.max(s.lo, s.hi);
    fillT(s.c - 4, y0 - 4, s.c + 3, y1 + 4, T_SIDE, 'soft');
    fillT(s.c - 2, y0 - 2, s.c + 1, y1 + 1, T_ROAD, 'hard');
  }
}
function ensureRoute(upto) {
  while (route.length < upto + 4) genSeg();
  for (let i = 0; i <= upto + 3; i++) paintSeg(route[i]);
  for (let i = 0; i <= upto + 1; i++) populateSeg(route[i]);
}
function segAt(x, y, prefer) {
  let best = null;
  for (const s of route) { if (!s.populated && !s.painted) continue; const b = s.box; if (x >= b.x0 && x <= b.x1 && y >= b.y0 && y <= b.y1) { if (!best || Math.abs(s.i - prefer) < Math.abs(best.i - prefer)) best = s; } }
  return best;
}

/* ================= POPULATE: buildings, alleys, props ================= */
let buildings = [], props = [], decor = [];
const BSTYLES = ['paris', 'paris', 'fachwerk', 'dutch', 'italian', 'italian', 'modern'];
function rectFree(x0, y0, x1, y1) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (getT(x, y) !== T_VOID) return false; return true; }
function addBuilding(s, tx, ty, tw, td, opts = {}) {
  fillT(tx, ty, tx + tw - 1, ty + td - 1, T_BLD, 'soft');
  let northWalk = false, southWalk = 0;
  for (let x = tx; x < tx + tw; x++) { if (WALKABLE[getT(x, ty - 1)]) northWalk = true; if (WALKABLE[getT(x, ty + td)]) southWalk++; }
  const low = northWalk || opts.low;
  const style = low ? 'low' : pick(BSTYLES);
  const H = low ? 4 : opts.H || (rint(3, 6) * 18 + (southWalk > tw / 2 ? 36 : 12));
  const b = { x: tx * TILE, y: ty * TILE, w: tw * TILE, d: td * TILE, H, style, seg: s.i, low, img: null, name: null, shop: false, street: s.name, seed: (Math.random() * 1e9) | 0 };
  if (!low && southWalk >= tw - 1 && tw >= 4) { b.shop = true; b.name = pick(SHOPS); }
  if (low) b.name = pick(SHOPS);
  // palette
  const pal = {
    paris: ['#eadfc8', '#e6d6b8', '#f0e6d2'], fachwerk: ['#f1eadb', '#efe4cc'], dutch: ['#a8503a', '#8e4430', '#b2604a'],
    italian: ['#e3a96b', '#d98a7a', '#e8c88a', '#c9a0a0', '#9fb89a'], modern: ['#9aa3ad', '#b0b4ba'], low: ['#9a948a']
  }[style];
  b.wall = pick(pal);
  b.awning = pick([['#c43d5a', '#fff'], ['#2a7a4a', '#fff'], ['#2a4a8a', '#fff'], ['#1b1b24', '#e8d27a'], ['#d9822b', '#fff7e0'], ['#7a2a5a', '#f4d0e0']]);
  b.signBg = pick(['#1b1b24', '#2a4a3a', '#5a1a2a', '#f4ecd8', '#1e3060']);
  b.signFg = b.signBg === '#f4ecd8' ? '#5a1a2a' : pick(['#ffd23f', '#fff', '#f4ecd8']);
  buildings.push(b); s.buildings.push(b);
  // shop windows (breakable)
  if (b.shop) {
    const bottom = b.y + b.d; const doorX = b.x + Math.round(b.w * (0.3 + Math.random() * 0.4)); b.door = doorX;
    for (let wx = b.x + 18; wx <= b.x + b.w - 18; wx += 34) {
      if (Math.abs(wx - doorX) < 24) continue;
      if (!WALKABLE[getT(Math.floor(wx / TILE), Math.floor((bottom + 4) / TILE))]) continue;
      addProp(s, 'window', wx, bottom + 1, (b.seed + wx) % 4);
    }
  }
  return b;
}
function addProp(s, type, x, y, variant = 0, extra) {
  const d = PROP_DEFS[type];
  const p = Object.assign({ type, x, y, variant, hp: d.hp, maxHp: d.hp, mat: d.mat, pts: d.pts, fine: d.fine, hx: x, hy: y + d.hy, hr: d.hr, state: 'intact', flash: 0, shake: 0, seg: s.i, push: 0, pushers: 0, flipT: 0, playerPush: false }, extra || {});
  if (d.solid) p.solid = { x: x - d.solid[0] / 2, y: y - d.solid[1], w: d.solid[0], h: d.solid[1] };
  if (type === 'car' || type === 'carv') { p.flippable = true; p.need = 7; p.hy = y + d.hy; }
  props.push(p); s.props.push(p); return p;
}
function addDecor(s, type, x, y, extra) { const o = Object.assign({ type, x, y, seg: s.i }, extra || {}); decor.push(o); s.decor.push(o); return o; }
function propNear(x, y, r) { for (const p of props) if (Math.abs(p.x - x) < r && Math.abs(p.y - y) < r) return true; for (const o of decor) if (Math.abs(o.x - x) < r && Math.abs(o.y - y) < r) return true; return false; }

function populateSeg(s) {
  if (s.populated) return; s.populated = true;
  const H = s.dir === 'H';
  // ---- alleys (side streets where reinforcements and police appear) ----
  const nAl = rint(1, 2);
  for (let k = 0; k < nAl; k++) {
    if (H) {
      const north = k === 0 || Math.random() < .5;
      let ax = rint(s.lo + 8, s.hi - 14); if (s.plaza && ax >= s.plaza.x0 - 3 && ax <= s.plaza.x1 + 2) ax = s.plaza.x1 + 5;
      if (ax > s.hi - 12) continue;
      if (north) { if (rectFree(ax, s.c - 11, ax + 1, s.c - 5)) { fillT(ax, s.c - 11, ax + 1, s.c - 5, T_ALLEY, 'soft'); s.alleys.push({ x: (ax + 1) * TILE, y: (s.c - 10) * TILE, mx: (ax + 1) * TILE, my: (s.c - 3) * TILE }); } }
      else if (rectFree(ax, s.c + 5, ax + 1, s.c + 11)) { fillT(ax, s.c + 5, ax + 1, s.c + 11, T_ALLEY, 'soft'); s.alleys.push({ x: (ax + 1) * TILE, y: (s.c + 11) * TILE, mx: (ax + 1) * TILE, my: (s.c + 3) * TILE }); }
    } else {
      const y0 = Math.min(s.lo, s.hi), y1 = Math.max(s.lo, s.hi);
      const ay = rint(y0 + 8, y1 - 8);
      if (Math.abs(ay - (s.hi - s.sign * 7)) < 6) continue;
      const west = Math.random() < .5;
      if (west) { if (rectFree(s.c - 11, ay, s.c - 5, ay + 1)) { fillT(s.c - 11, ay, s.c - 5, ay + 1, T_ALLEY, 'soft'); s.alleys.push({ x: (s.c - 10) * TILE, y: (ay + 1) * TILE, mx: (s.c - 3) * TILE, my: (ay + 1) * TILE }); } }
      else if (rectFree(s.c + 4, ay, s.c + 10, ay + 1)) { fillT(s.c + 4, ay, s.c + 10, ay + 1, T_ALLEY, 'soft'); s.alleys.push({ x: (s.c + 10) * TILE, y: (ay + 1) * TILE, mx: (s.c + 3) * TILE, my: (ay + 1) * TILE }); }
    }
  }
  // ---- buildings ----
  if (H) {
    // north side (tall, facades on the street)
    let x = s.lo - 4;
    while (x < s.hi + 4) {
      let base = s.c - 5; if (s.plaza && x >= s.plaza.x0 && x <= s.plaza.x1) base = s.plaza.y0 - 1;
      let w = rint(5, 9); if (s.plaza && x < s.plaza.x0 && x + w > s.plaza.x0) w = s.plaza.x0 - x; if (s.plaza && x <= s.plaza.x1 && x + w > s.plaza.x1 + 1) w = s.plaza.x1 + 1 - x;
      const d = rint(5, 8); let placed = false;
      for (let ww = w; ww >= 3 && !placed; ww--) if (rectFree(x, base - d + 1, x + ww - 1, base)) { addBuilding(s, x, base - d + 1, ww, d); x += ww; placed = true; }
      if (!placed) x++;
    }
    // plaza side buildings
    if (s.plaza) {
      for (const [bx, bw] of [[s.plaza.x0 - 6, 6], [s.plaza.x1 + 1, 6]]) for (let y = s.plaza.y0; y < s.c - 5; y += 5) if (rectFree(bx, y, bx + bw - 1, Math.min(y + 4, s.c - 5))) addBuilding(s, bx, y, bw, Math.min(5, s.c - 4 - y));
    }
    // south side (low)
    x = s.lo - 4;
    while (x < s.hi + 4) {
      const w = rint(4, 8), d = rint(4, 7); let placed = false;
      for (let ww = w; ww >= 3 && !placed; ww--) if (rectFree(x, s.c + 5, x + ww - 1, s.c + 4 + d)) { addBuilding(s, x, s.c + 5, ww, d, { low: true }); x += ww; placed = true; }
      if (!placed) x++;
    }
  } else {
    const y0 = Math.min(s.lo, s.hi) - 4, y1 = Math.max(s.lo, s.hi) + 4;
    for (const west of [true, false]) {
      let y = y0;
      while (y < y1) {
        const w = rint(5, 8), d = rint(4, 7); const bx = west ? s.c - 4 - w : s.c + 4; let placed = false;
        for (let dd = d; dd >= 3 && !placed; dd--) if (rectFree(bx, y, bx + w - 1, y + dd - 1)) { addBuilding(s, bx, y, w, dd); y += dd; placed = true; }
        if (!placed) y++;
      }
    }
  }
  // ---- street furniture ----
  const curbN = [], spots = [];
  if (H) {
    const xa = (s.lo + 3) * TILE, xb = (s.hi - 9) * TILE;
    const nCurb = (s.c - 2) * TILE - 3, nIn = (s.c - 3) * TILE + 8, sCurb = (s.c + 2) * TILE + 7, sMid = (s.c + 3) * TILE + 12;
    for (let x = xa + 20; x < xb; x += rint(110, 140)) { spots.push(['lamp', x, nCurb]); spots.push(['lamp', x + 60, sCurb]); }
    for (let x = xa + 50; x < xb; x += rint(70, 120)) { if (Math.random() < .55) spots.push(['tree', x, sCurb]); }
    for (let x = xa; x < xb; x += rint(44, 70)) spots.push([wpick([['bin', 3], ['terrace', 3], ['planter', 2], ['bikerack', 2], ['postbox', 1], ['column', 1], ['hydrant', 1], ['booth', 1]]), x, Math.random() < .5 ? nIn : nCurb - 2]);
    for (let x = xa + 30; x < xb; x += rint(60, 100)) spots.push([wpick([['bench', 3], ['shelter', 1], ['bin', 2], ['column', 1], ['bikerack', 1], ['hydrant', 1], ['booth', 1], ['terrace', 1]]), x, sMid]);
    // parked cars
    for (let x = xa + 40; x < xb - 30; x += rint(90, 170)) if (Math.random() < .7) spots.push(['car', x, Math.random() < .5 ? (s.c - 1) * TILE + 2 : (s.c + 2) * TILE - 3]);
    if (s.plaza) {
      const pcx = (s.plaza.x0 + s.plaza.x1 + 1) / 2 * TILE, pcy = (s.plaza.y0 + s.plaza.y1 + 1) / 2 * TILE;
      s.plaza.cx = pcx; s.plaza.cy = pcy;
      addProp(s, 'statue', pcx, pcy + 8, 0, { solid: { x: pcx - 40, y: pcy - 14, w: 80, h: 30 } });
      for (const [dx, dy, t] of [[-70, 44, 'bench'], [70, 44, 'bench'], [-110, -30, 'terrace'], [110, -30, 'terrace'], [-120, 50, 'planter'], [120, 50, 'planter'], [0, -60, 'column'], [-60, -60, 'lamp'], [60, -60, 'lamp']]) spots.push([t, pcx + dx, pcy + dy]);
      for (const [dx, dy] of [[-140, -60], [140, -60]]) spots.push(['tree', pcx + dx, pcy + dy]);
    }
  } else {
    const ya = Math.min(s.lo, s.hi) * TILE + 60, yb = Math.max(s.lo, s.hi) * TILE - 60;
    const wCurb = (s.c - 2) * TILE - 4, wIn = (s.c - 3) * TILE - 2, eCurb = (s.c + 2) * TILE + 4, eIn = (s.c + 3) * TILE + 2;
    const barY = s.bar.y;
    for (let y = ya; y < yb; y += rint(100, 130)) { spots.push(['lamp', wCurb, y]); spots.push(['lamp', eCurb, y + 50]); }
    for (let y = ya + 20; y < yb; y += rint(40, 70)) spots.push([wpick([['bin', 3], ['planter', 2], ['bikerack', 1], ['postbox', 1], ['hydrant', 1], ['tree', 3], ['column', 1]]), Math.random() < .5 ? wIn : eIn, y]);
    for (let y = ya + 30; y < yb; y += rint(120, 200)) if (Math.random() < .7) spots.push(['carv', Math.random() < .5 ? (s.c - 1) * TILE - 2 : (s.c + 1) * TILE + 2, y]);
    void barY;
  }
  for (const [t, x, y] of spots) {
    if (Math.abs(x - (s.bar.x + s.bar.w / 2)) < 60 && Math.abs(y - (s.bar.y + s.bar.h / 2)) < 120 && s.dir === 'H') continue;
    if (s.dir === 'V' && Math.abs(y - s.bar.y) < 70) continue;
    if (Math.abs(x - s.van.x) < 40 && Math.abs(y - s.van.y) < 40) continue;
    const near = t === 'car' || t === 'carv' ? 26 : t === 'shelter' ? 30 : 16;
    if (propNear(x, y, near)) continue;
    if (!walkableAt(x, y - 2)) continue;
    let bad = false; for (const a of s.alleys) if (Math.abs(a.mx - x) < 26 && Math.abs(a.my - y) < 26) bad = true; if (bad) continue;
    if (t === 'tree') addDecor(s, 'tree', x, y, { solid: { x: x - 3, y: y - 4, w: 6, h: 4 }, v: rint(0, 2) });
    else if (t === 'car') addProp(s, 'car', x, y, 0, { model: pick(['sedan', 'cv', 'sedan', 'van']), col: pick(['#d8473f', '#3f86d8', '#e8c440', '#5aa86a', '#e8e4dc', '#4a4a56', '#9a5ad0', '#e88a3a']), orient: 'h' });
    else if (t === 'carv') addProp(s, 'carv', x, y, 0, { model: 'sedan', col: pick(['#d8473f', '#3f86d8', '#e8c440', '#5aa86a', '#e8e4dc', '#4a4a56']), orient: 'v' });
    else addProp(s, t, x, y, rint(0, 5));
  }
}
function pruneBefore(k) {
  const keep = i => i >= k;
  buildings = buildings.filter(b => keep(b.seg)); props = props.filter(p => keep(p.seg)); decor = decor.filter(o => keep(o.seg));
}

/* ================= GROUND RENDER (per chunk, cached) ================= */
function thash(x, y) { let h = (x * 374761393 + y * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
let groundCount = 0;
function chunkCanvas(c) {
  if (c.cv) { c.used = performance.now(); return c.cv; }
  const cv2 = mkCanvas(CPX, CPX), g = cv2.getContext('2d');
  const ox = c.cx * CHUNK, oy = c.cy * CHUNK;
  for (let ly = 0; ly < CHUNK; ly++) for (let lx = 0; lx < CHUNK; lx++) {
    const tx = ox + lx, ty = oy + ly, t = c.t[(ly << 5) | lx], X = lx * TILE, Y = ly * TILE, h = thash(tx, ty);
    if (t === T_ROAD) {
      R(g, X, Y, 16, 16, P.road);
      for (let i = 0; i < 9; i++) { const v = thash(tx * 7 + i, ty * 13 - i); R(g, X + ((v * 16) | 0), Y + ((thash(tx + i, ty * 3) * 16) | 0), 1, 1, v < .5 ? P.roadDk : P.roadLt); }
      if (h < 0.03) { ell(g, X + 8, Y + 8, 5, 3, '#2c2e38'); ell(g, X + 8, Y + 8, 4, 2, '#4a4c58'); R(g, X + 5, Y + 8, 7, 1, '#2c2e38'); }
      else if (h < 0.08) ell(g, X + 8, Y + 9, 4, 1, 'rgba(20,20,30,.3)');
    } else if (t === T_SIDE) {
      const base = h < .12 ? P.sideDk : h > .9 ? P.sideLt : P.side;
      R(g, X, Y, 16, 16, base); R(g, X, Y, 16, 1, P.sideDk); R(g, X, Y + 8, 16, 1, P.sideDk); R(g, X + ((ty & 1) ? 0 : 8), Y, 1, 8, P.sideDk); R(g, X + ((ty & 1) ? 8 : 0), Y + 8, 1, 8, P.sideDk);
      if (h > .96) R(g, X + 5, Y + 11, 2, 1, '#8a7a6a');
    } else if (t === T_PLAZA || t === T_ALLEY) {
      const a = t === T_PLAZA ? [P.cob, P.cobDk, P.cobLt] : [P.alley, P.alleyDk, '#8a8172'];
      R(g, X, Y, 16, 16, a[1]);
      for (let yy = 0; yy < 16; yy += 4) for (let xx = ((yy / 4) & 1) * 2 - 2; xx < 16; xx += 4) { const v = thash(tx * 16 + xx, ty * 16 + yy); const cx2 = Math.max(0, X + xx), w2 = Math.min(3, X + 16 - cx2, xx + 3); if (w2 > 0) { R(g, cx2, Y + yy, w2, 3, v < .3 ? a[1] : v > .8 ? a[2] : a[0]); R(g, cx2, Y + yy, Math.min(w2, 2), 1, a[2]); } }
      if (t === T_ALLEY && h < .1) ell(g, X + 8, Y + 9, 5, 2, 'rgba(70,110,150,.45)');
    } else if (t === T_VOID) {
      const bx = Math.floor(tx / 5), by = Math.floor(ty / 4), bh = thash(bx, by);
      const roofs = ['#3a3d50', '#433b45', '#3d4448', '#4a3a36', '#363a4a'];
      const col = roofs[(bh * roofs.length) | 0];
      R(g, X, Y, 16, 16, col);
      if (ty % 4 === 0) R(g, X, Y, 16, 1, shade(col, -0.3));
      if (tx % 5 === 0) R(g, X, Y, 1, 16, shade(col, -0.3));
      for (let yy = 3; yy < 16; yy += 4) R(g, X, Y + yy, 16, 1, shade(col, -0.12));
      if (h < .06) { R(g, X + 5, Y + 4, 5, 7, '#6a4a3a'); R(g, X + 5, Y + 4, 5, 1, '#8a6a5a'); R(g, X + 6, Y + 2, 1, 2, '#c4703a'); R(g, X + 8, Y + 2, 1, 2, '#c4703a'); }
      else if (h > .95) { R(g, X + 3, Y + 5, 8, 5, '#9aa0a8'); R(g, X + 4, Y + 6, 5, 3, '#6a7078'); }
    } else { R(g, X, Y, 16, 16, '#2a2533'); }
  }
  // curbs and base shadows
  for (let ly = 0; ly < CHUNK; ly++) for (let lx = 0; lx < CHUNK; lx++) {
    const tx = ox + lx, ty = oy + ly, t = c.t[(ly << 5) | lx], X = lx * TILE, Y = ly * TILE;
    if (t === T_SIDE || t === T_PLAZA) {
      if (getT(tx, ty + 1) === T_ROAD) { R(g, X, Y + 13, 16, 3, P.curb); R(g, X, Y + 13, 16, 1, P.curbLt); }
      if (getT(tx, ty - 1) === T_ROAD) { R(g, X, Y, 16, 3, P.curb); R(g, X, Y + 2, 16, 1, P.curbLt); }
      if (getT(tx + 1, ty) === T_ROAD) { R(g, X + 13, Y, 3, 16, P.curb); R(g, X + 13, Y, 1, 16, P.curbLt); }
      if (getT(tx - 1, ty) === T_ROAD) { R(g, X, Y, 3, 16, P.curb); R(g, X + 2, Y, 1, 16, P.curbLt); }
    }
    if (WALKABLE[t] && getT(tx, ty - 1) === T_BLD) { g.fillStyle = 'rgba(10,8,20,.28)'; g.fillRect(X, Y, 16, 3); g.fillStyle = 'rgba(10,8,20,.14)'; g.fillRect(X, Y + 3, 16, 2); }
  }
  // markings from route segments
  g.save(); g.translate(-ox * TILE, -oy * TILE);
  for (const s of route) {
    if (!s.painted) continue;
    if (s.dir === 'H') {
      const y = s.c * TILE - 1;
      if (y < oy * TILE - 8 || y > (oy + CHUNK) * TILE + 8) continue;
      for (let x = (s.lo + 3) * TILE; x < (s.hi - 3) * TILE; x += 22) R(g, x, y, 12, 2, P.lane);
      R(g, (s.lo + 2) * TILE, (s.c - 2) * TILE + 3, (s.hi - s.lo - 4) * TILE, 1, 'rgba(220,221,227,.5)'); R(g, (s.lo + 2) * TILE, (s.c + 2) * TILE - 4, (s.hi - s.lo - 4) * TILE, 1, 'rgba(220,221,227,.5)');
      for (const cx of [s.lo + 4, s.hi - 5, ((s.lo + s.hi) / 2) | 0]) for (let yy = (s.c - 2) * TILE + 3; yy < (s.c + 2) * TILE - 3; yy += 7) R(g, cx * TILE, yy, 22, 4, P.lineW);
      if (s.plaza) { ell(g, s.plaza.cx, s.plaza.cy + 4, 50, 26, '#6f7584'); ell(g, s.plaza.cx, s.plaza.cy + 2, 50, 25, '#9aa0ad'); ell(g, s.plaza.cx, s.plaza.cy + 1, 45, 21, '#c3c8d2'); ell(g, s.plaza.cx, s.plaza.cy + 2, 43, 19, P.waterDk); ell(g, s.plaza.cx, s.plaza.cy + 1, 42, 18, P.water); }
    } else {
      const x = s.c * TILE - 1;
      if (x < ox * TILE - 8 || x > (ox + CHUNK) * TILE + 8) continue;
      const y0 = Math.min(s.lo, s.hi), y1 = Math.max(s.lo, s.hi);
      for (let y = (y0 + 3) * TILE; y < (y1 - 3) * TILE; y += 22) R(g, x, y, 2, 12, P.lane);
      for (const cy of [y0 + 4, y1 - 5]) for (let xx = (s.c - 2) * TILE + 3; xx < (s.c + 2) * TILE - 3; xx += 7) R(g, xx, cy * TILE, 4, 22, P.lineW);
    }
  }
  g.restore();
  c.cv = cv2; c.used = performance.now(); groundCount++;
  if (groundCount > 24) { // LRU prune
    const list = [...chunks.values()].filter(k => k.cv).sort((a, b) => a.used - b.used);
    for (let i = 0; i < list.length - 18; i++) { list[i].cv = null; groundCount--; }
  }
  return cv2;
}
function stampDecal(x, y, col, s = 1) {
  const c = chunks.get(ckey(Math.floor(x / CPX), Math.floor(y / CPX))); if (!c || !c.cv) return;
  const g = c.cv.getContext('2d'); g.fillStyle = col; g.fillRect(Math.round(x - c.cx * CPX), Math.round(y - c.cy * CPX), s, s);
}
function splatDecal(x, y, col, r) { for (let i = 0; i < r * 3; i++) { const a = Math.random() * 6.28, d = Math.random() * r; stampDecal(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.6, col, Math.random() < .4 ? 2 : 1); } }

/* ================= BUILDING RENDER ================= */
function buildingImage(b) {
  if (b.img) return b.img;
  const rr = mulberry32(b.seed);
  const W = b.w, D = b.d, H = b.H, top = b.low ? 18 : 0;
  const c = mkCanvas(W, D + H + top), g = c.getContext('2d');
  const r = (x, y, w, h, cc) => R(g, x, y + top, w, h, cc);
  const st = b.style;
  // ---- roof ----
  if (st === 'paris') {
    r(0, 0, W, D, '#6e7a8c'); for (let x = 2; x < W; x += 5) r(x, 0, 1, D - 12, '#7d899b');
    r(0, D - 13, W, 13, '#4a5262'); r(0, D - 13, W, 1, '#5a6272');
    for (let x = 6; x < W - 10; x += 18) { r(x, D - 12, 9, 10, '#e8dcc4'); r(x + 1, D - 10, 7, 7, '#3a4660'); r(x + 2, D - 9, 2, 2, '#8aa0c0'); r(x - 1, D - 13, 11, 2, '#4a5262'); }
    for (let i = 0; i < 2; i++) { const cx = 6 + ((rr() * (W - 20)) | 0); r(cx, 2, 10, 6, '#b06a4a'); r(cx, 2, 10, 1, '#c88a6a'); for (let k = 0; k < 3; k++) r(cx + 1 + k * 3, 0, 2, 2, '#d97a4a'); }
  } else if (st === 'modern') {
    r(0, 0, W, D, '#8a8a90'); for (let i = 0; i < W * D / 20; i++) r((rr() * W) | 0, (rr() * D) | 0, 1, 1, rr() < .5 ? '#7a7a80' : '#9a9aa0');
    r(0, 0, W, 2, '#b0b0b6'); r(0, D - 3, W, 3, '#6a6a70');
    for (let i = 0; i < 2; i++) { const ax = 6 + ((rr() * (W - 20)) | 0), ay = 3 + ((rr() * Math.max(1, D - 14)) | 0); r(ax, ay, 12, 8, '#d7dbe2'); r(ax + 1, ay + 1, 7, 6, '#8a93a6'); r(ax + 9, ay + 2, 2, 4, '#555'); }
  } else if (st === 'low') {
    const kind = (b.seed % 3);
    if (kind === 0) { r(0, 0, W, D, '#9a948a'); for (let i = 0; i < W * D / 18; i++) r((rr() * W) | 0, (rr() * D) | 0, 1, 1, rr() < .5 ? '#8a847a' : '#aaa49a'); }
    else if (kind === 1) { const tc = '#b5583a'; r(0, 0, W, D, tc); for (let y = 2; y < D; y += 3) { r(0, y, W, 1, shade(tc, -0.2)); for (let x = (y % 6 ? 0 : 3); x < W; x += 6) r(x, y - 2, 1, 2, shade(tc, -0.12)); } }
    else { r(0, 0, W, D, '#6e7a8c'); for (let x = 2; x < W; x += 5) r(x, 0, 1, D, '#7d899b'); }
    r(0, 0, W, 2, 'rgba(255,255,255,.25)'); r(0, 0, 2, D, 'rgba(255,255,255,.12)'); r(W - 2, 0, 2, D, 'rgba(0,0,0,.2)');
    if (kind === 0 && W > 50) { const tx = 8 + ((rr() * (W - 50)) | 0), ty = 18 + ((rr() * Math.max(1, D - 34)) | 0); r(tx, ty, 34, 14, '#c8a878'); for (let k = 0; k < 34; k += 4) r(tx + k, ty, 1, 14, '#b09060'); ell(g, tx + 9, ty + 4 + top, 7, 3, pick(['#c43d5a', '#2a7a4a', '#e8c440'])); r(tx + 20, ty + 4, 6, 4, '#efe9df'); ell(g, tx + 28, ty + 10 + top, 4, 3, '#4c9a4f'); }
    for (let i = 0; i < 2; i++) { const cx = 6 + ((rr() * (W - 20)) | 0), cy = 16 + ((rr() * Math.max(1, D - 26)) | 0); r(cx, cy, 7, 7, '#8a5a4a'); r(cx, cy, 7, 1, '#aa7a6a'); }
    for (let i = 0; i < 2; i++) { const ax = 6 + ((rr() * (W - 22)) | 0), ay = 6 + ((rr() * Math.max(1, D - 16)) | 0); if (rr() < .5) { r(ax, ay, 12, 8, '#d7dbe2'); r(ax + 1, ay + 1, 7, 6, '#8a93a6'); } else { ell(g, ax + 6, ay + 4 + top, 6, 3, '#4c9a4f'); r(ax + 4, ay + 2, 2, 2, '#ff6b8a'); } }
    // rooftop sign facing the street
    const sw = Math.min(W - 8, 96), sx = ((W - sw) / 2) | 0;
    R(g, sx + 6, 12, 2, 8, '#333'); R(g, sx + sw - 8, 12, 2, 8, '#333');
    R(g, sx, 0, sw, 13, '#15121a'); R(g, sx + 1, 1, sw - 2, 11, b.signBg);
    g.fillStyle = b.signFg; fitText(g, b.name, sw - 6, 12); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(b.name, sx + sw / 2, 7); g.textAlign = 'start'; g.textBaseline = 'alphabetic';
  } else {
    const tc = st === 'dutch' ? '#7a3a2a' : st === 'fachwerk' ? '#9a4a32' : '#b5583a';
    r(0, 0, W, D, tc); for (let y = 2; y < D; y += 3) { r(0, y, W, 1, shade(tc, -0.2)); for (let x = (y % 6 ? 0 : 3); x < W; x += 6) r(x, y - 2, 1, 2, shade(tc, -0.12)); }
    r(0, 0, W, 1, shade(tc, 0.2)); r(0, D - 2, W, 2, shade(tc, -0.3));
    for (let i = 0; i < 2; i++) { const cx = 6 + ((rr() * (W - 20)) | 0); r(cx, 2, 7, 7, '#8a5a4a'); r(cx, 2, 7, 1, '#aa7a6a'); }
  }
  // ---- wall ----
  const wy = D, wb = D + H;
  if (H > 0) {
    r(0, wy, W, H, b.wall);
    for (let i = 0; i < W * H / 30; i++) r((rr() * W) | 0, wy + ((rr() * H) | 0), 1, 1, 'rgba(0,0,0,.06)');
    r(0, wy, 1, H, 'rgba(255,255,255,.2)'); r(W - 1, wy, 1, H, 'rgba(0,0,0,.25)');
    const gH = b.shop ? 36 : (b.low ? 0 : 20);
    const upTop = wy + 4, upBot = wb - gH - 2;
    if (st === 'paris') {
      for (let y = wy + 3; y < upBot; y += 5) r(0, y, W, 1, shade(b.wall, -0.06));
      r(0, wy, W, 3, shade(b.wall, -0.15)); r(0, wy + 3, W, 1, shade(b.wall, 0.1));
    }
    if (st === 'dutch') { for (let y = wy; y < wb; y += 3) { r(0, y, W, 1, shade(b.wall, 0.18)); for (let x = (((y - wy) / 3) & 1) * 3; x < W; x += 6) r(x, y, 1, 3, shade(b.wall, 0.18)); } }
    if (st === 'modern') {
      for (let y = upTop; y < upBot - 6; y += 16) for (let x = 3; x < W - 3; x += 12) { r(x, y, 10, 13, '#5a7aa0'); r(x, y, 10, 1, '#8ab0d8'); r(x + 1, y + 1, 3, 4, 'rgba(255,255,255,.3)'); }
    } else if (!b.low) {
      let fl = 0;
      for (let y = upTop; y + 16 < upBot + 2; y += 20, fl++) {
        if (st === 'fachwerk') { r(0, y - 3, W, 2, '#4a2e1e'); }
        for (let x = 6; x + 9 < W - 2; x += 17) {
          const lit = rr() < .2;
          if (st === 'paris') { r(x - 1, y - 1, 10, 16, '#f5f0e6'); r(x, y, 8, 14, lit ? '#ffe9a3' : '#3a4660'); r(x + 3, y, 1, 14, '#f5f0e6'); r(x + 1, y + 1, 2, 4, 'rgba(255,255,255,.35)'); if (fl === 0 || fl % 2 === 1) { r(x - 2, y + 10, 12, 4, '#1b1b22'); for (let k = 0; k < 12; k += 2) r(x - 2 + k, y + 11, 1, 2, b.wall); } }
          else if (st === 'fachwerk') { r(x - 2, y - 1, 2, 16, '#4a2e1e'); r(x, y + 1, 8, 9, '#f5f0e6'); r(x + 1, y + 2, 6, 7, lit ? '#ffe9a3' : '#3a4a5a'); r(x + 3, y + 2, 1, 7, '#f5f0e6'); r(x - 1, y + 10, 10, 3, '#7a4a2a'); r(x, y + 9, 2, 2, '#e8303f'); r(x + 4, y + 9, 2, 2, '#ff6b8a'); pline(g, x + 10, y + top - 1, x + 15, y + top + 13, '#4a2e1e'); }
          else if (st === 'dutch') { r(x - 1, y - 1, 10, 16, '#f5f0e6'); r(x, y, 8, 14, lit ? '#ffe9a3' : '#2a3a4a'); r(x + 3, y, 1, 14, '#f5f0e6'); r(x, y + 6, 8, 1, '#f5f0e6'); r(x - 1, y - 3, 10, 2, '#e8dcc4'); }
          else { r(x - 3, y, 3, 13, '#3a6a3a'); r(x + 8, y, 3, 13, '#3a6a3a'); for (let k = 1; k < 13; k += 2) { r(x - 3, y + k, 3, 1, '#4a8a4a'); r(x + 8, y + k, 3, 1, '#4a8a4a'); } r(x, y, 8, 13, lit ? '#ffe9a3' : '#3a3a4a'); r(x - 1, y + 13, 10, 2, shade(b.wall, -0.2)); }
        }
      }
      if (st === 'dutch') { // stepped gable on top of the facade
        const gw = Math.min(W, 72), gx = ((W - gw) / 2) | 0;
        for (let k = 0; k < 4; k++) { const ww = gw - k * 16; if (ww <= 8) break; r(gx + k * 8, wy - (k + 1) * 6, ww, 6, b.wall); r(gx + k * 8, wy - (k + 1) * 6, ww, 1, '#e8dcc4'); }
        r(W / 2 - 3, wy - 14, 6, 6, '#2a3a4a');
      }
    }
    // drainpipe + street plate
    if (!b.low) { const px = W - 4; r(px, wy + 2, 2, H - 4, '#7a7e88'); r(px, wy + 2, 2, 1, '#9aa0aa'); }
    // ground floor
    if (b.shop) {
      const sy = wb - gH;
      r(0, sy, W, gH, shade(b.wall, -0.14));
      r(2, sy + 1, W - 4, 10, '#15121a'); r(3, sy + 2, W - 6, 8, b.signBg);
      g.fillStyle = b.signFg; fitText(g, b.name, W - 12, 12); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(b.name, W / 2, sy + 6 + top); g.textAlign = 'start'; g.textBaseline = 'alphabetic';
      for (let x = 0; x < W; x += 6) { r(x, sy + 11, 6, 5, b.awning[((x / 6) | 0) % 2]); r(x, sy + 16, 6, 1, ((x / 6) | 0) % 2 ? b.awning[0] : 'rgba(0,0,0,.25)'); }
      const bottom = wb;
      for (const p of props) if (p.type === 'window' && p.y === b.y + b.d + 1 && p.x >= b.x && p.x <= b.x + W) { const lx = p.x - b.x; r(lx - 16, bottom - 24, 32, 23, '#15121a'); }
      if (b.door) { const dx = b.door - b.x; r(dx - 7, bottom - 22, 14, 22, '#15121a'); r(dx - 6, bottom - 21, 12, 21, '#5a3a24'); r(dx - 5, bottom - 19, 10, 9, P.glass); r(dx + 3, bottom - 9, 1, 2, P.gold); }
      r(0, bottom - 2, W, 2, 'rgba(0,0,0,.3)');
      if (rr() < .55) { g.font = '9px VT323'; g.fillStyle = pick(['#ff4f8b', '#4ab8ff', '#5fe08a', '#ffd23f', '#fff']); g.fillText(pick(GRAFFITI), 4 + rr() * Math.max(1, W - 40), bottom - 4 + top); }
      R(g, 6, sy - 9 + top, 34, 7, '#1e3a8a'); R(g, 7, sy - 8 + top, 32, 5, '#2a4ab0'); g.font = '6px VT323'; g.fillStyle = '#fff'; fitText(g, b.street, 30, 7); g.fillText(b.street, 8, sy - 3.5 + top);
    } else if (!b.low && gH) {
      const sy = wb - gH; r(0, sy, W, gH, shade(b.wall, -0.1));
      for (let x = 8; x < W - 10; x += 20) { r(x, sy + 4, 10, 12, '#2a3040'); r(x + 1, sy + 5, 3, 3, 'rgba(255,255,255,.25)'); }
      r(0, wb - 2, W, 2, 'rgba(0,0,0,.3)');
    } else if (b.low) { r(0, wb - 2, W, 2, 'rgba(0,0,0,.3)'); r(4, wy + 2, 10, H - 2, '#5a4a3a'); }
  }
  b.img = c; return c;
}
