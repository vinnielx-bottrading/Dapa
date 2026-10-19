/* ================= GAME STATE ================= */
const S = {
  mode: 'menu', t: 0, runT: 0, score: 0, fine: 0, tier: 0, combo: 0, maxCombo: 1, lastDestroyT: -99,
  hitStop: 0, shakeT: 0, shakeMag: 0, block: 0, wave: 0, phase: 'march', phaseT: 0, crowdWins: 0, policeWins: 0,
  kos: 0, flips: 0, broken: 0, arrested: 0, waveStartCrowd: 0, queue: [], queueT: 0, firstHit: false, honkT: 3,
  bubbleT: 2, tug: 0.5, rear: null, bar: null, food: null, tables: [], hintT: 0, partyBeer: false
};
let player = null, rioters = [], cops = [], vehicles = [], projectiles = [], gasCans = [], particles = [], emitters = [], floaters = [], bubbles = [];
let reducedMotion = lsGet('dapa_motion', matchMedia('(prefers-reduced-motion: reduce)').matches ? '1' : '0') === '1';
let best = parseInt(lsGet('dapa_best2', '0'), 10) || 0;

const RTYPES = {
  hippie:     { w: 3, hp: 3, speed: 46, aggr: 0.2,  smash: 0.45, throw: 0.55, proj: 'paint',  held: () => pick(['guitar', 'flower', null]) },
  gangster:   { w: 3, hp: 5, speed: 54, aggr: 0.75, smash: 0.65, throw: 0.25, proj: 'bottle', held: () => 'bat' },
  punk:       { w: 2, hp: 4, speed: 56, aggr: 0.6,  smash: 0.7,  throw: 0.5,  proj: 'bottle', held: () => null, kick: 0.8 },
  uncle:      { w: 2, hp: 4, speed: 40, aggr: 0.15, smash: 0.5,  throw: 0.2,  proj: 'tomato', held: () => null, loot: true },
  influencer: { w: 1, hp: 2, speed: 48, aggr: 0,    smash: 0.05, throw: 0,    proj: null,     held: () => 'phone', film: true },
  grandma:    { w: 1, hp: 6, speed: 36, aggr: 0.5,  smash: 0.3,  throw: 0.1,  proj: 'tomato', held: () => 'pan' },
  student:    { w: 3, hp: 3, speed: 50, aggr: 0.3,  smash: 0.4,  throw: 0.6,  proj: 'tomato', held: () => Math.random() < .55 ? 'sign:' + pick(PLACARDS) : null },
};
const CTYPES = {
  officer:    { hp: 4, speed: 52, grab: true,  spec: 'officer', held: 'baton', score: 150, fine: 1500 },
  riot:       { hp: 7, speed: 38, shield: true, spec: 'riot', held: 'shield', score: 200, fine: 2500 },
  gasser:     { hp: 4, speed: 44, gas: true,   spec: 'gasser', held: 'launcher', score: 150, fine: 1800 },
  bike:       { hp: 3, speed: 92, bike: true,  spec: 'biker', held: null, score: 150, fine: 1800 },
  horse:      { hp: 9, speed: 74, horse: true, spec: 'rider', held: 'baton', score: 300, fine: 5000 },
  bureaucrat: { hp: 3, speed: 42, forms: true, spec: 'bureaucrat', held: 'clip', score: 200, fine: 2000 },
};
const CHANTS = ['ALLEZ!', 'NEIN!', 'VIVA!', 'LUNCH!', 'WOOO!', 'SIESTA!', 'BIER!', '¡HUELGA!', 'NON!', 'PAUSE!', 'OLÉ!', 'MERCI!', 'JA!', 'FORZA!', 'OUI OUI!'];
const COP_LINES = ['HALT!', 'STOP!', 'ARRÊTEZ!', 'PAPIERS?', 'ALTO!', 'AU CALME!', 'POLIZEI!'];
const FORM_LINES = ['FORM B-12!', 'STEMPEL!', 'SIGNEZ ICI', 'IN 3 KOPIEN', 'FORMULAIRE A-38', 'TAMPON!'];

/* ================= SPAWN ================= */
function newAgent(o) {
  return Object.assign({ x: 0, y: 0, vx: 0, vy: 0, fx: 0, fy: 1, dir: 'down', anim: Math.random() * 4, frame: 0, moving: false, hp: 3, maxHp: 3, state: 'idle', task: 'march', think: Math.random(), cd: Math.random(), atkT: 0, hitDone: true, down: 0, kt: 0, kx: 0, ky: 0, cough: 0, paper: 0, wet: 0, flash: 0, icon: null, iconT: 0, stuckT: 0, sideT: 0, sx: 0, sy: 0, alley: null, z: 0, pose: 'walk', grabbedBy: null, grabbing: null }, o);
}
function spawnRioter(x, y, type, alley) {
  if (rioters.length >= MAX_RIOTERS) return null;
  type = type || wpick(Object.entries(RTYPES).map(([k, v]) => [k, v.w]));
  const T = RTYPES[type];
  const a = newAgent({ kind: 'rioter', type, x, y, hp: T.hp, maxHp: T.hp, speed: T.speed * rnd(0.9, 1.1), spec: makeSpec(type), held: T.held(), alley: alley || null, ox: rnd(-70, 70), oy: rnd(-34, 34) });
  rioters.push(a); return a;
}
function spawnCop(type, x, y, alley) {
  const T = CTYPES[type];
  const hpS = Math.round(T.hp * (1 + 0.12 * Math.max(0, S.wave - 1)));
  const c = newAgent({ kind: 'cop', type, x, y, hp: hpS, maxHp: hpS, speed: T.speed * rnd(0.92, 1.08), spec: makeSpec(T.spec), held: T.held, state: 'engage', alley: alley || null, kos: 0, windup: 0, target: null, gasCD: rnd(2, 4), formCD: 0, mounted: !!(T.bike || T.horse), react: 0.4 });
  cops.push(c); dust(x, y, 4); return c;
}
function spawnVehicle(kind, x, y, orient, extra) {
  const v = Object.assign({ kind, x, y, orient, hp: kind === 'cannon' ? 30 : kind === 'van' ? 16 : 999, maxHp: 0, state: 'drive', flash: 0, t: 0, sprayT: 0, tx: x, ty: y, dead: false }, extra || {});
  v.maxHp = v.hp; vehicles.push(v); return v;
}
function vehRect(v) { return v.orient === 'h' ? { x: v.x - 32, y: v.y - 14, w: 64, h: 14 } : { x: v.x - 15, y: v.y - 40, w: 30, h: 40 }; }

