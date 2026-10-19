/* ================= SPRITES ================= */
const SPR = new Map();
function outline(c, col = P.out) {
  const g = c.getContext('2d'); const w = c.width, h = c.height;
  const id = g.getImageData(0, 0, w, h), d = id.data; const src = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) src[i] = d[i * 4 + 3] > 40 ? 1 : 0;
  const [r, gg, b] = hexRgb(col);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x; if (src[i]) continue;
    if ((x > 0 && src[i - 1]) || (x < w - 1 && src[i + 1]) || (y > 0 && src[i - w]) || (y < h - 1 && src[i + w])) { d[i * 4] = r; d[i * 4 + 1] = gg; d[i * 4 + 2] = b; d[i * 4 + 3] = 255; }
  }
  g.putImageData(id, 0, 0); return c;
}
function whiteOf(c) {
  if (c._white) return c._white;
  const w = mkCanvas(c.width, c.height), g = w.getContext('2d'); g.drawImage(c, 0, 0);
  g.globalCompositeOperation = 'source-atop'; g.fillStyle = '#fff'; g.fillRect(0, 0, w.width, w.height);
  c._white = w; return w;
}
function silOf(c, col) {
  const k = '_sil' + col; if (c[k]) return c[k];
  const w = mkCanvas(c.width, c.height), g = w.getContext('2d'); g.drawImage(c, 0, 0);
  g.globalCompositeOperation = 'source-atop'; g.fillStyle = col; g.fillRect(0, 0, w.width, w.height);
  c[k] = w; return w;
}

/* ---------- people specs ---------- */
const SKINS = ['#f6d3b3', '#efc19a', '#e0a77e', '#c98c62', '#a8714c', '#8a5a3c', '#6b4430'];
const HAIRS = ['#2a1d18', '#4a3020', '#7a4a28', '#c8963e', '#e6c46a', '#9a9aa2', '#b8432c', '#1c1c24'];
let specSeq = 0;
function baseSpec(o) { return Object.assign({ id: 's' + (specSeq++), skin: pick(SKINS), hair: pick(HAIRS), hairStyle: 'short', head: null, headCol: '#333', top: '#888', top2: '#fff', pattern: 'plain', sleeves: 'long', pants: '#3a4466', legs: 'jeans', shoe: '#2a2230', belly: false, glasses: null, beard: false, moustache: false, mask: null, chain: false, extra: null }, o); }
const TIEDYE = ['#ff5a7a', '#ffb03a', '#ffe14a', '#5fe08a', '#4ab8ff', '#b47aff'];
function makeSpec(kind) {
  switch (kind) {
    case 'player': return baseSpec({ id: 'player', skin: '#f2c49b', hair: '#2a1d18', hairStyle: 'short', head: 'moto', top: '#ff7a1a', pattern: 'hoodie', pants: '#3a4466', shoe: '#22202c' });
    case 'hippie': return baseSpec({ hairStyle: pick(['long', 'long', 'afro']), head: Math.random() < .7 ? 'flower' : 'band', headCol: pick(['#ff6b8a', '#ffe14a', '#5fe08a']), pattern: pick(['tiedye', 'tiedye', 'floral']), top: pick(['#ffb03a', '#e65a8a', '#7ac']), top2: '#fff7c0', legs: 'flare', pants: pick(['#4a6fb0', '#6a8ac8', '#a67b5b']), glasses: pick(['round', 'round', 'sun', null]), beard: Math.random() < .3, shoe: '#7a5a3a' });
    case 'gangster': { const track = Math.random() < .45; return baseSpec({ hairStyle: pick(['short', 'bald', 'comb']), head: pick(['capback', 'beanie', 'cap', null]), headCol: pick(['#222', '#c33', '#fff', '#2a4a8a']), top: track ? pick(['#2a3a8a', '#1a1a1e', '#8a1a2a', '#2a6a3a']) : '#23202a', pattern: track ? 'track' : 'leather', top2: '#fff', pants: track ? '#23202a' : '#2a2e40', glasses: Math.random() < .7 ? 'sun' : null, chain: Math.random() < .6, shoe: '#f2f2f2', mask: Math.random() < .3 ? 'bandana' : null, maskCol: pick(['#c33', '#222', '#2a4a8a']) }); }
    case 'punk': return baseSpec({ hairStyle: 'mohawk', hair: pick(['#ff3fae', '#5fe08a', '#4ab8ff', '#ffe14a', '#ff5a3a']), pattern: 'studs', top: '#1e1c24', top2: '#c9ced8', pants: pick(['#3a4466', '#2a2a30', '#6a2a2a']), legs: 'ripped', shoe: '#111', chain: Math.random() < .4 });
    case 'uncle': return baseSpec({ hairStyle: pick(['bald', 'bald', 'comb']), hair: pick(['#4a3020', '#9a9aa2', '#2a1d18']), moustache: true, belly: true, pattern: pick(['tank', 'polo', 'stripes']), sleeves: 'none', top: pick(['#f2f2f2', '#e8d27a', '#8ac0e0', '#e88a6a']), top2: '#2a4a8a', legs: 'shorts', pants: pick(['#c9a46a', '#5a6a3a', '#3a4466']), shoe: '#6a4a2a' });
    case 'influencer': return baseSpec({ hairStyle: pick(['bun', 'long']), hair: pick(['#e6c46a', '#2a1d18', '#c8963e', '#ff8fb1']), pattern: 'hoodie', top: pick(['#ff8fb1', '#b9a6ff', '#9ee6d0']), pants: '#f2f0f4', shoe: '#ffffff', glasses: Math.random() < .5 ? 'sun' : null });
    case 'grandma': return baseSpec({ skin: pick(SKINS.slice(0, 4)), hairStyle: 'bun', hair: '#d8d8de', head: Math.random() < .5 ? 'kerchief' : null, headCol: pick(['#c33', '#6a5acd', '#2a8a6a']), pattern: 'floral', top: pick(['#6a5acd', '#2a6a8a', '#8a3a5a', '#5a7a3a']), top2: pick(['#ffe14a', '#fff', '#ff8fb1']), legs: 'skirt', pants: '#d9c4a0', glasses: 'round', shoe: '#3a2a2a' });
    case 'student': return baseSpec({ hairStyle: pick(['short', 'long', 'bun', 'afro']), head: Math.random() < .5 ? 'beanie' : null, headCol: pick(['#c33', '#2a6a3a', '#e8d27a', '#333']), pattern: 'hoodie', top: pick(['#5a6a8a', '#3a7a5a', '#8a5a3a', '#6a6a6a', '#a33']), pants: pick(['#3a4466', '#2a2a30']), mask: Math.random() < .35 ? 'bandana' : null, maskCol: pick(['#222', '#a33', '#3a5aa0']), shoe: '#e8e8e8' });
    case 'officer': return baseSpec({ id: 'officer', skin: pick(SKINS), hairStyle: 'short', head: 'kepi', pattern: 'police', top: '#25366e', top2: '#d7ff3a', pants: '#1b2550', shoe: '#111' });
    case 'riot': return baseSpec({ hairStyle: 'short', head: 'riot', pattern: 'armor', top: '#262b3a', top2: '#3a4258', pants: '#1f2330', legs: 'armor', shoe: '#111' });
    case 'gasser': return baseSpec({ hairStyle: 'short', head: 'riot', mask: 'gas', pattern: 'armor', top: '#3a4030', top2: '#555c44', pants: '#2a2e22', legs: 'armor', shoe: '#111' });
    case 'biker': return baseSpec({ hairStyle: 'short', head: 'bikehelm', pattern: 'police', top: '#8fb4e8', top2: '#d7ff3a', legs: 'shorts', pants: '#1b2550', shoe: '#111' });
    case 'rider': return baseSpec({ hairStyle: 'short', head: 'kepi', pattern: 'police', top: '#25366e', top2: '#d7ff3a', pants: '#e8e2d0', shoe: '#2a1a10' });
    case 'bureaucrat': return baseSpec({ hairStyle: pick(['comb', 'bald']), hair: pick(['#4a3020', '#9a9aa2']), pattern: 'suit', top: pick(['#5a5e6a', '#6a604e', '#4a4e5e']), top2: pick(['#a33', '#2a4a8a', '#4a7a3a']), pants: '#4a4e5a', glasses: 'round', moustache: Math.random() < .5, shoe: '#2a1a10' });
    case 'cook': return baseSpec({ hairStyle: 'short', head: 'chef', pattern: 'apron', top: '#f2f2f2', top2: '#e8d27a', belly: true, moustache: true, pants: '#3a3a44' });
  }
  return baseSpec({});
}

