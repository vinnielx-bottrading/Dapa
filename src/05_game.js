/* ================= DECOR SPRITES ================= */
function treeSprite(v) {
  const key = 'tree' + v; let c = SPR.get(key); if (c) return c;
  c = mkCanvas(48, 64); const g = c.getContext('2d'); const X = 24, Y = 61;
  R(g, X - 7, Y - 3, 14, 4, '#3a3530'); for (let i = -6; i < 7; i += 2) R(g, X + i, Y - 3, 1, 4, '#5a554e');
  R(g, X - 2, Y - 26, 5, 24, '#8a8070'); R(g, X - 2, Y - 26, 2, 24, '#a89c88'); R(g, X + 1, Y - 18, 2, 4, '#c4b8a0'); R(g, X - 1, Y - 10, 2, 3, '#6a6050');
  const cols = [[P.leafDk, P.leaf, P.leafLt], ['#4a7a3a', '#5e9448', '#86b866'], ['#3e7a5a', '#4e946a', '#7abf8a']][v % 3];
  ell(g, X, Y - 38, 18, 14, cols[0]); ell(g, X - 6, Y - 42, 11, 9, cols[1]); ell(g, X + 7, Y - 40, 10, 8, cols[1]); ell(g, X - 2, Y - 46, 9, 6, cols[2]); ell(g, X + 6, Y - 32, 8, 5, cols[0]);
  for (let i = 0; i < 18; i++) R(g, X - 14 + ((i * 37) % 28), Y - 50 + ((i * 13) % 24), 2, 1, cols[2]);
  outline(c); SPR.set(key, c); return c;
}
function barrierSprite(edge) {
  const key = 'barrier' + edge; let c = SPR.get(key); if (c) return c;
  if (edge) { c = mkCanvas(8, 24); const g = c.getContext('2d'); R(g, 3, 2, 2, 20, '#b8bec8'); R(g, 1, 2, 6, 2, '#d8dde4'); R(g, 1, 20, 6, 2, '#8a909a'); R(g, 0, 21, 8, 2, '#5a606a'); }
  else { c = mkCanvas(34, 22); const g = c.getContext('2d'); R(g, 1, 2, 32, 2, '#d8dde4'); R(g, 1, 15, 32, 2, '#a8aeb8'); R(g, 1, 2, 2, 17, '#b8bec8'); R(g, 31, 2, 2, 17, '#b8bec8'); for (let x = 5; x < 31; x += 3) R(g, x, 4, 1, 11, '#c8ced8'); R(g, 0, 19, 6, 2, '#5a606a'); R(g, 28, 19, 6, 2, '#5a606a'); R(g, 10, 6, 14, 6, '#2f5fd0'); R(g, 11, 7, 12, 4, '#fff'); }
  outline(c); SPR.set(key, c); return c;
}
function tableSprite() {
  let c = SPR.get('table'); if (c) return c;
  c = mkCanvas(40, 22); const g = c.getContext('2d');
  R(g, 2, 6, 36, 5, '#b8854a'); R(g, 2, 6, 36, 1, '#d8a56a'); R(g, 4, 11, 2, 9, '#6a4a2a'); R(g, 34, 11, 2, 9, '#6a4a2a'); R(g, 0, 15, 40, 3, '#9a6a3a');
  for (let i = 0; i < 4; i++) { R(g, 6 + i * 8, 1, 4, 5, '#f2b636'); R(g, 6 + i * 8, 0, 4, 2, '#fffbe8'); }
  R(g, 20, 3, 6, 3, '#c43d5a'); R(g, 21, 2, 4, 1, '#e88a6a');
  outline(c); SPR.set('table', c); return c;
}