/* ================= FX ================= */
function spawnP(o) {
  if (particles.length >= MAX_PARTICLES) particles.shift();
  particles.push(Object.assign({ x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, g: 260, life: 1, col: '#fff', s: 1, bounce: true, decal: false, type: 'debris' }, o));
}
const MAT_COL = {
  plastic: ['#5a8a5a', '#3a6a3a', '#e9e4d0', '#c9b26a'], wood: [P.wood, P.woodDk, P.woodLt, '#e9dcc0'], metal: [P.metal, P.metalDk, P.metalLt, '#2a3a32'],
  glass: [P.glass, P.glassLt, '#fff', P.glassDk], car: ['#c4cad6', '#555c6e', '#ff3b4f', '#222'], stone: ['#a9a49a', '#7d786e', '#c9c4b8', '#5f7a62'], paper: ['#fff', '#e6e1d0', '#cfd6e6']
};
function burst(x, y, z, mat, n, power = 1) {
  const cols = MAT_COL[mat] || MAT_COL.wood;
  for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, sp = rnd(20, 80) * power; spawnP({ x: x + rnd(-3, 3), y: y + rnd(-2, 2), z: z + rnd(0, 4), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.6, vz: rnd(40, 130) * power, col: pick(cols), s: Math.random() < .3 ? 2 : 1, life: rnd(0.8, 1.6), decal: Math.random() < .7 }); }
}
function dust(x, y, n) { for (let i = 0; i < n; i++) spawnP({ x: x + rnd(-5, 5), y: y + rnd(-1, 1), z: 1, vx: rnd(-24, 24), vy: rnd(-6, 6), vz: rnd(5, 20), g: 20, col: 'rgba(230,220,200,.7)', s: 2, life: rnd(.3, .6), bounce: false, type: 'puff' }); }
function stars(x, y) { for (let i = 0; i < 6; i++) spawnP({ x, y, z: 26, vx: rnd(-40, 40), vy: rnd(-10, 10), vz: rnd(30, 70), g: 160, col: pick(['#ffd23f', '#fff', '#ff8fb1']), s: 2, life: .6, bounce: false }); }
function floater(x, y, txt, col, big) { floaters.push({ x, y, txt, col, t: 0, big }); }
function bubble(a, txt, t = 1.6) { if (bubbles.length > 5) return; a.say = { txt, t }; bubbles.push(a); }
function shake(mag, t) { if (reducedMotion) return; S.shakeMag = Math.max(S.shakeT > 0 ? S.shakeMag : 0, mag); S.shakeT = Math.max(S.shakeT, t); }
function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]; p.life -= dt;
    p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.vz -= p.g * dt;
    if (p.type === 'smoke') p.s = Math.min(6, p.s + dt * 3);
    if (p.z < 0) {
      p.z = 0;
      if (p.bounce && Math.abs(p.vz) > 25) { p.vz *= -0.35; p.vx *= 0.55; p.vy *= 0.55; }
      else { p.vz = 0; p.vx *= 0.8; p.vy *= 0.8; if (p.decal) { stampDecal(p.x, p.y, p.col, p.s); p.life = 0; } }
    }
    if (p.life <= 0) particles.splice(i, 1);
  }
  for (let i = emitters.length - 1; i >= 0; i--) {
    const e = emitters[i]; e.acc += dt * e.rate; e.t += dt;
    if (e.dur && e.t > e.dur) { emitters.splice(i, 1); continue; }
    if (Math.abs(e.x - player.x) > 500 || Math.abs(e.y - player.y) > 400) continue;
    while (e.acc >= 1) {
      e.acc -= 1;
      if (e.type === 'water') spawnP({ x: e.x + rnd(-1, 1), y: e.y, z: 6, vx: rnd(-16, 16), vy: rnd(-8, 8), vz: rnd(100, 140), g: 230, col: Math.random() < .5 ? P.water : P.waterLt, life: 1.2, bounce: false, decal: Math.random() < .2, type: 'water' });
      else if (e.type === 'smoke') spawnP({ x: e.x + rnd(-5, 5), y: e.y, z: 10, vx: rnd(-4, 8), vy: rnd(-3, 0), vz: rnd(12, 22), g: -4, col: Math.random() < .5 ? 'rgba(70,70,80,.55)' : 'rgba(120,120,130,.45)', s: 2, life: rnd(1.2, 2), bounce: false, type: 'smoke' });
      else if (e.type === 'spark') { if (Math.random() < .4) spawnP({ x: e.x, y: e.y, z: e.z, vx: rnd(-40, 40), vy: rnd(-15, 15), vz: rnd(20, 70), g: 300, col: Math.random() < .5 ? '#ffd23f' : '#fff', life: rnd(.2, .5), bounce: false }); }
    }
  }
  for (let i = floaters.length - 1; i >= 0; i--) { floaters[i].t += dt; if (floaters[i].t > 1.2) floaters.splice(i, 1); }
  for (let i = bubbles.length - 1; i >= 0; i--) { const a = bubbles[i]; if (!a.say || (a.say.t -= dt) <= 0) { a.say = null; bubbles.splice(i, 1); } }
}

/* ================= SCORING ================= */
function addScore(pts, x, y, useCombo) {
  let mult = 1;
  if (useCombo) {
    S.combo = (S.runT - S.lastDestroyT < COMBO_WINDOW) ? S.combo + 1 : 1; S.lastDestroyT = S.runT; S.maxCombo = Math.max(S.maxCombo, S.combo);
    mult = Math.min(5, S.combo); if (mult > 1) AUDIO.play('combo', S.combo);
  }
  const g = Math.round(pts * mult); S.score += g;
  if (x !== undefined) { floater(x, y, '+' + g, mult > 1 ? P.gold : '#fff'); if (mult > 1) floater(x, y - 8, 'x' + mult, P.hot); }
}
function addFine(eur, x, y) {
  if (S.mode !== 'playing') return;
  S.fine += eur; if (x !== undefined) floater(x + 10, y + 6, '€' + Math.round(eur), '#ff6a7a');
  let t = 0; for (let i = 0; i < TIERS.length; i++) if (S.fine >= TIERS[i][0]) t = i;
  if (t > S.tier) { S.tier = t; showToast('Danh hiệu mới: <b>' + TIERS[t][1] + '</b>. Cảnh sát để ý bạn hơn!', 3, 'cop'); AUDIO.play('kazoo', 4); }
}

/* ================= COLLISION ================= */
let solidGrid = new Map();
function addSolid(r) { const x0 = Math.floor(r.x / 64), x1 = Math.floor((r.x + r.w) / 64), y0 = Math.floor(r.y / 64), y1 = Math.floor((r.y + r.h) / 64); for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const k = x + ',' + y; let a = solidGrid.get(k); if (!a) solidGrid.set(k, a = []); a.push(r); } }
function rebuildSolids() {
  solidGrid.clear();
  for (const p of props) if (p.solid && (p.state !== 'destroyed' || p.flippable || p.type === 'statue' || p.type === 'booth' || p.type === 'column' || p.type === 'shelter')) addSolid(p.solid);
  for (const o of decor) if (o.solid) addSolid(o.solid);
  for (const v of vehicles) if (v.kind !== 'food' || v.state === 'parked') addSolid(vehRect(v));
  if (S.bar) addSolid(S.bar); if (S.rear) addSolid(S.rear);
}
function solidAt(x, y, hw, hh) {
  if (!walkableAt(x - hw, y - hh) || !walkableAt(x + hw, y - hh) || !walkableAt(x - hw, y + hh) || !walkableAt(x + hw, y + hh)) return true;
  const a = solidGrid.get(Math.floor(x / 64) + ',' + Math.floor(y / 64));
  if (a) for (const r of a) if (rectsOverlap(x - hw, y - hh, hw * 2, hh * 2, r)) return true;
  // check neighbours (entities near cell edges)
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { const b = solidGrid.get((Math.floor((x + dx * hw) / 64)) + ',' + (Math.floor((y + dy * hh) / 64))); if (b && b !== a) for (const r of b) if (rectsOverlap(x - hw, y - hh, hw * 2, hh * 2, r)) return true; }
  return false;
}
function moveEntity(e, dx, dy, hw = 4, hh = 3) {
  let moved = 0;
  if (dx) { const nx = e.x + dx; if (!solidAt(nx, e.y, hw, hh)) { e.x = nx; moved += Math.abs(dx); } }
  if (dy) { const ny = e.y + dy; if (!solidAt(e.x, ny, hw, hh)) { e.y = ny; moved += Math.abs(dy); } }
  return moved;
}