/* ---------- human renderer ---------- */
const HW = 32, HH = 48, HAX = 16, HAY = 45;
function drawHuman(g, X, Y, sp, dir, frame, pose) {
  const r = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(X + x, Y + y, w, h); };
  const skin = sp.skin, skinD = shade(skin, -0.16), skinDD = shade(skin, -0.32);
  const top = sp.top, topD = shade(top, -0.24), topL = shade(top, 0.14);
  const pants = sp.pants, pantsD = shade(pants, -0.25);
  const hair = sp.hair, hairD = shade(hair, -0.25);
  const walk = pose === 'walk', ph = walk ? frame : 0;
  const sit = pose === 'sit', ride = pose === 'ride';
  const by = (walk && (ph === 1 || ph === 3) ? -1 : 0) + (sit ? 5 : 0);
  const side = dir === 'side';
  const tW = side ? 8 : (sp.belly ? 12 : 10), tx = side ? -4 : -tW / 2;
  // ---------- legs ----------
  if (!sit && !ride) {
    if (side) {
      const s1 = ph === 1 ? 2 : ph === 3 ? -2 : 0;
      const legs = [[-2 - s1, pantsD], [-1 + s1, pants]];
      for (const [lx, col] of legs) {
        if (sp.legs === 'skirt') { r(lx + 1, -6, 2, 4, '#d9c4a0'); }
        else if (sp.legs === 'shorts') { r(lx, -11, 3, 4, col); r(lx, -7, 3, 5, skin); r(lx + 2, -7, 1, 5, skinD); }
        else { r(lx, -11, 3, 9, col); if (sp.legs === 'armor') r(lx, -7, 3, 2, '#555c6e'); if (sp.legs === 'flare') r(lx - 1, -4, 5, 2, col); if (sp.legs === 'ripped' && col === pants) r(lx + 1, -7, 1, 1, skin); }
        r(lx, -2, 5, 2, sp.shoe); r(lx, -2, 5, 1, shade(sp.shoe, 0.15));
      }
    } else {
      for (const s of [-1, 1]) {
        const lx = s < 0 ? -4 : 1;
        const lift = walk && ((s < 0 && ph === 1) || (s > 0 && ph === 3)) ? 2 : 0;
        const yb = -2 - lift;
        if (sp.legs === 'skirt') { r(lx + (s < 0 ? 1 : 0), -6 - lift, 2, 4, '#d9c4a0'); }
        else if (sp.legs === 'shorts') { r(lx, -11, 3, 4, pants); r(lx, -7, 3, 5 - lift, skin); r(lx + 2, -7, 1, 5 - lift, skinD); }
        else {
          r(lx, -11, 3, 9 - lift, pants); r(lx + 2, -11, 1, 9 - lift, pantsD);
          if (sp.legs === 'flare') r(lx + (s < 0 ? -1 : 0), yb - 2, 4, 2, pants);
          if (sp.legs === 'armor') { r(lx, -8, 3, 2, '#5a6278'); r(lx, -8, 3, 1, '#7a849a'); }
          if (sp.legs === 'ripped') { r(lx + 1, -7, 1, 1, skin); r(lx, -9, 1, 1, shade(pants, 0.3)); }
        }
        r(lx - (s < 0 ? 1 : 0), yb, 4, 2, sp.shoe); r(lx - (s < 0 ? 1 : 0), yb, 4, 1, shade(sp.shoe, 0.18));
      }
    }
  } else if (sit) {
    r(-5, -7, 10, 3, pants); r(-5, -4, 3, 3, pants); r(2, -4, 3, 3, pants); r(-6, -2, 4, 2, sp.shoe); r(2, -2, 4, 2, sp.shoe);
  } else if (ride) {
    r(-1, -12, 3, 8, pants); r(1, -6, 3, 3, pants); r(1, -4, 4, 2, sp.shoe);
  }
  // ---------- torso ----------
  const ty = -20 + by;
  r(tx, ty, tW, 10, top); r(tx, ty, tW, 1, topL); r(tx + tW - 2, ty + 1, 2, 9, topD);
  if (sp.belly) { if (side) r(tx + tW, ty + 3, 2, 6, top); else r(tx - 1, ty + 4, tW + 2, 5, top); }
  switch (sp.pattern) {
    case 'tiedye': for (let yy = 0; yy < 10; yy++) for (let xx = 0; xx < tW; xx++) r(tx + xx, ty + yy, 1, 1, TIEDYE[(((xx + yy) / 2 + Math.abs(xx - tW / 2) * 0.5) | 0) % 6]); r(tx + tW - 1, ty, 1, 10, 'rgba(0,0,0,.18)'); break;
    case 'floral': for (let i = 0; i < 9; i++) r(tx + ((i * 7) % tW), ty + 1 + ((i * 3) % 9), 1, 1, sp.top2); break;
    case 'stripes': for (let yy = 1; yy < 10; yy += 2) r(tx, ty + yy, tW, 1, sp.top2); break;
    case 'leather': r(side ? tx + 5 : -1, ty, 1, 10, '#8a8a92'); r(side ? tx + 6 : 0, ty, 1, 3, '#f2f2f2'); r(tx, ty, 2, 2, '#3a3640'); r(tx + tW - 2, ty, 2, 2, '#3a3640'); break;
    case 'track': r(tx, ty, 1, 10, sp.top2); r(tx + tW - 1, ty, 1, 10, sp.top2); if (!side) r(-1, ty, 2, 3, sp.top2); break;
    case 'studs': for (let i = 0; i < tW; i += 2) { r(tx + i, ty + 1, 1, 1, '#d8dde6'); } r(tx, ty + 3, tW, 6, '#3c5aa0'); r(tx, ty + 3, tW, 1, '#5a7ac0'); if (!side) { r(-1, ty + 3, 2, 6, '#1e1c24'); } for (let i = 1; i < tW; i += 3) r(tx + i, ty + 5, 1, 1, '#d8dde6'); break;
    case 'tank': if (!side) { r(tx + 2, ty, tW - 4, 2, skin); } break;
    case 'polo': if (!side) { r(-2, ty, 4, 2, '#fff'); r(0, ty + 2, 1, 2, '#fff'); } break;
    case 'hoodie': if (!side) { r(-3, ty + 6, 6, 2, topD); r(-2, ty + 1, 1, 3, '#eee'); r(1, ty + 1, 1, 3, '#eee'); } else r(tx + 1, ty - 1, 4, 2, topD); break;
    case 'police': r(tx, ty + 4, tW, 2, sp.top2); r(tx, ty + 4, tW, 1, '#f4ffc0'); if (!side) r(-3, ty + 1, 2, 2, '#ffd23f'); r(tx, ty + 8, tW, 2, '#111'); break;
    case 'armor': r(tx - 1, ty, 3, 4, sp.top2); r(tx + tW - 2, ty, 3, 4, sp.top2); r(tx + 1, ty + 4, tW - 2, 4, shade(top, 0.08)); r(tx, ty + 8, tW, 2, '#111'); if (!side) r(-2, ty + 5, 4, 1, '#cfd6e6'); break;
    case 'suit': if (!side) { r(-2, ty, 4, 6, '#f2f2f2'); r(-1, ty + 1, 2, 6, sp.top2); r(-1, ty + 1, 2, 1, shade(sp.top2, 0.3)); r(-3, ty, 1, 7, topD); r(2, ty, 1, 7, topD); } else { r(tx + 6, ty, 2, 5, '#f2f2f2'); } break;
    case 'apron': r(tx + 1, ty + 2, tW - 2, 8, '#fff'); r(tx + 1, ty + 2, tW - 2, 1, '#ddd'); break;
  }
  if (sp.legs === 'skirt') { if (side) r(-4, ty + 8, 9, 8, top); else r(-6, ty + 8, 12, 8, top); r(side ? -4 : -6, ty + 15, side ? 9 : 12, 1, topD); for (let i = 0; i < 5; i++) r((side ? -3 : -5) + ((i * 5) % (side ? 8 : 11)), ty + 9 + ((i * 3) % 6), 1, 1, sp.top2); }
  else if (sp.pattern !== 'police' && sp.pattern !== 'armor') r(tx, ty + 9, tW, 1, shade(pants, -0.35));
  if (sp.chain) { if (side) r(tx + 5, ty + 1, 2, 2, '#ffd23f'); else { r(-2, ty + 1, 4, 1, '#ffd23f'); r(-1, ty + 2, 2, 1, '#ffd23f'); } }
  // ---------- arms ----------
  const armCol = sp.sleeves === 'none' ? skin : (sp.pattern === 'tiedye' ? '#ffb03a' : sp.pattern === 'studs' ? '#1e1c24' : top);
  const armColD = shade(armCol, -0.2);
  if (side) {
    if (pose === 'cheer') { r(-1, ty - 8, 3, 9, armCol); r(-1, ty - 10, 3, 2, skin); }
    else if (pose === 'grab' || pose === 'hold') { r(0, ty + 2, 8, 3, armCol); r(8, ty + 2, 2, 3, skin); }
    else if (ride) { r(0, ty + 2, 6, 3, armCol); r(6, ty + 3, 2, 2, skin); }
    else { const s = ph === 1 ? -2 : ph === 3 ? 2 : 0; r(-1 + s, ty + 1, 3, 7, armCol); r(1 + s, ty + 1, 1, 7, armColD); r(-1 + s, ty + 8, 3, 2, skin); }
  } else {
    for (const s of [-1, 1]) {
      const ax = s < 0 ? tx - 2 - (sp.belly ? 1 : 0) : tx + tW + (sp.belly ? 1 : 0);
      if (pose === 'cheer') { r(ax, ty - 8, 2, 9, armCol); r(ax, ty - 10, 2, 2, skin); }
      else if (pose === 'grab' || pose === 'hold') { const ix = s < 0 ? ax + 2 : ax - 2; r(ix, ty + 3, 2, 7, armCol); r(ix, ty + 10, 2, 2, skin); }
      else { const sw = walk ? (ph === 1 ? s : ph === 3 ? -s : 0) : 0; r(ax, ty + 1 + sw, 2, 7, armCol); r(ax + (s > 0 ? 1 : 0), ty + 1 + sw, 1, 7, armColD); r(ax, ty + 8 + sw, 2, 2, skin); }
    }
  }
  // ---------- head ----------
  const hy = -29 + by;
  r(-1, hy + 8, 2, 1, skinD);
  if (side) { r(-3, hy, 7, 8, skin); r(-3, hy + 7, 7, 1, skinD); r(4, hy + 3, 1, 2, skinD); }
  else { r(-4, hy, 8, 8, skin); r(3, hy, 1, 8, skinD); r(-4, hy + 7, 8, 1, skinD); }
  // face
  if (dir === 'down') {
    r(-2, hy + 3, 1, 2, '#1b1420'); r(1, hy + 3, 1, 2, '#1b1420'); r(-2, hy + 3, 1, 1, '#4a4060');
    r(-1, hy + 6, 2, 1, skinDD);
    if (sp.beard) { r(-4, hy + 5, 8, 3, hair); r(-1, hy + 6, 2, 1, skinDD); }
    if (sp.moustache) r(-2, hy + 5, 4, 1, hair === '#d8d8de' ? '#bbb' : hairD);
    if (sp.glasses === 'sun') { r(-3, hy + 3, 7, 2, '#15121a'); r(-2, hy + 3, 1, 1, '#7aa8ff'); r(2, hy + 3, 1, 1, '#7aa8ff'); }
    if (sp.glasses === 'round') { r(-3, hy + 2, 3, 3, '#3a2a2a'); r(1, hy + 2, 3, 3, '#3a2a2a'); r(-2, hy + 3, 1, 1, '#cfefff'); r(2, hy + 3, 1, 1, '#cfefff'); }
    if (sp.mask === 'gas') { r(-4, hy + 1, 8, 7, '#5a6070'); r(-3, hy + 2, 2, 2, '#bff5e8'); r(1, hy + 2, 2, 2, '#bff5e8'); r(-1, hy + 5, 2, 3, '#2a2c34'); }
    if (sp.mask === 'bandana') { r(-4, hy + 4, 8, 4, sp.maskCol || '#c33'); r(-3, hy + 5, 1, 1, '#fff'); r(1, hy + 6, 1, 1, '#fff'); }
  } else if (side) {
    r(2, hy + 3, 1, 2, '#1b1420'); r(4, hy + 4, 1, 2, skinD); r(2, hy + 6, 2, 1, skinDD);
    if (sp.beard) r(-1, hy + 5, 5, 3, hair);
    if (sp.moustache) r(2, hy + 5, 3, 1, hairD);
    if (sp.glasses === 'sun') r(1, hy + 3, 4, 2, '#15121a');
    if (sp.glasses === 'round') { r(1, hy + 2, 3, 3, '#3a2a2a'); r(2, hy + 3, 1, 1, '#cfefff'); }
    if (sp.mask === 'gas') { r(0, hy + 1, 5, 7, '#5a6070'); r(2, hy + 2, 2, 2, '#bff5e8'); r(4, hy + 5, 2, 3, '#2a2c34'); }
    if (sp.mask === 'bandana') r(0, hy + 4, 5, 4, sp.maskCol || '#c33');
  }
  // hair
  const back = dir === 'up';
  switch (sp.hairStyle) {
    case 'short': if (side) { r(-3, hy - 1, 7, 3, hair); r(-3, hy + 2, 3, 3, hair); } else { r(-4, hy - 1, 8, 3, hair); r(-4, hy + 2, 1, 2, hair); r(3, hy + 2, 1, 2, hair); if (back) r(-4, hy, 8, 7, hair); } r(-3, hy - 1, 3, 1, shade(hair, 0.2)); break;
    case 'long': if (side) { r(-4, hy - 1, 7, 3, hair); r(-4, hy + 2, 3, 10, hair); } else { r(-5, hy - 1, 10, 3, hair); r(-5, hy + 2, 2, 10, hair); r(3, hy + 2, 2, 10, hair); if (back) r(-5, hy, 10, 12, hair); } r(-3, hy - 1, 3, 1, shade(hair, 0.2)); break;
    case 'afro': if (side) { r(-5, hy - 4, 10, 8, hair); r(-5, hy + 4, 5, 3, hair); } else { r(-6, hy - 4, 12, 6, hair); r(-6, hy + 2, 2, 4, hair); r(4, hy + 2, 2, 4, hair); if (back) r(-6, hy - 4, 12, 11, hair); } r(-4, hy - 4, 4, 1, shade(hair, 0.2)); break;
    case 'mohawk': if (side) r(-2, hy - 6, 5, 6, hair); else { r(-1, hy - 6, 2, 7, hair); r(-4, hy, 8, 1, skinD); } r(-1, hy - 6, 1, 6, shade(hair, 0.3)); break;
    case 'bun': if (side) { r(-3, hy - 1, 7, 3, hair); r(-5, hy - 2, 3, 3, hair); r(-3, hy + 2, 3, 3, hair); } else { r(-4, hy - 1, 8, 3, hair); r(-2, hy - 4, 4, 3, hair); r(-4, hy + 2, 1, 2, hair); r(3, hy + 2, 1, 2, hair); if (back) r(-4, hy, 8, 7, hair); } break;
    case 'bald': r(side ? -1 : -2, hy, 2, 1, shade(skin, 0.25)); if (side) r(-3, hy + 2, 2, 3, hair); else { r(-4, hy + 2, 1, 3, hair); r(3, hy + 2, 1, 3, hair); } break;
    case 'comb': if (side) { r(-3, hy - 1, 7, 2, hair); r(-3, hy + 1, 2, 4, hair); } else { r(-4, hy - 1, 8, 2, hair); r(-4, hy + 1, 1, 3, hair); r(3, hy + 1, 1, 3, hair); if (back) r(-4, hy, 8, 6, hair); } break;
  }
  // headwear
  const hc = sp.headCol;
  switch (sp.head) {
    case 'flower': r(-4, hy + 1, 8, 1, '#5aa04a'); r(-3, hy, 1, 1, '#ff6b8a'); r(0, hy, 1, 1, '#ffe14a'); r(2, hy, 1, 1, '#fff'); break;
    case 'band': r(side ? -3 : -4, hy + 1, side ? 7 : 8, 1, hc); break;
    case 'beanie': r(side ? -4 : -5, hy - 3, side ? 8 : 10, 4, hc); r(side ? -4 : -5, hy, side ? 8 : 10, 1, shade(hc, -0.25)); r(-1, hy - 4, 2, 1, '#eee'); break;
    case 'cap': r(side ? -3 : -5, hy - 2, side ? 7 : 10, 3, hc); if (side) r(4, hy, 3, 1, shade(hc, -0.3)); else if (!back) r(-5, hy + 1, 10, 1, shade(hc, -0.3)); break;
    case 'capback': r(side ? -3 : -5, hy - 2, side ? 7 : 10, 3, hc); if (side) r(-5, hy, 2, 1, shade(hc, -0.3)); else if (!back) r(-1, hy - 2, 2, 1, '#eee'); else r(-4, hy + 1, 8, 1, shade(hc, -0.3)); break;
    case 'kerchief': r(side ? -4 : -5, hy - 2, side ? 8 : 10, 4, hc); if (!side) { r(-5, hy + 2, 2, 4, hc); r(3, hy + 2, 2, 4, hc); } r(-3, hy - 1, 1, 1, '#fff'); r(1, hy, 1, 1, '#fff'); break;
    case 'moto': if (side) { r(-4, hy - 3, 9, 6, '#ffd23f'); r(-3, hy - 3, 4, 1, '#fff1a8'); r(4, hy, 2, 1, '#c9a52a'); r(-4, hy + 3, 1, 3, '#c9a52a'); } else { r(-5, hy - 3, 10, 6, '#ffd23f'); r(-4, hy - 3, 4, 1, '#fff1a8'); if (!back) r(-5, hy + 2, 10, 1, '#c9a52a'); r(-5, hy + 3, 1, 3, '#c9a52a'); r(4, hy + 3, 1, 3, '#c9a52a'); } break;
    case 'kepi': if (side) { r(-3, hy - 3, 7, 4, '#1b2550'); r(-3, hy, 7, 1, '#c9a52a'); r(4, hy + 1, 2, 1, '#0d1228'); } else { r(-5, hy - 3, 10, 4, '#1b2550'); r(-5, hy, 10, 1, '#c9a52a'); if (!back) { r(-1, hy - 2, 2, 2, '#ffd23f'); r(-5, hy + 1, 10, 1, '#0d1228'); } } break;
    case 'bikehelm': r(side ? -4 : -5, hy - 3, side ? 9 : 10, 4, '#f2f4f8'); r(side ? -3 : -4, hy - 3, 3, 1, '#ffffff'); r(side ? 0 : -2, hy - 2, 1, 2, '#3b7bff'); if (!side) r(2, hy - 2, 1, 2, '#3b7bff'); break;
    case 'riot': if (side) { r(-4, hy - 4, 10, 9, '#22283a'); r(-3, hy - 4, 4, 1, '#4a5570'); r(2, hy + 1, 4, 5, 'rgba(150,200,255,0.55)'); r(2, hy + 1, 4, 1, '#111'); } else { r(-6, hy - 4, 12, 9, '#22283a'); r(-5, hy - 4, 4, 1, '#4a5570'); if (!back) { r(-5, hy + 1, 10, 6, 'rgba(150,200,255,0.5)'); r(-5, hy + 1, 10, 1, '#111'); r(-4, hy + 2, 2, 1, 'rgba(255,255,255,.7)'); } } break;
    case 'chef': r(side ? -3 : -4, hy - 6, side ? 7 : 8, 6, '#fff'); r(side ? -4 : -5, hy - 7, side ? 9 : 10, 3, '#fff'); r(side ? -3 : -4, hy - 1, side ? 7 : 8, 1, '#ddd'); break;
  }
}
function humanSprite(sp, dir, frame, pose) {
  const key = sp.id + '|' + dir + '|' + frame + '|' + pose;
  let c = SPR.get(key); if (c) return c;
  c = mkCanvas(HW, HH); const g = c.getContext('2d');
  drawHuman(g, HAX, HAY, sp, dir === 'left' || dir === 'right' ? 'side' : dir, frame, pose);
  outline(c); SPR.set(key, c); return c;
}