/* ================= WAVES & PHASES ================= */
function waveComp(w) {
  const L = [];
  const add = (type, n, from) => { for (let i = 0; i < n; i++) L.push({ type, from: from === 'mix' ? (Math.random() < .4 ? 'alley' : 'bar') : from }); };
  add('officer', 4 + Math.min(6, w), 'mix');
  if (w >= 2) add('riot', Math.min(6, w), 'bar');
  if (w >= 2) add('gasser', Math.min(3, 1 + (w >> 1)), 'bar');
  if (w >= 3) add('bureaucrat', Math.min(3, w - 2), 'alley');
  if (w >= 4) add('bike', Math.min(5, w - 2), 'mix');
  if (w >= 4) L.push({ type: 'cannon', from: 'bar' });
  if (w >= 5) add('horse', Math.min(3, w - 4), 'bar');
  for (let i = L.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [L[i], L[j]] = [L[j], L[i]]; }
  L.forEach((q, i) => q.d = i * 0.55 + Math.floor(i / 6) * 4.5);
  return L;
}
function activeCrowd() { return rioters.filter(a => !a.gone).length; }
function activeCops() { return cops.filter(c => !c.gone && c.state !== 'retreat').length; }
function barSpawnPoint() {
  const s = route[S.block], b = s.bar;
  for (let k = 0; k < 10; k++) {
    let x, y;
    if (s.dir === 'H') { x = b.x - 16 - rnd(0, 26); y = rnd(b.y + 10, b.y + b.h - 6); }
    else { x = rnd(b.x + 10, b.x + b.w - 10); y = s.sign > 0 ? b.y - 14 - rnd(0, 20) : b.y + b.h + 14 + rnd(0, 20); }
    if (walkableAt(x, y) && !solidAt(x, y, 4, 3)) return { x, y };
  }
  return { x: s.rally.x, y: s.rally.y };
}
function spawnFromQueue(q) {
  const s = route[S.block];
  if (q.type === 'cannon') {
    const p = barSpawnPoint();
    const v = s.dir === 'H' ? spawnVehicle('cannon', S.bar.x - 46, s.c * TILE + 6, 'h') : spawnVehicle('cannon', s.c * TILE, s.sign > 0 ? S.bar.y - 20 : S.bar.y + S.bar.h + 50, 'v');
    void p; floater(v.x, v.y - 60, 'XE VÒI RỒNG!', '#8fb4ff', true); AUDIO.play('alert'); return;
  }
  let pos, alley = null;
  if (q.from === 'alley' && s.alleys.length) { const a = pick(s.alleys); pos = { x: a.x + rnd(-3, 3), y: a.y }; alley = a; }
  else pos = barSpawnPoint();
  const c = spawnCop(q.type, pos.x, pos.y, alley);
  if (Math.random() < .3) bubble(c, pick(COP_LINES));
  if (q.type === 'bike') AUDIO.play('bell');
  if (q.type === 'horse') AUDIO.play('hoof');
}
function startBattle() {
  S.phase = 'battle'; S.phaseT = 0; S.wave++; S.queue = waveComp(S.wave); S.queueT = 0; S.waveStartCrowd = activeCrowd();
  const extra = S.wave === 2 ? ' Có <b>lựu đạn cay</b>: đứng gần bấm <b>' + (isTouch ? 'NÉM' : 'E') + '</b> để đá trả!' : S.wave === 4 ? ' Coi chừng <b>xe vòi rồng</b>!' : S.wave === 5 ? ' Kỵ binh tới!' : S.wave === 3 ? ' <b>Đội Thủ Tục</b> phát giấy tờ làm bạn đứng hình!' : '';
  showToast('<b>ĐỢT ' + S.wave + '</b>: cảnh sát ập tới!' + extra, 3.6, 'cop');
  AUDIO.play('whistle'); MUSIC.play('chase');
}
function crowdWin() {
  S.phase = 'party'; S.phaseT = 0; S.crowdWins++;
  for (const c of cops) if (c.state !== 'stunned') { c.state = 'retreat'; c.grabbing = null; } else c.kos = 9;
  for (const a of rioters) if (a.grabbedBy) a.grabbedBy = null;
  if (player.grabbedBy) releasePlayer(true);
  for (const v of vehicles) if (v.kind === 'cannon' && !v.dead) v.retreat = true;
  const s = route[S.block];
  if (S.bar) { for (let i = 0; i < 16; i++) { const bx = S.bar.x + rnd(0, S.bar.w), by = S.bar.y + rnd(0, S.bar.h); spawnP({ x: bx, y: by, z: 6, vx: rnd(-80, 80), vy: rnd(-40, 40), vz: rnd(80, 160), col: pick(['#b8bec8', '#d8dde4', '#ffd23f', '#1b1b22']), s: 2, life: 1.6, decal: true }); } S.bar = null; }
  const cut = Math.round(S.fine * 0.3); S.fine -= cut;
  let t = 0; for (let i = 0; i < TIERS.length; i++) if (S.fine >= TIERS[i][0]) t = i; S.tier = t;
  showToast('<b>ĐÁM ĐÔNG THẮNG!</b> Kéo nhau đi nhậu! Luật sư đám đông thương lượng: <b>−' + fmtEur(cut) + '</b> tiền phạt.', 4.5, 'beer');
  AUDIO.play('victory'); MUSIC.play('party');
  // food truck rolls in from beyond the old barricade
  let fx, fy, sx, sy;
  if (s.dir === 'H') { fx = s.bar.x - 30; fy = s.c * TILE - 6; sx = fx + 260; sy = fy; }
  else { fx = s.c * TILE - 8; fy = s.bar.y - s.sign * 30; sx = fx; sy = fy + s.sign * 260; }
  spawnVehicle('food', sx, sy, s.dir === 'H' ? 'h' : 'v', { tx: fx, ty: fy, state: 'drive' });
  S.food = { x: fx, y: fy + (s.dir === 'H' ? 10 : 0) };
  S.tables = [];
  for (let i = 0; i < 4; i++) { const tx = fx + (s.dir === 'H' ? -110 + i * 46 : (i % 2 ? 36 : -36)), ty = fy + (s.dir === 'H' ? 42 + (i % 2) * 14 : -s.sign * (60 + (i >> 1) * 34)); if (walkableAt(tx, ty)) S.tables.push({ x: tx, y: ty }); }
  for (const a of rioters) { a.task = 'party'; a.hp = a.maxHp; a.cough = 0; }
  S.partyBeer = false;
}
function policeWin() {
  S.phase = 'sweep'; S.phaseT = 0; S.policeWins++;
  showToast('<b>CẢNH SÁT THẮNG ĐỢT NÀY!</b> Họ đang càn quét. Chạy và sống sót!', 3.6, 'cop');
  AUDIO.play('defeat'); MUSIC.play('chase');
}
function endSweep() {
  for (const c of cops) if (c.state === 'stunned') c.kos = 9; else if (c.state !== 'drag') c.state = 'retreat';
  for (const v of vehicles) if (v.kind === 'cannon' && !v.dead) v.retreat = true;
  const n = 9; reinforce(n);
  showToast('Hết ca! Cảnh sát về ăn trưa. <b>' + n + ' người</b> từ quán bar vừa kéo tới tiếp sức.', 3.6);
  S.phase = 'march'; S.phaseT = 0; MUSIC.play('riot');
}
function reinforce(n) {
  const s = route[S.block], prev = route[S.block - 1];
  const als = s.alleys.concat(prev ? prev.alleys : []);
  for (let i = 0; i < n; i++) {
    if (als.length && Math.random() < .7) { const a = pick(als); spawnRioter(a.x + rnd(-3, 3), a.y + rnd(-4, 4), null, a); }
    else { const cc = crowdCenter(); const back = s.dir === 'H' ? { x: s.start.x + 40, y: s.c * TILE + rnd(-40, 40) } : { x: s.c * TILE + rnd(-40, 40), y: s.start.y + s.sign * 40 }; const p = Math.random() < .5 ? back : { x: cc.x + rnd(-40, 40), y: cc.y + rnd(-20, 20) }; if (walkableAt(p.x, p.y)) spawnRioter(p.x, p.y); }
  }
  AUDIO.play('cheer', false);
}
function setupBlock(k) {
  S.block = k; ensureRoute(k);
  const s = route[k];
  S.bar = Object.assign({}, s.bar); S.rear = k >= 1 ? Object.assign({}, route[k - 1].rear) : null;
  if (k >= 2) pruneBefore(k - 1);
  vehicles = vehicles.filter(v => v.kind !== 'van' && !(v.dead && dist(v.x, v.y, player.x, player.y) > 600));
  spawnVehicle('van', s.van.x, s.van.y, s.van.orient, { state: 'parked' });
}
function nextBlock() {
  for (const v of vehicles) if (v.kind === 'food') { v.state = 'leave'; }
  S.food = null; S.tables = [];
  setupBlock(S.block + 1);
  reinforce(6);
  for (const a of rioters) { a.task = 'march'; a.ox = rnd(-70, 70); a.oy = rnd(-34, 34); }
  S.phase = 'march'; S.phaseT = 0;
  showToast('Khúc phố mới: <b>' + route[S.block].name + '</b>. Tiến lên!', 3);
  MUSIC.play('riot');
}
function updatePhase(dt) {
  S.phaseT += dt;
  const s = route[S.block], cc = crowdCenter();
  if (S.phase === 'march') {
    if ((dist(cc.x, cc.y, s.rally.x, s.rally.y) < 110 && S.phaseT > 6) || S.phaseT > (S.wave === 0 ? 16 : 13)) startBattle();
  } else if (S.phase === 'battle') {
    S.queueT += dt;
    while (S.queue.length && S.queue[0].d <= S.queueT) { if (cops.length >= MAX_COPS) { S.queue[0].d += 1; break; } spawnFromQueue(S.queue.shift()); }
    const cannonAlive = vehicles.some(v => v.kind === 'cannon' && !v.dead && !v.retreat);
    if (!S.queue.length && activeCops() === 0 && !cannonAlive && S.phaseT > 3) crowdWin();
    else if (activeCrowd() <= Math.max(3, Math.ceil(S.waveStartCrowd * 0.3))) policeWin();
    else if (S.tug > 0.82 && S.phaseT > 14 && !S.queue.length) { showToast('Cảnh sát <b>rút lui</b> trong hỗn loạn!', 2.5, 'cop'); for (const c of cops) if (c.state !== 'stunned' && c.state !== 'drag') c.state = 'retreat'; for (const v of vehicles) if (v.kind === 'cannon') v.retreat = true; }
  } else if (S.phase === 'party') {
    if (player.active && S.food && dist(player.x, player.y, S.food.x, S.food.y) < 70 && !S.partyBeer) { S.partyBeer = true; player.stam = 100; AUDIO.play('clink'); setTimeout(() => AUDIO.play('burp'), 500); floater(player.x, player.y - 34, 'BIA FREE! SỨC 100%', P.gold, true); }
    if (player.active && S.food && dist(player.x, player.y, S.food.x, S.food.y) < 90) player.stam = Math.min(100, player.stam + dt * 30);
    if (S.phaseT > 13) nextBlock();
  } else if (S.phase === 'sweep') {
    if (S.phaseT > 14) endSweep();
  }
  // tug of war
  let cp = player.active ? 3 : 0, pp = 0;
  for (const a of rioters) if (!a.gone) cp += 0.5 + a.hp / a.maxHp;
  for (const c of cops) if (!c.gone && c.state !== 'retreat') pp += (c.state === 'stunned' ? 0.4 : 1.2 * c.hp / c.maxHp) + (c.mounted ? 1.5 : 0);
  for (const v of vehicles) if (v.kind === 'cannon' && !v.dead && !v.retreat) pp += 6;
  pp += S.queue.length * 1.1;
  const target = S.phase === 'battle' || S.phase === 'sweep' ? cp / (cp + pp + 0.001) : 1;
  S.tug += (target - S.tug) * Math.min(1, dt * 2);
}