/* ================= NAVIGATION (follow the route polyline) ================= */
function navDir(a, tx, ty) {
  let gx = tx, gy = ty;
  if (a.alley) { if (dist(a.x, a.y, a.alley.mx, a.alley.my) < 14) a.alley = null; else { gx = a.alley.mx; gy = a.alley.my; } }
  else {
    const as = segAt(a.x, a.y, S.block), ts = segAt(tx, ty, S.block);
    if (!as) { // wandered into an alley: head back to its mouth first
      let bm = null, bd = 260; for (const s of route) { if (!s.populated) continue; for (const al of s.alleys) { const d = dist(a.x, a.y, al.mx, al.my); if (d < bd && Math.abs(a.x - al.mx) < 24 + Math.abs(al.x - al.mx) && Math.abs(a.y - al.my) < 24 + Math.abs(al.y - al.my)) { bd = d; bm = al; } } }
      if (bm) { a.alley = bm; gx = bm.mx; gy = bm.my; }
    } else if (as && ts && as !== ts) { if (as.i < ts.i) { gx = as.end.x; gy = as.end.y; } else { gx = as.start.x; gy = as.start.y; } }
  }
  const dx = gx - a.x, dy = gy - a.y, d = Math.hypot(dx, dy) || 1;
  return [dx / d, dy / d, dist(a.x, a.y, tx, ty)];
}
function steer(a, dirx, diry, speed, dt) {
  if (a.sideT > 0) { a.sideT -= dt; dirx = a.sx; diry = a.sy; }
  const k = Math.min(1, dt * 8); a.vx += (dirx * speed - a.vx) * k; a.vy += (diry * speed - a.vy) * k;
}
let agentGrid = new Map();
function rebuildAgentGrid() {
  agentGrid.clear();
  const add = a => { const k = (a.x >> 5) + ',' + (a.y >> 5); let l = agentGrid.get(k); if (!l) agentGrid.set(k, l = []); l.push(a); };
  for (const a of rioters) add(a); for (const c of cops) add(c); if (player.active) add(player);
}
function separate(a, dt, r = 9) {
  const cx = a.x >> 5, cy = a.y >> 5;
  for (let y = cy - 1; y <= cy + 1; y++) for (let x = cx - 1; x <= cx + 1; x++) { const l = agentGrid.get(x + ',' + y); if (!l) continue; for (const b of l) { if (b === a) continue; const dx = a.x - b.x, dy = a.y - b.y, d = Math.hypot(dx, dy); if (d < r && d > 0.01) { a.vx += dx / d * 60 * dt * 8; a.vy += dy / d * 60 * dt * 8; } } }
}
function integrate(a, dt, hw = 4, hh = 3) {
  let vx = a.vx, vy = a.vy;
  if (a.kt > 0) { a.kt -= dt; vx = a.kx; vy = a.ky; a.kx *= 0.9; a.ky *= 0.9; }
  const want = Math.hypot(vx, vy) * dt;
  const moved = moveEntity(a, vx * dt, vy * dt, hw, hh);
  if (want > 0.3 && moved < want * 0.25 && a.kt <= 0) { a.stuckT += dt; if (a.stuckT > 0.35) { a.stuckT = 0; const s = Math.random() < .5 ? 1 : -1; const d = Math.hypot(vx, vy) || 1; a.sx = -vy / d * s; a.sy = vx / d * s; a.sideT = 0.45; } }
  else a.stuckT = 0;
  const sp = Math.hypot(a.vx, a.vy); a.moving = sp > 6;
  if (a.moving) { a.anim += dt * (6 + sp * 0.09); if (!a.lockDir) { a.dir = Math.abs(a.vx) > Math.abs(a.vy) * 1.1 ? (a.vx < 0 ? 'left' : 'right') : (a.vy < 0 ? 'up' : 'down'); a.fx = a.vx / sp; a.fy = a.vy / sp; } }
  a.frame = a.moving ? ((a.anim | 0) % 4) : 0;
}
function knock(a, fromX, fromY, power, dur = 0.18) {
  const dx = a.x - fromX, dy = a.y - fromY, d = Math.hypot(dx, dy) || 1;
  a.kx = dx / d * power; a.ky = dy / d * power; a.kt = dur;
}

/* ================= PROPS ================= */
function nearestProp(x, y, r, filter) {
  let bp = null, bd = r;
  for (const p of props) { if (p.state === 'destroyed' || (filter && !filter(p))) continue; const d = Math.hypot(p.hx - x, p.hy - y) - p.hr; if (d < bd) { bd = d; bp = p; } }
  return bp;
}
function propHit(p, dmg, byPlayer) {
  if (p.state === 'destroyed') return;
  p.flash = 0.09; p.shake = 0.18;
  if (p.flippable) {
    p.push += byPlayer ? 1.4 : 0.5; if (byPlayer) p.playerPush = true;
    burst(p.x, p.y - 6, 8, 'car', 3, 0.6); AUDIO.play('hit', 'car');
    if (p.push >= p.need) flipCar(p);
    return;
  }
  p.hp -= dmg;
  burst(p.hx, p.y, Math.max(2, p.y - p.hy), p.mat, 4, 0.7);
  if (byPlayer || Math.random() < .3) AUDIO.play('hit', p.mat);
  if (byPlayer) S.hitStop = Math.max(S.hitStop, 0.03);
  if (p.hp <= 0) destroyProp(p, byPlayer);
  else if (p.hp <= p.maxHp / 2) p.state = 'damaged';
}
function destroyProp(p, byPlayer) {
  p.state = 'destroyed';
  const big = p.pts >= 150;
  burst(p.hx, p.y, Math.max(3, p.y - p.hy), p.mat, big ? 24 : 14, big ? 1.3 : 1); dust(p.hx, p.y, big ? 8 : 4);
  AUDIO.play('break', p.mat);
  if (p.type === 'window') for (let i = 0; i < 18; i++) stampDecal(p.x + rnd(-13, 13), p.y + rnd(1, 10), Math.random() < .5 ? P.glassLt : P.glass, 1);
  if (p.type === 'bin') for (let i = 0; i < 14; i++) stampDecal(p.x + rnd(-12, 12), p.y + rnd(-3, 5), pick(['#e9e4d0', '#c9b26a', '#7a6a4a', '#3b7bff']), Math.random() < .3 ? 2 : 1);
  if (p.type === 'hydrant') emitters.push({ type: 'water', x: p.x, y: p.y - 2, rate: 34, acc: 0, t: 0, dur: 40 });
  if (p.type === 'lamp' || p.type === 'booth') emitters.push({ type: 'spark', x: p.x + (p.type === 'lamp' ? 8 : 0), y: p.y, z: p.type === 'lamp' ? 3 : 14, rate: 12, acc: 0, t: 0, dur: 4 });
  if (p.type === 'postbox' || p.type === 'column') for (let i = 0; i < 10; i++) spawnP({ x: p.x, y: p.y, z: 12, vx: rnd(-30, 30), vy: rnd(-12, 12), vz: rnd(30, 70), g: 40, col: p.type === 'column' ? pick(['#ff8a3a', '#4ab8ff', '#ffe14a', '#fff']) : '#fff', s: 2, life: rnd(1.5, 2.6), bounce: false, decal: true, type: 'paper' });
  if (byPlayer) {
    S.broken++;
    addScore(p.pts, p.hx, p.hy - 12, true); addFine(p.fine, p.hx, p.hy - 12);
    S.hitStop = Math.max(S.hitStop, big ? 0.08 : 0.05); shake(big ? 3 : 1.5, big ? 0.28 : 0.14);
    if (!S.firstHit) { S.firstHit = true; showToast('Đập đồ = <b>điểm</b> + <b>tiền phạt</b>. Đập liên tục để ăn <b>COMBO</b>!', 3.2); }
  }
}
function flipCar(p) {
  p.state = 'destroyed'; p.flipT = 0.5;
  burst(p.x, p.y - 8, 10, 'car', 22, 1.3); dust(p.x, p.y, 10);
  AUDIO.play('flip'); AUDIO.play('cheer', true); shake(4, 0.35);
  emitters.push({ type: 'smoke', x: p.x - 4, y: p.y - 10, rate: 6, acc: 0, t: 0, dur: 30 });
  for (const a of rioters) if (a.target === p) { a.task = 'cheer'; a.taskT = 1.5; a.target = null; }
  floater(p.x, p.y - 30, 'LẬT!', P.gold, true);
  if (p.playerPush) { S.flips++; addScore(p.pts, p.x, p.y - 24, true); addFine(p.fine, p.x, p.y - 24); }
  for (const a of rioters) if (dist(a.x, a.y, p.x, p.y) < 50 && a.down <= 0) knock(a, p.x, p.y, 70, 0.15);
}