/* ---------- held items (drawn rotated at runtime) ---------- */
const ITEMS = {};
function mkItem(name, w, h, px, py, fn) { const c = mkCanvas(w + 2, h + 2), g = c.getContext('2d'); fn(g, 1, 1); outline(c); ITEMS[name] = { c, px: px + 1, py: py + 1 }; }
function buildItems() {
  // pivot (px,py) = where the hand holds it; items point "up" (−y) at angle 0
  mkItem('hammer', 10, 16, 5, 15, (g, o) => { R(g, o + 4, o + 6, 2, 10, '#ffd23f'); R(g, o + 5, o + 6, 1, 10, '#e0b020'); R(g, o, o, 10, 7, '#ff4f8b'); R(g, o + 1, o + 1, 4, 2, '#ffc1d6'); R(g, o, o + 5, 10, 2, '#c22d63'); R(g, o + 2, o, 1, 7, '#ff79a8'); });
  mkItem('bat', 4, 16, 2, 15, (g, o) => { R(g, o + 1, o + 10, 2, 6, '#5a3a24'); R(g, o, o, 4, 11, '#c89a5a'); R(g, o, o, 1, 11, '#e0b880'); });
  mkItem('baton', 3, 12, 1, 11, (g, o) => { R(g, o, o, 3, 12, '#1e1e24'); R(g, o, o + 8, 3, 1, '#555'); R(g, o, o, 1, 8, '#3a3a44'); });
  mkItem('pan', 8, 13, 4, 12, (g, o) => { R(g, o + 3, o + 7, 2, 6, '#3a2a1a'); ell(g, o + 4, o + 3, 4, 3, '#2a2a30'); ell(g, o + 4, o + 3, 3, 2, '#4a4a54'); });
  mkItem('guitar', 8, 18, 4, 14, (g, o) => { R(g, o + 3, o, 2, 9, '#5a3a24'); R(g, o + 2, o, 4, 2, '#3a2418'); ell(g, o + 4, o + 13, 4, 4, '#d9822b'); ell(g, o + 4, o + 9, 3, 2, '#d9822b'); R(g, o + 3, o + 12, 2, 2, '#3a2418'); });
  mkItem('phone', 6, 14, 3, 13, (g, o) => { R(g, o + 2, o + 5, 1, 9, '#888'); R(g, o, o, 6, 6, '#1b1b24'); R(g, o + 1, o + 1, 4, 4, '#6ad0ff'); R(g, o + 4, o + 1, 1, 1, '#ff3b4f'); });
  mkItem('flower', 5, 12, 2, 11, (g, o) => { R(g, o + 2, o + 4, 1, 8, '#4c9a4f'); R(g, o + 1, o, 3, 3, '#ff6b8a'); R(g, o + 2, o + 1, 1, 1, '#ffe14a'); });
  mkItem('beer', 7, 9, 3, 6, (g, o) => { R(g, o, o + 2, 5, 7, '#f2b636'); R(g, o, o, 5, 3, '#fffbe8'); R(g, o + 5, o + 3, 2, 4, '#e0e0e0'); R(g, o + 1, o + 3, 1, 5, '#ffd86a'); });
  mkItem('clip', 8, 10, 4, 9, (g, o) => { R(g, o, o, 8, 10, '#a8683a'); R(g, o + 1, o + 2, 6, 7, '#fff'); R(g, o + 2, o, 4, 2, '#999'); for (let i = 0; i < 3; i++) R(g, o + 2, o + 4 + i * 2, 4, 1, '#888'); });
  mkItem('tv', 14, 11, 7, 10, (g, o) => { R(g, o, o, 14, 11, '#3a3a44'); R(g, o + 1, o + 1, 10, 8, '#6ad0ff'); R(g, o + 2, o + 2, 3, 2, '#e6f8ff'); R(g, o + 12, o + 2, 1, 1, '#ff3b4f'); R(g, o + 12, o + 5, 1, 1, '#888'); });
  mkItem('launcher', 5, 14, 2, 12, (g, o) => { R(g, o + 1, o, 3, 10, '#3a4030'); R(g, o, o, 5, 3, '#2a2e22'); R(g, o + 1, o + 10, 2, 4, '#222'); });
  mkItem('shield', 16, 22, 8, 14, (g, o) => { R(g, o, o, 16, 22, 'rgba(170,205,235,0.55)'); R(g, o, o, 16, 1, '#1e2230'); R(g, o, o + 21, 16, 1, '#1e2230'); R(g, o, o, 1, 22, '#1e2230'); R(g, o + 15, o, 1, 22, '#1e2230'); R(g, o + 2, o + 2, 2, 8, 'rgba(255,255,255,.6)'); R(g, o + 3, o + 9, 10, 3, '#f2f2f2'); R(g, o + 4, o + 10, 8, 1, '#1e2230'); });
  for (const txt of PLACARDS) mkItem('sign:' + txt, 26, 22, 13, 21, (g, o) => { R(g, o + 12, o + 12, 2, 10, '#8a5a34'); R(g, o, o, 26, 13, '#fff9e8'); R(g, o, o + 12, 26, 1, '#d8ccb0'); g.fillStyle = pick(['#c43d5a', '#2a4a8a', '#1b1b24', '#2a7a4a']); const s = fitText(g, txt, 24, 10); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, o + 13, o + 6.5); g.textAlign = 'start'; g.textBaseline = 'alphabetic'; void s; });
}
const PLACARDS = ['MORE LUNCH!', 'NEIN ZU MONTAG', 'CROISSANTS 4 ALL', 'FREE WIFI = DROIT', 'À BAS LES FORMS', '4-DAY WEEKEND', 'JUST HERE 4 BIER', 'NO TAX ON NAPS', 'SIESTA ES VIDA', 'VIVE LA SIESTE', 'STOP MONDAYS', 'MAKE PAUSE LONGER', 'ICH BIN MÜDE', 'PIZZA = HUMAN RIGHT'];