/* ================= VEHICLES ================= */
function updateVehicles(dt) {
  const cc = crowdCenter();
  for (let i = vehicles.length - 1; i >= 0; i--) {
    const v = vehicles[i]; v.flash -= dt; v.t += dt;
    if (v.kind === 'food') {
      if (v.state === 'drive') { const dx = v.tx - v.x, dy = v.ty - v.y, d = Math.hypot(dx, dy); if (d < 2) { v.state = 'parked'; AUDIO.play('honk'); } else { const sp = Math.min(120, d * 2 + 20); v.x += dx / d * sp * dt; v.y += dy / d * sp * dt; } }
      else if (v.state === 'leave') { v.x += (v.orient === 'h' ? 1 : 0) * 140 * dt; v.y += (v.orient === 'v' ? (route[S.block].dir === 'V' ? route[S.block].sign : 1) : 0) * 140 * dt; if (v.t > 8 || dist(v.x, v.y, player.x, player.y) > 700) { vehicles.splice(i, 1); continue; } }
      continue;
    }
    if (v.kind !== 'cannon' || v.dead) continue;
    const s = route[S.block];
    if (v.retreat) { const ex = s.dir === 'H' ? { x: s.bar.x + 120, y: v.y } : { x: v.x, y: s.bar.y + s.sign * 120 }; const dx = ex.x - v.x, dy = ex.y - v.y, d = Math.hypot(dx, dy); if (d < 6 || v.t > 40) { vehicles.splice(i, 1); continue; } v.x += dx / d * 50 * dt; v.y += dy / d * 50 * dt; continue; }
    // drive along the road axis toward the crowd, keep ~110px away
    let tgt = null, td = 170;
    const cands = rioters.filter(a => !a.gone && !a.grabbedBy); if (player.active && !player.grabbedBy) cands.push(player);
    for (const a of cands) { const d = dist(a.x, a.y, v.x, v.y - 16); if (d < td) { td = d; tgt = a; } }
    if (s.dir === 'H') { const want = clamp(cc.x + 110, s.start.x + 60, (S.bar ? S.bar.x : v.x) - 40); const dx = want - v.x; if (Math.abs(dx) > 4) { const nx = v.x + Math.sign(dx) * 26 * dt; const r = { x: nx - 32, y: v.y - 14, w: 64, h: 14 }; let blocked = false; for (const a of rioters) if (rectsOverlap(a.x - 4, a.y - 3, 8, 6, r)) { blocked = true; knock(a, v.x, v.y, 60, 0.1); } if (!blocked) v.x = nx; } }
    else { const want = s.sign > 0 ? clamp(cc.y + 120, -1e9, S.bar ? S.bar.y - 10 : 1e9) : clamp(cc.y - 90, S.bar ? S.bar.y + S.bar.h + 60 : -1e9, 1e9); const dy = want - v.y; if (Math.abs(dy) > 4) v.y += Math.sign(dy) * 26 * dt; }
    if (tgt && (S.phase === 'battle' || S.phase === 'sweep')) {
      v.sprayT -= dt;
      const nx = v.orient === 'h' ? v.x - 6 : v.x, ny = v.orient === 'h' ? v.y - 36 : v.y - 40;
      const ax = tgt.x + Math.sin(v.t * 3) * 10, ay = tgt.y - 8;
      if (v.sprayT <= 0) {
        v.sprayT = 0.05; const d = dist(ax, ay, nx, ny) || 1;
        spawnP({ x: nx, y: ny + 30, z: 30, vx: (ax - nx) / d * 260 + rnd(-10, 10), vy: (ay - ny) / d * 260 + rnd(-10, 10), vz: rnd(-10, 20), g: 60, col: Math.random() < .5 ? P.water : P.waterLt, s: 2, life: d / 260 + 0.1, bounce: false, decal: Math.random() < .3, type: 'water' });
        if (Math.random() < .25) AUDIO.play('water');
        const hitList = rioters.concat(player.active ? [player] : []);
        for (const a of hitList) {
          const px = a.x - nx, py = a.y - 8 - ny, lx = ax - nx, ly = ay - ny, L2 = lx * lx + ly * ly || 1; const t = clamp((px * lx + py * ly) / L2, 0, 1.15);
          const qx = nx + lx * t, qy = ny + ly * t; if (dist(a.x, a.y - 8, qx, qy) < 11) {
            if (a === player) { if (player.dashT <= 0 && !player.grabbedBy) { player.stam -= 1.2; player.hitT = 0; player.wet = 1; knock(player, nx, ny, 70, 0.08); } }
            else { a.wet = 1.5; knock(a, nx, ny, 90, 0.1); if (Math.random() < 0.04) a.down = 1; }
          }
        }
      }
    }
  }
  // horses that lost their rider, loose bikes
  for (let i = runaway.length - 1; i >= 0; i--) { const h = runaway[i]; h.t += dt; h.x += h.vx * dt; if (h.t > 4) runaway.splice(i, 1); }
}

/* ================= MAIN UPDATE ================= */
function updateGame(dt) {
  rebuildSolids(); rebuildAgentGrid();
  for (const p of props) { p.flash = Math.max(0, p.flash - dt); p.shake = Math.max(0, p.shake - dt); if (p.flipT > 0) p.flipT -= dt; if (p.flippable && p.state !== 'destroyed') { if (p.pushers >= 2) p.push += dt * 0.55 * p.pushers; else p.push = Math.max(0, p.push - dt * 0.4); if (p.pushers) p.shake = Math.max(p.shake, 0.05); if (p.push >= p.need) flipCar(p); } p.pushers = 0; }
  if (player.active) updatePlayer(dt);
  for (const a of rioters) updateRioter(a, dt);
  for (const c of cops) updateCop(c, dt);
  rioters = rioters.filter(a => !a.gone); cops = cops.filter(c => !c.gone);
  updateVehicles(dt); updateProjectiles(dt); updatePhase(dt);
  // ambient
  S.bubbleT -= dt; if (S.bubbleT <= 0) { S.bubbleT = rnd(0.6, 1.6); const a = pick(rioters); if (a && !a.say && S.phase !== 'party') bubble(a, pick(a.type === 'student' ? PLACARDS.concat(CHANTS) : CHANTS)); }
  S.honkT -= dt; if (S.honkT <= 0) { AUDIO.play('honk'); S.honkT = rnd(6, 14); }
  let near = 0; for (const a of rioters) if (Math.abs(a.x - cam.x - VW / 2) < VW && Math.abs(a.y - cam.y - VH / 2) < VH) near++;
  AUDIO.crowd(clamp(near / 18, 0, 1) * (S.phase === 'battle' ? 1 : 0.6));
}

/* ================= CAMERA ================= */
const cam = { x: 0, y: 0, sx: 0, sy: 0 };
function updateCamera(dt, snap) {
  let tx, ty;
  if (!player.active) { const cc = crowdCenter(); tx = cc.x - VW / 2; ty = cc.y - VH / 2 - 20; }
  else { tx = player.x + player.fx * 24 - VW / 2; ty = player.y - 14 + player.fy * 16 - VH * (VH > VW * 1.2 ? 0.6 : 0.5); }
  const k = snap ? 1 : Math.min(1, dt * (player.active ? 5 : 1.5));
  cam.x += (tx - cam.x) * k; cam.y += (ty - cam.y) * k;
  if (S.shakeT > 0) { S.shakeT -= dt; cam.sx = rnd(-1, 1) * S.shakeMag; cam.sy = rnd(-1, 1) * S.shakeMag; } else { cam.sx = cam.sy = 0; S.shakeMag = 0; }
}