/* ================= PLAYER ================= */
function newPlayer(x, y) { return newAgent({ kind: 'player', x, y, spec: makeSpec('player'), held: 'hammer', stam: 100, atkCD: 0, dashT: 0, dashCD: 0, throwCD: 0, inv: 0, hitT: 9, active: true, ddx: 0, ddy: 0 }); }
function readInput() {
  let mx = 0, my = 0;
  if (keys.KeyA || keys.ArrowLeft) mx -= 1; if (keys.KeyD || keys.ArrowRight) mx += 1;
  if (keys.KeyW || keys.ArrowUp) my -= 1; if (keys.KeyS || keys.ArrowDown) my += 1;
  if (stick.id !== null && Math.hypot(stick.dx, stick.dy) > 0.2) { mx = stick.dx; my = stick.dy; }
  const m = Math.hypot(mx, my); if (m > 1) { mx /= m; my /= m; }
  input.mx = mx; input.my = my;
  input.attack = !!(keys.Space || keys.KeyJ || input.mouseDown || input.touchHit);
}
function updatePlayer(dt) {
  readInput();
  const p = player;
  p.atkCD -= dt; p.dashCD -= dt; p.throwCD -= dt; p.inv -= dt; p.hitT += dt;
  if (p.hitT > 2) p.stam = Math.min(100, p.stam + dt * 7);
  if (p.cough > 0) { p.cough -= dt; p.stam -= dt * 5; if (Math.random() < dt * 1.5) AUDIO.play('cough'); }
  if (p.paper > 0) p.paper -= dt; if (p.wet > 0) p.wet -= dt;
  p.stam = clamp(p.stam, 0, 100);
  if (p.grabbedBy) { updateStruggle(dt); input.attackPressed = false; input.dashQ = false; input.throwQ = false; return; }
  // dash
  if (input.dashQ) {
    input.dashQ = false;
    if (p.dashCD <= 0 && p.paper <= 0) {
      let dx = input.mx, dy = input.my; if (!dx && !dy) { dx = p.fx; dy = p.fy; }
      const m = Math.hypot(dx, dy) || 1; p.ddx = dx / m; p.ddy = dy / m; p.dashT = DASH_T; p.dashCD = DASH_CD; p.inv = 0.3; dust(p.x, p.y, 5); AUDIO.play('dash');
    }
  }
  let vx, vy;
  const slow = (p.cough > 0 ? 0.6 : 1) * (p.wet > 0 ? 0.75 : 1) * (p.stam < 25 ? 0.85 : 1) * (p.atkT > 0 ? 0.6 : 1);
  if (p.paper > 0) { vx = vy = 0; }
  else if (p.dashT > 0) { p.dashT -= dt; vx = p.ddx * DASH_SPEED; vy = p.ddy * DASH_SPEED; p.z = Math.sin((1 - p.dashT / DASH_T) * Math.PI) * 3; }
  else { vx = input.mx * PLAYER_SPEED * slow; vy = input.my * PLAYER_SPEED * slow; p.z = 0; }
  if (p.kt > 0) { p.kt -= dt; vx = p.kx; vy = p.ky; p.kx *= 0.88; p.ky *= 0.88; }
  p.moving = Math.hypot(vx, vy) > 2;
  if (p.moving && (input.mx || input.my) && p.atkT <= 0 && p.kt <= 0) { const m = Math.hypot(input.mx, input.my); p.fx = input.mx / m; p.fy = input.my / m; p.dir = dirOf(p.fx, p.fy); }
  if (p.moving) p.anim += dt * 11;
  p.frame = p.moving ? ((p.anim | 0) % 4) : 0;
  moveEntity(p, vx * dt, vy * dt, 4, 3);
  // attack
  if ((input.attack || input.attackPressed) && p.atkCD <= 0 && p.paper <= 0) {
    if (input.mouseDown && input.aimX !== null) { const ax = input.aimX - p.x, ay = input.aimY - (p.y - 8), m = Math.hypot(ax, ay) || 1; p.fx = ax / m; p.fy = ay / m; p.dir = dirOf(p.fx, p.fy); }
    else autoAim(p);
    p.atkT = ATK_DUR; p.atkCD = ATK_CD; p.hitDone = false;
  }
  input.attackPressed = false;
  if (p.atkT > 0) { p.atkT -= dt; if (!p.hitDone && p.atkT < ATK_DUR - 0.05) { p.hitDone = true; playerHit(); } }
  // throw / kick
  if (input.throwQ) { input.throwQ = false; if (p.throwCD <= 0 && p.paper <= 0) playerThrow(); }
}
function dirOf(x, y) { return Math.abs(x) > Math.abs(y) * 1.1 ? (x < 0 ? 'left' : 'right') : (y < 0 ? 'up' : 'down'); }
function autoAim(p) {
  let best = null, bd = 30;
  for (const c of cops) { if (c.state === 'stunned' || c.state === 'retreat') continue; const d = dist(c.x, c.y - 8, p.x, p.y - 8) - 8; if (d < bd) { bd = d; best = { x: c.x, y: c.y - 8 }; } }
  if (!best) { const pr = nearestProp(p.x, p.y - 8, 30); if (pr) best = { x: pr.hx, y: pr.hy }; }
  if (!best) return;
  const ax = best.x - p.x, ay = best.y - (p.y - 8), m = Math.hypot(ax, ay) || 1;
  if ((ax / m) * p.fx + (ay / m) * p.fy > -0.35 || !p.moving) { p.fx = ax / m; p.fy = ay / m; p.dir = dirOf(p.fx, p.fy); }
}
function playerHit() {
  const p = player, cx = p.x, cy = p.y - 8, hx = cx + p.fx * 14, hy = cy + p.fy * 11;
  // cops first
  let bc = null, bd = 16;
  for (const c of cops) { if (c.state === 'stunned' || c.state === 'retreat') continue; const d = Math.min(dist(c.x, c.y - 9, hx, hy), dist(c.x, c.y - 9, cx, cy) + 5) - (c.mounted ? 8 : 0); if (d < bd) { bd = d; bc = c; } }
  if (bc) { copHit(bc, 1, p, true); return; }
  for (const v of vehicles) { if (v.dead || v.kind === 'food') continue; const r = vehRect(v); if (hx > r.x - 8 && hx < r.x + r.w + 8 && hy > r.y - 26 && hy < r.y + r.h + 8) { vehHit(v, 1, true); return; } }
  let bp = null; bd = 12;
  for (const pr of props) { if (pr.state === 'destroyed') continue; const d = Math.min(Math.hypot(pr.hx - hx, pr.hy - hy), Math.hypot(pr.hx - cx, pr.hy - cy) + 5) - pr.hr; if (d < bd) { bd = d; bp = pr; } }
  if (bp) { propHit(bp, 1, true); return; }
  AUDIO.play('whoosh');
}
function playerThrow() {
  const p = player;
  // kick a tear-gas canister back
  let can = null, cd = 30; for (const g of gasCans) { const d = dist(g.x, g.y, p.x, p.y); if (d < cd) { cd = d; can = g; } }
  if (can) {
    const tgt = nearestCop(p.x, p.y, 260);
    const tx = tgt ? tgt.x : p.x + p.fx * 120, ty = tgt ? tgt.y : p.y + p.fy * 120; const d = dist(tx, ty, can.x, can.y) || 1;
    can.vx = (tx - can.x) / d * 190; can.vy = (ty - can.y) / d * 190; can.kicked = true;
    AUDIO.play('boing'); floater(can.x, can.y - 14, 'ĐÁ TRẢ!', P.mint, true); addScore(60, p.x, p.y - 30); p.throwCD = 0.4; p.dir = dirOf(can.vx, can.vy); return;
  }
  const tgt = nearestCop(p.x, p.y, 170);
  let tx, ty; if (tgt) { tx = tgt.x; ty = tgt.y - 8; } else { tx = p.x + p.fx * 110; ty = p.y + p.fy * 110; }
  throwProj('tomato', p.x, p.y - 12, tx, ty, 'player'); p.throwCD = THROW_CD; p.dir = dirOf(tx - p.x, ty - p.y); p.atkT = 0.12; p.hitDone = true;
}
function hurtPlayer(amount, fromX, fromY, power = 110) {
  const p = player; if (!p.active || p.inv > 0 || p.dashT > 0 || p.grabbedBy) return;
  p.stam -= amount; p.hitT = 0; knock(p, fromX, fromY, power, 0.16); p.inv = 0.35;
  shake(2, 0.15); AUDIO.play('bonk'); burst(p.x, p.y - 10, 10, 'paper', 2, 0.4);
  if (p.stam < 0) p.stam = 0;
}

