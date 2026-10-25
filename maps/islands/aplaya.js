// Generated from Aplaya Island v2.html
export async function build(THREE) {



const warn = (...a) => console.warn(...a);
const PI = Math.PI, TAU = PI * 2;
let seed = 11; const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const pick = a => a[(rnd() * a.length) | 0];

// ---------- procedural textures (UVs are in meters; repeat = 1 / tile size) ----------
const C = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h); return c; };
const tex = (canvas, meters, name) => { const t = new THREE.CanvasTexture(canvas); t.name = name; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (meters) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / meters, 1 / meters); } return t; };
function dots(g, s, n, cols, r0, r1, a0 = .5) { for (let i = 0; i < n; i++) { const r = r0 + rnd() * (r1 - r0), x = rnd() * s, y = rnd() * s; g.globalAlpha = a0 * (.5 + rnd() * .5); g.fillStyle = pick(cols);
  for (const dx of [-s, 0, s]) for (const dy of [-s, 0, s]) { if (Math.abs(x + dx - s / 2) > s / 2 + r || Math.abs(y + dy - s / 2) > s / 2 + r) continue; g.beginPath(); g.arc(x + dx, y + dy, r, 0, TAU); g.fill(); } } g.globalAlpha = 1; }
function bricks(g, s, cols, rows, colors, grout, rad, hi = .16) { g.fillStyle = grout; g.fillRect(0, 0, s, s); const w = s / cols, h = s / rows;
  for (let r = 0; r < rows; r++) for (let c = -1; c <= cols; c++) { const x = c * w + (r % 2 ? w / 2 : 0), y = r * h; g.fillStyle = pick(colors); g.beginPath(); g.roundRect(x + 3, y + 3, w - 6, h - 6, rad); g.fill();
    g.fillStyle = `rgba(255,255,255,${hi})`; g.beginPath(); g.roundRect(x + 6, y + 5, w - 14, (h - 6) * .3, rad * .6); g.fill(); g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(x + 4, y + h - 8, w - 8, 4); } }

const tGrass = tex(C(512, 512, (g, s) => { g.fillStyle = '#69B944'; g.fillRect(0, 0, s, s); dots(g, s, 700, ['#5AA83A', '#7CC94F', '#62B23F', '#86D158'], 4, 16, .55); g.lineCap = 'round';
  for (let i = 0; i < 2600; i++) { const x = rnd() * s, y = rnd() * s, l = 5 + rnd() * 9, a = -PI / 2 + (rnd() - .5) * .9; g.strokeStyle = pick(['#4E9C33', '#8AD65C', '#5FAF3C', '#9BE06A']); g.globalAlpha = .7; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  g.globalAlpha = 1; dots(g, s, 60, ['#FFF6D8', '#FFE066'], 1.5, 2.5, 1); }), 3, 'grass');
const tCobble = tex(C(512, 512, (g, s) => { bricks(g, s, 8, 8, ['#E6D5B1', '#DCC89F', '#EBDDBE', '#D3BE93', '#E0CCA4'], '#A38A69', 16, .18); dots(g, s, 500, ['#8F7756', '#F3E7CF'], 1, 2.5, .4); }), 2, 'cobble');
const tBrick = tex(C(512, 512, (g, s) => { bricks(g, s, 4, 8, ['#D7A88A', '#CF9B7D', '#DDB396', '#C98F72', '#D9AE90'], '#EEDFC9', 5, .1); dots(g, s, 400, ['#B97B60', '#F2D9C3'], 1, 2, .35); }), 2, 'plaza_brick');
const tBaldosa = tex(C(512, 512, (g, s) => { const w = s / 4; for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { const x = c * w, y = r * w, a = (r + c) % 2; g.fillStyle = a ? '#F1E4C6' : '#B4473A'; g.fillRect(x, y, w, w);
  g.fillStyle = a ? '#B4473A' : '#F1E4C6'; g.beginPath(); g.moveTo(x + w / 2, y + 18); g.lineTo(x + w - 18, y + w / 2); g.lineTo(x + w / 2, y + w - 18); g.lineTo(x + 18, y + w / 2); g.fill();
  g.fillStyle = '#2E5E8C'; g.beginPath(); g.arc(x + w / 2, y + w / 2, 10, 0, TAU); g.fill(); g.strokeStyle = '#7A5A46'; g.lineWidth = 3; g.strokeRect(x, y, w, w); } dots(g, s, 300, ['#ffffff', '#5a3a2a'], 1, 2, .2); }), 1, 'baldosa');
const tStucco = tex(C(512, 512, (g, s) => { g.fillStyle = '#F4EEE2'; g.fillRect(0, 0, s, s); dots(g, s, 900, ['#E7DECB', '#FFFFFF', '#EDE4D2'], 2, 12, .35); dots(g, s, 1200, ['#D8CDB6'], .6, 1.4, .4); }), 2, 'stucco');
const tAdobe = tex(C(512, 512, (g, s) => { bricks(g, s, 2, 4, ['#CBB487', '#C2A97A', '#D3BE93', '#BBA170', '#C7AE80'], '#9C8460', 8, .1); dots(g, s, 1400, ['#9E875F', '#7E6A4C', '#E2D1A9'], .8, 2.6, .45); dots(g, s, 40, ['#7E8A5A', '#5E5A44'], 10, 30, .12); }), 2, 'adobe');
const tRoof = tex(C(256, 256, (g, s) => { const cw = 32; for (let c = 0; c < s / cw; c++) { const gr = g.createLinearGradient(c * cw, 0, c * cw + cw, 0); const base = pick(['#C4522E', '#BC4B29', '#CB5A33']); gr.addColorStop(0, '#8E3A1F'); gr.addColorStop(.5, base); gr.addColorStop(.75, '#DE7247'); gr.addColorStop(1, '#8E3A1F'); g.fillStyle = gr; g.fillRect(c * cw, 0, cw, s); }
  for (let r = 0; r < 8; r++) { g.fillStyle = 'rgba(60,20,10,.35)'; g.fillRect(0, r * 32 + 28, s, 4); } dots(g, s, 300, ['#6E2C16', '#E9906A'], .8, 1.8, .4); }), 1, 'roof_tiles');
const tSoil = tex(C(512, 512, (g, s) => { let y = 0; while (y < s) { const h = Math.min(s - y, 26 + rnd() * 50); g.fillStyle = pick(['#C98A4B', '#B8763C', '#D59A5A', '#A9693A', '#C2834A']); g.beginPath(); g.moveTo(0, y);
  const ph = rnd() * TAU; for (let x = 0; x <= s; x += 16) g.lineTo(x, y + Math.sin(x / s * TAU * 2 + ph) * 4); g.lineTo(s, y + h); g.lineTo(0, y + h); g.fill(); y += h; }
  dots(g, s, 500, ['#8E7A68', '#E0B27A', '#7A5230'], 1.5, 5, .5); }), 3, 'soil');
const tRock = tex(C(256, 256, (g, s) => { g.fillStyle = '#8E7A68'; g.fillRect(0, 0, s, s); dots(g, s, 260, ['#7A6656', '#A08B77', '#6B594B', '#9A8672'], 4, 18, .5); g.strokeStyle = 'rgba(60,45,35,.5)'; g.lineWidth = 1.5;
  for (let i = 0; i < 30; i++) { let x = rnd() * s, y = rnd() * s; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 4; k++) { x += (rnd() - .5) * 30; y += (rnd() - .5) * 30; g.lineTo(x, y); } g.stroke(); } }), 3, 'rock');
const tWood = tex(C(256, 256, (g, s) => { for (let p = 0; p < 4; p++) { g.fillStyle = pick(['#A8683A', '#9C5F34', '#B27342']); g.fillRect(0, p * 64, s, 64); g.strokeStyle = 'rgba(70,35,15,.35)'; g.lineWidth = 1.2;
  for (let l = 0; l < 7; l++) { const y0 = p * 64 + 6 + l * 8 + rnd() * 3; g.beginPath(); g.moveTo(0, y0); for (let x = 0; x <= s; x += 16) g.lineTo(x, y0 + Math.sin(x / s * TAU + l) * 2); g.stroke(); } g.fillStyle = '#4A2814'; g.fillRect(0, p * 64 + 62, s, 2); } }), 1, 'wood');