/* ================= RENDER ================= */
function drawShadow(x, y, w) { ctx.fillStyle = P.shadow; ctx.fillRect(x - (w >> 1) + 1, y - 1, w - 2, 3); ctx.fillRect(x - (w >> 1), y, w, 1); }
function drawSprite(c, x, y, ax, ay, flip, alpha) {
  if (alpha !== undefined) ctx.globalAlpha = alpha;
  if (flip) { ctx.save(); ctx.translate(x, 0); ctx.scale(-1, 1); ctx.drawImage(c, -ax, y - ay); ctx.restore(); }
  else ctx.drawImage(c, x - ax, y - ay);
  if (alpha !== undefined) ctx.globalAlpha = 1;
}
function heldPose(a) { if (a.held === 'tv') return 'hold'; return null; }
function drawItem(name, hx, hy, ang, flip) {
  const it = ITEMS[name]; if (!it) return;
  ctx.save(); ctx.translate(Math.round(hx), Math.round(hy)); if (flip) ctx.scale(-1, 1); ctx.rotate(ang); ctx.drawImage(it.c, -it.px, -it.py); ctx.restore();
}
function drawHeld(a, X, Y, phase) {
  // phase 'back' draws items that sit behind the body, 'front' the others
  let name = a.beer ? 'beer' : a.held; if (!name) return;
  const flip = a.dir === 'left', side = a.dir === 'left' || a.dir === 'right', up = a.dir === 'up';
  if (name === 'shield') {
    if ((phase === 'back') !== up) return;
    if (side) drawItem('shield', X + (flip ? -5 : 5), Y - 4, 0, flip); else drawItem('shield', X, Y - 3, 0, false); return;
  }
  if (name.startsWith('sign:')) { if (phase !== 'front') return; drawItem(name, X + (side ? (flip ? -3 : 3) : 0), Y - 18, Math.sin(S.t * 4 + X) * 0.12, false); return; }
  if (name === 'tv') { if (phase !== 'front' || up) return; drawItem('tv', X, Y - 9, 0, false); return; }
  if (name === 'beer') { if (phase !== 'front') return; drawItem('beer', X + (flip ? -7 : 7), Y - (a.pose === 'cheer' ? 30 : 16), Math.sin(S.t * 5 + X) * 0.2, flip); return; }
  if (name === 'phone') { if (phase !== 'front') return; drawItem('phone', X + (flip ? -6 : 6), Y - 22, flip ? -0.25 : 0.25, false); return; }
  if ((phase === 'back') !== up) return;
  let hx, hy;
  if (a.dir === 'down') { hx = X + 6; hy = Y - 12; } else if (up) { hx = X - 6; hy = Y - 12; } else { hx = X + (flip ? -3 : 3); hy = Y - 12; }
  let ang;
  if (a.atkT > 0) { const k = 1 - a.atkT / ATK_DUR; const base = Math.atan2(a.fy, a.fx) + Math.PI / 2; ang = base - 1.5 + k * 2.6; drawItem(name, hx, hy, ang, false); return; }
  ang = a.dir === 'down' ? 0.5 : up ? -0.5 : 0.65;
  drawItem(name, hx, hy, ang, flip && side);
}
function drawAgent(a) {
  const X = Math.round(a.x), Y = Math.round(a.y - (a.z || 0)), Yg = Math.round(a.y);
  const lying = (a.kind === 'cop' && a.state === 'stunned') || (a.kind === 'rioter' && a.down > 0);
  if (a.kind === 'cop' && a.mounted && a.type === 'horse') {
    drawShadow(X, Yg, 30); const flip = a.fx < 0; const fr = a.moving ? ((a.anim * 0.8) | 0) % 4 : 0;
    drawSprite(horseSprite(fr), X, Y, 22, 37, flip);
    const rs = humanSprite(a.spec, 'side', 0, 'ride'); drawSprite(rs, X + (flip ? 2 : -2), Y - 14, HAX, HAY, flip);
    if (a.flash > 0) drawSprite(whiteOf(rs), X + (flip ? 2 : -2), Y - 14, HAX, HAY, flip, 0.7);
    if (a.atkT > 0 || true) drawItem('baton', X + (flip ? -6 : 6), Y - 30, flip ? -0.7 : 0.7, false);
    return drawOverhead(a, X, Y - 18);
  }
  if (a.kind === 'cop' && a.mounted && a.type === 'bike') {
    drawShadow(X, Yg, 24); const flip = a.fx < 0; const fr = ((a.anim * 0.8) | 0) % 4;
    drawSprite(bikeSprite(fr), X, Y, 17, 19, flip);
    const rs = humanSprite(a.spec, 'side', 0, 'ride'); drawSprite(rs, X + (flip ? 2 : -2), Y - 6, HAX, HAY, flip);
    if (a.flash > 0) drawSprite(whiteOf(rs), X + (flip ? 2 : -2), Y - 6, HAX, HAY, flip, 0.7);
    return drawOverhead(a, X, Y - 8);
  }
  drawShadow(X, Yg, lying ? 22 : 11);
  const dk = a.dir === 'left' || a.dir === 'right' ? 'side' : a.dir;
  const pose = a.pose === 'walk' ? (heldPose(a) || (a.grabbedBy ? 'cheer' : 'walk')) : a.pose;
  const spr = humanSprite(a.spec, lying ? 'down' : dk, lying ? 0 : a.frame, lying ? 'walk' : pose);
  if (lying) {
    ctx.save(); ctx.translate(X - 14, Y - 2); ctx.rotate(Math.PI / 2 * (a.x % 2 < 1 ? 1 : -1) * 0 + Math.PI / 2); ctx.drawImage(spr, -HAX, -HAY + 2); ctx.restore();
    if (a.kind === 'cop') { for (let i = 0; i < 3; i++) { const an = S.t * 5 + i * 2.1; R(ctx, Math.round(X + 10 + Math.cos(an) * 7), Math.round(Y - 10 + Math.sin(an) * 2), 2, 2, i === 1 ? '#fff' : P.gold); } }
    return;
  }
  const flip = a.dir === 'left';
  if (a.kind === 'player' && a.dashT > 0) drawSprite(spr, X - Math.round(a.ddx * 8), Y - Math.round(a.ddy * 5), HAX, HAY, flip, 0.35);
  drawHeld(a, X, Y, 'back');
  drawSprite(spr, X, Y, HAX, HAY, flip);
  if (a.flash > 0) drawSprite(whiteOf(spr), X, Y, HAX, HAY, flip, 0.75);
  if (a.paintCol && a.blind > 0) { R(ctx, X - 3, Y - 26, 6, 4, a.paintCol); R(ctx, X - 4, Y - 24, 2, 3, a.paintCol); }
  drawHeld(a, X, Y, 'front');
  drawOverhead(a, X, Y);
}
function drawOverhead(a, X, Y) {
  if (a.icon) drawNum(a.icon, X, Y - 42 + Math.round(Math.sin(S.t * 14)), P.red);
  if (a.cough > 0 && ((S.t * 4) | 0) % 2) { R(ctx, X + 5, Y - 30, 3, 3, 'rgba(200,230,180,.8)'); R(ctx, X + 8, Y - 33, 2, 2, 'rgba(200,230,180,.6)'); }
  if (a.paper > 0) { for (let i = 0; i < 3; i++) { R(ctx, X - 5 + i * 2, Y - 40 - i * 2, 8, 6, '#fff'); R(ctx, X - 5 + i * 2, Y - 40 - i * 2, 8, 1, '#ccc'); } }
  if (a.kind === 'player' && S.tier >= 3 && S.mode === 'playing') { const on = ((S.t * 3) | 0) % 2; ctx.font = '10px VT323'; ctx.textAlign = 'center'; ctx.fillStyle = '#000'; ctx.fillText('WANTED', X + 1, Y - 37); ctx.fillStyle = on ? P.red : P.gold; ctx.fillText('WANTED', X, Y - 38); ctx.textAlign = 'start'; }
}
function drawProp(p) {
  if (p.flippable) return drawCar(p);
  const st = p.state; const sp = propSprite(p.type, st, p.variant);
  let X = Math.round(p.x), Y = Math.round(p.y); if (p.shake > 0) X += Math.round(Math.sin(S.t * 90) * 1.5);
  if (p.type !== 'window') drawShadow(X, Y, Math.min(40, p.hr * 2));
  ctx.drawImage(sp.c, X - sp.ax, Y - sp.ay);
  if (p.flash > 0) { ctx.globalAlpha = 0.7; ctx.drawImage(whiteOf(sp.c), X - sp.ax, Y - sp.ay); ctx.globalAlpha = 1; }
}
function drawCar(p) {
  const st = p.state === 'destroyed' ? 'flipped' : (p.push > p.need * 0.5 ? 'damaged' : 'intact');
  const c = carSprite(p.model || 'sedan', p.col || '#d8473f', p.orient || 'h', st);
  let X = Math.round(p.x), Y = Math.round(p.y);
  const ax = p.orient === 'v' ? 14 : 26, ay = p.orient === 'v' ? 41 : 31;
  if (p.state !== 'destroyed' && p.push > 0) { X += Math.round(Math.sin(S.t * 40) * Math.min(2, p.push * 0.4)); Y -= Math.round(Math.abs(Math.sin(S.t * 20)) * Math.min(3, p.push * 0.4)); }
  ctx.fillStyle = P.shadow; ctx.fillRect(X - ax + 2, Y - 3, ax * 2 - 4, 4);
  if (p.flipT > 0) { const k = p.flipT / 0.5; ctx.save(); ctx.translate(X, Y - 10); ctx.scale(1, Math.max(0.1, Math.abs(Math.cos(k * Math.PI)))); ctx.drawImage(c, -ax, -ay + 10); ctx.restore(); }
  else ctx.drawImage(c, X - ax, Y - ay);
  if (p.flash > 0) { ctx.globalAlpha = 0.6; ctx.drawImage(whiteOf(c), X - ax, Y - ay); ctx.globalAlpha = 1; }
  if (p.state !== 'destroyed' && p.push > 0.3) { const w = 26, k = clamp(p.push / p.need, 0, 1); R(ctx, X - w / 2 - 1, Y - ay - 6, w + 2, 4, P.out); R(ctx, X - w / 2, Y - ay - 5, Math.round(w * k), 2, P.gold); }
}
function drawVehicle(v) {
  const st = v.dead ? 'destroyed' : 'ok';
  const c = truckSprite(v.kind, v.orient, st);
  const X = Math.round(v.x), Y = Math.round(v.y);
  const ax = v.orient === 'h' ? 36 : 20, ay = v.orient === 'h' ? 49 : 55;
  ctx.fillStyle = P.shadow; ctx.fillRect(X - ax + 4, Y - 3, ax * 2 - 8, 4);
  drawSprite(c, X, Y, ax, ay, false);
  if (v.flash > 0) drawSprite(whiteOf(c), X, Y, ax, ay, false, 0.6);
  if (!v.dead && v.kind !== 'food') { const on = ((S.t * 8) | 0) % 2; ctx.fillStyle = on ? 'rgba(255,59,79,.22)' : 'rgba(59,123,255,.22)'; ctx.fillRect(X - 14, Y - ay - 6, 28, 12); if (v.hp < v.maxHp) { const w = 30; R(ctx, X - w / 2 - 1, Y - ay - 10, w + 2, 4, P.out); R(ctx, X - w / 2, Y - ay - 9, Math.round(w * v.hp / v.maxHp), 2, P.red); } }
}
function drawBarrier(b, kind) {
  const s = route[S.block];
  const vertical = b.h > b.w;
  if (vertical) {
    const e = barrierSprite(true);
    for (let y = b.y + 6; y < b.y + b.h; y += 14) ctx.drawImage(e, b.x + 1, y - 20);
    for (let y = b.y; y < b.y + b.h; y += 4) R(ctx, b.x + 4, y - 10, 2, 2, ((y / 4) | 0) % 2 ? '#ffd23f' : '#1b1b22');
  } else {
    const f = barrierSprite(false);
    for (let x = b.x; x < b.x + b.w - 8; x += 32) ctx.drawImage(f, x, b.y - 12);
    for (let x = b.x; x < b.x + b.w; x += 4) R(ctx, x, b.y - 8, 4, 2, ((x / 4) | 0) % 2 ? '#ffd23f' : '#1b1b22');
  }
  const sx = vertical ? b.x - 22 : b.x + b.w / 2 - 28, sy = vertical ? b.y + b.h / 2 - 30 : b.y - 30;
  R(ctx, sx, sy, 56, 12, P.out); R(ctx, sx + 1, sy + 1, 54, 10, kind === 'rear' ? '#ffd23f' : '#2f5fd0');
  ctx.font = '9px VT323'; ctx.fillStyle = kind === 'rear' ? '#1b1b22' : '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(kind === 'rear' ? 'ROUTE BARRÉE' : 'POLICE · HALT', sx + 28, sy + 6.5); ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic';
  void s;
}
function drawGas(g) {
  const X = Math.round(g.x), Y = Math.round(g.y);
  R(ctx, X - 2, Y - 5, 5, 5, '#5a6070'); R(ctx, X - 2, Y - 5, 5, 1, '#8a909a'); R(ctx, X - 1, Y - 6, 3, 1, '#ffd23f');
  const r = g.r;
  for (let k = 0; k < 7; k++) {
    const an = k * 0.9 + g.t * 0.4, rr = r * (0.35 + (k % 3) * 0.2);
    const px = X + Math.cos(an) * r * 0.45, py = Y - 8 + Math.sin(an) * r * 0.25 - g.t * 2 % 6;
    ctx.globalAlpha = 0.22; ell(ctx, Math.round(px), Math.round(py), Math.round(rr), Math.round(rr * 0.6), '#d8ecc8'); ctx.globalAlpha = 1;
  }
}
function drawBubble(a) {
  if (!a.say) return;
  const X = Math.round(a.x), Y = Math.round(a.y) - (a.mounted ? 62 : 44);
  ctx.font = '10px VT323'; const w = Math.ceil(ctx.measureText(a.say.txt).width) + 6;
  R(ctx, X - w / 2 - 1, Y - 9, w + 2, 12, P.out); R(ctx, X - w / 2, Y - 8, w, 10, a.kind === 'cop' ? '#dbe6ff' : '#fff9e8');
  R(ctx, X - 1, Y + 2, 3, 2, P.out); R(ctx, X, Y + 2, 1, 1, a.kind === 'cop' ? '#dbe6ff' : '#fff9e8');
  ctx.fillStyle = a.kind === 'cop' ? '#1e3a8a' : '#2a1f2e'; ctx.textAlign = 'center'; ctx.fillText(a.say.txt, X, Y); ctx.textAlign = 'start';
}
function render() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  R(ctx, 0, 0, VW, VH, '#2a2533');
  const ox = Math.round(cam.x + cam.sx), oy = Math.round(cam.y + cam.sy);
  ctx.setTransform(1, 0, 0, 1, -ox, -oy);
  const vx0 = ox - 40, vy0 = oy - 40, vx1 = ox + VW + 40, vy1 = oy + VH + 120;
  for (let cy = Math.floor(oy / CPX); cy <= Math.floor((oy + VH) / CPX); cy++) for (let cx = Math.floor(ox / CPX); cx <= Math.floor((ox + VW) / CPX); cx++) {
    const c = getChunk(cx, cy, true); ctx.drawImage(chunkCanvas(c), cx * CPX, cy * CPX);
  }
  // fountain shimmer
  for (const s of route) if (s.plaza && s.plaza.cx && Math.abs(s.plaza.cx - ox - VW / 2) < VW) for (let i = 0; i < 14; i++) { const an = S.t * 0.8 + i * 0.45; R(ctx, Math.round(s.plaza.cx + Math.cos(an) * (14 + (i % 3) * 9)), Math.round(s.plaza.cy + 1 + Math.sin(an) * (6 + (i % 3) * 4)), 2, 1, P.waterLt); }
  for (const g of gasCans) { R(ctx, Math.round(g.x) - 1, Math.round(g.y), 3, 1, P.shadow); }
  const list = [];
  const inView = (x, y, w, h) => x + w > vx0 && x < vx1 && y + h > vy0 && y < vy1;
  for (const b of buildings) { const top = b.low ? 18 : 0, by = b.y + b.d - b.H - b.d - top; if (inView(b.x, by, b.w, b.d + b.H + top)) list.push({ y: b.y + b.d, b, f: drawBuildingEntry }); }
  for (const p of props) if (inView(p.x - 40, p.y - 70, 80, 80)) list.push({ y: p.y, f: () => drawProp(p) });
  for (const o of decor) if (inView(o.x - 30, o.y - 64, 60, 70)) list.push({ y: o.y, f: () => { const t = treeSprite(o.v); drawShadow(o.x, o.y, 20); ctx.drawImage(t, Math.round(o.x) - 24, Math.round(o.y) - 61); } });
  for (const t of S.tables) list.push({ y: t.y, f: () => ctx.drawImage(tableSprite(), Math.round(t.x) - 20, Math.round(t.y) - 18) });
  for (const v of vehicles) if (inView(v.x - 40, v.y - 60, 80, 70)) list.push({ y: v.y, f: () => drawVehicle(v) });
  for (const a of rioters) if (inView(a.x - 20, a.y - 50, 40, 56)) list.push({ y: a.y, f: () => drawAgent(a) });
  for (const c of cops) if (inView(c.x - 30, c.y - 70, 60, 76)) list.push({ y: c.y, f: () => drawAgent(c) });
  if (player.active) list.push({ y: player.y, f: () => drawAgent(player), isPlayer: true });
  for (const h of runaway) list.push({ y: h.y, f: () => drawSprite(horseSprite(((h.t * 8) | 0) % 4), Math.round(h.x), Math.round(h.y), 22, 37, h.vx < 0) });
  for (const k of looseBikes) list.push({ y: k.y, f: () => { ctx.save(); ctx.translate(Math.round(k.x), Math.round(k.y)); ctx.scale(1, 0.5); ctx.drawImage(bikeSprite(0), -17, -19); ctx.restore(); } });
  if (S.bar) list.push({ y: S.bar.y + S.bar.h, f: () => drawBarrier(S.bar, 'bar') });
  if (S.rear) list.push({ y: S.rear.y + S.rear.h, f: () => drawBarrier(S.rear, 'rear') });
  list.sort((a, b) => a.y - b.y);
  for (const d of list) d.b ? drawBuildingEntry(d.b) : d.f();
  for (const g of gasCans) drawGas(g);
  for (const p of projectiles) {
    const X = Math.round(p.x), Y = Math.round(p.y - p.z);
    R(ctx, Math.round(p.x) - 1, Math.round(p.y), 3, 1, P.shadow);
    if (p.type === 'tomato') { R(ctx, X - 2, Y - 2, 4, 4, P.out); R(ctx, X - 1, Y - 1, 3, 3, '#e8303f'); R(ctx, X, Y - 2, 1, 1, '#4c9a4f'); }
    else if (p.type === 'paint') { R(ctx, X - 2, Y - 2, 5, 5, P.out); R(ctx, X - 1, Y - 1, 3, 3, P.paint[(X + Y) % 6 | 0] || '#ff4f8b'); }
    else if (p.type === 'bottle') { ctx.save(); ctx.translate(X, Y); ctx.rotate(p.rot); R(ctx, -1, -4, 3, 8, P.out); R(ctx, 0, -3, 1, 6, '#5ab06a'); ctx.restore(); }
    else if (p.type === 'gas') { R(ctx, X - 2, Y - 2, 5, 4, '#5a6070'); spawnP({ x: p.x, y: p.y, z: p.z, vx: 0, vy: 0, vz: 4, g: 0, col: 'rgba(220,236,210,.6)', s: 2, life: .4, bounce: false, type: 'puff' }); }
  }
  for (const p of particles) {
    const a = p.type === 'smoke' || p.type === 'puff' ? Math.max(0, Math.min(1, p.life / 0.6)) : 1;
    if (a < 1) ctx.globalAlpha = a;
    ctx.fillStyle = p.col; const s = p.s | 0 || 1; ctx.fillRect(Math.round(p.x), Math.round(p.y - p.z), s, s);
    if (a < 1) ctx.globalAlpha = 1;
  }
  for (const a of bubbles) drawBubble(a);
  for (const f of floaters) { const k = f.t / 1.2; if (k > 0.75 && ((f.t * 20) | 0) % 2) continue; if (/^[0-9+x€.!? -]+$/.test(f.txt)) drawNum(f.txt, f.x, f.y - k * 18, f.col); else { ctx.font = (f.big ? 12 : 10) + 'px VT323'; ctx.textAlign = 'center'; ctx.fillStyle = P.out; ctx.fillText(f.txt, Math.round(f.x) + 1, Math.round(f.y - k * 18) + 1); ctx.fillStyle = f.col; ctx.fillText(f.txt, Math.round(f.x), Math.round(f.y - k * 18)); ctx.textAlign = 'start'; } }
  // struggle ring
  if (player.grabbedBy && strug) { const n = 22; for (let i = 0; i < n; i++) { const an = -Math.PI / 2 + i / n * 6.283; R(ctx, Math.round(player.x + Math.cos(an) * 13), Math.round(player.y - 10 + Math.sin(an) * 11), 1, 1, i / n < strug.prog ? P.gold : 'rgba(255,255,255,.4)'); } }
  // screen-space overlays
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (player.active && player.cough > 0) { ctx.fillStyle = 'rgba(190,220,160,.18)'; ctx.fillRect(0, 0, VW, VH); }
  if (player.active && player.stam < 25 && ((S.t * 3) | 0) % 2) { ctx.fillStyle = 'rgba(255,59,79,.25)'; ctx.fillRect(0, 0, VW, 3); ctx.fillRect(0, VH - 3, VW, 3); ctx.fillRect(0, 0, 3, VH); ctx.fillRect(VW - 3, 0, 3, VH); }
  if (S.mode === 'playing') drawIndicators(ox, oy);
}
function drawBuildingEntry(b) {
  const img = buildingImage(b), top = b.low ? 18 : 0;
  const dx = b.x, dy = b.y + b.d - b.H - b.d - top;
  let alpha = 1;
  if (player.active && player.y < b.y + b.d && player.x > b.x - 4 && player.x < b.x + b.w + 4 && player.y > dy + 10) alpha = 0.45;
  if (alpha < 1) ctx.globalAlpha = alpha;
  ctx.drawImage(img, dx, dy);
  if (alpha < 1) ctx.globalAlpha = 1;
}
function edgeArrow(sx, sy, col, label) {
  const cx = VW / 2, cy = VH / 2, an = Math.atan2(sy - cy, sx - cx);
  const ex = clamp(sx, 10, VW - 11), ey = clamp(sy, 64, VH - 11);
  ctx.fillStyle = P.out; ctx.fillRect(Math.round(ex) - 3, Math.round(ey) - 3, 7, 7);
  ctx.fillStyle = col; ctx.fillRect(Math.round(ex) - 2, Math.round(ey) - 2, 5, 5);
  ctx.fillStyle = '#fff'; ctx.fillRect(Math.round(ex + Math.cos(an) * 4), Math.round(ey + Math.sin(an) * 4), 2, 2);
  if (label) { ctx.font = '10px VT323'; ctx.textAlign = 'center'; ctx.fillStyle = P.out; ctx.fillText(label, Math.round(ex - Math.cos(an) * 14) + 1, Math.round(ey - Math.sin(an) * 12) + 4); ctx.fillStyle = col; ctx.fillText(label, Math.round(ex - Math.cos(an) * 14), Math.round(ey - Math.sin(an) * 12) + 3); ctx.textAlign = 'start'; }
}
function drawIndicators(ox, oy) {
  const on = ((S.t * 6) | 0) % 2;
  for (const c of cops) { if (c.target !== player || c.state === 'retreat' || c.state === 'stunned') continue; const sx = c.x - ox, sy = c.y - 10 - oy; if (sx >= 0 && sx < VW && sy >= 0 && sy < VH) continue; edgeArrow(sx, sy, on ? P.red : P.blue); }
  const cc = crowdCenter(); const sx = cc.x - ox, sy = cc.y - oy;
  if (cc.n && (sx < -20 || sx > VW + 20 || sy < -20 || sy > VH + 20)) edgeArrow(sx, sy, P.hot, 'ĐÁM ĐÔNG');
  if (S.phase === 'party' && S.food) { const fx = S.food.x - ox, fy = S.food.y - oy; if (fx < 0 || fx > VW || fy < 0 || fy > VH) edgeArrow(fx, fy, '#f2b636', 'BIA'); }
}