/* ================= STRUGGLE (player grabbed) ================= */
let strug = null;
function grabPlayer(c) {
  const p = player; if (p.grabbedBy || p.inv > 0 || p.dashT > 0) return false;
  p.grabbedBy = c; c.grabbing = p; c.state = 'drag'; c.dragT = 0;
  const need = 9 + S.tier * 2 + (p.stam < 25 ? 4 : 0);
  strug = { prog: 0.15, need, t: 0, extra: 0 };
  AUDIO.play('grab'); shake(2, 0.2);
  document.getElementById('struggle').hidden = false;
  return true;
}
function updateStruggle(dt) {
  const p = player, c = p.grabbedBy;
  if (!c || c.grabbing !== p || c.state === 'stunned' || c.state === 'retreat') { releasePlayer(false); return; }
  strug.t += dt;
  const helpers = cops.filter(o => o !== c && o.state !== 'stunned' && o.state !== 'retreat' && dist(o.x, o.y, p.x, p.y) < 18).length;
  if (input.attackPressed) { strug.prog += 1 / (strug.need + helpers * 3); AUDIO.play('struggle'); p.flash = 0.05; shake(1, 0.05); }
  strug.prog -= dt * 0.12;
  if (strug.prog >= 1) { releasePlayer(true); return; }
  if (strug.prog <= 0) strug.prog = 0;
  p.x = c.x + (c.fx || 0) * -2; p.y = c.y + 3; p.frame = ((S.t * 12) | 0) % 4; p.dir = ((S.t * 6) | 0) % 2 ? 'left' : 'right';
  document.getElementById('strugBar').style.width = Math.round(strug.prog * 100) + '%';
}
function releasePlayer(won) {
  const p = player, c = p.grabbedBy;
  p.grabbedBy = null; strug = null; document.getElementById('struggle').hidden = true;
  if (c) { c.grabbing = null; if (c.state === 'drag') { c.state = 'stunned'; c.stun = won ? 1.4 : 0.6; } knock(c, p.x, p.y, 130, 0.2); }
  p.inv = 1.0; p.kt = 0;
  if (won) { AUDIO.play('free'); floater(p.x, p.y - 30, 'VÙNG THOÁT!', P.mint, true); addScore(150, p.x, p.y - 40); for (const o of cops) if (dist(o.x, o.y, p.x, p.y) < 26) knock(o, p.x, p.y, 120, 0.2); }
}