/* ---------- horse & bicycle ---------- */
function horseSprite(frame, col = '#7a4a2a') {
  const key = 'horse|' + frame + col; let c = SPR.get(key); if (c) return c;
  c = mkCanvas(48, 40); const g = c.getContext('2d'); const X = 22, Y = 37; const r = (x, y, w, h, cc) => R(g, X + x, Y + y, w, h, cc);
  const d = shade(col, -0.25), l = shade(col, 0.15);
  const legs = [[-12, 0], [-9, 1], [8, 2], [11, 3]];
  const off = [[0, 0, 0, 0], [2, -2, -2, 2], [0, 0, 0, 0], [-2, 2, 2, -2]][frame];
  legs.forEach(([lx], i) => { r(lx + off[i], -11, 3, 9, i % 2 ? col : d); r(lx + off[i], -2, 3, 2, '#2a2020'); });
  r(-15, -22, 29, 12, col); r(-15, -22, 29, 2, l); r(-15, -12, 29, 2, d);
  r(10, -30, 6, 12, col); r(12, -34, 10, 6, col); r(20, -32, 3, 3, d); r(13, -36, 2, 3, d); r(18, -32, 1, 1, '#111');
  r(8, -32, 3, 12, '#2a1a10'); r(-19, -21, 4, 10, '#2a1a10'); r(-20, -13, 3, 4, '#2a1a10');
  r(-4, -23, 10, 3, '#a33'); r(-3, -20, 8, 5, '#2a2a6a');
  outline(g.canvas); SPR.set(key, c); return c;
}
function bikeSprite(frame) {
  const key = 'bike|' + frame; let c = SPR.get(key); if (c) return c;
  c = mkCanvas(34, 22); const g = c.getContext('2d'); const X = 17, Y = 19;
  for (const wx of [-9, 9]) { ell(g, X + wx, Y - 5, 5, 5, '#22222a'); ell(g, X + wx, Y - 5, 4, 4, 'rgba(0,0,0,0)'); g.clearRect(X + wx - 3, Y - 8, 7, 7); R(g, X + wx, Y - 5, 1, 1, '#999'); const a = frame * Math.PI / 4; pline(g, X + wx - Math.cos(a) * 3, Y - 5 - Math.sin(a) * 3, X + wx + Math.cos(a) * 3, Y - 5 + Math.sin(a) * 3, '#888'); }
  pline(g, X - 9, Y - 5, X - 1, Y - 5, '#2f5fd0'); pline(g, X - 1, Y - 5, X - 4, Y - 13, '#2f5fd0'); pline(g, X - 9, Y - 5, X - 4, Y - 13, '#2f5fd0'); pline(g, X - 4, Y - 13, X + 6, Y - 13, '#2f5fd0'); pline(g, X + 6, Y - 13, X + 9, Y - 5, '#2f5fd0'); pline(g, X - 1, Y - 5, X + 6, Y - 13, '#2f5fd0');
  R(g, X - 6, Y - 15, 5, 2, '#222'); R(g, X + 5, Y - 17, 2, 4, '#555'); R(g, X + 5, Y - 17, 4, 1, '#222');
  outline(c); SPR.set(key, c); return c;
}