/* ================= UI ================= */
const $ = id => document.getElementById(id);
let hudCache = {};
function setText(id, v) { if (hudCache[id] !== v) { hudCache[id] = v; $(id).textContent = v; } }
let toastTimer = 0;
function showToast(html, secs, cls) { const el = $('toast'); el.innerHTML = html; el.className = 'on' + (cls ? ' ' + cls : ''); toastTimer = secs; }
function updateToast(dt) { if (toastTimer > 0) { toastTimer -= dt; if (toastTimer <= 0) $('toast').classList.remove('on'); } }
const PHASE_NAMES = { march: 'TIẾN VỀ RÀO CHẮN', battle: 'GIAO TRANH', party: 'NHẬU MỪNG CHIẾN THẮNG', sweep: 'CẢNH SÁT CÀN QUÉT' };
function updateHUD() {
  setText('score', fmtNum(S.score));
  setText('fine', fmtEur(S.fine));
  setText('tier', TIERS[S.tier][1]); if (hudCache.tc !== S.tier) { hudCache.tc = S.tier; $('tier').className = 't' + S.tier; }
  setText('phase', (S.phase === 'battle' || S.phase === 'sweep' ? 'ĐỢT ' + S.wave + ' · ' : '') + PHASE_NAMES[S.phase]);
  setText('crowdN', String(activeCrowd() + (player.active ? 1 : 0)));
  setText('copN', String(activeCops() + S.queue.length));
  const tw = Math.round(S.tug * 100); if (hudCache.tw !== tw) { hudCache.tw = tw; $('tugBar').style.width = tw + '%'; }
  setText('blockLbl', 'Khúc phố ' + (S.block + 1) + ' · ' + route[S.block].name);
  const sw = Math.round(player.stam); if (hudCache.sw !== sw) { hudCache.sw = sw; $('stamBar').style.width = sw + '%'; $('stamBar').classList.toggle('low', sw < 25); }
  const comboLive = S.combo > 1 && S.runT - S.lastDestroyT < COMBO_WINDOW;
  if (hudCache.co !== comboLive) { hudCache.co = comboLive; $('combo').classList.toggle('on', comboLive); }
  if (comboLive) { setText('comboX', 'x' + Math.min(5, S.combo)); $('comboBar').style.width = Math.round((1 - (S.runT - S.lastDestroyT) / COMBO_WINDOW) * 100) + '%'; }
  const dr = player.dashCD <= 0; if (hudCache.dr !== dr) { hudCache.dr = dr; $('btnDash').classList.toggle('cd', !dr); }
  const tr = player.throwCD <= 0; if (hudCache.tr !== tr) { hudCache.tr = tr; $('btnThrow').classList.toggle('cd', !tr); }
}
function updateHint(dt) {
  const el = $('hint');
  if (S.mode !== 'playing') { if (hudCache.hint) { hudCache.hint = ''; el.classList.remove('on'); } return; }
  S.hintT += dt;
  let html = '';
  if (!S.firstHit && S.hintT > 0.8 && S.hintT < 30) html = isTouch ? 'Kéo nửa trái để đi · giữ <kbd>ĐẬP</kbd> cạnh đồ vật hoặc cảnh sát' : '<kbd>WASD</kbd> di chuyển · <kbd>Space</kbd> đập · <kbd>E</kbd> ném cà chua · <kbd>Shift</kbd> lướt';
  else if (S.firstHit && S.hintT < 40 && props.some(p => p.flippable && p.pushers >= 1 && dist(p.x, p.y, player.x, player.y) < 80 && p.state !== 'destroyed')) html = 'Cùng đám đông <kbd>' + (isTouch ? 'ĐẬP' : 'Space') + '</kbd> vào xe để <b>lật xe</b>!';
  if (hudCache.hint !== html) { hudCache.hint = html; el.innerHTML = html; el.classList.toggle('on', !!html); el.classList.toggle('touch', isTouch); }
}
function syncToggles() {
  const m = AUDIO.muted;
  $('btnMute').textContent = m ? '×' : '♪'; $('btnMute').classList.toggle('off', m);
  $('btnMenuMute').textContent = 'Âm thanh: ' + (m ? 'TẮT' : 'BẬT'); $('btnPauseMute').textContent = 'Âm thanh: ' + (m ? 'TẮT' : 'BẬT');
  $('btnMotion').textContent = 'Rung màn hình: ' + (reducedMotion ? 'TẮT' : 'BẬT'); $('btnPauseMotion').textContent = 'Rung: ' + (reducedMotion ? 'TẮT' : 'BẬT');
  $('bestMenu').textContent = fmtNum(best);
  $('strugTip').textContent = isTouch ? 'Bấm ĐẬP thật nhanh để vùng ra' : 'Space / J thật nhanh để vùng ra';
}
function toggleMute() { AUDIO.init(); AUDIO.setMuted(!AUDIO.muted); syncToggles(); }
function toggleMotion() { reducedMotion = !reducedMotion; lsSet('dapa_motion', reducedMotion ? '1' : '0'); syncToggles(); AUDIO.play('click'); }
function updateTouchUI() { $('touch').hidden = !(isTouch && S.mode === 'playing'); placeStickRest(); syncToggles(); }