/* ================= COPS ================= */
function nearestCop(x, y, r) { let b = null, bd = r; for (const c of cops) { if (c.state === 'stunned' || c.state === 'retreat') continue; const d = dist(c.x, c.y, x, y); if (d < bd) { bd = d; b = c; } } return b; }
function copHit(c, dmg, src, byPlayer) {
  if (c.state === 'stunned' || c.state === 'retreat') return;
  // riot shield blocks from the front
  if (c.type === 'riot' && c.state !== 'drag') { const dx = src.x - c.x, dy = src.y - c.y, d = Math.hypot(dx, dy) || 1; if ((dx / d) * c.fx + (dy / d) * c.fy > 0.25 && Math.random() < 0.7) { AUDIO.play('clang'); knock(src, c.x, c.y, 80, 0.12); c.flash = 0.06; if (byPlayer) floater(c.x, c.y - 30, 'CLANG', '#cfd6e6'); return; } }
  c.hp -= dmg; c.flash = 0.1; knock(c, src.x, src.y, byPlayer ? 110 : 70, 0.14);
  if (c.grabbing) { const g = c.grabbing; if (g === player) releasePlayer(true); else { g.grabbedBy = null; g.down = 0.5; } c.grabbing = null; c.state = 'engage'; }
  if (byPlayer) { AUDIO.play('boing'); S.hitStop = Math.max(S.hitStop, 0.04); shake(1.5, 0.1); addScore(30, c.x, c.y - 30, false); addFine(c.type === 'bureaucrat' ? 600 : 450, c.x, c.y - 30); if (c.type === 'bureaucrat') floater(c.x, c.y - 40, 'TẤN CÔNG THỦ TỤC!', '#ffd23f'); }
  else if (Math.random() < .35) AUDIO.play('bonk');
  if (c.hp <= 0) {
    if (c.mounted) { dismount(c, byPlayer); return; }
    c.state = 'stunned'; c.stun = 3.2; c.kos++; stars(c.x, c.y);
    S.kos += byPlayer ? 1 : 0;
    if (byPlayer) { addScore(CTYPES[c.type].score, c.x, c.y - 36, true); addFine(CTYPES[c.type].fine, c.x, c.y - 36); AUDIO.play('slideDown'); }
  }
}
function dismount(c, byPlayer) {
  if (c.type === 'horse') { AUDIO.play('slideDown'); floater(c.x, c.y - 40, 'NGÃ NGỰA!', P.gold, true); emitters.push({ type: 'smoke', x: c.x, y: c.y, rate: 0, acc: 0, t: 0, dur: 0.1 }); runaway.push({ x: c.x, y: c.y, vx: c.fx >= 0 ? 120 : -120, t: 0 }); }
  else { const pr = addLooseBike(c.x, c.y); void pr; floater(c.x, c.y - 30, 'BỊCH!', '#fff'); }
  if (byPlayer) { addScore(CTYPES[c.type].score, c.x, c.y - 36, true); addFine(CTYPES[c.type].fine, c.x, c.y - 36); S.kos++; }
  c.mounted = false; c.type = 'officer'; c.hp = 3; c.maxHp = 3; c.speed = 52; c.state = 'stunned'; c.stun = 2.2; c.kos = 1; c.held = 'baton'; stars(c.x, c.y); dust(c.x, c.y, 6);
}
let runaway = [], looseBikes = [];
function addLooseBike(x, y) { looseBikes.push({ x, y, t: 0 }); return null; }
function copThink(c) {
  const p = player, ph = S.phase;
  if (ph === 'party' || ph === 'march') { c.state = 'retreat'; return; }
  // choose a target
  let best = null, bs = 1e9;
  const consider = (t, bonus) => { if (!t || t.grabbedBy || (t.kind === 'rioter' && t.gone)) return; const d = dist(t.x, t.y, c.x, c.y); if (d > 300) return; const sc = d - bonus; if (sc < bs) { bs = sc; best = t; } };
  if (p.active && !p.grabbedBy) consider(p, 30 + S.tier * 40 + (ph === 'sweep' ? 60 : 0));
  for (const a of rioters) consider(a, (a.down > 0 ? 40 : 0) + (a.type === 'influencer' ? 50 : 0) + (a.task === 'fight' ? 20 : 0));
  c.target = best;
}
function updateCop(c, dt) {
  const T = CTYPES[c.type] || CTYPES.officer, p = player;
  c.flash -= dt; c.icon && (c.iconT -= dt) <= 0 && (c.icon = null);
  if (c.cough > 0) c.cough -= dt; if (c.blind > 0) c.blind -= dt;
  if (c.state === 'stunned') { c.stun -= dt; c.vx *= 0.8; c.vy *= 0.8; if (c.kt > 0) integrate(c, dt); if (c.stun <= 0) { if (c.kos >= 2 || S.phase !== 'battle' && S.phase !== 'sweep') { c.state = 'retreat'; bubble(c, pick(['AU SECOURS!', 'MAMA!', 'FEIERABEND!', 'JE DÉMISSIONNE!'])); } else { c.state = 'engage'; c.hp = Math.ceil(c.maxHp * 0.6); } } return; }
  c.think -= dt;
  if (c.think <= 0 && c.state !== 'drag' && c.state !== 'retreat') { c.think = rnd(0.4, 0.8); copThink(c); }
  let sp = c.speed * (c.cough > 0 && c.spec.mask !== 'gas' ? 0.5 : 1) * (c.wet > 0 ? 0.8 : 1) * (S.phase === 'sweep' ? 1.12 : 1);
  if (c.react > 0) { c.react -= dt; sp = 0; }
  c.cd -= dt; c.gasCD -= dt; c.formCD -= dt;
  if (c.state === 'retreat') {
    const ex = c.exit || (c.exit = copExit(c)); const [dx, dy, d] = navDir(c, ex.x, ex.y); steer(c, dx, dy, c.speed * 1.2, dt);
    if (d < 16 || c.retreatT > 12) { c.gone = true; dust(c.x, c.y, 3); }
    c.retreatT = (c.retreatT || 0) + dt;
  } else if (c.state === 'drag') {
    const g = c.grabbing; if (!g) { c.state = 'engage'; return; }
    const dest = dragDest(c); const [dx, dy, d] = navDir(c, dest.x, dest.y); steer(c, dx, dy, 40, dt);
    if (g !== p) { g.x = c.x + 4; g.y = c.y + 2; }
    c.dragT = (c.dragT || 0) + dt;
    if (d < 22 || (c.dragT > 4 && d < 90) || c.dragT > 7) { c.dragT = 0; if (g === p) { arrestPlayer(); return; } arrestRioter(g); c.grabbing = null; c.state = S.phase === 'battle' || S.phase === 'sweep' ? 'engage' : 'retreat'; }
  } else if (c.blind > 0) { steer(c, Math.cos(S.t * 3 + c.x), Math.sin(S.t * 2.3 + c.y), sp * 0.5, dt); if (Math.random() < dt) bubble(c, '???'); }
  else {
    const t = c.target;
    if (!t) { const r = S.bar ? { x: S.bar.x + S.bar.w / 2, y: S.bar.y + S.bar.h / 2 } : { x: c.x, y: c.y }; const [dx, dy] = navDir(c, r.x, r.y); steer(c, dx, dy, sp * 0.4, dt); }
    else {
      const d = dist(t.x, t.y, c.x, c.y);
      if (T.gas && c.gasCD <= 0 && d < 190 && d > 40) { throwProj('gas', c.x, c.y - 14, t.x + rnd(-16, 16), t.y + rnd(-10, 10), 'police'); c.gasCD = rnd(6, 8.5); c.atkT = 0.2; AUDIO.play('gasPop'); bubble(c, pick(['GAS!', 'GAZ!', 'ACHTUNG!'])); }
      let want = T.gas ? 95 : 0;
      if (T.forms && c.formCD <= 0 && d < 18) { c.formCD = 4.5; c.atkT = 0.2; if (t === p) { if (p.inv <= 0 && p.dashT <= 0) { p.paper = 1.8; addFine(250, p.x, p.y - 30); AUDIO.play('paper'); floater(p.x, p.y - 34, pick(FORM_LINES), '#fff'); } } else { t.paper = 2.2; AUDIO.play('paper'); } bubble(c, pick(FORM_LINES)); for (let i = 0; i < 6; i++) spawnP({ x: t.x, y: t.y, z: 18, vx: rnd(-30, 30), vy: rnd(-12, 12), vz: rnd(20, 60), g: 50, col: '#fff', s: 2, life: rnd(1, 2), bounce: false, decal: true, type: 'paper' }); }
      if (d > want + 10 || (!T.gas && d > 11)) { const [dx, dy] = navDir(c, t.x, t.y); steer(c, dx, dy, sp, dt); }
      else if (T.gas && d < want - 20) { const [dx, dy] = navDir(c, t.x, t.y); steer(c, -dx, -dy, sp * 0.7, dt); }
      else { c.vx *= 0.7; c.vy *= 0.7; c.fx = (t.x - c.x) / (d || 1); c.fy = (t.y - c.y) / (d || 1); c.dir = dirOf(c.fx, c.fy); }
      // horse / bike: trample on contact
      if (c.mounted) for (const a of rioters) if (a.down <= 0 && !a.grabbedBy && dist(a.x, a.y, c.x, c.y) < (c.type === 'horse' ? 14 : 10)) { a.down = c.type === 'horse' ? 1.4 : 0.8; knock(a, c.x, c.y, 120, 0.2); a.hp -= 1; if (c.type === 'horse' && Math.random() < .3) AUDIO.play('hoof'); }
      if (c.mounted && p.active && dist(p.x, p.y, c.x, c.y) < (c.type === 'horse' ? 15 : 11)) hurtPlayer(c.type === 'horse' ? 16 : 9, c.x, c.y, 160);
      // melee
      if (d < 15 && c.cd <= 0 && !T.forms) {
        if (T.grab && (t.down > 0 || Math.random() < 0.55 + (t === p ? S.tier * 0.05 : 0)) && !c.windup) { c.windup = t === p ? 0.5 : 0.35; c.icon = '!'; c.iconT = 0.6; c.pose = 'grab'; }
        else if (!c.windup) { c.atkT = 0.2; c.cd = T.shield ? 1.4 : rnd(0.9, 1.3);
          if (t === p) hurtPlayer(T.shield ? 8 : 11, c.x, c.y, T.shield ? 170 : 110);
          else { t.hp -= 1; knock(t, c.x, c.y, T.shield ? 150 : 90, 0.16); if (t.hp <= 0) { t.down = 1.8; t.hp = 1; } if (Math.random() < .25) AUDIO.play('bonk'); }
        }
      }
      if (c.windup) { c.windup -= dt; sp = 0; c.vx *= 0.5; c.vy *= 0.5;
        if (c.windup <= 0) { c.windup = 0; c.pose = 'walk'; c.cd = 1.2;
          if (dist(t.x, t.y, c.x, c.y) < 17) { if (t === p) { if (grabPlayer(c)) bubble(c, pick(COP_LINES)); } else if (!t.grabbedBy) { t.grabbedBy = c; c.grabbing = t; c.state = 'drag'; c.dragT = 0; t.task = 'grabbed'; bubble(t, pick(['NON!', 'HILFE!', 'MAMMA!', 'AU SECOURS!'])); } }
        } }
    }
  }
  separate(c, dt, 10);
  integrate(c, dt, c.mounted ? 6 : 4, 3);
}
function copExit(c) {
  const s = route[S.block]; const opts = [];
  if (S.bar) opts.push({ x: S.bar.x + S.bar.w / 2 + (s.dir === 'H' ? 30 : 0), y: S.bar.y + S.bar.h / 2 + (s.dir === 'V' ? s.sign * 30 : 0) });
  for (const a of s.alleys) opts.push({ x: a.x, y: a.y });
  let b = opts[0] || { x: c.x, y: c.y }, bd = 1e9; for (const o of opts) { const d = dist(o.x, o.y, c.x, c.y); if (d < bd) { bd = d; b = o; } }
  return b;
}
function dragDest(c) { const v = vehicles.find(v => v.kind === 'van' && !v.dead); if (v) return { x: v.x, y: v.y + (v.orient === 'h' ? 10 : 6) }; return copExit(c); }
function arrestRioter(a) { a.gone = true; S.arrested++; dust(a.x, a.y, 4); floater(a.x, a.y - 30, 'BỊ BẮT', '#8fb4ff'); }