/* ---------- vehicles ---------- */
function carSprite(model, col, orient, state) {
  const key = 'car|' + model + col + orient + state; let c = SPR.get(key); if (c) return c;
  const d = shade(col, -0.25), l = shade(col, 0.22);
  if (orient === 'h') {
    c = mkCanvas(52, 34); const g = c.getContext('2d'); const X = 26, Y = 31; const r = (x, y, w, h, cc) => R(g, X + x, Y + y, w, h, cc);
    if (state === 'flipped') {
      r(-22, -16, 44, 11, '#2b2b33'); r(-22, -16, 44, 2, '#3a3a44'); r(-16, -6, 32, 5, d); r(-14, -2, 28, 2, shade(d, -0.3));
      for (const wx of [-18, 10]) { r(wx, -23, 8, 7, '#18181e'); r(wx + 2, -21, 4, 3, '#777'); }
      r(-20, -13, 12, 2, '#555'); r(6, -12, 14, 2, '#555'); r(-24, -14, 3, 3, '#666');
    } else {
      const dm = state === 'damaged';
      if (model === 'van') {
        r(-23, -26, 46, 22, col); r(-23, -26, 46, 2, l); r(-23, -6, 46, 2, d); r(12, -24, 10, 8, P.glass); r(13, -23, 4, 3, P.glassLt); r(-20, -22, 28, 12, shade(col, 0.1));
        r(-18, -19, 22, 6, '#fff'); r(-17, -18, 20, 4, pick(['#c43d5a', '#2a7a4a', '#d9822b']));
      } else if (model === 'cv') {
        r(-21, -14, 42, 10, col); r(-21, -14, 42, 1, l); r(-14, -24, 26, 11, col); r(-12, -24, 22, 2, '#ddd');
        r(-12, -22, 9, 7, P.glass); r(1, -22, 9, 7, P.glass); r(-11, -21, 3, 2, P.glassLt); r(2, -21, 3, 2, P.glassLt); r(-22, -8, 44, 3, d);
        ell(g, X + 19, Y - 10, 2, 2, '#fff7b0');
      } else {
        r(-22, -13, 44, 9, col); r(-22, -13, 44, 1, l); r(-14, -21, 26, 9, col); r(-15, -13, 28, 1, d);
        r(-12, -20, 10, 6, P.glass); r(0, -20, 10, 6, P.glass); r(-11, -19, 3, 2, P.glassLt); r(1, -19, 3, 2, P.glassLt); r(-22, -6, 44, 2, d); r(20, -11, 2, 2, '#fff7b0'); r(-22, -11, 2, 2, '#ff6b6b');
      }
      r(-22, -6, 4, 2, '#cfd3da'); r(18, -6, 4, 2, '#cfd3da');
      for (const wx of [-17, 9]) { r(wx, -7, 8, 7, '#18181e'); r(wx + 2, -5, 4, 3, '#9aa0aa'); }
      if (dm) { r(-9, -20, 1, 6, '#fff'); r(-11, -18, 5, 1, '#fff'); r(4, -10, 4, 3, d); r(-16, -9, 3, 2, d); }
    }
    outline(c);
  } else {
    c = mkCanvas(28, 44); const g = c.getContext('2d'); const X = 14, Y = 41; const r = (x, y, w, h, cc) => R(g, X + x, Y + y, w, h, cc);
    if (state === 'flipped') {
      r(-11, -36, 22, 33, '#2b2b33'); r(-9, -34, 18, 29, '#3a3a44'); r(-1, -34, 2, 29, '#555');
      for (const [wx, wy] of [[-13, -33], [9, -33], [-13, -12], [9, -12]]) r(wx, wy, 4, 8, '#18181e');
    } else {
      r(-11, -38, 22, 36, col); r(-11, -38, 22, 2, l); r(10, -36, 1, 34, d);
      r(-9, -30, 18, 7, P.glass); r(-8, -29, 5, 2, P.glassLt); r(-9, -23, 18, 10, l); r(-9, -13, 18, 4, P.glassDk);
      r(-10, -4, 20, 3, '#cfd3da'); r(-9, -3, 3, 1, '#fff7b0'); r(6, -3, 3, 1, '#fff7b0');
      for (const [wx, wy] of [[-12, -33], [10, -33], [-12, -12], [10, -12]]) r(wx, wy, 2, 7, '#18181e');
      if (state === 'damaged') { r(-4, -30, 1, 6, '#fff'); r(-6, -27, 5, 1, '#fff'); }
    }
    outline(c);
  }
  SPR.set(key, c); return c;
}
function truckSprite(kind, orient, state) {
  // kind: 'cannon' | 'van' | 'food'
  const key = 'truck|' + kind + orient + state; let c = SPR.get(key); if (c) return c;
  const dead = state === 'destroyed';
  if (orient === 'h') {
    c = mkCanvas(72, 52); const g = c.getContext('2d'); const X = 36, Y = 49; const r = (x, y, w, h, cc) => R(g, X + x, Y + y, w, h, cc);
    const body = dead ? '#4a4048' : kind === 'food' ? '#f2c040' : '#f1f3f7', stripe = kind === 'food' ? '#c43d5a' : '#2f5fd0';
    if (kind === 'cannon') {
      r(-32, -30, 44, 24, body); r(-32, -30, 44, 2, '#fff'); r(-32, -16, 44, 4, dead ? '#333' : stripe);
      r(12, -34, 18, 28, dead ? '#3a3038' : '#2f5fd0'); r(15, -31, 13, 9, dead ? '#111' : P.glass); r(16, -30, 4, 3, P.glassLt);
      r(-14, -40, 14, 10, dead ? '#333' : '#d9dde5'); r(-2, -38, 16, 4, '#555c6e'); r(12, -38, 3, 4, '#333');
      r(-6, -43, 3, 3, dead ? '#333' : '#ff3b4f'); r(-1, -43, 3, 3, dead ? '#333' : '#3b7bff');
      r(-30, -6, 60, 3, '#2a2a30');
      for (const wx of [-26, -10, 16]) { r(wx, -8, 10, 8, '#18181e'); r(wx + 3, -6, 4, 4, '#888'); }
    } else if (kind === 'van') {
      r(-30, -36, 50, 30, body); r(-30, -36, 50, 2, '#fff'); r(-30, -20, 50, 5, dead ? '#333' : stripe); r(-30, -15, 50, 1, '#ffd23f');
      r(20, -30, 10, 24, body); r(21, -28, 8, 9, dead ? '#111' : P.glass);
      r(-24, -32, 30, 9, '#c8d0dc'); for (let i = 0; i < 5; i++) r(-22 + i * 6, -31, 4, 7, '#2a3040');
      r(-8, -40, 5, 4, dead ? '#333' : '#ff3b4f'); r(-3, -40, 5, 4, dead ? '#333' : '#3b7bff');
      for (const wx of [-24, 14]) { r(wx, -8, 10, 8, '#18181e'); r(wx + 3, -6, 4, 4, '#888'); }
      if (!dead) { g.font = '9px VT323'; g.fillStyle = '#fff'; g.fillText('POLICE·POLIZEI', X - 28, Y - 16); }
    } else {
      r(-32, -38, 46, 32, body); r(-32, -38, 46, 2, '#fff6c0'); r(14, -30, 16, 24, '#e04848'); r(17, -28, 11, 9, P.glass);
      r(-30, -30, 40, 14, '#3a2a20'); for (let i = 0; i < 5; i++) { r(-28 + i * 8, -28, 5, 9, '#f2b636'); r(-28 + i * 8, -28, 5, 2, '#fffbe8'); }
      for (let x = -34; x < 16; x += 6) R(g, X + x, Y - 40, 6, 4, ((x + 34) / 6) % 2 ? '#fff' : '#c43d5a');
      R(g, X - 30, Y - 50, 42, 10, '#1b1b24'); g.font = '10px VT323'; g.fillStyle = '#ffd23f'; g.textAlign = 'center'; g.fillText('WURST · BIER · KEBAB', X - 9, Y - 42); g.textAlign = 'start';
      for (const wx of [-26, 16]) { r(wx, -8, 10, 8, '#18181e'); r(wx + 3, -6, 4, 4, '#888'); }
    }
    outline(c);
  } else {
    c = mkCanvas(40, 58); const g = c.getContext('2d'); const X = 20, Y = 55; const r = (x, y, w, h, cc) => R(g, X + x, Y + y, w, h, cc);
    const body = dead ? '#4a4048' : kind === 'food' ? '#f2c040' : '#f1f3f7', stripe = kind === 'food' ? '#c43d5a' : '#2f5fd0';
    r(-15, -52, 30, 50, body); r(-15, -52, 30, 2, '#fff'); r(-15, -22, 30, 3, dead ? '#333' : stripe);
    r(-13, -14, 26, 8, dead ? '#111' : P.glass); r(-12, -13, 6, 3, P.glassLt); r(-14, -5, 28, 3, '#cfd3da'); r(-13, -4, 3, 2, '#fff7b0'); r(10, -4, 3, 2, '#fff7b0');
    if (kind === 'cannon') { r(-7, -46, 14, 12, '#d9dde5'); r(-2, -38, 4, 22, '#555c6e'); }
    if (kind !== 'food') { r(-7, -54, 6, 3, dead ? '#333' : '#ff3b4f'); r(1, -54, 6, 3, dead ? '#333' : '#3b7bff'); }
    else { for (let x = -15; x < 15; x += 5) r(x, -54, 5, 3, ((x + 15) / 5) % 2 ? '#fff' : '#c43d5a'); }
    for (const [wx, wy] of [[-17, -44], [15, -44], [-17, -14], [15, -14]]) r(wx, wy, 3, 9, '#18181e');
    outline(c);
  }
  SPR.set(key, c); return c;
}