const tBark = tex(C(256, 256, (g, s) => { g.fillStyle = '#8B6A4A'; g.fillRect(0, 0, s, s); dots(g, s, 300, ['#7A5A3C', '#9C7B58', '#6E5034'], 2, 7, .5); for (let r = 0; r < 8; r++) { g.fillStyle = 'rgba(55,35,20,.45)'; g.fillRect(0, r * 32 + rnd() * 4, s, 3); } }), 1, 'bark');
const tLeaf = tex(C(256, 256, (g, s) => { g.fillStyle = '#3F9A3E'; g.fillRect(0, 0, s, s); dots(g, s, 520, ['#4DB04A', '#2F7F33', '#5DBE55', '#3A8F3A', '#6CCB5E'], 5, 16, .7); }), 1.5, 'leaf');
const tGranite = tex(C(256, 256, (g, s) => { g.fillStyle = '#C9C4B8'; g.fillRect(0, 0, s, s); dots(g, s, 1500, ['#A9A398', '#E2DED5', '#8F897F', '#BDB7AB'], .6, 2.2, .6); }), 1, 'granite');
const tCapiz = tex(C(128, 256, (g, w, h) => { g.fillStyle = '#6B4428'; g.fillRect(0, 0, w, h); const cw = (w - 16) / 4, ch = (h - 16) / 8; for (let r = 0; r < 8; r++) for (let c = 0; c < 4; c++) { const x = 8 + c * cw, y = 8 + r * ch, gr = g.createLinearGradient(x, y, x + cw, y + ch); gr.addColorStop(0, '#F4EEE0'); gr.addColorStop(1, '#D9CFBA'); g.fillStyle = gr; g.fillRect(x + 2, y + 2, cw - 4, ch - 4); } }), 0, 'capiz');
const plaque = (txt, bg, fg, w = 512, h = 76, font = 44) => tex(C(w, h, (g) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.strokeStyle = fg; g.lineWidth = 5; g.strokeRect(6, 6, w - 12, h - 12); g.fillStyle = fg; g.font = `900 ${font}px "Arial Black", Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, w / 2, h / 2 + 2); }), 0, 'plaque');
const star5 = (g, x, y, r) => { g.beginPath(); for (let i = 0; i < 10; i++) { const a = -PI / 2 + i * PI / 5, rr = i % 2 ? r * .42 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.fill(); };
const tFlagPH = tex(C(512, 256, (g) => { g.fillStyle = '#0038A8'; g.fillRect(0, 0, 512, 128); g.fillStyle = '#CE1126'; g.fillRect(0, 128, 512, 128); const tw = 256 * Math.sqrt(3) / 2;
  g.fillStyle = '#FFFFFF'; g.beginPath(); g.moveTo(0, 0); g.lineTo(tw, 128); g.lineTo(0, 256); g.fill(); g.fillStyle = '#FCD116'; const sx = tw * .36, sy = 128;
  for (let i = 0; i < 8; i++) { const a = i * PI / 4; g.beginPath(); g.moveTo(sx + Math.cos(a - .16) * 20, sy + Math.sin(a - .16) * 20); g.lineTo(sx + Math.cos(a) * 46, sy + Math.sin(a) * 46); g.lineTo(sx + Math.cos(a + .16) * 20, sy + Math.sin(a + .16) * 20); g.fill(); }
  g.beginPath(); g.arc(sx, sy, 19, 0, TAU); g.fill(); star5(g, 18, 24, 11); star5(g, 18, 232, 11); star5(g, tw - 24, 128, 11); }), 0, 'flag_ph');
const tFlagTP = tex(C(512, 256, (g) => { g.fillStyle = '#FFC93C'; g.fillRect(0, 0, 512, 256); for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? '#3B2316' : '#E2452E'; g.fillRect(i * 32, 0, 32, 18); g.fillRect(i * 32 + 16, 238, 32, 18); }
  g.fillStyle = '#3B2316'; g.font = '900 78px "Arial Black", Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('TAYMPERS', 256, 112); g.font = '900 40px "Arial Black", Arial, sans-serif'; g.fillStyle = '#E2452E'; g.fillText('I ♥ TP', 256, 182); }), 0, 'flag_taympers');
const tFrond = tex(C(128, 512, (g, w, h) => { g.lineCap = 'round'; for (let y = 24; y < h - 8; y += 8) { const t = 1 - y / h, L = 56 * Math.sin(PI * Math.min(1, t * 1.15)) + 6; g.strokeStyle = pick(['#4FAE3C', '#5DBE45', '#3E9A35', '#6CC94E']); g.lineWidth = 5;
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(64, y); g.quadraticCurveTo(64 + s * L * .6, y - L * .2, 64 + s * L, y - L * .55); g.stroke(); } } g.strokeStyle = '#B7A24A'; g.lineWidth = 6; g.beginPath(); g.moveTo(64, h); g.lineTo(64, 10); g.stroke(); }), 0, 'palm_frond');
tFrond.colorSpace = THREE.SRGBColorSpace;

// ---------- materials ----------
const std = (name, o) => Object.assign(new THREE.MeshStandardMaterial({ roughness: .85, ...o }), { name });
const own = m => (m.userData.ownUV = true, m);
const grass = std('grass', { map: tGrass }), cobble = std('cobble_path', { map: tCobble }), brick = std('plaza_brick', { map: tBrick }), baldosa = std('baldosa_tiles', { map: tBaldosa, roughness: .45 }),
  stucco = std('stucco_white', { map: tStucco }), stuccoCream = std('stucco_cream', { map: tStucco, color: '#FFEBC8' }), adobe = std('adobe_stone', { map: tAdobe }),
  roof = std('roof_tiles', { map: tRoof, roughness: .7 }), soil = std('soil', { map: tSoil }), rock = std('rock', { map: tRock, flatShading: true }), wood = std('wood', { map: tWood, roughness: .7 }),
  bark = std('bark', { map: tBark }), leaf = std('leaf', { map: tLeaf, flatShading: true }), leafLight = std('leaf_light', { map: tLeaf, color: '#CFF0A0', flatShading: true }), leafDark = std('leaf_dark', { map: tLeaf, color: '#A6C99A', flatShading: true }),
  granite = std('granite', { map: tGranite }), white = std('white_paint', { color: '#FBF7EF', roughness: .5 }), domeRed = std('dome_red', { color: '#D9442E', roughness: .45 }), domeCream = std('dome_cream', { color: '#F6E9CF', roughness: .45 }),
  gold = std('gold', { color: '#FFC93C', roughness: .3, metalness: .5 }), iron = std('iron', { color: '#2F3440', roughness: .45, metalness: .4 }), bronze = std('bronze', { color: '#6E5A3A', roughness: .4, metalness: .65 }),
  glass = std('window_dark', { color: '#2D4A63', roughness: .2, metalness: .1 }), doorWood = std('door_wood', { color: '#5A3420', roughness: .6 }), niche = std('niche_shadow', { color: '#6B5A44' }),
  glow = std('lamp_glow', { color: '#FFF2C2', emissive: '#FFD873', emissiveIntensity: .6, roughness: .3 }), heartRed = std('heart_red', { color: '#E2302E', roughness: .35 }),
  coconutM = std('coconut', { color: '#6B4A26' }), pinkF = std('bougainvillea', { color: '#E0338C', roughness: .6 }), santan = std('santan', { color: '#F25C2A', roughness: .6 }), yellowF = std('flower_yellow', { color: '#FFD23F', roughness: .6 }),
  capiz = own(std('capiz_window', { map: tCapiz, roughness: .4 })), flagPH = own(std('flag_ph', { map: tFlagPH, side: THREE.DoubleSide })), flagTP = own(std('flag_taympers', { map: tFlagTP, side: THREE.DoubleSide })),
  frondM = own(std('palm_frond', { map: tFrond, alphaTest: .5, side: THREE.DoubleSide, roughness: .7 })),
  plaqueMun = own(std('plaque_munisipyo', { map: plaque('MUNISIPYO', '#F3E7C9', '#3B2316') })), plaqueRizal = own(std('plaque_rizal', { map: plaque('DR. JOSE RIZAL', '#3C3A2E', '#E8C76A', 512, 256, 54), metalness: .4 }));
const bandColors = ['#E2452E', '#2E6FD8', '#FFC93C', '#FBF7EF'].map((c, i) => std('banderita_' + ['red', 'blue', 'yellow', 'white'][i], { color: c, side: THREE.DoubleSide, roughness: .7 }));

const fiestaBulb = std('fiesta_bulb', { color: '#FFF6D0', emissive: '#FFD873', emissiveIntensity: .25, roughness: .3 });
const horseM = std('horse_brown', { color: '#7A4E2D', roughness: .7 }), maneM = std('horse_mane', { color: '#2B1A10' }), plaqueKal = own(std('plaque_kalesa', { map: plaque('KALESA', '#3B2316', '#FFC93C'), side: THREE.DoubleSide }));
// ---------- helpers ----------
const mesh = (name, geo, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, m); o.name = name; o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; return o; };
const group = (name, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.name = name; g.position.set(x, y, z); return g; };
const B = (n, w, h, d, m, x, y, z) => mesh(n, new THREE.BoxGeometry(w, h, d), m, x, y + h / 2, z);
const archTop = (n, r, d, m, x, y, z) => mesh(n, new THREE.CylinderGeometry(r, r, d, 12, 1, false, PI / 2, PI).rotateX(PI / 2), m, x, y, z);
const arched = (n, w, h, d, m, x, y, z) => { const g = group(n, x, y, z); g.add(B(n + '_body', w, h, d, m, 0, 0, 0), archTop(n + '_arch', w / 2, d, m, 0, h, 0)); return g; };
function hipRoof(w, d, h, inset, over = .4) { const W = w / 2 + over, D = d / 2 + over, r = Math.min(inset, W); const c = [[-W, 0, D], [W, 0, D], [W, 0, -D], [-W, 0, -D]], r0 = [-W + r, h, 0], r1 = [W - r, h, 0];
  const tris = [[c[0], c[1], r1], [c[0], r1, r0], [c[2], c[3], r0], [c[2], r0, r1], [c[1], c[2], r1], [c[3], c[0], r0], [c[0], c[3], c[2]], [c[0], c[2], c[1]]];
  const pos = new Float32Array(tris.length * 9); tris.forEach((t, i) => t.forEach((p, j) => pos.set(p, i * 9 + j * 3))); const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.computeVertexNormals(); return g; }
// Merge every mesh under g into one mesh per material; box-project UVs in meters unless the material owns its UVs.
function bake(g) {
  g.updateMatrixWorld(true); const inv = g.matrixWorld.clone().invert(), buckets = new Map();
  g.traverse(o => { if (!o.isMesh) return; const geo = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone(); geo.applyMatrix4(inv.clone().multiply(o.matrixWorld)); if (!geo.attributes.normal) geo.computeVertexNormals();
    if (!buckets.has(o.material)) buckets.set(o.material, []); buckets.get(o.material).push(geo); });
  g.clear();
  for (const [m, list] of buckets) { const n = list.reduce((s, x) => s + x.attributes.position.count, 0), P = new Float32Array(n * 3), N = new Float32Array(n * 3), U = new Float32Array(n * 2); let off = 0;
    for (const x of list) { const p = x.attributes.position.array, nn = x.attributes.normal.array, uv = x.attributes.uv && x.attributes.uv.array, c = x.attributes.position.count; P.set(p, off * 3); N.set(nn, off * 3);
      for (let i = 0; i < c; i++) { let u, v; if (m.userData.ownUV && uv) { u = uv[i * 2]; v = uv[i * 2 + 1]; } else { const ax = Math.abs(nn[i * 3]), ay = Math.abs(nn[i * 3 + 1]), az = Math.abs(nn[i * 3 + 2]), X = p[i * 3], Y = p[i * 3 + 1], Z = p[i * 3 + 2];
        if (ay >= ax && ay >= az) { u = X; v = -Z; } else if (ax >= az) { u = Z; v = Y; } else { u = X; v = Y; } } U[(off + i) * 2] = u; U[(off + i) * 2 + 1] = v; }
      off += c; x.dispose(); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(P, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(N, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(U, 2));
    g.add(mesh(`${g.name}__${m.name}`, geo, m)); }
  return g;
}

// ---------- island shape ----------
const RX = 40, RZ = 34, IZ = 0;
const blobR = a => 1 + .04 * Math.sin(a) + .035 * Math.cos(3 * a + .6) + .025 * Math.cos(5 * a + 2.1);
const blobShape = (rx, rz, s, f, N = 96) => { const sh = new THREE.Shape(); for (let i = 0; i < N; i++) { const a = i / N * TAU, r = f(a) * s, x = Math.cos(a) * rx * r, y = Math.sin(a) * rz * r; i ? sh.lineTo(x, y) : sh.moveTo(x, y); } sh.closePath(); return sh; };
const inIsland = (x, z, m = 1) => Math.hypot(x / RX, (z - IZ) / RZ) < blobR(Math.atan2(-(z - IZ) / RZ, x / RX)) * m;
const chk = (label, x, z) => { if (!inIsland(x, z, .97)) warn('off-island:', label, x.toFixed(1), z.toFixed(1)); };
function islandBody(name, rx, rz, depth, f, nRoots, chunks = 0, N = 96) {
  const g = group(name);
  g.add(mesh('grass_cap', new THREE.ExtrudeGeometry(blobShape(rx, rz, 1, f, N), { depth: .3, bevelEnabled: true, bevelThickness: .15, bevelSize: .3, bevelSegments: 3, curveSegments: 2 }).rotateX(-PI / 2), grass, 0, -.45, 0));
  const ch = Math.min(2.2, depth * .22);
  g.add(mesh('cliff', new THREE.ExtrudeGeometry(blobShape(rx, rz, .985, f, N), { depth: ch - .15, bevelEnabled: true, bevelThickness: .1, bevelSize: .1, bevelSegments: 1, curveSegments: 2 }).rotateX(-PI / 2), soil, 0, -.45 - ch, 0));
  const prof = [[.97, 0], [.9, -.14], [.68, -.32], [.5, -.52], [.32, -.72], [.15, -.88], [.03, -1]].reverse().map(([r, y]) => new THREE.Vector2(r * rx, y * depth));
  const lat = new THREE.LatheGeometry(prof, 14), p = lat.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(z, x), k = 1 + (.08 * Math.sin(5 * a + y * .9) + .05 * Math.sin(9 * a - y * 1.7)) * (y < -.1 * depth ? 1 : .3); p.setXYZ(i, x * k, y, z * k * rz / rx); }
  lat.computeVertexNormals(); g.add(mesh('underside', lat, rock, 0, -.4 - ch, 0));
  for (let i = 0; i < nRoots; i++) { const a = i / nRoots * TAU + rnd() * .3, r = f(a) * .97, L = .6 + rnd() * 1.6; g.add(mesh('vine', new THREE.CylinderGeometry(.05, .02, L, 5), leafDark, Math.cos(a) * rx * r, -.4 - L / 2, -Math.sin(a) * rz * r)); }
  for (let i = 0; i < chunks; i++) { const a = i / chunks * TAU + .5, r = 1.08 + rnd() * .1, s = .5 + rnd() * .9; const c = mesh('float_rock', new THREE.DodecahedronGeometry(s, 0), rock, Math.cos(a) * rx * r, -2.2 - rnd() * 3, -Math.sin(a) * rz * r); c.rotation.set(rnd() * 3, rnd() * 3, 0); g.add(c); }
  return g;
}

const root = group('isla3_aplaya');

// ---------- PROPS ----------
const props = group('props'); root.add(props);
function frondGeo(L, lift) { const geo = new THREE.PlaneGeometry(1.1, L, 2, 8).translate(0, L / 2, 0).rotateX(-PI / 2), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const t = -p.getZ(i) / L, x = p.getX(i); p.setY(i, L * (.32 * t - .55 * t * t) + lift * t - Math.abs(x) * .3); } geo.computeVertexNormals(); return geo; }
function palm(name, x, z, h, lean, dir) { const g = group(name, x, 0, z), n = 7, pts = [];
  for (let i = 0; i <= n; i++) { const t = i / n; pts.push(new THREE.Vector3(Math.cos(dir) * lean * t * t, h * t, -Math.sin(dir) * lean * t * t)); }
  for (let i = 0; i < n; i++) { const a = pts[i], b = pts[i + 1], d = b.clone().sub(a), L = d.length(), r0 = .24 - .1 * i / n, r1 = .24 - .1 * (i + 1) / n;
    const s = mesh('trunk', new THREE.CylinderGeometry(r1, r0, L * 1.04, 7), bark, (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2); s.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); g.add(s); }
  g.add(mesh('root_flare', new THREE.CylinderGeometry(.24, .4, .4, 7), bark, 0, .2, 0)); const top = pts[n];
  for (let k = 0; k < 12; k++) { const f = mesh('frond', frondGeo(3 + rnd() * .9, k % 2 ? .35 : .05), frondM); f.position.copy(top); f.rotation.y = k / 12 * TAU + rnd() * .2; g.add(f); }
  for (let k = 0; k < 4; k++) { const a = k * TAU / 4 + .3; g.add(mesh('coconut', new THREE.SphereGeometry(.16, 8, 6), coconutM, top.x + Math.cos(a) * .22, top.y - .22, top.z + Math.sin(a) * .22)); }
  return g; }
function acacia(name, x, z, s) { const g = group(name, x, 0, z); g.add(mesh('trunk', new THREE.CylinderGeometry(.26 * s, .42 * s, 2.6 * s, 8), bark, 0, 1.3 * s, 0));
  for (let k = 0; k < 4; k++) { const a = k / 4 * TAU + .4, br = mesh('branch', new THREE.CylinderGeometry(.1 * s, .2 * s, 2.6 * s, 6), bark, Math.cos(a) * .8 * s, 3.5 * s, Math.sin(a) * .8 * s); br.rotation.set(Math.sin(a) * .7, 0, -Math.cos(a) * .7); g.add(br); }
  const cl = [[0, 5.1, 0, 2.1], ...Array.from({ length: 6 }, (_, i) => { const a = i / 6 * TAU; return [Math.cos(a) * 2.1, 4.7 + (i % 2) * .3, Math.sin(a) * 2.1, 1.55]; })];
  cl.forEach(([cx, cy, cz, r], i) => { const c = mesh('canopy', new THREE.IcosahedronGeometry(r * s, 1), i % 2 ? leafLight : leaf, cx * s, cy * s, cz * s); c.scale.y = .55; g.add(c); }); return g; }
function bush(name, x, z, s, fl, y = 0) { const g = group(name, x, y, z); for (let k = 0; k < 3; k++) { const b = mesh('bush', new THREE.IcosahedronGeometry(s * (1 - k * .18), 1), [leaf, leafDark, leafLight][k], (k - 1) * s * .75, s * .6, (rnd() - .5) * s * .5); b.scale.y = .8; g.add(b); }
  if (fl) for (let k = 0; k < 5; k++) { const a = rnd() * TAU; g.add(mesh('flower', new THREE.IcosahedronGeometry(.1, 0), fl, Math.cos(a) * s * 1.1, s * (.75 + rnd() * .45), Math.sin(a) * s * .7)); } return g; }
function bench(name, a, r) { const g = group(name, Math.sin(a) * r, .09, Math.cos(a) * r); g.rotation.y = a + PI;
  g.add(B('seat', 1.6, .07, .45, wood, 0, .42, 0), B('back', 1.6, .3, .05, wood, 0, .58, -.22)); for (const s of [-1, 1]) g.add(B('leg', .07, .45, .45, iron, s * .68, 0, 0), B('back_post', .06, .5, .06, iron, s * .68, .4, -.22)); return g; }
function lamp(name, x, z) { const g = group(name, x, .09, z); g.add(mesh('base', new THREE.CylinderGeometry(.18, .24, .4, 8), iron, 0, .2, 0), mesh('pole', new THREE.CylinderGeometry(.06, .08, 3.2, 8), iron, 0, 2.0, 0), mesh('collar', new THREE.TorusGeometry(.11, .03, 4, 10).rotateX(PI / 2), iron, 0, 3.55, 0));
  g.add(mesh('globe', new THREE.SphereGeometry(.24, 12, 8), glow, 0, 3.82, 0), mesh('cap', new THREE.ConeGeometry(.2, .2, 8), iron, 0, 4.12, 0)); return g; }
function bed(name, x, z, w, d, fls) { const g = group(name, x, 0, z); g.add(B('curb_f', w, .25, .15, granite, 0, 0, d / 2), B('curb_b', w, .25, .15, granite, 0, 0, -d / 2));
  for (const s of [-1, 1]) g.add(B('curb_s', .15, .25, d, granite, s * w / 2, 0, 0)); g.add(B('soil', w - .15, .2, d - .15, soil, 0, 0, 0));
  const n = Math.max(2, Math.round(w / .7)); for (let i = 0; i < n; i++) g.add(bush('plant', -w / 2 + .4 + i * (w - .8) / (n - 1), 0, .3, fls[i % fls.length], .15)); return g; }


// ---------- PALENGKE MATERIALS ----------
const tConcrete = tex(C(512, 512, (g, s) => { const w = s / 4; for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { const v = 196 + (rnd() * 22 | 0); g.fillStyle = 'rgb(' + v + ',' + (v - 3) + ',' + (v - 8) + ')'; g.fillRect(c * w, r * w, w, w); }
  dots(g, s, 1600, ['#A9A49B', '#D9D5CC', '#8F8A82'], .6, 2, .5); dots(g, s, 26, ['#8A8378', '#6F6A62'], 14, 40, .1);
  g.strokeStyle = '#7E7970'; g.lineWidth = 3; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * w, 0); g.lineTo(i * w, s); g.stroke(); g.beginPath(); g.moveTo(0, i * w); g.lineTo(s, i * w); g.stroke(); }
  g.strokeStyle = 'rgba(70,64,58,.75)'; g.lineWidth = 1.6; for (let i = 0; i < 9; i++) { let x = rnd() * s, y = rnd() * s; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (rnd() - .5) * 46; y += (rnd() - .5) * 46; g.lineTo(x, y); if (rnd() > .6) { g.moveTo(x, y); } } g.stroke(); } }), 2.4, 'concrete_tiles');
const concrete = std('concrete_tiles', { map: tConcrete, roughness: .9 }), concreteWet = std('concrete_wet', { map: tConcrete, color: '#B9BEC2', roughness: .22, metalness: .05 }), aisle = std('aisle_concrete', { map: tConcrete, color: '#FFFDF6', roughness: .85 });
const yellowLine = std('aisle_line_yellow', { color: '#F2B705', roughness: .6 }), asphalt = std('street_asphalt', { map: tex(C(256, 256, (g, s) => { g.fillStyle = '#5B5A58'; g.fillRect(0, 0, s, s); dots(g, s, 1400, ['#4A4947', '#6E6D6A', '#7C7B77'], .6, 1.8, .6); }), 2, 'asphalt'), roughness: .9 });
const tGI = tex(C(256, 256, (g, s) => { for (let x = 0; x < s; x += 16) { const gr = g.createLinearGradient(x, 0, x + 16, 0); gr.addColorStop(0, '#8C939A'); gr.addColorStop(.5, '#C9CED3'); gr.addColorStop(1, '#8C939A'); g.fillStyle = gr; g.fillRect(x, 0, 16, s); } dots(g, s, 90, ['#9C6B3E', '#7E5634'], 3, 12, .25); }), 1, 'gi_sheet');
const giRoof = std('gi_roof', { map: tGI, metalness: .5, roughness: .45, side: THREE.DoubleSide });
const tarps = ['#2E6FD8', '#F07C1E', '#3BAA4A', '#E2452E', '#13A39A'].map((c, i) => std('tarp_' + i, { color: c, roughness: .7, side: THREE.DoubleSide }));
const tWoven = tex(C(256, 256, (g, s) => { g.fillStyle = '#B98A4E'; g.fillRect(0, 0, s, s); for (let y = 0; y < s; y += 16) for (let x = 0; x < s; x += 16) { const o = ((x + y) / 16) % 2; g.fillStyle = o ? '#D4A866' : '#A97A42'; g.fillRect(x + (o ? 0 : 2), y + (o ? 2 : 0), o ? 16 : 12, o ? 12 : 16); } }), .4, 'woven');
const woven = std('woven_buri', { map: tWoven, roughness: .85 }), sack = std('rice_sack', { map: tWoven, color: '#EDE3CF', roughness: .9 });
const tTileW = tex(C(256, 256, (g, s) => { g.fillStyle = '#9FA7AE'; g.fillRect(0, 0, s, s); for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = rnd() > .1 ? '#F4F6F7' : '#DDE3E8'; g.fillRect(x * 32 + 2, y * 32 + 2, 28, 28); } }), .6, 'white_tiles');
const tileWhite = std('counter_tiles', { map: tTileW, roughness: .3 });
const crateTex = col => tex(C(128, 128, (g, s) => { g.fillStyle = col; g.fillRect(0, 0, s, s); g.clearRect(0, 0, 0, 0); for (let y = 0; y < 4; y++) for (let x = 0; x < 6; x++) g.clearRect(10 + x * 19, 14 + y * 26, 12, 16); }), 0, 'crate');
const crates = ['#D9442E', '#2E6FD8', '#F2B705'].map((c, i) => own(std('plastic_crate_' + i, { map: crateTex(c), alphaTest: .5, side: THREE.DoubleSide, roughness: .5 })));
const P = (n, c, o = {}) => std(n, { color: c, roughness: .55, ...o });
const plasticWhite = P('monobloc_white', '#F4F2EC', { roughness: .4 }), plasticRed = P('monobloc_red', '#D33A2C', { roughness: .4 }), styro = P('styro_box', '#F7F7F4', { roughness: .95 }), drumBlue = P('water_drum_blue', '#1E5FB4', { roughness: .4 });
const steel = std('steel', { color: '#C9CED6', metalness: .7, roughness: .35 }), ice = P('ice', '#D7EEF8', { roughness: .1 }), fishM = P('fish_silver', '#9FB1BE', { metalness: .45, roughness: .3 }), fishB = P('fish_blue', '#4E6E8C', { metalness: .35, roughness: .35 });
const meat = P('meat_red', '#B8423A'), fat = P('meat_fat', '#F1C8B8'), longg = P('longganisa', '#8E2E22', { roughness: .4 });
const VEG = { tomato: P('tomato', '#E03A2A', { roughness: .35 }), eggplant: P('eggplant', '#5B2A6E', { roughness: .3 }), cabbage: P('cabbage', '#9CCB5E'), carrot: P('carrot', '#F07C1E'), onion: P('onion', '#B04A6A', { roughness: .4 }), kalabasa: P('kalabasa', '#D9822B'), sitaw: P('sitaw', '#4F9A34'), calamansi: P('calamansi', '#5DAA2E', { roughness: .4 }) };
const FRUIT = { mango: P('mango', '#F7B733', { roughness: .4 }), banana: P('banana', '#F2D23C', { roughness: .45 }), watermelon: P('watermelon', '#2F7A33', { roughness: .4 }), pineapple: P('pineapple', '#C9932F'), papaya: P('papaya', '#E9A13B') };
const KAK = [P('puto_white', '#FAF6EC'), P('kutsinta_brown', '#8A4A1E', { roughness: .3 }), P('ube_purple', '#6B3C8F', { roughness: .4 }), P('cassava_gold', '#E6B54A', { roughness: .4 })], bananaLeaf = P('banana_leaf', '#3E8E3A', { side: THREE.DoubleSide });
const rice = P('rice_white', '#F5F1E6', { roughness: .95 }), cloth = ['#E2452E', '#2E6FD8', '#F2B705', '#3BAA4A', '#E8559A', '#FBF7EF', '#13A39A', '#7B4BC4'].map((c, i) => P('cloth_' + i, c, { roughness: .9 }));
const paintBlue = P('paint_blue', '#2E6FD8'), paintGreen = P('paint_green', '#3BAA4A'), paintYellow = P('paint_yellow', '#FFC93C'), paintRed = domeRed;
const signCache = {}; const signMat = t => signCache[t] || (signCache[t] = own(std('sign_' + t.toLowerCase().replace(/[^a-z]/g, '_'), { map: plaque(t, '#FFF4DC', '#3B2316', 512, 96, t.length > 12 ? 40 : 52), side: THREE.DoubleSide })));
const dialMat = own(std('scale_dial', { roughness: .3, map: tex(C(512, 512, (g) => { g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, 512, 512); g.strokeStyle = '#1D1F20'; g.lineWidth = 14; g.beginPath(); g.arc(256, 256, 236, 0, TAU); g.stroke();
  g.fillStyle = '#1D1F20'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '900 40px "Arial Black", Arial, sans-serif';
  for (let i = 0; i <= 50; i++) { const a = -PI / 2 + i / 50 * TAU * .9 - TAU * .45 + PI / 2, r0 = i % 5 ? 196 : 176; g.lineWidth = i % 5 ? 3 : 7; g.beginPath(); g.moveTo(256 + Math.cos(a) * r0, 256 + Math.sin(a) * r0); g.lineTo(256 + Math.cos(a) * 220, 256 + Math.sin(a) * 220); g.stroke(); if (!(i % 5)) g.fillText(String(i / 5), 256 + Math.cos(a) * 140, 256 + Math.sin(a) * 140); }
  g.font = '900 34px "Arial Black", Arial, sans-serif'; g.fillStyle = '#E2452E'; g.fillText('KG', 256, 350); g.strokeStyle = '#E2452E'; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.moveTo(256, 256); g.lineTo(256 + Math.cos(-.5) * 190, 256 + Math.sin(-.5) * 190); g.stroke(); g.fillStyle = '#1D1F20'; g.beginPath(); g.arc(256, 256, 18, 0, TAU); g.fill(); }), 0, 'scale_dial') }));

// ---------- PALENGKE GEOMETRY HELPERS ----------
const landmarks = group('landmarks'); root.add(landmarks);
const V = (x, z) => new THREE.Vector3(x, 0, z);
const line = (a, b, n) => Array.from({ length: n + 1 }, (_, i) => a.clone().lerp(b, i / n));
function ribbon(name, pts, w, m, y, closed = false) { const n = pts.length, Pp = [], idx = [];
  for (let i = 0; i < n; i++) { const a = pts[closed ? (i - 1 + n) % n : Math.max(0, i - 1)], b = pts[closed ? (i + 1) % n : Math.min(n - 1, i + 1)], d = b.clone().sub(a).setY(0).normalize(), p = pts[i];
    Pp.push(p.x - d.z * w / 2, y, p.z + d.x * w / 2, p.x + d.z * w / 2, y, p.z - d.x * w / 2); }
  for (let i = 0; i < (closed ? n : n - 1); i++) { const a = i * 2, b = ((i + 1) % n) * 2; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(Pp, 3)); g.setIndex(idx); g.computeVertexNormals(); return mesh(name, g, m); }
const offsetPts = (pts, d, closed) => pts.map((p, i) => { const n = pts.length, a = pts[closed ? (i - 1 + n) % n : Math.max(0, i - 1)], b = pts[closed ? (i + 1) % n : Math.min(n - 1, i + 1)], t = b.clone().sub(a).setY(0).normalize(); return V(p.x - t.z * d, p.z + t.x * d); });
function roundPath(pts, r) { const cp = new THREE.CurvePath(); let cur = pts[0]; for (let i = 1; i < pts.length; i++) { const p = pts[i]; if (i < pts.length - 1) { const nx = pts[i + 1], a = p.clone().add(cur.clone().sub(p).setLength(r)), b = p.clone().add(nx.clone().sub(p).setLength(r)); cp.add(new THREE.LineCurve3(cur, a)); cp.add(new THREE.QuadraticBezierCurve3(a, p, b)); cur = b; } else cp.add(new THREE.LineCurve3(cur, p)); } return cp; }
const strut = (n, a, b, r, m) => { const d = b.clone().sub(a), o = mesh(n, new THREE.CylinderGeometry(r, r, d.length(), 6), m, (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2); o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return o; };
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- PROPS: market things ----------
const monobloc = (x, z, ry, m = plasticWhite) => { const g = group('monobloc_chair', x, 0, z); g.rotation.y = ry; g.add(B('seat', .44, .05, .42, m, 0, .43, 0)); const bk = B('back', .44, .45, .04, m, 0, .46, -.21); bk.rotation.x = -.12; g.add(bk);
  for (const sx of [-.21, .21]) for (const sz of [-.19, .19]) g.add(mesh('leg', new THREE.CylinderGeometry(.022, .03, .44, 6), m, sx, .22, sz)); return g; };
const monoTable = (x, z, m = plasticWhite) => { const g = group('monobloc_table', x, 0, z); g.add(mesh('top', new THREE.CylinderGeometry(.45, .45, .04, 16), m, 0, .72, 0), mesh('stem', new THREE.CylinderGeometry(.05, .2, .7, 8), m, 0, .35, 0)); return g; };
const crate = (x, y, z, i = 0, ry = 0) => { const c = B('plastic_crate', .5, .3, .36, crates[i % 3], x, y, z); c.rotation.y = ry; return c; };
const bayong = (x, y, z) => { const g = group('bayong', x, y, z); g.add(B('bag', .34, .34, .18, woven, 0, 0, 0)); for (const s of [-1, 1]) g.add(mesh('handle', new THREE.TorusGeometry(.08, .012, 4, 10, PI), woven, s * .08, .34, 0)); return g; };
const bilao = (x, y, z, r = .34) => mesh('bilao', new THREE.CylinderGeometry(r, r * .94, .05, 14), woven, x, y + .025, z);
const drum = (x, z) => { const g = group('water_drum', x, 0, z); g.add(mesh('drum', new THREE.CylinderGeometry(.29, .29, .9, 12), drumBlue, 0, .45, 0), mesh('rib', new THREE.TorusGeometry(.295, .02, 4, 16).rotateX(PI / 2), drumBlue, 0, .3, 0), mesh('rib', new THREE.TorusGeometry(.295, .02, 4, 16).rotateX(PI / 2), drumBlue, 0, .6, 0)); return g; };
const pile = (g, mats, x, y, z, n, r, spread, shape = 's') => { for (let i = 0; i < n; i++) { const a = rnd() * TAU, d = Math.sqrt(rnd()) * spread, hy = y + r + (1 - d / spread) * spread * .55, m = Array.isArray(mats) ? pick(mats) : mats;
  const geo = shape === 'c' ? new THREE.CapsuleGeometry(r * .7, r * 2.2, 2, 6).rotateZ(PI / 2) : shape === 'k' ? new THREE.ConeGeometry(r * .6, r * 3, 5).rotateZ(PI / 2) : new THREE.SphereGeometry(r, 6, 4); const o = mesh('produce', geo, m, x + Math.cos(a) * d, hy, z + Math.sin(a) * d); o.rotation.y = rnd() * TAU; g.add(o); } };
function bicycle(name, x, z, ry, basket = true, frame = domeRed) { const g = group(name, x, 0, z); g.rotation.y = ry;
  for (const dx of [-.55, .55]) g.add(mesh('wheel', new THREE.TorusGeometry(.33, .025, 5, 18), iron, dx, .33, 0), mesh('hub', new THREE.CylinderGeometry(.03, .03, .08, 6).rotateX(PI / 2), steel, dx, .33, 0));
  [[[-.55, .33], [-.12, .86]], [[-.12, .86], [.36, .82]], [[.36, .82], [.55, .33]], [[.36, .82], [0, .38]], [[-.55, .33], [0, .38]], [[-.12, .86], [0, .38]], [[.36, .82], [.42, 1.02]]].forEach(([a, b]) => g.add(strut('frame', v3(a[0], a[1], 0), v3(b[0], b[1], 0), .022, frame)));
  g.add(strut('handlebar', v3(.42, 1.02, -.26), v3(.42, 1.02, .26), .018, iron), B('saddle', .24, .05, .12, iron, -.14, .88, 0));
  if (basket) g.add(B('basket', .36, .24, .32, woven, .74, .78, 0)); return g; }
function padyak(name, x, z, ry) { const g = bicycle(name, x, z, ry, false, paintBlue); g.add(B('sidecar', 1.05, .7, .78, paintBlue, .05, .38, .78), B('sidecar_seat', .9, .1, .6, iron, .05, .75, .78), B('sidecar_roof', 1.2, .06, .95, paintYellow, .05, 1.55, .78));
  for (const dx of [-.5, .55]) g.add(mesh('roof_post', new THREE.CylinderGeometry(.02, .02, .82, 5), iron, dx, 1.14, 1.2));
  g.add(mesh('sidecar_wheel', new THREE.TorusGeometry(.26, .025, 5, 16), iron, .05, .26, 1.22), mesh('sign', new THREE.PlaneGeometry(.9, .18), signMat('PADYAK'), .05, .6, 1.18)); return g; }
function kariton(name, x, z, ry) { const g = group(name, x, 0, z); g.rotation.y = ry; for (const s of [-1, 1]) g.add(mesh('wheel', new THREE.TorusGeometry(.28, .04, 5, 14), iron, -.2, .28, s * .42));
  g.add(B('bed', 1.3, .3, .74, wood, 0, .4, 0), strut('handle', v3(.6, .6, -.3), v3(1.3, .85, -.3), .025, wood), strut('handle', v3(.6, .6, .3), v3(1.3, .85, .3), .025, wood), crate(-.3, .7, 0, 1), crate(.25, .7, 0, 2)); return g; }
function umbrellaTop(g, x, y, r, cols) { g.add(mesh('umbrella_pole', new THREE.CylinderGeometry(.03, .03, y, 6), iron, x, y / 2, 0)); for (let i = 0; i < 8; i++) g.add(mesh('umbrella_panel', new THREE.ConeGeometry(r, .5, 1, 1, true, i * PI / 4, PI / 4), cols[i % 2], x, y + .22, 0)); g.add(mesh('umbrella_tip', new THREE.SphereGeometry(.05, 6, 4), white, x, y + .48, 0)); }

// ---------- LIVED-IN CLUTTER ----------
const plywood = P('plywood', '#C9A877', { roughness: .9 }), cardboard = P('cardboard', '#B58B5A', { roughness: .95 }), trashBag = P('trash_bag', '#1E1E1E', { roughness: .35 }), plasticBag = [P('plastic_bag_white', '#F2F2EE', { roughness: .3 }), P('plastic_bag_pink', '#F08BB2', { roughness: .3 }), P('plastic_bag_yellow', '#F7DA57', { roughness: .3 })];
const bulbGlow = std('bare_bulb', { color: '#FFF4C8', emissive: '#FFD873', emissiveIntensity: .5 }), wireM = P('electric_wire', '#151515', { roughness: .5 }), buko = P('buko_green', '#6FA33A', { roughness: .45 }), chickenW = P('chicken_white', '#F3EEE4'), chickenB = P('chicken_brown', '#9A5B2E'), comb = P('chicken_comb', '#D7322B'), cageM = own(std('wire_cage', { map: crateTex('#8E9399'), alphaTest: .5, side: THREE.DoubleSide, metalness: .4, roughness: .5 })), gallon = P('water_gallon', '#5DA9E9', { roughness: .15, transparent: true, opacity: .8 }), charcoal = P('uling_sack', '#2B2B2B', { roughness: .9 });
function mess(g) { if (rnd() < .5) for (let k = 0; k < 3 + (rnd() * 4 | 0); k++) g.add(B('plastic_bags', .12, .2, .03, pick(plasticBag), -1.2 + rnd() * 2.4, 1.85 + rnd() * .2, 1.05));
  if (rnd() < .4) { const bx = (rnd() - .5) * 2; g.add(mesh('bulb_wire', new THREE.CylinderGeometry(.006, .006, .5, 3), wireM, bx, 2.1, .4), mesh('bare_bulb', new THREE.SphereGeometry(.06, 6, 4), bulbGlow, bx, 1.83, .4)); }
  if (rnd() < .55) { const sx = pick([-1.7, 1.7]), r = rnd(); g.add(r < .35 ? B('styro_box', .6, .36, .42, styro, sx, 0, -.6) : r < .7 ? crate(sx, 0, -.6, rnd() * 3 | 0, rnd()) : B('cardboard_box', .5, .35, .4, cardboard, sx, 0, -.6)); }
  if (rnd() < .3) g.add(monobloc((rnd() - .5) * 1.6, -.35, PI + (rnd() - .5), rnd() < .5 ? plasticRed : plasticWhite));
  if (rnd() < .25) g.add(mesh('trash_bag', new THREE.SphereGeometry(.22, 6, 4), trashBag, pick([-1.6, 1.6]), .18, -1.1)); }
function groundVendor(name, x, z, ry) { const g = group(name, x, .065, z); g.rotation.y = ry; g.add(B('sack_mat', 1.8, .02, 1.1, sack, 0, 0, .2)); const vg = [...Object.values(VEG), ...Object.values(FRUIT)];
  for (let k = 0; k < 3; k++) { const m = pick(vg); if (rnd() < .5) { g.add(bilao(-.55 + k * .55, .02, .25, .26)); pile(g, m, -.55 + k * .55, .07, .25, 8, .07, .18); } else pile(g, m, -.55 + k * .55, .02, .25, 10, .08, .24); }
  umbrellaTop(g, -.7, 2.1, 1.2, pick([[paintBlue, white], [paintYellow, paintRed], [paintGreen, white]])); g.add(B('bangkito', .35, .3, .25, wood, .7, 0, -.55), mesh('trash_bag', new THREE.SphereGeometry(.18, 6, 4), pick(plasticBag), .9, .15, .5)); return g; }

// ---------- APLAYA MATERIALS ----------
const tSand = tex(C(512, 512, (g, s) => { g.fillStyle = '#F6EEDB'; g.fillRect(0, 0, s, s); dots(g, s, 2600, ['#ECE1C8', '#FFFBF0', '#E0D3B6', '#F2E6CC'], .6, 2.2, .6); dots(g, s, 70, ['#E3D4B2', '#FFF9EE'], 12, 34, .28); g.strokeStyle = 'rgba(190,170,130,.35)'; g.lineWidth = 2;
  for (let y = 0; y < s; y += 22) { g.beginPath(); for (let x = 0; x <= s; x += 16) g.lineTo(x, y + Math.sin(x / s * TAU * 3 + y) * 4); g.stroke(); } dots(g, s, 40, ['#E8A0A0', '#FFFFFF', '#C9B6E4'], 1.5, 3, .8); }), 3, 'white_sand');
const sand = std('white_sand', { map: tSand, roughness: .95 }), wetSand = std('wet_sand', { map: tSand, color: '#DCCFB4', roughness: .55 }), sandPath = std('sand_trail', { map: tSand, color: '#E9D9B6', roughness: .9 });
const waterM = std('lagoon_water', { vertexColors: true, roughness: .06, metalness: .1, transparent: true, opacity: .9 }), channelWater = std('channel_water', { color: '#43CFC9', roughness: .06, metalness: .1, transparent: true, opacity: .9 });
const foam = std('surf_foam', { color: '#FFFFFF', roughness: .4, transparent: true, opacity: .85 });
const tThatch = tex(C(256, 256, (g, s) => { g.fillStyle = '#B48A4E'; g.fillRect(0, 0, s, s); g.lineWidth = 2; for (let i = 0; i < 900; i++) { const x = rnd() * s, y = rnd() * s; g.strokeStyle = pick(['#9C7440', '#C9A063', '#8A6436', '#D3AE70']); g.beginPath(); g.moveTo(x, y); g.lineTo(x + (rnd() - .5) * 4, y + 10 + rnd() * 10); g.stroke(); } for (let y = 0; y < s; y += 32) { g.fillStyle = 'rgba(60,40,20,.25)'; g.fillRect(0, y, s, 3); } }), 1, 'nipa_thatch');
const nipa = std('nipa_thatch', { map: tThatch, roughness: .95, side: THREE.DoubleSide }), bamboo = P('bamboo', '#C9A75A', { roughness: .6 }), bambooDark = P('bamboo_dark', '#9E7E3C', { roughness: .6 });
const netM = own(std('fishing_net', { map: tex(C(128, 128, (g, s) => { g.strokeStyle = '#ECE6D4'; g.lineWidth = 3; for (let i = -s; i < 2 * s; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + s, s); g.stroke(); g.beginPath(); g.moveTo(i + s, 0); g.lineTo(i, s); g.stroke(); } }), 0, 'fishing_net'), alphaTest: .4, side: THREE.DoubleSide }));
const fallM = own(std('waterfall', { map: tex(C(128, 256, (g, w, h) => { g.fillStyle = '#CFF5F7'; g.fillRect(0, 0, w, h); for (let i = 0; i < 60; i++) { g.fillStyle = pick(['#FFFFFF', '#A8E9EE', '#E8FBFC']); g.fillRect(rnd() * w, 0, 1 + rnd() * 3, h); } }), 0, 'fall_streaks'),
  alphaMap: tex(C(16, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#fff'); gr.addColorStop(.7, '#999'); gr.addColorStop(1, '#000'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }), 0, 'fall_alpha'), transparent: true, depthWrite: false, side: THREE.DoubleSide, emissive: '#7FD9E3', emissiveIntensity: .25, roughness: .2 }));
const limestone = std('limestone', { map: tRock, color: '#D8D3C4', flatShading: true, roughness: .9 }), mangroveLeaf = std('mangrove_leaf', { map: tLeaf, color: '#8FB37A', flatShading: true }), stoneGrey = P('stone_grey', '#8C8880', { flatShading: true });
const flame = std('flame', { color: '#FF9A2E', emissive: '#FF6A00', emissiveIntensity: .9, roughness: .5 }), flameY = std('flame_yellow', { color: '#FFE070', emissive: '#FFC21A', emissiveIntensity: .9 });
const vestOrange = P('life_vest', '#FF6A1A'), shellPink = P('shell_pink', '#F4C7C0'), shellWhite = P('shell_white', '#FBF6EE'), starfishM = P('starfish', '#F28A3A'), cloud = std('cloud', { color: '#FFFFFF', emissive: '#FFFFFF', emissiveIntensity: .15, roughness: 1 }), coconutWhite = P('coconut_meat', '#FBF8EF');
const lagoonSignMat = t => signMat(t);
function ribbonY(name, pts, w, m, dy = 0) { const n = pts.length, Pp = [], idx = []; for (let i = 0; i < n; i++) { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], d = b.clone().sub(a).setY(0).normalize(), p = pts[i]; Pp.push(p.x - d.z * w / 2, p.y + dy, p.z + d.x * w / 2, p.x + d.z * w / 2, p.y + dy, p.z - d.x * w / 2); }
  for (let i = 0; i < n - 1; i++) { const a = i * 2, b = (i + 1) * 2; idx.push(a, b, a + 1, b, b + 1, a + 1); } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(Pp, 3)); g.setIndex(idx); g.computeVertexNormals(); return mesh(name, g, m); }

// ---------- LAYOUT ----------
const LA = 16, LB = 10, LZ = -1, lagR = a => 1 + .06 * Math.cos(3 * a + .4) + .04 * Math.cos(5 * a + 1.3);
const lagPt = (a, s) => V(Math.cos(a) * LA * s * lagR(a), LZ - Math.sin(a) * LB * s * lagR(a));
const inLagoon = (x, z, s = 1) => { const a = Math.atan2(-(z - LZ) / LB, x / LA); return Math.hypot(x / LA, (z - LZ) / LB) < lagR(a) * s; };
const MA = 27, MB = 19, NM = 80, NW = 26, FORK = 20, MERGE = 60, BOAT_A = 12, BOAT_B = 40;   // the bangka: M12 to M40 (it was M02, passed only once, with the first 10 piso)
const mainPt = t => { const k = 1 + .04 * Math.cos(3 * t + .5); return V(MA * Math.sin(t) * k, MB * Math.cos(t) * k); };
const mainCurve = new THREE.CatmullRomCurve3(Array.from({ length: 120 }, (_, i) => mainPt(i / 120 * TAU)), true);
const M = i => mainCurve.getPointAt((((i % NM) + NM) % NM) / NM);
const walkCurve = new THREE.CatmullRomCurve3([M(FORK), V(19, -1.5), V(10, -5.5), V(0, -3.5), V(-10, -6), V(-19, -2), M(MERGE)]);
const deckY = t => .07 + .5 * Math.min(1, Math.sin(PI * t) * 3);
const Wp = j => { const t = (j + 1) / (NW + 1), p = walkCurve.getPointAt(t); p.y = deckY(t); return p; };
const CH_A = .49, chStart = lagPt(CH_A, .9), chDir = V(1, -.45).normalize(); let chEnd = chStart.clone(); while (inIsland(chEnd.x, chEnd.z, .985)) chEnd.add(chDir.clone().multiplyScalar(.25));
const chPts = line(chStart, chEnd, 40);
const distToSeg = (p, a, b) => { const ab = b.clone().sub(a), t = Math.max(0, Math.min(1, p.clone().sub(a).dot(ab) / ab.lengthSq())); return p.distanceTo(a.clone().add(ab.multiplyScalar(t))); };
const onBridge = p => distToSeg(V(p.x, p.z), chStart, chEnd) < 2.4;
const mainPts = mainCurve.getSpacedPoints(300).slice(0, -1), walkPts = walkCurve.getSpacedPoints(120).map((p, i, a) => { p.y = deckY(i / (a.length - 1)); return p; });
const PATHS = [[mainPts, 2.2], [walkPts, 2.2], [line(V(4, 12.5), V(4, 2.5), 12), 2.4]];
const nearPath = (x, z, d) => PATHS.some(([pts, w]) => pts.some(p => Math.hypot(p.x - x, p.z - z) < d + w / 2));
// palms keep their crowns off the board: a crown (fronds reach ~4 m) over the path would hide spaces from the board camera.
// First the palm leans another way; if that is not enough the trunk steps away from the path (staying on the island).
const BOARD_PTS = [...mainPts, ...walkPts], PALM_CLEAR = 4.6;
// the game's board camera looks north from the south, steeply (64-70 deg): a crown h m up shows about .45 h m further north
const crownGap = (x, z, d, l, h) => { const cx = x + Math.cos(d) * l, cz = z - Math.sin(d) * l; let m = 1e9; for (const p of BOARD_PTS) m = Math.min(m, Math.hypot(p.x - cx, p.z - cz), Math.hypot(p.x - cx, p.z - (cz - h * .45))); return m; };
function palmOffBoard(x, z, l, d, h) {
  if (crownGap(x, z, d, l, h) >= PALM_CLEAR) return { x, z, d, ok: true };
  let best = { x, z, d, g: crownGap(x, z, d, l, h) };
  for (let k = 1; k < 16; k++) { const dd = d + k * Math.PI / 8, g = crownGap(x, z, dd, l, h); if (g > best.g) best = { x, z, d: dd, g }; }
  if (best.g >= PALM_CLEAR) return { ...best, ok: true };
  let np = null, nd = 1e9; for (const p of BOARD_PTS) { const q = Math.hypot(p.x - x, p.z - z); if (q < nd) { nd = q; np = p; } }
  const ux = (x - np.x) / (nd || 1), uz = (z - np.z) / (nd || 1), away = Math.atan2(-uz, ux);
  for (let s = .5; s <= 6; s += .5) { const nx = x + ux * s, nz = z + uz * s; if (!inIsland(nx, nz, .94)) break; const g = crownGap(nx, nz, away, l, h); if (g >= PALM_CLEAR) return { x: nx, z: nz, d: away, ok: true }; }
  return { ...best, ok: false };
}

const clearSpot = (x, z, d = 1.2) => inIsland(x, z, .9) && !inLagoon(x, z, 1.1) && !nearPath(x, z, d) && distToSeg(V(x, z), chStart, chEnd) > 3;

// ---------- TERRAIN + WATER ----------
const terrain = group('terrain'); { const body = islandBody('island_body', RX, RZ, 13, blobR, 26, 8); body.traverse(o => { if (o.isMesh && o.name === 'grass_cap') o.material = sand; }); terrain.add(body); }
{ const segs = 72, rings = 7, pos = [], col = [], idx = [], cDeep = new THREE.Color('#1497B3'), cMid = new THREE.Color('#38CCC6'), cRim = new THREE.Color('#B6F2E6'), c = new THREE.Color();
  pos.push(0, 0, LZ); c.copy(cDeep); col.push(c.r, c.g, c.b);
  for (let r = 1; r <= rings; r++) for (let i = 0; i < segs; i++) { const t = r / rings, a = i / segs * TAU, p = lagPt(a, t); pos.push(p.x, 0, p.z); t < .6 ? c.copy(cDeep).lerp(cMid, t / .6) : c.copy(cMid).lerp(cRim, (t - .6) / .4); col.push(c.r, c.g, c.b); }
  for (let i = 0; i < segs; i++) idx.push(0, 1 + i, 1 + (i + 1) % segs); for (let r = 1; r < rings; r++) for (let i = 0; i < segs; i++) { const a = 1 + (r - 1) * segs + i, b = 1 + (r - 1) * segs + (i + 1) % segs; idx.push(a, a + segs, b, b, a + segs, b + segs); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals();
  const lag = mesh('lagoon_water', g, waterM, 0, .05, 0); lag.receiveShadow = true; lag.castShadow = false; root.add(lag); }
{ const rim = Array.from({ length: 160 }, (_, i) => lagPt(i / 160 * TAU, 1.0)), wet = Array.from({ length: 160 }, (_, i) => lagPt(i / 160 * TAU, 1.08));
  terrain.add(ribbon('wet_sand_ring', wet, 2.0, wetSand, .02, true), ribbon('shore_foam', rim, .35, foam, .06, true), ribbon('shore_foam_2', Array.from({ length: 160 }, (_, i) => lagPt(i / 160 * TAU, .94)), .15, foam, .058, true)); }
terrain.add(ribbon('channel', chPts, 3.2, channelWater, .055), ribbon('channel_bank', chPts, 4.4, wetSand, .03), ribbon('beach_trail', mainPts, 2.2, sandPath, .04, true));
for (const s of [-1, 1]) terrain.add(ribbon('channel_foam', offsetPts(chPts, s * 1.55), .2, foam, .06));
root.add(bake(terrain));
{ const wf = group('waterfall', chEnd.x, 0, chEnd.z); wf.rotation.y = Math.atan2(chDir.x, chDir.z); const H = 13, geo = new THREE.PlaneGeometry(3.2, H, 4, 16).translate(0, -H / 2, 0), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const d = -p.getY(i); p.setZ(i, 2.6 * Math.sqrt(d / H) + .2 * Math.sin(p.getX(i) * 3 + d)); p.setY(i, .05 - d); } geo.computeVertexNormals(); wf.add(mesh('fall_sheet', geo, fallM));
  wf.add(mesh('lip_foam', new THREE.CapsuleGeometry(.18, 3.0, 2, 6).rotateZ(PI / 2), foam, 0, .1, .15)); for (let k = 0; k < 6; k++) wf.add(mesh('mist', new THREE.SphereGeometry(.6 + rnd() * .6, 8, 6), std('mist', { color: '#FFFFFF', transparent: true, opacity: .35, depthWrite: false }), (rnd() - .5) * 3, -6 - rnd() * 5, 2.2 + rnd()));
  wf.traverse(o => { if (o.isMesh) o.castShadow = false; }); landmarks.add(wf); }

// ---------- PROP BUILDERS ----------
function karst(name, x, z, h, r, y0 = 0) { const g = group(name, x, y0, z); const prof = [[1, -.6], [1.05, 0], [.95, .15], [.9, .35], [.7, .55], [.62, .7], [.48, .86], [.3, .97], [.08, 1]].map(([rr, yy]) => new THREE.Vector2(rr * r, yy * h));
  const lat = new THREE.LatheGeometry(prof, 9), p = lat.attributes.position; for (let i = 0; i < p.count; i++) { const X = p.getX(i), Y = p.getY(i), Z = p.getZ(i), a = Math.atan2(Z, X), k = 1 + .18 * Math.sin(4 * a + Y * .7) + .1 * Math.sin(7 * a - Y * 1.3); p.setXYZ(i, X * k, Y, Z * k); } lat.computeVertexNormals();
  g.add(mesh('karst', lat, limestone)); for (let k = 0; k < 5; k++) { const a = rnd() * TAU, hh = h * (.45 + rnd() * .5), rr = r * (.9 - hh / h * .6); const c = mesh('karst_green', new THREE.IcosahedronGeometry(.5 + rnd() * .6, 0), leaf, Math.cos(a) * rr, hh, Math.sin(a) * rr); c.scale.y = .6; g.add(c); }
  g.add(mesh('karst_top', new THREE.IcosahedronGeometry(r * .35, 1), leafLight, 0, h * .98, 0)); return g; }
function bangka(name, x, z, ry, L, o = {}) { const g = group(name, x, o.y ?? 0, z); g.rotation.y = ry; const W = o.w ?? .95; const sh = new THREE.Shape();
  [[-L / 2 - .2, 1.0], [-L / 2 + .8, .25], [-L / 2 + 1.6, 0], [L / 2 - 1.6, 0], [L / 2 - .8, .25], [L / 2 + .3, 1.15], [L / 2 - 1.0, .78], [-L / 2 + 1.0, .78]].forEach(([px, py], i) => i ? sh.lineTo(px, py) : sh.moveTo(px, py)); sh.closePath();
  const hg = new THREE.ExtrudeGeometry(sh, { depth: W, bevelEnabled: true, bevelThickness: .06, bevelSize: .06, bevelSegments: 2, curveSegments: 4 }).translate(0, 0, -W / 2), hp = hg.attributes.position;
  for (let i = 0; i < hp.count; i++) { const k = 1 - Math.pow(Math.min(1, Math.abs(hp.getX(i)) / (L / 2 + .3)), 3) * .88; hp.setZ(i, hp.getZ(i) * k); } hg.computeVertexNormals(); g.add(mesh('hull', hg, white));
  for (const s of [-1, 1]) { g.add(B('stripe', L * .62, .1, .03, o.c1 ?? paintBlue, 0, .5, s * (W / 2 + .07)), B('stripe_2', L * .62, .06, .03, o.c2 ?? paintRed, 0, .36, s * (W / 2 + .07)));
    const ox = s * (W / 2 + 1.9); g.add(mesh('katig', new THREE.CylinderGeometry(.09, .09, L * .85, 6).rotateZ(PI / 2), bamboo, 0, .32, ox));
    for (const cx of [-L * .25, 0, L * .25]) g.add(strut('tadik', v3(cx, .8, s * W / 2), v3(cx, 1.15, s * 1.3), .05, bamboo), strut('tadik', v3(cx, 1.15, s * 1.3), v3(cx, .4, ox), .05, bamboo)); }
  g.add(B('deck', L * .66, .05, W * .8, wood, 0, .74, 0));
  if (o.awning) { for (const px of [-L * .22, L * .22]) for (const pz of [-W * .4, W * .4]) g.add(mesh('awning_post', new THREE.CylinderGeometry(.03, .03, 1.3, 5), wood, px, 1.4, pz)); g.add(B('awning', L * .55, .06, W + .7, o.awning, 0, 2.05, 0)); g.add(B('engine', .5, .4, .45, iron, -L * .36, .78, 0), mesh('benches', new THREE.BoxGeometry(L * .4, .06, .25), wood)); }
  if (o.sail) { g.add(mesh('mast', new THREE.CylinderGeometry(.05, .06, 5, 6), bamboo, L * .08, 3.2, 0)); const ss = new THREE.Shape(); ss.moveTo(0, 0); ss.quadraticCurveTo(1.8, 2.6, .4, 5.2); ss.lineTo(-.1, 4.8); ss.quadraticCurveTo(1.0, 2.5, -1.6, .5); ss.closePath();
    const sl = mesh('crab_claw_sail', new THREE.ShapeGeometry(ss), std('sail_' + name, { color: o.sail, side: THREE.DoubleSide, roughness: .7 }), L * .08 + .2, .9, 0); g.add(sl); }
  return g; }
function kubo(name, x, z, ry, sign, w = 3, d = 3) { const g = group(name, x, 0, z); g.rotation.y = ry;
  for (const px of [-w / 2 + .15, w / 2 - .15]) for (const pz of [-d / 2 + .15, d / 2 - .15]) g.add(mesh('post', new THREE.CylinderGeometry(.08, .09, 2.6, 6), bamboo, px, 1.3, pz));
  g.add(B('floor', w, .12, d, bamboo, 0, .5, 0), mesh('roof', hipRoof(w, d, 1.5, w / 2, .5), nipa, 0, 2.55, 0), B('table', 1.4, .06, .7, bambooDark, 0, 1.25, 0), B('bench', 1.4, .05, .3, bambooDark, 0, .95, .65), B('bench', 1.4, .05, .3, bambooDark, 0, .95, -.65), B('rail', w, .06, .06, bamboo, 0, 1.3, -d / 2 + .1));
  for (const s of [-1, 1]) g.add(B('rail_side', .06, .06, d, bamboo, s * (w / 2 - .1), 1.3, 0));
  if (sign) g.add(mesh('sign', new THREE.PlaneGeometry(1.4, .3), signMat(sign), 0, 2.35, d / 2 + .12)); return g; }
function lounger(x, z, ry, c) { const g = group('sun_lounger', x, 0, z); g.rotation.y = ry; g.add(B('frame', .7, .3, 1.9, white, 0, 0, 0), B('cushion', .66, .08, 1.3, c, 0, .3, .25)); const bk = B('back', .66, .08, .7, c, 0, .45, -.75); bk.rotation.x = .6; g.add(bk); return g; }
function palmRing(name, list) { const pg = group(name); list.forEach(([x, z, h, l, d], k) => { const q = palmOffBoard(x, z, l, d, h); const pl = palm(name + '_' + k, q.x, q.z, h, l, q.d); if (q.ok) { pg.add(pl); chk(name, q.x, q.z); } else warn('palm left out (over the board):', name, k); }); return bake(pg); }

// ---------- LANDMARK: PANTALAN (fishing pier) ----------
{ const pr = group('pantalan_pier'); pr.add(B('deck', 2.4, .12, 10, wood, 4, .45, 7.4));
  for (let k = 0; k <= 6; k++) for (const s of [-1, 1]) { const z = 2.6 + k * 1.6; pr.add(mesh('pile', new THREE.CylinderGeometry(.1, .12, 1.4, 6), doorWood, 4 + s * 1.1, -.1, z), mesh('rail_post', new THREE.CylinderGeometry(.04, .04, .9, 5), wood, 4 + s * 1.15, 1.0, z)); }
  for (const s of [-1, 1]) pr.add(B('rail', .06, .06, 10, wood, 4 + s * 1.15, 1.4, 7.4)); pr.add(B('end_platform', 4, .12, 2.4, wood, 4, .45, 2.0));
  for (const [bx, bz] of [[2.3, 1.2], [5.7, 1.2], [5.7, 3]]) pr.add(mesh('bollard', new THREE.CylinderGeometry(.1, .12, .35, 8), iron, bx, .74, bz));
  pr.add(lamp('pier_lamp', 2.9, 2.6), crate(4.8, .57, 1.5, 1), crate(4.8, .87, 1.5, 0), drum(3.2, 1.3), mesh('sign', new THREE.PlaneGeometry(2.0, .4), signMat('PANTALAN'), 4, 2.4, 12.5), mesh('sign_post', new THREE.CylinderGeometry(.05, .05, 2.4, 5), wood, 2.9, 1.2, 12.5), mesh('sign_post', new THREE.CylinderGeometry(.05, .05, 2.4, 5), wood, 5.1, 1.2, 12.5));
  pr.add(bangka('bangka_pantalan', 7.3, 3.6, PI / 2, 8.5, { awning: tarps[0], c1: paintBlue, c2: paintYellow, y: -.15 }));
  landmarks.add(bake(pr)); }
{ const jt = group('north_jetty'); const a = lagPt(.75, 1.0); jt.add(B('jetty', 1.8, .1, 4, wood, a.x - 1, .42, a.z + 1.2)); for (let k = 0; k < 3; k++) for (const s of [-1, 1]) jt.add(mesh('pile', new THREE.CylinderGeometry(.08, .1, 1.2, 6), doorWood, a.x - 1 + s * .8, -.1, a.z - .4 + k * 1.6)); landmarks.add(bake(jt)); }

// ---------- BOARDWALK (deck on stilts + rope rails) ----------
{ const bw = group('boardwalk'); bw.add(ribbonY('deck', walkPts, 2.2, wood, .0)); const rp = walkCurve.getSpacedPoints(60);
  rp.forEach((p, i) => { const t = i / (rp.length - 1), y = deckY(t); if (y < .2) return; const n = walkCurve.getTangentAt(t); const nx = -n.z, nz = n.x; for (const s of [-1, 1]) { const px = p.x + nx * s * 1.05, pz = p.z + nz * s * 1.05; if (i % 2 === 0) bw.add(mesh('stilt', new THREE.CylinderGeometry(.07, .08, y + .3, 5), doorWood, px, (y - .3) / 2, pz)); bw.add(mesh('rail_post', new THREE.CylinderGeometry(.035, .035, .9, 5), bamboo, px, y + .45, pz)); } });
  for (const s of [-1, 1]) { const off = offsetPts(rp, s * 1.05).map((p, i) => { p.y = deckY(i / (rp.length - 1)) + .88; return p; }).filter(p => p.y > 1.05); bw.add(mesh('rope', new THREE.TubeGeometry(new THREE.CatmullRomCurve3(off), 80, .025, 4), std('rope', { color: '#D8C08A' }))); }
  landmarks.add(bake(bw)); }

// ---------- CHANNEL BRIDGE ----------
{ let best = 0, bd = 1e9; mainPts.forEach((p, i) => { const d = distToSeg(V(p.x, p.z), chStart, chEnd); if (d < bd) { bd = d; best = i; } }); const bp = mainPts[best], tg = mainPts[(best + 1) % mainPts.length].clone().sub(mainPts[(best - 1 + mainPts.length) % mainPts.length]);
  const br = group('channel_bridge', bp.x, 0, bp.z); br.rotation.y = Math.atan2(tg.x, tg.z); br.add(B('bridge_deck', 2.6, .12, 6, wood, 0, .26, 0)); for (const s of [-1, 1]) { br.add(B('bridge_rail', .08, .08, 6, wood, s * 1.25, 1.1, 0)); for (const zz of [-2.8, -1.4, 0, 1.4, 2.8]) br.add(mesh('bridge_post', new THREE.CylinderGeometry(.05, .05, 1.1, 5), wood, s * 1.25, .6, zz)); }
  landmarks.add(bake(br)); }

// ---------- KARSTS + ROCKS ----------
{ const ks = group('karsts'); ks.add(karst('karst_1', -10.5, 1.5, 9, 2.1, -.5), karst('karst_2', 10.8, 4.2, 7, 1.7, -.5), karst('karst_3', -4, -8.3, 5.5, 1.3, -.5), karst('tall_rock_waterfall', chEnd.x - chDir.x * 6 + 3.2, chEnd.z - chDir.z * 6 - 2.6, 6.5, 1.5));
  for (let k = 0; k < 9; k++) { const a = rnd() * TAU, b = mesh('boulder', new THREE.DodecahedronGeometry(.5 + rnd() * .9, 0), rock, chEnd.x - chDir.x * (3 + rnd() * 6) + Math.cos(a) * 3.2, .2, chEnd.z - chDir.z * (3 + rnd() * 6) + Math.sin(a) * 3.2); b.scale.y = .7; ks.add(b); }
  landmarks.add(bake(ks)); }

// ---------- SOUTH BEACH: resort side ----------
{ const sb = group('south_beach');
  [[-20, 25.2, 1], [-14, 27.5, 2], [-7, 26.8, 3], [13, 26, 4]].forEach(([x, z, n]) => { sb.add(kubo('cottage_' + n, x, z, PI + (rnd() - .5) * .2, 'COTTAGE ' + n)); chk('cottage', x, z); });
  { const v = kubo('videoke_cottage', 6.5, 27, PI, 'VIDEOKE'); v.add(B('videoke_machine', .55, 1.1, .45, P('videoke_body', '#2B2B33'), .9, .56, .9), mesh('videoke_screen', new THREE.PlaneGeometry(.4, .3), bulbGlow, .9, 1.35, 1.13), B('speaker', .4, .6, .35, trashBag, -.9, .56, .9), B('cooler', .6, .4, .4, paintBlue, -1.9, 0, 1.6), B('cooler_lid', .62, .08, .42, white, -1.9, .4, 1.6));
    for (let k = 0; k < 12; k++) { const t = k / 11, x = -1.6 + t * 3.2; v.add(mesh('string_bulb', new THREE.SphereGeometry(.06, 6, 4), fiestaBulb, x, 2.25 - Math.sin(PI * t) * .25, 1.6)); } v.add(monobloc(-.8, 2.2, PI, plasticRed), monobloc(0, 2.3, PI), monoTable(.9, 2.3)); sb.add(v); }
  [[-18, 21.8], [-10.5, 22.2], [10.5, 22.2], [18, 21.8]].forEach(([x, z], k) => { const u = group('beach_umbrella_' + k, x, 0, z); umbrellaTop(u, 0, 2.3, 1.4, k % 2 ? [paintYellow, white] : [tarps[4], white]); sb.add(u, lounger(x - .9, z + .3, PI + .1, pick(cloth)), lounger(x + .9, z + .3, PI - .1, pick(cloth)), B('towel', .8, .02, 1.6, pick(cloth), x + 2.2, 0, z + .8)); });
  { const st = group('buko_halohalo', 20.3, 0, 22.8); for (const px of [-1.3, 1.3]) for (const pz of [-.9, .9]) st.add(mesh('post', new THREE.CylinderGeometry(.06, .06, 2.4, 6), bamboo, px, 1.2, pz)); st.add(mesh('roof', hipRoof(2.8, 2, .9, 1.0, .35), nipa, 0, 2.35, 0), B('counter', 2.5, .9, .7, bamboo, 0, 0, .55), mesh('sign', new THREE.PlaneGeometry(2.2, .36), signMat('BUKO • HALO-HALO'), 0, 2.15, 1.05));
    pile(st, buko, -.8, .9, .55, 7, .14, .3); for (let k = 0; k < 3; k++) { st.add(mesh('buko_half', new THREE.SphereGeometry(.14, 8, 4, 0, TAU, 0, PI / 2), buko, .1 + k * .3, .9, .55), mesh('buko_meat', new THREE.CircleGeometry(.12, 8).rotateX(-PI / 2), coconutWhite, .1 + k * .3, .91, .55)); }
    for (let k = 0; k < 4; k++) { const cx = .25 + (k % 2) * .25, cz = .4 + ((k / 2) | 0) * .25; st.add(mesh('halohalo_ube', new THREE.CylinderGeometry(.06, .05, .06, 8), KAK[2], cx + .6, .93, cz), mesh('halohalo_ice', new THREE.CylinderGeometry(.065, .06, .08, 8), ice, cx + .6, 1.0, cz), mesh('halohalo_top', new THREE.SphereGeometry(.05, 6, 4), k % 2 ? paintRed : paintYellow, cx + .6, 1.06, cz)); }
    pile(st, buko, 1.9, 0, -.3, 12, .15, .5); sb.add(st); }
  { const lg = group('lifeguard_tower', 0, 0, 29.2); for (const px of [-.7, .7]) for (const pz of [-.7, .7]) lg.add(mesh('leg', new THREE.CylinderGeometry(.06, .07, 2.2, 6), white, px, 1.1, pz)); lg.add(B('platform', 1.8, .1, 1.8, wood, 0, 2.2, 0), B('cab', 1.6, 1.0, 1.6, paintRed, 0, 2.3, 0), B('cab_window', 1.62, .4, 1.3, glass, 0, 2.75, 0), mesh('cab_roof', hipRoof(1.6, 1.6, .5, .8, .2), white, 0, 3.3, 0), strut('ladder', v3(0, 0, 1.6), v3(0, 2.2, .9), .04, wood)); sb.add(lg); }
  { const bf = group('bonfire', -25, 0, 20.5); for (let k = 0; k < 9; k++) { const a = k / 9 * TAU; bf.add(mesh('stone', new THREE.DodecahedronGeometry(.18, 0), stoneGrey, Math.cos(a) * .7, .1, Math.sin(a) * .7)); } for (let k = 0; k < 3; k++) { const l = mesh('log', new THREE.CylinderGeometry(.07, .07, 1.0, 6).rotateZ(PI / 2), doorWood, 0, .15, 0); l.rotation.y = k * PI / 3; bf.add(l); }
    bf.add(mesh('flame', new THREE.ConeGeometry(.35, .9, 6), flame, 0, .6, 0), mesh('flame_inner', new THREE.ConeGeometry(.2, .6, 6), flameY, 0, .5, 0)); for (let k = 0; k < 4; k++) { const a = k / 4 * TAU + .4, s = mesh('log_seat', new THREE.CylinderGeometry(.2, .2, 1.4, 8).rotateZ(PI / 2), doorWood, Math.cos(a) * 2, .2, Math.sin(a) * 2); s.rotation.y = -a + PI / 2; bf.add(s); } sb.add(bf); }
  { const sc = group('sand_castle', -3, 0, 14.3); sc.add(mesh('base', new THREE.CylinderGeometry(.6, .7, .3, 10), sandPath, 0, .15, 0)); for (let k = 0; k < 4; k++) { const a = k / 4 * TAU + .4; sc.add(mesh('tower', new THREE.CylinderGeometry(.14, .16, .45, 8), sandPath, Math.cos(a) * .42, .5, Math.sin(a) * .42), mesh('tower_cone', new THREE.ConeGeometry(.17, .22, 8), sandPath, Math.cos(a) * .42, .84, Math.sin(a) * .42)); }
    sc.add(mesh('keep', new THREE.CylinderGeometry(.22, .25, .7, 8), sandPath, 0, .55, 0), mesh('flag', new THREE.PlaneGeometry(.2, .12), paintRed, .1, 1.05, 0), mesh('pail', new THREE.CylinderGeometry(.14, .11, .25, 10, 1, true), paintRed, 1.0, .13, .3), B('shovel', .08, .02, .25, paintBlue, 1.2, 0, -.3), strut('shovel_stick', v3(1.2, .02, -.2), v3(1.25, .3, .2), .015, paintBlue));
    for (let k = 0; k < 6; k++) sc.add(mesh('beach_ball', new THREE.SphereGeometry(.22, 6, 6, k * PI / 3, PI / 3), [paintRed, white, paintBlue, white, paintYellow, white][k], -1.1, .22, .6)); sb.add(sc); }
  { const kr = group('kayak_rack', 12.5, 0, 14.5); for (const s of [-1, 1]) kr.add(strut('a_frame', v3(s * 1.2, 0, -.5), v3(s * 1.2, 1.4, 0), .04, wood), strut('a_frame', v3(s * 1.2, 0, .5), v3(s * 1.2, 1.4, 0), .04, wood));
    [[.45, paintRed], [.95, paintYellow]].forEach(([y, m]) => { const k = mesh('kayak', new THREE.CapsuleGeometry(.28, 2.6, 3, 8).rotateZ(PI / 2), m, 0, y, 0); k.scale.set(1, .45, 1); kr.add(k); }); kr.add(B('crossbar', 2.6, .05, .05, wood, 0, .3, 0), B('crossbar', 2.6, .05, .05, wood, 0, .8, 0));
    for (let k = 0; k < 4; k++) kr.add(B('life_vest', .4, .5, .12, vestOrange, -1.0 + k * .65, .8, .35)); [[2.6, 1.2, tarps[4]], [3.2, -.9, paintGreen]].forEach(([x, z, m]) => { const k = mesh('kayak', new THREE.CapsuleGeometry(.28, 2.6, 3, 8).rotateZ(PI / 2), m, x, .14, z); k.scale.set(1, .45, 1); k.rotation.y = rnd(); kr.add(k); }); sb.add(kr); }
  sb.add(bangka('bangka_beached_1', -12.5, 12.6, .3, 5.5, { c1: paintGreen, c2: paintRed }), bangka('paraw_moored', -5, 4.5, -.4, 6, { sail: '#E2452E', c1: paintRed, c2: paintYellow, y: -.15 }));
  props.add(bake(sb)); }

// ---------- MANGROVES + SEAWALL ----------
{ const mg = group('mangroves'); for (let k = 0; k < 9; k++) { const p = lagPt(PI * (.86 + k * .04), .95 + rnd() * .12), t = group('mangrove_' + k, p.x, 0, p.z); for (let r = 0; r < 6; r++) { const a = r / 6 * TAU + rnd() * .4; t.add(strut('prop_root', v3(Math.cos(a) * .9, -.1, Math.sin(a) * .9), v3(0, 1.1, 0), .04, doorWood)); }
    t.add(mesh('trunk', new THREE.CylinderGeometry(.1, .14, 1.4, 6), doorWood, 0, 1.7, 0)); for (let c = 0; c < 3; c++) { const cn = mesh('canopy', new THREE.IcosahedronGeometry(1.0 + rnd() * .4, 1), c % 2 ? mangroveLeaf : leaf, (rnd() - .5) * 1.2, 2.6 + rnd() * .4, (rnd() - .5) * 1.2); cn.scale.y = .6; t.add(cn); } mg.add(t); }
  const sw = group('seawall'); for (let k = 0; k < 12; k++) { const x = -10 + k * 1.0, p = lagPt(Math.atan2(-((-11.2) - LZ) / LB, x / LA), 1.05); sw.add(B('seawall_block', 1.02, .8, .6, granite, x, -.1, p.z - .3)); } sw.add(B('seawall_steps', 1.6, .35, .7, granite, -3, -.05, -11.1)); mg.add(sw); props.add(bake(mg)); }

// ---------- NORTH: fishing village ----------
function dryRack(x, z, ry) { const g = group('daing_rack', x, 0, z); g.rotation.y = ry; for (const px of [-1.1, 1.1]) for (const pz of [-.4, .4]) g.add(mesh('leg', new THREE.CylinderGeometry(.04, .04, .9, 5), bamboo, px, .45, pz)); g.add(B('rack_net', 2.4, .02, .9, netM, 0, .9, 0), B('rack_frame', 2.4, .05, .05, bamboo, 0, .9, .45), B('rack_frame', 2.4, .05, .05, bamboo, 0, .9, -.45));
  for (let r = 0; r < 3; r++) for (let c = 0; c < 10; c++) { const f = mesh('daing', new THREE.SphereGeometry(.06, 6, 3), fishM, -1.05 + c * .23, .93, -.28 + r * .28); f.scale.set(2.6, .3, 1.1); g.add(f); } return g; }
function netPoles(x, z, ry) { const g = group('fishing_net_poles', x, 0, z); g.rotation.y = ry; for (const px of [-1.6, 1.6]) g.add(mesh('pole', new THREE.CylinderGeometry(.06, .07, 2.8, 6), bamboo, px, 1.4, 0)); g.add(strut('top_line', v3(-1.6, 2.7, 0), v3(1.6, 2.7, 0), .015, std('rope', { color: '#D8C08A' })));
  const ng = new THREE.PlaneGeometry(3.2, 2.2, 8, 6).translate(0, 1.6, 0), p = ng.attributes.position; for (let i = 0; i < p.count; i++) { const xx = p.getX(i), yy = p.getY(i); p.setZ(i, Math.sin(xx * 1.5) * .12); p.setY(i, yy - (1 - (xx / 1.6) ** 2) * .3 * ((yy - .5) / 2.2)); } ng.computeVertexNormals(); g.add(mesh('net', ng, netM));
  for (let k = 0; k < 7; k++) g.add(mesh('float', new THREE.SphereGeometry(.08, 6, 4), vestOrange, -1.35 + k * .45, 2.68, 0)); return g; }
function bahayKubo(name, x, z, ry) { const g = group(name, x, 0, z); g.rotation.y = ry; for (const px of [-1.5, 1.5]) for (const pz of [-1.2, 1.2]) g.add(mesh('stilt', new THREE.CylinderGeometry(.09, .1, 1.3, 6), bamboo, px, .65, pz));
  g.add(B('floor', 3.4, .12, 2.8, bamboo, 0, 1.2, 0), B('walls', 3.2, 1.7, 2.6, woven, 0, 1.32, 0), B('window', .9, .6, .04, niche, -.7, 2.0, 1.31), B('door', .7, 1.3, .04, niche, .8, 1.32, 1.31), mesh('roof', hipRoof(3.2, 2.6, 1.9, .5, .55), nipa, 0, 3.0, 0), strut('ladder', v3(.8, 0, 2.1), v3(.8, 1.2, 1.4), .05, bamboo)); return g; }
{ const vg = group('fishing_village');
  vg.add(bahayKubo('bahay_kubo_1', -16, -26.5, .15), bahayKubo('bahay_kubo_2', -8, -28.5, -.1), bahayKubo('bahay_kubo_3', 3.5, -27.5, .2)); [[-16, -26.5], [-8, -28.5], [3.5, -27.5]].forEach(([x, z]) => chk('kubo', x, z));
  { const ss = group('sari_sari_store', 12.5, 0, -25.5); ss.add(B('walls', 2.8, 2.2, 2.0, paintGreen, 0, 0, 0), B('window', 1.8, .9, .04, niche, 0, .95, 1.01), B('ledge', 2.0, .08, .3, wood, 0, .9, 1.15), B('roof', 3.2, .06, 2.6, giRoof, 0, 2.3, .1), mesh('sign', new THREE.PlaneGeometry(2.0, .4), signMat('SARI-SARI STORE'), 0, 1.95, 1.03));
    for (let k = 0; k < 9; k++) ss.add(mesh('grille', new THREE.CylinderGeometry(.012, .012, .9, 4), iron, -.85 + k * .21, 1.4, 1.05)); ss.add(monobloc(1.8, 1.4, PI, plasticRed), B('bench', 1.4, .4, .35, wood, -1.0, 0, 1.6)); vg.add(ss); }
  [[-2, -23.5, .1], [-24, -21, .5], [8.5, -21.5, -.2], [5, -15.5, 0], [9.5, -14.8, .1]].forEach(([x, z, r]) => vg.add(dryRack(x, z, r))); [[-12, -22.5, .2], [-6, -15.3, 0], [-1, -15.8, .1], [20, -21, -.6]].forEach(([x, z, r]) => vg.add(netPoles(x, z, r)));
  { const ll = group('sampayan', -21, 0, -28); for (const px of [-1.8, 1.8]) ll.add(mesh('pole', new THREE.CylinderGeometry(.04, .04, 2.0, 5), bamboo, px, 1.0, 0)); ll.add(strut('line', v3(-1.8, 1.9, 0), v3(1.8, 1.9, 0), .01, wireM)); for (let k = 0; k < 7; k++) ll.add(B('clothes', .35, .45, .02, cloth[k % 8], -1.4 + k * .46, 1.42, 0)); vg.add(ll); }
  vg.add(bangka('bangka_beached_village', -27, -12, 1.2, 5, { c1: paintYellow, c2: paintBlue }), bangka('bangka_beached_village_2', 24.5, 4, -1.4, 5, { c1: paintRed, c2: paintGreen }));
  for (let k = 0; k < 6; k++) vg.add(B('banyera_fish', .7, .3, .5, k % 2 ? drumBlue : paintRed, -4 + (k % 3) * .8, 0, -22.5 + ((k / 3) | 0) * .65)); vg.add(kariton('kariton_fish', 1.5, -22.3, .4), drum(-5.5, -23.2));
  props.add(bake(vg)); }

// ---------- PALMS, SHELLS, STARFISH ----------
props.add(palmRing('palms', [[-30, 14, 8, 1.6, PI * .8], [-33, 2, 7.6, 1.4, PI], [-31, -10, 8.2, 1.2, PI * 1.1], [-25, -22, 7.4, 1.1, PI * 1.2], [-3, -31, 7.8, 1.2, PI * 1.5], [18, -28, 8, 1.3, PI * 1.6], [27, -19, 7.2, 1.0, -.6], [33, 6, 7.9, 1.4, 0], [31, 16, 7.4, 1.5, .4], [21.5, 21.5, 8.1, 1.4, .8], [-23, 22, 7.7, 1.3, PI * .6], [-10, 29.5, 7.2, 1.2, PI * .5], [9, 27.8, 7.6, 1.3, PI * .45], [-18, 15.5, 7.4, 1.6, PI * .3], [20, 13.5, 7.8, 1.5, PI * .7], [-20, -14.5, 7.2, 1.2, PI * 1.3]]));
{ const sh = group('shells_starfish'); const st = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = -PI / 2 + i * PI / 5, r = i % 2 ? .05 : .14; i ? st.lineTo(Math.cos(a) * r, Math.sin(a) * r) : st.moveTo(Math.cos(a) * r, Math.sin(a) * r); } st.closePath(); const sg = new THREE.ExtrudeGeometry(st, { depth: .025, bevelEnabled: false }).rotateX(-PI / 2);
  let placed = 0; for (let t = 0; t < 1500 && placed < 70; t++) { const x = (rnd() * 2 - 1) * RX, z = (rnd() * 2 - 1) * RZ; if (!clearSpot(x, z, .3)) continue; placed++; const r = rnd(); const o = r < .3 ? mesh('starfish', sg, starfishM, x, .02, z) : mesh('shell', new THREE.ConeGeometry(.05, .12, 6).rotateZ(PI / 2), r < .65 ? shellPink : shellWhite, x, .04, z); o.rotation.y = rnd() * TAU; sh.add(o); }
  const bs = group('beach_shrubs'); let n = 0; for (let t = 0; t < 1200 && n < 26; t++) { const a = rnd() * TAU, rr = .9 + rnd() * .07, x = Math.cos(a) * RX * rr * blobR(a), z = -Math.sin(a) * RZ * rr * blobR(a); if (!clearSpot(x, z, 1) || distToSeg(V(x, z), chStart, chEnd) < 5) continue; bs.add(bush('sea_grape_' + (++n), x, z, .45 + rnd() * .4, rnd() > .6 ? pinkF : null)); }
  props.add(bake(sh), bake(bs)); }

// ---------- CLOUDS (from the sketch) ----------
{ const cl = group('clouds'); [[-46, 14, -24], [44, 17, 10], [-30, 19, 38], [20, 15, -46]].forEach(([x, y, z], k) => { const c = group('cloud_' + k, x, y, z); for (let q = 0; q < 6; q++) c.add(mesh('puff', new THREE.SphereGeometry(1.6 + rnd() * 1.4, 10, 8), cloud, (q - 2.5) * 1.9, (rnd() - .3) * 1.2, (rnd() - .5) * 1.5)); c.traverse(o => { if (o.isMesh) o.castShadow = false; }); cl.add(c); }); root.add(bake(cl)); }

// ---------- ISLETS ----------
{ const isl = group('islets'); const f = a => 1 + .07 * Math.cos(3 * a + 1) + .05 * Math.cos(2 * a); const sandify = g => g.traverse(o => { if (o.isMesh && o.name === 'grass_cap') o.material = sand; });
  const i1 = group('islet_palm', -50, -2.5, -6), b1 = islandBody('body', 3.6, 3.2, 4, f, 6, 0, 40); sandify(b1); i1.add(b1, palm('palm', 0, 0, 5.5, 1.1, PI * .8), lounger(1.4, .6, .3, cloth[0])); isl.add(bake(i1));
  const i2 = group('islet_karst', 49, 1.5, -16), b2 = islandBody('body', 3.4, 3.0, 4.2, f, 6, 0, 40); sandify(b2); i2.add(b2, karst('mini_karst', -.4, -.3, 4.2, 1.0)); isl.add(bake(i2));
  const i3 = group('islet_kayak', 34, -3.5, 40), b3 = islandBody('body', 2.8, 2.6, 3.4, f, 5, 0, 36); sandify(b3); const kk = mesh('kayak', new THREE.CapsuleGeometry(.28, 2.4, 3, 8).rotateZ(PI / 2), paintYellow, 0, .14, .3); kk.scale.set(1, .45, 1); i3.add(b3, kk); const u = group('umbrella', -.9, 0, -.6); umbrellaTop(u, 0, 2.1, 1.1, [paintRed, white]); i3.add(u); isl.add(bake(i3));
  root.add(isl); }

// ---------- SET PIECES for empty sand ----------
{ const sp = group('beach_set_pieces'); const banig = std('banig_mat', { map: tex(C(256, 256, (g, s) => { const cs = ['#E2452E', '#F2B705', '#3BAA4A', '#2E6FD8', '#E8559A', '#FBF7EF']; for (let i = 0; i < 16; i++) { g.fillStyle = cs[i % 6]; g.fillRect(0, i * 16, s, 16); } g.globalAlpha = .25; for (let x = 0; x < s; x += 8) { g.fillStyle = x % 16 ? '#000' : '#fff'; g.fillRect(x, 0, 4, s); } }), 1.2, 'banig') });
  { const vb = group('volleyball_court', -21.8, 0, 5.6); for (const s of [-1, 1]) vb.add(mesh('net_pole', new THREE.CylinderGeometry(.05, .05, 2.5, 6), white, 0, 1.25, s * 2.7)); const nt = mesh('volley_net', new THREE.PlaneGeometry(5.4, .9), netM, 0, 2.0, 0); nt.rotation.y = PI / 2; vb.add(nt, B('net_top', .04, .06, 5.4, white, 0, 2.42, 0));
    for (const s of [-1, 1]) vb.add(B('line', .1, .02, 5, white, s * 3, .02, 0), B('line', 6, .02, .1, white, 0, .02, s * 2.5)); vb.add(mesh('ball', new THREE.SphereGeometry(.12, 8, 6), paintYellow, 1.6, .12, -1.2)); sp.add(vb); chk('volleyball', -21.8, 5.6); }
  const hammock = (x, z, ry) => { const g = group('duyan', x, 0, z); g.rotation.y = ry; for (const s of [-1, 1]) g.add(mesh('post', new THREE.CylinderGeometry(.08, .1, 2.2, 6), bamboo, s * 1.6, 1.1, 0)); const hm = mesh('hammock', new THREE.SphereGeometry(1.4, 12, 4, 0, TAU, PI * .62, PI * .25), cloth[(rnd() * 8) | 0], 0, 2.25, 0); hm.scale.set(1.15, .9, .32); hm.material = std('hammock_' + x, { color: pick(['#E2452E', '#2E6FD8', '#F2B705', '#13A39A']), side: THREE.DoubleSide }); g.add(hm); return g; };
  sp.add(hammock(21.5, 4.5, .3), hammock(34.5, -3.5, 1.2), hammock(-33.5, 9, -.4));
  [[20.5, -3.5, .2], [-19.5, 9.5, -.3], [-29, 17, .6]].forEach(([x, z, r], k) => { const m = group('picnic_' + k, x, 0, z); m.rotation.y = r; m.add(B('banig', 1.8, .02, 1.4, banig, 0, .02, 0), B('basket', .4, .28, .3, woven, .5, .04, .3), mesh('plate', new THREE.CylinderGeometry(.14, .14, .02, 10), white, -.3, .05, -.2), mesh('plate', new THREE.CylinderGeometry(.14, .14, .02, 10), white, .1, .05, -.35), mesh('buko', new THREE.SphereGeometry(.13, 8, 6), buko, -.6, .14, .4)); sp.add(m); });
  [[35, -9, .4, '#F07C1E'], [33.5, 11.5, -.3, '#2E6FD8'], [-35.5, -4, 1.4, '#3BAA4A']].forEach(([x, z, r, c], k) => { const t = group('tent_' + k, x, 0, z); t.rotation.y = r; const tg = new THREE.CylinderGeometry(1.1, 1.1, 2.2, 3, 1).rotateZ(PI / 2).rotateX(PI / 6); const tm = mesh('tent', tg, std('tent_' + k, { color: c, roughness: .7 }), 0, .55, 0); tm.scale.y = .9; t.add(tm); chk('tent', x, z); sp.add(t); });
  { const sh = group('banlawan_shower', -3.5, 0, 23.2); sh.add(mesh('pipe', new THREE.CylinderGeometry(.04, .04, 2.4, 6), steel, 0, 1.2, 0), strut('arm', v3(0, 2.35, 0), v3(.45, 2.35, 0), .03, steel), mesh('head', new THREE.CylinderGeometry(.12, .06, .1, 8), steel, .45, 2.28, 0), B('slab', 1.1, .06, 1.1, granite, .3, 0, 0), drum(-.7, .3)); sp.add(sh); }
  { const tb = group('trash_area', 3.6, 0, 23.2); for (let k = 0; k < 2; k++) tb.add(mesh('bin', new THREE.CylinderGeometry(.28, .25, .8, 10), k ? paintGreen : paintBlue, k * .65, .4, 0)); tb.add(mesh('sign_post', new THREE.CylinderGeometry(.03, .03, 1.8, 5), wood, -.6, .9, 0), mesh('sign', new THREE.PlaneGeometry(1.6, .34), signMat('BAWAL MAGTAPON NG BASURA'), -.6, 1.7, .03)); sp.add(tb); }
  { const br = group('bangka_repair', 22.5, 0, -22); br.add(B('block', .5, .5, .5, wood, -1.4, 0, 0), B('block', .5, .5, .5, wood, 1.4, 0, 0)); br.add(bangka('bangka_on_blocks', 0, 0, .2, 5, { c1: paintGreen, c2: paintYellow, y: .45 })); br.add(drum(2.5, 1.5)); sp.add(br); chk('repair', 22.5, -22); }
  [[-9, 13.5, 0], [8.5, 14.5, 1], [19.5, 9.5, 2], [-20, -9.5, 3], [17.5, -12.5, 4], [-13, -13.5, 5]].forEach(([x, z, k]) => { if (!clearSpot(x, z, .8)) return; const u = group('inner_umbrella_' + k, x, 0, z); umbrellaTop(u, 0, 2.2, 1.3, [[paintRed, white], [tarps[4], white], [paintYellow, paintBlue]][k % 3]); sp.add(u, lounger(x + .9, z + .2, rnd() * TAU, pick(cloth)), B('towel', .8, .02, 1.6, pick(cloth), x - 1.2, 0, z + .4)); });
  props.add(bake(sp)); }

// ---------- DUNES (heightfield) + VEGETATION FILL ----------
let duneH = () => 0;
{ const GS = 1.0, nx = Math.ceil(2 * RX / GS) + 1, nz = Math.ceil(2 * RZ / GS) + 1, x0 = -RX, z0 = IZ - RZ, occ = new Float32Array(nx * nz);
  const mark = (x, z, r) => { const ci = Math.round((x - x0) / GS), cj = Math.round((z - z0) / GS), rr = Math.ceil(r / GS); for (let j = cj - rr; j <= cj + rr; j++) for (let i = ci - rr; i <= ci + rr; i++) if (i >= 0 && j >= 0 && i < nx && j < nz) occ[j * nx + i] = 1; };
  root.updateMatrixWorld(true); const v = new THREE.Vector3();
  [props, landmarks].forEach(gr => gr.traverse(o => { if (!o.isMesh || /shells_starfish|beach_shrubs/.test(o.name)) return; const p = o.geometry.attributes.position; for (let k = 0; k < p.count; k += 3) { v.fromBufferAttribute(p, k).applyMatrix4(o.matrixWorld); if (v.y < 1.0 && v.y > -.6) mark(v.x, v.z, .7); } }));
  PATHS.forEach(([pts]) => pts.forEach(p => mark(p.x, p.z, 2.2))); chPts.forEach(p => mark(p.x, p.z, 3.2));
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const x = x0 + i * GS, z = z0 + j * GS; if (inLagoon(x, z, 1.18)) occ[j * nx + i] = 1; }
  let bl = occ; for (let pass = 0; pass < 3; pass++) { const nb = new Float32Array(nx * nz); for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { let s = 0, c = 0; for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { const ii = i + di, jj = j + dj; if (ii >= 0 && jj >= 0 && ii < nx && jj < nz) { s += bl[jj * nx + ii]; c++; } } nb[j * nx + i] = Math.max(bl[j * nx + i] * (pass ? 0 : 1), s / c); } bl = nb; }
  const rN = (x, z) => Math.hypot(x / RX, (z - IZ) / RZ) / blobR(Math.atan2(-(z - IZ) / RZ, x / RX));
  const sm = (a, b, t) => { const u = Math.max(0, Math.min(1, (t - a) / (b - a))); return u * u * (3 - 2 * u); };
  const hAt = (i, j) => { const x = x0 + i * GS, z = z0 + j * GS, r = rN(x, z), free = 1 - Math.min(1, bl[j * nx + i]), edge = 1 - sm(.86, .95, r), amp = .6 + 1.7 * sm(.5, .85, r);
    const n = .55 + .25 * Math.sin(x * .33 + z * .21) + .14 * Math.sin(x * .9 - z * .62 + 1.3) + .08 * Math.sin(z * 1.7 + x * .25); return .015 + free * edge * amp * n; };
  const Hs = new Float32Array(nx * nz); for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) Hs[j * nx + i] = hAt(i, j);
  duneH = (x, z) => { const fi = (x - x0) / GS, fj = (z - z0) / GS, i = Math.max(0, Math.min(nx - 2, Math.floor(fi))), j = Math.max(0, Math.min(nz - 2, Math.floor(fj))), u = fi - i, w = fj - j; return (Hs[j * nx + i] * (1 - u) + Hs[j * nx + i + 1] * u) * (1 - w) + (Hs[(j + 1) * nx + i] * (1 - u) + Hs[(j + 1) * nx + i + 1] * u) * w; };
  const pos = [], col = [], idx = [], ok = [], cLo = new THREE.Color('#E2D4B6'), cHi = new THREE.Color('#FFFFFF'), cG = new THREE.Color('#C7DC9A'), c = new THREE.Color();
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const x = x0 + i * GS, z = z0 + j * GS, y = Hs[j * nx + i], r = rN(x, z); pos.push(x, y, z); ok.push(r < .955);
    const t = Math.min(1, (y - .015) / 1.2); c.copy(cLo).lerp(cHi, .35 + t * .65); const gz = sm(.66, .82, r) * (.5 + .5 * Math.sin(x * .45 + z * .3)) * Math.min(1, t * 3); c.lerp(cG, gz * .7); if (inLagoon(x, z, 1.25)) c.lerp(new THREE.Color('#D7CAAA'), .6); col.push(c.r, c.g, c.b); }
  for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) { const a = j * nx + i, b = a + 1, d = a + nx, e = d + 1; if (ok[a] && ok[b] && ok[d] && ok[e]) idx.push(a, d, b, b, d, e); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); const uv = []; for (let k = 0; k < pos.length; k += 3) uv.push(pos[k], -pos[k + 2]); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  const dunes = mesh('sand_dunes', g, std('sand_dunes', { map: tSand, vertexColors: true, roughness: .95 })); dunes.castShadow = false; root.add(dunes);
  // vegetation + debris on free sand
  const fill = group('beach_fill'), tuftM = [P('beach_grass_1', '#9DBA5A'), P('beach_grass_2', '#C2C77A'), P('beach_grass_3', '#7FA548')], pandanM = P('pandan', '#4C8F3A'), mglory = P('morning_glory_flower', '#D45DB0');
  const freeAt = (x, z) => { const i = Math.round((x - x0) / GS), j = Math.round((z - z0) / GS); return i >= 0 && j >= 0 && i < nx && j < nz && bl[j * nx + i] < .3 && rN(x, z) < .93; };
  let n = 0; for (let t = 0; t < 16000 && n < 1100; t++) { const x = (rnd() * 2 - 1) * RX, z = IZ + (rnd() * 2 - 1) * RZ; if (!freeAt(x, z)) continue; const r = rN(x, z); if (r < .62 && rnd() < .2) continue; n++; const y = duneH(x, z) - .03, k = rnd();
    if (k < .7) { for (let q = 0; q < 7; q++) { const bl2 = mesh('grass_blade', new THREE.ConeGeometry(.05, .5 + rnd() * .45, 4), pick(tuftM), x + (rnd() - .5) * .25, y + .25, z + (rnd() - .5) * .25); bl2.rotation.set((rnd() - .5) * .7, 0, (rnd() - .5) * .7); fill.add(bl2); } }
    else if (k < .78) { for (let q = 0; q < 9; q++) { const a = q / 9 * TAU, lf = mesh('pandan_leaf', new THREE.ConeGeometry(.06, 1.5, 3), pandanM, x + Math.cos(a) * .3, y + .55, z + Math.sin(a) * .3); lf.rotation.set(Math.sin(a) * .9, 0, -Math.cos(a) * .9); fill.add(lf); } }
    else if (k < .88) { const p2 = mesh('morning_glory', new THREE.IcosahedronGeometry(.6 + rnd() * .5, 1), leaf, x, y + .05, z); p2.scale.y = .22; fill.add(p2); for (let q = 0; q < 4; q++) fill.add(mesh('mg_flower', new THREE.SphereGeometry(.06, 5, 3), mglory, x + (rnd() - .5) * .8, y + .17, z + (rnd() - .5) * .8)); }
    else if (k < .93) { const lg = mesh('driftwood', new THREE.CylinderGeometry(.08, .12, 1.4 + rnd(), 6).rotateZ(PI / 2), P('driftwood', '#B9A88E'), x, y + .08, z); lg.rotation.y = rnd() * TAU; fill.add(lg); }
    else if (k < .97) { for (let q = 0; q < 3; q++) fill.add(mesh('coconut', new THREE.SphereGeometry(.15, 7, 5), q ? coconutM : buko, x + (rnd() - .5) * .7, y + .12, z + (rnd() - .5) * .7)); }
    else { for (let q = 0; q < 3; q++) { const rk = mesh('rock', new THREE.DodecahedronGeometry(.25 + rnd() * .45, 0), rock, x + (rnd() - .5) * 1.2, y + .1, z + (rnd() - .5) * 1.2); rk.scale.y = .65; rk.rotation.y = rnd() * 3; fill.add(rk); } } }
  let yp = 0; for (let t = 0; t < 3000 && yp < 14; t++) { const x = (rnd() * 2 - 1) * RX, z = IZ + (rnd() * 2 - 1) * RZ; if (!freeAt(x, z) || rN(x, z) < .55) continue; yp++; const h = 3 + rnd() * 2, l = .5 + rnd() * .6, d = rnd() * TAU, q = palmOffBoard(x, z, l, d, h), pl = palm('young_palm_' + yp, q.x, q.z, h, l, q.d); pl.position.y = duneH(q.x, q.z) - .05; if (q.ok) fill.add(pl); }
  props.add(bake(fill)); }

// ---------- LAGOON CAUSTICS ----------
{ const sh = new THREE.Shape(); for (let i = 0; i < 120; i++) { const p = lagPt(i / 120 * TAU, .985); i ? sh.lineTo(p.x, -p.z) : sh.moveTo(p.x, -p.z); } sh.closePath();
  const ct = tex(C(256, 256, (g, s) => { g.strokeStyle = '#FFFFFF'; g.lineWidth = 2.2; for (let i = 0; i < 70; i++) { const x = rnd() * s, y = rnd() * s, r = 10 + rnd() * 22; g.globalAlpha = .4 + rnd() * .5; g.beginPath(); for (let k = 0; k <= 7; k++) { const a = k / 7 * TAU, rr = r * (.7 + rnd() * .5); g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.stroke(); } }), 5, 'caustics');
  const cm = mesh('lagoon_caustics', new THREE.ShapeGeometry(sh, 4).rotateX(-PI / 2), std('caustics', { map: ct, transparent: true, opacity: .35, blending: THREE.AdditiveBlending, depthWrite: false, color: '#BFF7F4' }), 0, .062, 0); cm.castShadow = cm.receiveShadow = false; root.add(cm); }

// ---------- BOARD ----------
const EVENTS = { alon: 1, huli: 1, taog: 1, bangka: 1, buko: 1, araw: 1 };
const TYPES = { simula: '#3B2316', piso: '#2E6FD8', utang: '#E2452E', swerte: '#F2B705', tikbalang: '#7B4BC4', sarisari: '#13A39A', jackenpoy: '#F07C1E', kasama: '#3BAA4A', tanong: '#E8559A', alon: '#FFF4DC', huli: '#FFF4DC', taog: '#FFF4DC', bangka: '#FFF4DC', buko: '#FFF4DC', araw: '#FFF4DC' };
function tileTex(type) { const ev = EVENTS[type]; return tex(C(256, 256, (g, s) => { g.fillStyle = TYPES[type]; g.fillRect(0, 0, s, s); g.lineWidth = 7; g.strokeStyle = ev ? '#C9A24B' : 'rgba(255,255,255,.6)'; g.beginPath(); g.arc(128, 128, 112, 0, TAU); g.stroke();
  g.lineJoin = 'round'; g.lineCap = 'round'; g.strokeStyle = ev ? '#FFF4DC' : '#3B2316'; g.fillStyle = ev ? '#3B2316' : '#FFFFFF'; g.lineWidth = 12; g.textAlign = 'center'; g.textBaseline = 'middle';
  const txt = (t, size, y = 134) => { g.font = '900 ' + size + 'px "Arial Black", Arial, sans-serif'; g.strokeText(t, 128, y); g.fillText(t, 128, y); }; const shape = draw => { g.beginPath(); draw(); g.stroke(); g.fill(); };
  const waves = (y0, n) => { g.strokeStyle = '#3B2316'; g.lineWidth = 12; for (let k = 0; k < n; k++) { g.beginPath(); for (let x = 56; x <= 200; x += 6) g.lineTo(x, y0 + k * 34 + Math.sin((x - 56) / 144 * TAU * 1.5) * 10); g.stroke(); } };
  if (type === 'simula') { txt('SIMULA', 46, 112); txt('→', 80, 170); }
  else if (type === 'piso') txt('+₱', 110); else if (type === 'utang') txt('−₱', 110); else if (type === 'tanong') txt('?', 150); else if (type === 'jackenpoy') txt('VS', 100); else if (type === 'tikbalang') txt('←3', 100);
  else if (type === 'swerte') shape(() => { for (let i = 0; i < 10; i++) { const a = -PI / 2 + i * PI / 5, r = i % 2 ? 36 : 82; g.lineTo(128 + Math.cos(a) * r, 132 + Math.sin(a) * r); } g.closePath(); });
  else if (type === 'sarisari') { shape(() => g.rect(72, 118, 112, 68)); shape(() => { g.moveTo(58, 120); g.lineTo(198, 120); g.lineTo(178, 78); g.lineTo(78, 78); g.closePath(); }); g.fillStyle = '#E2452E'; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(84 + i * 26, 80); g.lineTo(96 + i * 26, 80); g.lineTo(92 + i * 28, 118); g.lineTo(76 + i * 28, 118); g.fill(); } g.fillStyle = '#3B2316'; g.fillRect(112, 140, 32, 46); }
  else if (type === 'kasama') for (const x of [94, 162]) { shape(() => g.arc(x, 96, 24, 0, TAU)); shape(() => g.roundRect(x - 32, 128, 64, 60, 22)); }
  else if (type === 'alon') { shape(() => { g.moveTo(50, 190); g.bezierCurveTo(60, 110, 120, 60, 180, 80); g.bezierCurveTo(140, 90, 130, 130, 160, 150); g.bezierCurveTo(130, 160, 120, 190, 206, 190); g.closePath(); }); }
  else if (type === 'huli') { shape(() => { g.ellipse(118, 128, 56, 32, 0, 0, TAU); }); shape(() => { g.moveTo(168, 128); g.lineTo(206, 98); g.lineTo(206, 158); g.closePath(); }); g.fillStyle = '#FFF4DC'; g.beginPath(); g.arc(90, 120, 7, 0, TAU); g.fill(); }
  else if (type === 'taog') { waves(150, 2); g.strokeStyle = '#3B2316'; g.lineWidth = 12; g.beginPath(); g.moveTo(128, 124); g.lineTo(128, 52); g.moveTo(102, 78); g.lineTo(128, 52); g.lineTo(154, 78); g.stroke(); }
  else if (type === 'bangka') { shape(() => { g.moveTo(44, 150); g.lineTo(212, 150); g.lineTo(188, 182); g.lineTo(68, 182); g.closePath(); }); shape(() => { g.moveTo(132, 140); g.lineTo(132, 50); g.lineTo(186, 136); g.closePath(); }); }
  else if (type === 'buko') { shape(() => g.arc(124, 142, 56, 0, TAU)); g.fillStyle = '#FFF4DC'; for (const [x, y] of [[106, 126], [138, 126], [122, 152]]) { g.beginPath(); g.arc(x, y, 8, 0, TAU); g.fill(); } g.strokeStyle = '#3B2316'; g.lineWidth = 10; g.beginPath(); g.moveTo(150, 96); g.lineTo(184, 44); g.stroke(); }
  else if (type === 'araw') { shape(() => g.arc(128, 128, 40, 0, TAU)); g.strokeStyle = '#3B2316'; g.lineWidth = 11; for (let i = 0; i < 8; i++) { const a = i * PI / 4; g.beginPath(); g.moveTo(128 + Math.cos(a) * 56, 128 + Math.sin(a) * 56); g.lineTo(128 + Math.cos(a) * 84, 128 + Math.sin(a) * 84); g.stroke(); } }
}), 0, 'tile_' + type); }
const tileMats = Object.fromEntries(Object.keys(TYPES).map(t => [t, own(std('tile_' + t, { map: tileTex(t), roughness: .45 }))]));
const SPM = { 0: 'simula', 3: 'tanong', 4: 'huli', 5: 'sarisari', 6: 'utang', 8: 'sarisari', 9: 'huli', 10: 'swerte', 12: 'bangka', 13: 'kasama', 15: 'buko', 16: 'swerte', 17: 'jackenpoy', 18: 'utang', 20: 'kasama',
  22: 'alon', 24: 'tanong', 25: 'utang', 26: 'swerte', 27: 'buko', 29: 'huli', 30: 'tanong', 31: 'tikbalang', 33: 'utang', 35: 'kasama', 36: 'alon', 37: 'sarisari', 39: 'araw', 40: 'jackenpoy',
  41: 'utang', 42: 'jackenpoy', 45: 'sarisari', 46: 'taog', 47: 'tanong', 49: 'tikbalang', 50: 'huli', 51: 'utang', 53: 'swerte', 55: 'huli', 56: 'swerte', 57: 'utang', 58: 'alon', 60: 'kasama',
  62: 'buko', 64: 'tanong', 65: 'buko', 66: 'utang', 68: 'araw', 69: 'sarisari', 70: 'tanong', 71: 'tikbalang', 72: 'kasama', 74: 'utang', 76: 'swerte', 77: 'alon', 78: 'taog' };
const MAIN = Array.from({ length: NM }, (_, i) => SPM[i] || 'piso');
const SPW = { 2: 'utang', 4: 'alon', 5: 'jackenpoy', 6: 'swerte', 8: 'huli', 9: 'sarisari', 10: 'utang', 12: 'tanong', 14: 'alon', 15: 'huli', 16: 'jackenpoy', 18: 'huli', 19: 'swerte', 20: 'utang', 22: 'taog',
  24: 'swerte', 25: 'kasama' };
const WALK = Array.from({ length: NW }, (_, j) => SPW[j] || 'piso');
const KOR = new Set(['M05', 'M16', 'M28', 'M38', 'M45', 'M54', 'M63', 'M75', 'W05', 'W17']);
const TIDAL = new Set(['W00', 'W01', 'W24', 'W25', 'M19', 'M21', 'M59', 'M61', 'M01', 'M79']);
const pad = n => String(n).padStart(2, '0');
{ const spaces = group('board_spaces'), graph = [];
  const addSpace = (id, type, p) => { const big = type === 'simula', Rr = big ? .85 : .58, y = id[0] === 'W' ? p.y + .02 : onBridge(p) ? .33 : .05, g = group('space_' + id + '_' + type, p.x, y, p.z);
    g.add(mesh('rim', new THREE.CylinderGeometry(Rr + .1, Rr + .14, .18, 24), white, 0, .09, 0), mesh('top', new THREE.CircleGeometry(Rr, 32).rotateX(-PI / 2), tileMats[type], 0, .182, 0));
    if (KOR.has(id)) g.add(mesh('korona_spot_ring', new THREE.TorusGeometry(Rr + .22, .045, 4, 32).rotateX(PI / 2), gold, 0, .1, 0));
    if (TIDAL.has(id)) g.add(mesh('tidal_marker', new THREE.TorusGeometry(Rr + .2, .03, 4, 32).rotateX(PI / 2), channelWater, 0, .05, 0));
    const node = { id, type, x: +p.x.toFixed(2), y: +y.toFixed(2), z: +p.z.toFixed(2), next: [], koronaSpot: KOR.has(id), tidal: TIDAL.has(id) }; g.userData = node; graph.push(node); spaces.add(g); };
  MAIN.forEach((t, i) => addSpace('M' + pad(i), t, M(i))); WALK.forEach((t, j) => addSpace('W' + pad(j), t, Wp(j)));
  graph.forEach(n => { const k = +n.id.slice(1); n.next.push(n.id[0] === 'M' ? 'M' + pad((k + 1) % NM) : (k === NW - 1 ? 'M' + pad(MERGE) : 'W' + pad(k + 1))); });
  graph.find(n => n.id === 'M' + pad(FORK)).next.push('W00'); Object.assign(graph.find(n => n.id === 'M' + pad(BOAT_A)), { bangkaTo: 'M' + pad(BOAT_B), bangkaCost: 6 });
  spaces.userData = { board: 'aplaya', start: 'M00', mainLoop: NM, boardwalk: NW, fork: 'M' + pad(FORK), merge: 'M' + pad(MERGE), bangka: { from: 'M' + pad(BOAT_A), to: 'M' + pad(BOAT_B), cost: 6 }, koronaSpots: [...KOR], tidalSpaces: [...TIDAL], activeKoronaRange: [1, 5], nodes: graph };
  window.__aplayaBoard = spaces.userData; root.add(spaces); }

let tris = 0; root.traverse(o => { if (o.isMesh) tris += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3; });


return { root, inIsland, RX, RZ, IZ };
}