/* ================= RIOTERS ================= */
function rioterThink(a) {
  const T = RTYPES[a.type], ph = S.phase, s = route[S.block];
  a.think = rnd(0.6, 1.3);
  if (ph === 'party') { a.task = 'party'; return; }
  if (a.cough > 0 && a.type !== 'punk') { a.task = 'flee'; return; }
  if (a.type === 'punk') { for (const g of gasCans) if (!g.kicked && dist(g.x, g.y, a.x, a.y) < 70 && Math.random() < T.kick) { a.task = 'kick'; a.target = g; return; } }
  const cop = nearestCop(a.x, a.y, 130);
  if (cop && T.film) { a.task = 'film'; a.target = cop; return; }
  if (cop && Math.random() < T.aggr) { a.task = 'fight'; a.target = cop; return; }
  if (cop && T.proj && Math.random() < T.throw) { a.task = 'throw'; a.target = cop; return; }
  if (cop && Math.random() < 0.3) { a.task = 'avoid'; a.target = cop; return; }
  const truck = vehicles.find(v => !v.dead && v.kind !== 'food' && dist(v.x, v.y, a.x, a.y) < 120);
  if (truck && Math.random() < T.aggr) { a.task = 'hitveh'; a.target = truck; return; }
  if (T.loot && !a.held) { const w = props.find(p => p.type === 'window' && p.state === 'destroyed' && !p.looted && dist(p.x, p.y, a.x, a.y) < 160); if (w) { a.task = 'loot'; a.target = w; return; } }
  const car = nearestProp(a.x, a.y, 140, p => p.flippable && p.pushers < 5);
  if (car && Math.random() < 0.45) { a.task = 'push'; a.target = car; a.side = Math.random() < .5 ? -1 : 1; return; }
  const pr = nearestProp(a.x, a.y, 150, p => !p.flippable && p.type !== 'statue' || (p.type === 'statue' && Math.random() < .3));
  if (pr && Math.random() < T.smash) { a.task = 'smash'; a.target = pr; return; }
  if (Math.random() < 0.15) { a.task = 'cheer'; a.taskT = rnd(1, 2); return; }
  a.task = 'march'; void s;
}
function crowdCenter() {
  let x = 0, y = 0, n = 0; for (const a of rioters) { if (a.gone) continue; x += a.x; y += a.y; n++; }
  return n ? { x: x / n, y: y / n, n } : { x: player.x, y: player.y, n: 0 };
}
function updateRioter(a, dt) {
  const T = RTYPES[a.type];
  a.flash -= dt; a.cd -= dt; if (a.cough > 0) a.cough -= dt; if (a.wet > 0) a.wet -= dt; if (a.paper > 0) a.paper -= dt;
  a.pose = 'walk'; a.lockDir = false;
  if (a.grabbedBy) { a.frame = ((S.t * 10) | 0) % 4; if (!cops.includes(a.grabbedBy) || a.grabbedBy.state !== 'drag') a.grabbedBy = null; else if (Math.random() < dt * 0.1 * (a.type === 'punk' || a.type === 'gangster' ? 2 : 1)) { const c = a.grabbedBy; c.grabbing = null; c.state = 'engage'; a.grabbedBy = null; knock(c, a.x, a.y, 100, 0.2); bubble(a, 'HA!'); } return; }
  if (a.down > 0) { a.down -= dt; a.vx *= 0.8; a.vy *= 0.8; if (a.kt > 0) integrate(a, dt); return; }
  if (a.paper > 0) { a.vx = a.vy = 0; return; }
  a.think -= dt; if (a.think <= 0) rioterThink(a);
  const s = route[S.block];
  let sp = a.speed * (a.cough > 0 ? 0.65 : 1) * (a.wet > 0 ? 0.75 : 1);
  const t = a.target;
  switch (a.task) {
    case 'march': {
      const r = S.phase === 'party' && S.food ? S.food : s.rally; const tx = r.x + a.ox, ty = r.y + a.oy * (s.dir === 'H' ? 1 : 0.4) + (s.dir === 'V' ? 0 : 0);
      const [dx, dy, d] = navDir(a, s.dir === 'V' ? r.x + a.ox * 0.4 : tx, s.dir === 'V' ? r.y + a.oy * 2 : ty);
      if (d > 14) steer(a, dx, dy, sp * (d > 120 ? 1 : 0.6), dt); else { a.vx *= 0.8; a.vy *= 0.8; if (Math.random() < dt * 0.3) { a.task = 'cheer'; a.taskT = 1.2; } }
      break; }
    case 'smash': case 'fight': case 'hitveh': {
      if (!t || (t.state === 'destroyed') || (t.kind === 'cop' && (t.state === 'stunned' || t.state === 'retreat' || t.gone)) || t.dead) { a.task = 'march'; a.think = 0; break; }
      const tx = t.hx !== undefined ? t.hx : t.x, ty = t.hy !== undefined ? t.y + 2 : t.y;
      const reach = t.hr !== undefined ? t.hr + 8 : t.kind === 'cop' ? 13 : 30;
      const [dx, dy, d] = navDir(a, tx, ty);
      if (d > reach) steer(a, dx, dy, sp, dt);
      else { a.vx *= 0.6; a.vy *= 0.6; a.fx = dx; a.fy = dy; a.dir = dirOf(dx, dy); a.lockDir = true;
        if (a.cd <= 0) { a.cd = rnd(0.7, 1.2); a.atkT = 0.2; a.hitDone = false; }
      }
      if (a.atkT > 0) { a.atkT -= dt; if (!a.hitDone && a.atkT < 0.12) { a.hitDone = true; if (t.kind === 'cop') copHit(t, a.type === 'gangster' || a.type === 'grandma' ? 0.75 : 0.45, a, false); else if (t.hx !== undefined) propHit(t, 1, false); else vehHit(t, 1, false); } }
      break; }
    case 'throw': {
      if (!t || t.state === 'stunned' || t.state === 'retreat' || t.gone) { a.task = 'march'; break; }
      const d = dist(t.x, t.y, a.x, a.y); const [dx, dy] = navDir(a, t.x, t.y);
      if (d > 140) steer(a, dx, dy, sp, dt); else if (d < 50) steer(a, -dx, -dy, sp * 0.8, dt); else { a.vx *= 0.7; a.vy *= 0.7; a.dir = dirOf(dx, dy); a.lockDir = true; if (a.cd <= 0) { a.cd = rnd(1.6, 2.8); a.atkT = 0.15; throwProj(T.proj, a.x, a.y - 14, t.x, t.y - 8, 'crowd'); } }
      if (a.atkT > 0) a.atkT -= dt;
      break; }
    case 'avoid': case 'flee': {
      let fx = 0, fy = 0;
      if (a.task === 'flee') { for (const g of gasCans) { const d = dist(g.x, g.y, a.x, a.y); if (d < 80) { fx += (a.x - g.x) / (d || 1); fy += (a.y - g.y) / (d || 1); } } }
      else if (t) { const d = dist(t.x, t.y, a.x, a.y); if (d < 60) { fx = (a.x - t.x) / (d || 1); fy = (a.y - t.y) / (d || 1); } }
      if (fx || fy) { const m = Math.hypot(fx, fy); steer(a, fx / m, fy / m, sp, dt); } else { a.task = 'march'; }
      if (a.cough > 0 && Math.random() < dt * 0.6) bubble(a, pick(['*KHỤ KHỤ*', '*HẮT XÌ*', 'ARGH!']));
      break; }
    case 'push': {
      if (!t || t.state === 'destroyed') { a.task = 'march'; break; }
      const tx = t.orient === 'v' ? t.x + a.side * 15 : t.x + a.side * 8, ty = t.orient === 'v' ? t.y - 14 : t.y + (a.side > 0 ? 6 : -14);
      const [dx, dy, d] = navDir(a, tx, ty);
      if (d > 8) steer(a, dx, dy, sp, dt); else { a.vx *= 0.5; a.vy *= 0.5; t.pushers++; a.pose = 'grab'; a.lockDir = true; a.dir = dirOf(t.x - a.x, t.y - 8 - a.y); if (Math.random() < dt * 0.5) bubble(a, pick(['HO-HISSE!', 'UND HOPP!', 'FORZA!', 'MỘT HAI BA!'])); }
      break; }
    case 'kick': {
      if (!t || t.life <= 0) { a.task = 'march'; break; }
      const [dx, dy, d] = navDir(a, t.x, t.y);
      if (d > 10) steer(a, dx, dy, sp * 1.2, dt); else { const c = nearestCop(a.x, a.y, 260); if (c) { const dd = dist(c.x, c.y, t.x, t.y) || 1; t.vx = (c.x - t.x) / dd * 170; t.vy = (c.y - t.y) / dd * 170; t.kicked = true; AUDIO.play('boing'); bubble(a, 'RETOUR!'); } a.task = 'march'; }
      break; }
    case 'loot': {
      if (!t || t.looted) { a.task = 'march'; break; }
      const [dx, dy, d] = navDir(a, t.x, t.y + 6);
      if (d > 10) steer(a, dx, dy, sp, dt); else { t.looted = true; a.held = 'tv'; bubble(a, pick(['GRATIS!', 'SALDI!', 'SOLDES!'])); a.task = 'march'; }
      break; }
    case 'film': {
      if (!t || t.gone) { a.task = 'march'; break; }
      const d = dist(t.x, t.y, a.x, a.y); const [dx, dy] = navDir(a, t.x, t.y);
      if (d > 70) steer(a, dx, dy, sp, dt); else if (d < 40) steer(a, -dx, -dy, sp, dt); else { a.vx *= 0.7; a.vy *= 0.7; a.dir = dirOf(dx, dy); a.lockDir = true; if (Math.random() < dt * 0.4) bubble(a, pick(['LIVE!', '#RIOT', 'LIKE & SUB!', 'OMG!'])); }
      break; }
    case 'cheer': { a.vx *= 0.8; a.vy *= 0.8; a.pose = 'cheer'; a.taskT -= dt; if (a.taskT <= 0) a.task = 'march'; break; }
    case 'party': {
      const f = S.food || s.rally; const tx = f.x + a.ox * 1.1, ty = f.y + 30 + a.oy * 0.9;
      const [dx, dy, d] = navDir(a, tx, ty);
      if (d > 10) steer(a, dx, dy, sp, dt); else { a.vx *= 0.6; a.vy *= 0.6; a.pose = (a.ox > 0) ? 'cheer' : 'walk'; if (!a.beer) { a.beer = true; } if (Math.random() < dt * 0.25) bubble(a, pick(['PROST!', 'SANTÉ!', 'SALUD!', 'CIN CIN!', 'MỘT HAI BA DZÔ!', '*Ợ*'])); }
      break; }
    default: a.task = 'march';
  }
  if (a.task !== 'party') a.beer = false;
  separate(a, dt, 9);
  integrate(a, dt);
}
function vehHit(v, dmg, byPlayer) {
  if (v.dead || v.kind === 'food') return;
  v.hp -= dmg; v.flash = 0.08; burst(v.x, v.y - 14, 10, 'car', 3, 0.7); if (byPlayer || Math.random() < .3) AUDIO.play('hit', 'metal');
  if (byPlayer) { addScore(20, v.x, v.y - 40); addFine(300, v.x, v.y - 40); }
  if (v.hp <= 0) {
    v.dead = true; v.state = 'dead'; AUDIO.play('break', 'metal'); AUDIO.play('cheer', true); shake(4, 0.35); burst(v.x, v.y - 14, 18, 'car', 26, 1.4);
    emitters.push({ type: 'smoke', x: v.x, y: v.y - 20, rate: 6, acc: 0, t: 0, dur: 30 });
    floater(v.x, v.y - 50, v.kind === 'cannon' ? 'VÒI RỒNG HỎNG!' : 'XE BẮT NGƯỜI TOANG!', P.gold, true);
    const pts = v.kind === 'cannon' ? 1000 : 500, eur = v.kind === 'cannon' ? 50000 : 20000;
    if (byPlayer) { addScore(pts, v.x, v.y - 40, true); addFine(eur, v.x, v.y - 40); }
  }
}