/* ---------- props ---------- */
const PROP_DEFS = {
  bin:      { hp: 1, mat: 'plastic', pts: 40,  fine: 120,  hr: 8,  hy: -8,  solid: [12, 5] },
  planter:  { hp: 2, mat: 'wood',    pts: 50,  fine: 300,  hr: 10, hy: -7,  solid: [20, 5] },
  bench:    { hp: 2, mat: 'wood',    pts: 80,  fine: 600,  hr: 14, hy: -7,  solid: [28, 5] },
  terrace:  { hp: 2, mat: 'wood',    pts: 80,  fine: 450,  hr: 12, hy: -10, solid: [14, 5] },
  bikerack: { hp: 2, mat: 'metal',   pts: 80,  fine: 700,  hr: 14, hy: -7,  solid: [26, 5] },
  postbox:  { hp: 2, mat: 'metal',   pts: 80,  fine: 900,  hr: 8,  hy: -18, solid: [6, 4] },
  hydrant:  { hp: 2, mat: 'metal',   pts: 100, fine: 1200, hr: 7,  hy: -7,  solid: [8, 4] },
  lamp:     { hp: 3, mat: 'metal',   pts: 100, fine: 1500, hr: 8,  hy: -12, solid: [5, 4] },
  booth:    { hp: 3, mat: 'glass',   pts: 120, fine: 2000, hr: 10, hy: -16, solid: [14, 6] },
  column:   { hp: 3, mat: 'wood',    pts: 120, fine: 2500, hr: 11, hy: -18, solid: [16, 6] },
  shelter:  { hp: 4, mat: 'glass',   pts: 150, fine: 3500, hr: 18, hy: -16, solid: [48, 6] },
  window:   { hp: 1, mat: 'glass',   pts: 100, fine: 1800, hr: 14, hy: -13, solid: null },
  statue:   { hp: 6, mat: 'stone',   pts: 400, fine: 25000, hr: 22, hy: -20, solid: null },
  car:      { hp: 99, mat: 'car',    pts: 250, fine: 8000, hr: 20, hy: -10, solid: [44, 14] },
  carv:     { hp: 99, mat: 'car',    pts: 250, fine: 8000, hr: 16, hy: -18, solid: [22, 34] },
};
function propSprite(type, state, variant = 0) {
  const key = 'prop|' + type + state + variant; let c = SPR.get(key); if (c) return c;
  const d = state === 'destroyed', dm = state === 'damaged';
  let W = 40, H = 48, X = 20, Y = 45;
  if (type === 'shelter') { W = 60; H = 52; X = 30; Y = 49; }
  if (type === 'statue') { W = 60; H = 70; X = 30; Y = 66; }
  if (type === 'window') { W = 34; H = 26; X = 17; Y = 24; }
  if (type === 'lamp') { H = 66; Y = 63; W = 52; X = 16; }
  c = mkCanvas(W, H); const g = c.getContext('2d'); const r = (x, y, w, h, cc) => R(g, X + x, Y + y, w, h, cc);
  const binCols = ['#5a8a5a', '#6a7280', '#3a6a9a'];
  switch (type) {
    case 'bin': { const col = binCols[variant % 3], cd = shade(col, -0.25);
      if (!d) { r(-6, -16, 12, 15, col); r(4, -15, 2, 14, cd); r(-7, -18, 14, 3, cd); r(-6, -19, 12, 1, shade(col, 0.2)); r(-2, -12, 4, 3, '#e6e6e6'); r(-6, -2, 3, 2, '#1b1b22'); r(3, -2, 3, 2, '#1b1b22'); }
      else { r(-12, -8, 17, 8, col); r(-12, -8, 17, 1, shade(col, 0.2)); r(5, -10, 3, 10, cd); r(9, -4, 6, 3, '#e6e6e6'); r(-14, -3, 3, 2, '#c9b26a'); } break; }
    case 'planter':
      if (!d) { r(-10, -10, 20, 10, '#7a5030'); for (let x = -10; x < 10; x += 4) r(x, -10, 1, 10, '#5a3820'); r(-10, -10, 20, 1, '#a07040'); ell(g, X, Y - 15, 10, 6, P.leafDk); ell(g, X - 1, Y - 16, 8, 4, P.leaf); for (let i = 0; i < 6; i++) r(-8 + i * 3, -19 + (i % 2) * 3, 2, 2, ['#ff6b8a', '#ffe14a', '#fff', '#ff8a3a'][i % 4]); if (dm) r(-1, -10, 1, 10, '#2a1a10'); }
      else { r(-12, -4, 9, 4, '#7a5030'); r(2, -5, 10, 5, '#5a3820'); ell(g, X - 2, Y - 3, 6, 2, '#4a3020'); r(-6, -8, 6, 4, P.leafDk); } break;
    case 'bench':
      if (!d) { r(-14, -16, 28, 2, P.wood); r(-14, -13, 28, 2, P.wood); r(-14, -16, 28, 1, P.woodLt); r(-14, -9, 28, 3, P.woodLt); r(-14, -7, 28, 1, P.woodDk); r(-13, -16, 2, 16, '#2a2e2a'); r(11, -16, 2, 16, '#2a2e2a'); if (dm) { r(-1, -16, 2, 10, 'rgba(0,0,0,0)'); g.clearRect(X - 1, Y - 16, 2, 10); } }
      else { r(-16, -5, 12, 3, P.wood); r(-16, -5, 12, 1, P.woodLt); r(3, -8, 12, 3, P.woodLt); r(-4, -3, 8, 2, P.woodDk); r(-13, -6, 2, 6, '#2a2e2a'); r(12, -9, 2, 9, '#2a2e2a'); } break;
    case 'terrace': {
      const pc = ['#c43d5a', '#2a7a4a', '#2a4a8a'][variant % 3];
      if (!d) { r(-1, -34, 2, 34, '#6a6a72'); ell(g, X, Y - 36, 17, 5, pc); for (let i = -16; i < 16; i += 6) r(i, -37, 3, 5, '#fff'); r(-17, -33, 34, 1, shade(pc, -0.3)); ell(g, X, Y - 11, 7, 2, '#efe9df'); r(-1, -10, 2, 9, '#444'); r(-12, -12, 5, 2, '#a0703a'); r(-12, -10, 1, 9, '#7a4a20'); r(-8, -10, 1, 9, '#7a4a20'); r(-12, -16, 5, 4, '#b8854a'); r(7, -12, 5, 2, '#a0703a'); r(7, -10, 1, 9, '#7a4a20'); r(11, -10, 1, 9, '#7a4a20'); r(7, -16, 5, 4, '#b8854a'); r(-3, -14, 2, 3, '#fff'); r(1, -13, 2, 2, '#6a3a1a'); if (dm) r(-17, -36, 10, 3, '#3a3036'); }
      else { r(-16, -4, 32, 3, pc); for (let i = -14; i < 16; i += 6) r(i, -4, 3, 3, '#fff'); r(-14, -8, 14, 2, '#6a6a72'); r(4, -9, 7, 7, '#efe9df'); r(-18, -2, 5, 2, '#a0703a'); } break; }
    case 'bikerack': {
      const bc = ['#e8d27a', '#7ac0d8', '#e88a9a'];
      if (!d) { for (let i = 0; i < 2; i++) { const bx = -10 + i * 14; ell(g, X + bx - 5, Y - 6, 4, 4, '#222'); ell(g, X + bx + 5, Y - 6, 4, 4, '#222'); g.clearRect(X + bx - 7, Y - 8, 5, 5); g.clearRect(X + bx + 3, Y - 8, 5, 5); pline(g, X + bx - 5, Y - 6, X + bx, Y - 12, bc[(variant + i) % 3]); pline(g, X + bx, Y - 12, X + bx + 5, Y - 6, bc[(variant + i) % 3]); pline(g, X + bx - 5, Y - 6, X + bx + 1, Y - 6, bc[(variant + i) % 3]); r(bx - 2, -14, 4, 1, '#222'); r(bx + 3, -15, 1, 3, '#555'); } r(-15, -9, 30, 2, '#8a93a6'); r(-15, -9, 1, 9, '#8a93a6'); r(14, -9, 1, 9, '#8a93a6'); }
      else { for (let i = 0; i < 3; i++) pline(g, X - 14 + i * 4, Y - 1 - i, X + 10 - i * 3, Y - 7 + i * 2, bc[i]); ell(g, X - 8, Y - 3, 4, 2, '#222'); ell(g, X + 9, Y - 4, 4, 2, '#222'); r(-15, -3, 30, 2, '#8a93a6'); } break; }
    case 'postbox':
      if (!d) { r(-1, -14, 2, 14, '#3a3a44'); r(-6, -28, 12, 15, '#f2c428'); r(-6, -28, 12, 1, '#fff07a'); r(4, -27, 2, 14, '#c99a10'); r(-4, -25, 8, 1, '#1b1b22'); r(-3, -21, 5, 3, '#1b1b22'); r(-2, -20, 3, 1, '#f2c428'); if (dm) r(-6, -18, 5, 4, '#c99a10'); }
      else { r(-1, -6, 2, 6, '#3a3a44'); r(2, -8, 13, 8, '#f2c428'); r(2, -8, 13, 1, '#fff07a'); r(-10, -2, 4, 2, '#fff'); r(-6, -1, 3, 1, '#fff'); } break;
    case 'hydrant':
      if (!d) { const t = dm ? 1 : 0; r(-3, -12, 6, 12, '#d8303a'); r(1, -12, 2, 12, '#a8202c'); r(-4 + t, -14, 8, 3, '#ff5a5a'); r(-2 + t, -16, 4, 2, '#d8303a'); r(-5, -9, 2, 3, '#a8202c'); r(3, -9, 2, 3, '#a8202c'); r(-4, -1, 8, 1, '#7a1a20'); }
      else { r(-3, -4, 6, 4, '#a8202c'); r(-3, -4, 6, 1, '#d8303a'); } break;
    case 'lamp': {
      const lc = '#2a3a32', ll = '#45574c';
      if (!d) {
        const lean = dm ? 4 : 0;
        r(-3, -4, 6, 4, lc); r(-2, -6, 4, 2, ll);
        for (let i = 6; i < 44; i++) { const lx = Math.round(lean * (i - 6) / 38); r(-1 + lx, -i, 2, 1, i % 9 === 0 ? ll : lc); }
        const tx = lean; r(tx - 3, -46, 6, 2, lc); r(tx - 4, -54, 8, 8, lc); r(tx - 3, -53, 6, 6, '#fff3b0'); r(tx - 1, -53, 1, 6, lc); r(tx - 5, -56, 10, 2, lc); r(tx - 1, -58, 2, 2, lc); r(tx - 3, -53, 2, 2, '#ffffff');
      } else { r(-3, -4, 6, 4, lc); r(-1, -12, 2, 8, lc); for (let i = 0; i < 26; i++) r(1 + i, -12 + Math.round(i * 0.4), 1, 2, lc); r(26, -4, 8, 6, lc); r(27, -3, 6, 4, '#7a7458'); } break; }
    case 'booth':
      if (!d) { r(-7, -38, 14, 38, '#c8202c'); r(-7, -38, 14, 1, '#ff5a5a'); r(-8, -40, 16, 3, '#a8101c'); r(-6, -36, 12, 3, '#fff'); g.font = '6px VT323'; g.fillStyle = '#c8202c'; g.fillText('PHONE', X - 6, Y - 33.5); for (let yy = -31; yy < -6; yy += 5) { r(-5, yy, 4, 4, P.glass); r(1, yy, 4, 4, P.glass); } r(-5, -31, 2, 2, P.glassLt); if (dm) { r(-4, -25, 1, 8, '#fff'); r(-5, -21, 5, 1, '#fff'); } r(5, -18, 1, 3, '#ffd23f'); }
      else { r(-7, -34, 14, 34, '#a8101c'); r(-8, -36, 16, 3, '#7a0a14'); for (let yy = -31; yy < -6; yy += 5) { r(-5, yy, 4, 4, '#1d2230'); r(1, yy, 4, 4, '#1d2230'); } r(-5, -31, 1, 2, P.glass); r(4, -20, 1, 3, P.glass); r(7, -3, 8, 3, '#c8202c'); } break;
    case 'column': {
      const posters = ['#ff8a3a', '#4ab8ff', '#ffe14a', '#e65a8a', '#5fe08a', '#fff'];
      if (!d) { r(-8, -40, 16, 37, '#e8dcc0'); for (let i = 0; i < 6; i++) { r(-7 + (i % 3) * 5, -38 + ((i / 3) | 0) * 15, 4, 13, posters[(i + variant) % 6]); r(-7 + (i % 3) * 5, -38 + ((i / 3) | 0) * 15, 4, 2, '#1b1b24'); } r(5, -40, 3, 37, 'rgba(0,0,0,.18)'); r(-9, -4, 18, 4, '#2a4a3a'); r(-9, -44, 18, 4, '#2a4a3a'); ell(g, X, Y - 47, 7, 4, '#2f5a46'); r(-1, -53, 2, 4, '#2a4a3a'); if (dm) { r(-7, -22, 9, 8, '#d0c4a8'); } }
      else { r(-8, -26, 16, 23, '#d0c4a8'); r(-6, -24, 4, 8, '#ff8a3a'); r(2, -14, 4, 6, '#4ab8ff'); r(-9, -4, 18, 4, '#2a4a3a'); r(-9, -28, 18, 3, '#2a4a3a'); ell(g, X + 13, Y - 4, 7, 4, '#2f5a46'); } break; }
    case 'shelter': {
      if (!d) { r(-24, -40, 48, 4, '#4a4e5a'); r(-24, -40, 48, 1, '#6a6e7a'); r(-22, -36, 32, 30, 'rgba(160,215,235,0.45)'); r(-22, -36, 1, 30, '#3a3e48'); r(9, -36, 1, 30, '#3a3e48'); r(-22, -7, 32, 1, '#3a3e48'); r(-20, -34, 6, 2, 'rgba(255,255,255,.6)'); r(11, -36, 12, 34, '#3a3e48'); r(12, -35, 10, 28, '#ffe14a'); r(13, -33, 8, 8, '#c43d5a'); r(13, -23, 8, 2, '#1b1b24'); r(13, -20, 6, 1, '#1b1b24'); r(-18, -14, 24, 3, '#6a6e7a'); r(-24, -48, 2, 8, '#3a3e48'); r(-28, -54, 10, 7, '#2a4a8a'); g.font = '7px VT323'; g.fillStyle = '#fff'; g.fillText('ARRÊT', X - 28, Y - 49); if (dm) { r(-14, -32, 1, 18, '#fff'); r(-18, -25, 10, 1, '#fff'); r(-6, -30, 1, 12, '#fff'); } }
      else { r(-24, -36, 48, 4, '#4a4e5a'); r(-22, -32, 1, 26, '#3a3e48'); r(9, -32, 1, 26, '#3a3e48'); r(-22, -32, 6, 6, 'rgba(160,215,235,0.45)'); r(4, -12, 5, 6, 'rgba(160,215,235,0.45)'); r(11, -30, 12, 28, '#3a3e48'); r(12, -26, 10, 12, '#1d2230'); r(-18, -11, 24, 3, '#6a6e7a'); } break; }
    case 'window': {
      const goods = [['#ff8fb1', '#ffd23f', '#5fe0a8'], ['#e8c48a', '#c9863a', '#fff'], ['#6ad0ff', '#fff', '#222'], ['#c43d5a', '#2a2a30', '#ffe14a']][variant % 4];
      if (!d) { r(-14, -22, 28, 20, P.glass); r(-14, -22, 28, 2, P.glassLt); for (let i = 0; i < 8; i++) { r(-11 + i, -19 + i, 1, 1, P.glassLt); r(-6 + i, -19 + i, 1, 1, 'rgba(255,255,255,.55)'); } r(-12, -9, 24, 7, 'rgba(29,34,48,.35)'); r(-10, -9, 4, 6, goods[0]); r(-3, -8, 6, 5, goods[1]); r(5, -10, 4, 7, goods[2]); if (dm) { r(-1, -19, 1, 12, '#fff'); r(-6, -14, 10, 1, '#fff'); } }
      else { r(-14, -22, 28, 20, P.interior); r(-10, -8, 4, 5, shade(goods[0], -0.5)); r(4, -9, 5, 6, shade(goods[2], -0.5)); r(-14, -22, 4, 5, P.glass); r(10, -22, 4, 4, P.glass); r(-14, -7, 3, 5, P.glass); r(11, -8, 3, 6, P.glass); r(-3, -22, 6, 2, P.glass); } break; }
    case 'statue': {
      const st = '#a9a49a', stD = '#7d786e', br = '#5f7a62', brL = '#86a588';
      r(-14, -18, 28, 18, st); r(-14, -18, 28, 2, '#c9c4b8'); r(10, -16, 4, 16, stD); r(-6, -12, 12, 5, '#c9a52a'); r(-5, -11, 10, 1, '#8a6a10');
      if (!d) {
        r(-14, -32, 22, 10, br); r(-14, -32, 22, 2, brL); r(6, -40, 5, 10, br); r(8, -44, 9, 6, br); r(14, -42, 3, 2, '#3a4a3a'); r(-17, -31, 4, 9, br);
        for (const lx of [-12, -8, 2, 6]) r(lx, -22, 3, 4, br);
        r(-6, -46, 8, 12, br); r(-6, -46, 8, 2, brL); r(-5, -53, 6, 7, br); r(-6, -55, 8, 3, '#4a6450'); r(1, -50, 10, 2, br); r(10, -52, 2, 4, br);
        if (dm) { r(-2, -30, 1, 6, '#2a3a2a'); r(-4, -27, 5, 1, '#2a3a2a'); }
        r(-26, -6, 2, 2, P.waterLt); r(24, -6, 2, 2, P.waterLt);
      } else {
        r(-14, -26, 22, 8, br); r(-14, -26, 22, 2, brL); for (const lx of [-12, -8, 2, 6]) r(lx, -18, 3, 1, br);
        r(14, -4, 10, 5, br); r(16, -6, 6, 3, '#4a6450'); r(-24, -6, 8, 6, br); r(-22, -8, 5, 3, br);
      } break; }
  }
  outline(c);
  SPR.set(key, { c, ax: X, ay: Y }); return SPR.get(key);
}