/* ================= RUN LIFECYCLE ================= */
function resetWorld(attract) {
  chunks = new Map(); route = []; buildings = []; props = []; decor = [];
  rioters = []; cops = []; vehicles = []; projectiles = []; gasCans = []; particles = []; emitters = []; floaters = []; bubbles = []; runaway = []; looseBikes = [];
  groundCount = 0; strug = null;
  Object.assign(S, { t: S.t, runT: 0, score: 0, fine: 0, tier: 0, combo: 0, maxCombo: 1, lastDestroyT: -99, hitStop: 0, shakeT: 0, shakeMag: 0, block: 0, wave: 0, phase: 'march', phaseT: 0, crowdWins: 0, policeWins: 0, kos: 0, flips: 0, broken: 0, arrested: 0, waveStartCrowd: 0, queue: [], queueT: 0, firstHit: false, bubbleT: 2, tug: 0.5, rear: null, bar: null, food: null, tables: [], hintT: 0, partyBeer: false, arrestT: 0 });
  ensureRoute(0);
  const s0 = route[0];
  player = newPlayer((s0.lo + 9) * TILE, (s0.c + 3) * TILE); player.active = !attract; player.fx = 1; player.fy = 0; player.dir = 'right';
  setupBlock(0);
  for (let i = 0; i < 16; i++) { let x, y, k = 0; do { x = (s0.lo + 4 + Math.random() * 16) * TILE; y = (s0.c - 3 + Math.random() * 6) * TILE; k++; } while ((!walkableAt(x, y) || solidAt(x, y, 4, 3)) && k < 20); spawnRioter(x, y); }
  updateCamera(0, true);
  hudCache = {};
}
let overShown = false;
function startGame() {
  AUDIO.init(); AUDIO.play('click'); AUDIO.suspend(false);
  resetWorld(false); S.mode = 'playing'; overShown = false;
  $('menu').hidden = true; $('over').hidden = true; $('pause').hidden = true; $('hud').hidden = false; $('struggle').hidden = true;
  updateTouchUI(); toastTimer = 0; $('toast').className = '';
  MUSIC.start(); MUSIC.play('riot');
  setTimeout(() => { if (S.mode === 'playing') showToast('Chào mừng tới <b>Saint-Paperasse</b>! Cả thành phố đang biểu tình đòi… nghỉ trưa dài hơn.', 3.5); }, 400);
}
function pauseGame() { if (S.mode !== 'playing') return; S.mode = 'paused'; $('pause').hidden = false; AUDIO.suspend(true); $('touch').hidden = true; input.touchHit = false; input.mouseDown = false; syncToggles(); }
function resumeGame() { if (S.mode !== 'paused') return; S.mode = 'playing'; $('pause').hidden = true; AUDIO.init(); AUDIO.suspend(false); updateTouchUI(); last = performance.now(); }
function arrestPlayer() {
  if (S.mode !== 'playing') return;
  S.mode = 'arrest'; S.arrestT = 0; $('struggle').hidden = true; $('touch').hidden = true; input.touchHit = false;
  MUSIC.stop(); AUDIO.play('arrest'); shake(3, 0.3);
  floater(player.x, player.y - 40, 'BỊ ÁP GIẢI!', P.red, true);
}
const VERDICTS = [
  'Phạt cảnh cáo. Tòa yêu cầu bị cáo viết bài luận 2.000 chữ: <b>“Vì sao tôi đứng gần đám đông”</b>, nộp kèm 3 bản sao có công chứng.',
  'Tuyên <b>120 giờ lao động công ích</b>: nhặt bã kẹo cao su trên Boulevard du Chaos bằng nhíp.',
  'Cấm bén mảng tới mọi quán cà phê có ghế ngoài trời trong <b>5 năm</b>. Croissant chỉ được mua mang đi.',
  'Trục xuất về nước kèm hóa đơn. Hãng bay thu thêm <b>phí hành lý quá khổ</b> cho cây búa hơi.',
  'Tòa không đủ giấy để in bản án nên tuyên <b>trắng án</b>. Hội đồng thành phố biểu quyết dựng tượng bị cáo cạnh tượng ngựa.'
];
function showCourt() {
  overShown = true; S.mode = 'over';
  const isBest = S.score > best; if (isBest) { best = S.score; lsSet('dapa_best2', String(best)); }
  $('verdict').innerHTML = 'Bị cáo, du khách đội <b>nón bảo hiểm vàng</b>, bị bắt quả tang cầm búa hơi tại ' + route[S.block].name + '. ' + VERDICTS[S.tier];
  $('oFine').textContent = fmtEur(S.fine); $('oScore').textContent = fmtNum(S.score);
  $('oBlocks').textContent = String(S.block); $('oWaves').textContent = S.wave + ' (thắng ' + S.crowdWins + ')';
  $('oKO').textContent = String(S.kos); $('oFlips').textContent = String(S.flips); $('oBroken').textContent = String(S.broken);
  $('oTime').textContent = fmtTime(S.runT); $('oBest').innerHTML = isBest ? '<span class="newbest">KỶ LỤC MỚI!</span>' : fmtNum(best);
  $('oTier').textContent = 'Danh hiệu: ' + TIERS[S.tier][1];
  $('over').hidden = false; $('hud').hidden = true; $('hint').classList.remove('on');
  setTimeout(() => $('btnAgain').focus(), 50);
}