/* ================= PROJECTILES & GAS ================= */
function throwProj(type, x, y, tx, ty, owner) {
  const d = dist(x, y, tx, ty), T = clamp(d / 170, 0.35, 0.9);
  projectiles.push({ type, x, y: y + 12, z: 12, vx: (tx - x) / T, vy: (ty + 8 - y - 12) / T, vz: 120 * T * 0.9 + 30, owner, life: 3, rot: 0 });
  AUDIO.play('throw');
}
function updateProjectiles(dt) {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.vz -= 260 * dt; p.rot += dt * 12; p.life -= dt;
    let hit = null;
    if (p.z < 22 && p.type !== 'gas') {
      if (p.owner !== 'police') { for (const c of cops) if (c.state !== 'stunned' && c.state !== 'retreat' && dist(c.x, c.y, p.x, p.y) < 9) { hit = c; break; } }
    }
    if (hit || p.z <= 0 || p.life <= 0) { projLand(p, hit); projectiles.splice(i, 1); }
  }
  for (let i = gasCans.length - 1; i >= 0; i--) {
    const g = gasCans[i]; g.t += dt; g.life -= dt;
    if (g.vx || g.vy) { const nx = g.x + g.vx * dt, ny = g.y + g.vy * dt; if (walkableAt(nx, ny)) { g.x = nx; g.y = ny; } else { g.vx *= -0.4; g.vy *= -0.4; } g.vx *= Math.pow(0.12, dt); g.vy *= Math.pow(0.12, dt); if (Math.hypot(g.vx, g.vy) < 4) g.vx = g.vy = 0; }
    g.r = Math.min(42, 12 + g.t * 14) * (g.life < 1.5 ? g.life / 1.5 : 1);
    if (g.life <= 0) { gasCans.splice(i, 1); continue; }
    for (const a of rioters) if (dist(a.x, a.y, g.x, g.y) < g.r && a.type !== 'punk') { a.cough = 1.2; if (a.task !== 'flee' && a.task !== 'kick') { a.task = 'flee'; } }
    for (const c of cops) if (dist(c.x, c.y, g.x, g.y) < g.r && c.spec.mask !== 'gas') { if (c.cough <= 0 && Math.random() < .1) bubble(c, '*KHỤ*'); c.cough = 1.2; }
    if (player.active && dist(player.x, player.y, g.x, g.y) < g.r) player.cough = 0.6;
    if (Math.random() < dt * 0.6) AUDIO.play('gasHiss');
  }
}
function projLand(p, hit) {
  const byP = p.owner === 'player';
  if (p.type === 'gas') { gasCans.push({ x: p.x, y: p.y, vx: 0, vy: 0, t: 0, life: 7.5, r: 10, kicked: false }); AUDIO.play('gasPop'); return; }
  if (p.type === 'tomato') { splatDecal(p.x, p.y, '#d8303a', 4); AUDIO.play('splat'); if (hit) { hit.blind = 0.5; hit.flash = 0.1; if (byP) { addScore(15, hit.x, hit.y - 30); addFine(80, hit.x, hit.y - 30); floater(hit.x, hit.y - 38, 'SPLAT', '#ff6a6a'); } } }
  if (p.type === 'paint') { const col = pick(P.paint); splatDecal(p.x, p.y, col, 7); AUDIO.play('splat'); if (hit) { hit.blind = 1.6; hit.flash = 0.1; hit.paintCol = col; } }
  if (p.type === 'bottle') { for (let i = 0; i < 8; i++) stampDecal(p.x + rnd(-5, 5), p.y + rnd(-3, 3), pick(['#4a9a5a', '#7ad08a', '#fff']), 1); AUDIO.play('hit', 'glass'); if (hit) copHit(hit, 1, { x: p.x - p.vx * 0.05, y: p.y - p.vy * 0.05 }, false); }
}