/* ================= INPUT WIRING ================= */
addEventListener('keydown', e => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
  keys[e.code] = true;
  if (isTouch && !e.repeat && e.key && e.key.length) { isTouch = false; if (S.mode === 'playing') updateTouchUI(); }
  if (e.repeat) return;
  if (S.mode === 'playing') {
    if (e.code === 'Space' || e.code === 'KeyJ') input.attackPressed = true;
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyK') input.dashQ = true;
    if (e.code === 'KeyE' || e.code === 'KeyL') input.throwQ = true;
  }
  if (e.code === 'Escape' || e.code === 'KeyP') { if (S.mode === 'playing') pauseGame(); else if (S.mode === 'paused') resumeGame(); }
  if (e.code === 'KeyM') toggleMute();
  if ((e.code === 'Enter' || e.code === 'Space') && (S.mode === 'menu' || S.mode === 'over') && document.activeElement?.tagName !== 'BUTTON') startGame();
});
addEventListener('keyup', e => { keys[e.code] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; input.mouseDown = false; if (S.mode === 'playing') pauseGame(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && S.mode === 'playing') pauseGame(); });
function setAim(cx, cy) { const r = cv.getBoundingClientRect(); input.aimX = (cx - r.left) / r.width * VW + Math.round(cam.x); input.aimY = (cy - r.top) / r.height * VH + Math.round(cam.y); }
cv.addEventListener('mousedown', e => { if (S.mode !== 'playing') return; setAim(e.clientX, e.clientY); if (e.button === 2) { input.throwQ = true; return; } input.mouseDown = true; input.attackPressed = true; });
cv.addEventListener('mousemove', e => { if (input.mouseDown) setAim(e.clientX, e.clientY); });
cv.addEventListener('contextmenu', e => e.preventDefault());
addEventListener('mouseup', () => { input.mouseDown = false; });
const elStick = $('stick'), elKnob = $('knob'), elZone = $('stickZone');
function placeStickRest() { elStick.style.left = '84px'; elStick.style.top = (wrap.clientHeight - 100) + 'px'; elKnob.style.transform = 'translate(0,0)'; }
elZone.addEventListener('pointerdown', e => { e.preventDefault(); if (stick.id !== null) return; stick.id = e.pointerId; stick.ox = e.clientX; stick.oy = e.clientY; stick.dx = stick.dy = 0; const r = wrap.getBoundingClientRect(); elStick.style.left = (e.clientX - r.left) + 'px'; elStick.style.top = (e.clientY - r.top) + 'px'; elZone.setPointerCapture(e.pointerId); });
elZone.addEventListener('pointermove', e => { if (e.pointerId !== stick.id) return; let dx = e.clientX - stick.ox, dy = e.clientY - stick.oy; const d = Math.hypot(dx, dy), M = 40; if (d > M) { dx = dx / d * M; dy = dy / d * M; } stick.dx = dx / M; stick.dy = dy / M; elKnob.style.transform = `translate(${dx}px,${dy}px)`; });
const endStick = e => { if (e.pointerId !== stick.id) return; stick.id = null; stick.dx = stick.dy = 0; placeStickRest(); };
elZone.addEventListener('pointerup', endStick); elZone.addEventListener('pointercancel', endStick);
const btnHit = $('btnHit');
btnHit.addEventListener('pointerdown', e => { e.preventDefault(); input.touchHit = true; input.attackPressed = true; btnHit.classList.add('down'); try { btnHit.setPointerCapture(e.pointerId); } catch (er) {} });
const hitUp = () => { input.touchHit = false; btnHit.classList.remove('down'); };
btnHit.addEventListener('pointerup', hitUp); btnHit.addEventListener('pointercancel', hitUp);
$('btnDash').addEventListener('pointerdown', e => { e.preventDefault(); if (S.mode === 'playing') input.dashQ = true; });
$('btnThrow').addEventListener('pointerdown', e => { e.preventDefault(); if (S.mode === 'playing') input.throwQ = true; });
addEventListener('touchstart', () => { if (!isTouch) { isTouch = true; if (S.mode === 'playing') updateTouchUI(); } }, { passive: true });
$('btnPlay').addEventListener('click', startGame);
$('btnAgain').addEventListener('click', startGame);
$('btnRestart').addEventListener('click', startGame);
$('btnResume').addEventListener('click', resumeGame);
$('btnPause').addEventListener('click', () => { AUDIO.play('click'); pauseGame(); });
$('btnMute').addEventListener('click', toggleMute);
$('btnMenuMute').addEventListener('click', toggleMute);
$('btnPauseMute').addEventListener('click', toggleMute);
$('btnMotion').addEventListener('click', toggleMotion);
$('btnPauseMotion').addEventListener('click', toggleMotion);

/* ================= LOOP ================= */
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (S.mode !== 'paused') {
    S.t += dt;
    let sim = dt;
    if (S.mode === 'playing' && S.hitStop > 0) { S.hitStop -= dt; sim = 0; }
    if (S.mode === 'arrest') { S.arrestT += dt; sim = dt * 0.35; if (S.arrestT > 2.2 && !overShown) showCourt(); }
    if (S.mode === 'over' || S.mode === 'menu') sim = dt;
    if (sim > 0) {
      if (S.mode === 'playing') S.runT += sim;
      updateGame(sim); updateParticles(sim);
    }
    updateCamera(dt);
    if (S.mode === 'playing') updateHUD();
    updateToast(dt); updateHint(dt);
  }
  render();
  requestAnimationFrame(frame);
}
function boot() {
  resize(); buildItems(); syncToggles();
  resetWorld(true);
  if (/[?&]debug/.test(location.search)) window.__dapa = { S, get player() { return player; }, get rioters() { return rioters; }, get cops() { return cops; }, get props() { return props; }, get vehicles() { return vehicles; }, get route() { return route; }, keys, input, startGame, crowdWin, policeWin, startBattle };
  requestAnimationFrame(t => { last = t; frame(t); });
}
const fontReady = (document.fonts && document.fonts.load) ? Promise.all([document.fonts.load('10px VT323'), document.fonts.load('10px Silkscreen')]) : Promise.resolve();
Promise.race([fontReady, new Promise(r => setTimeout(r, 1500))]).then(boot, boot);
addEventListener('resize', () => placeStickRest());
