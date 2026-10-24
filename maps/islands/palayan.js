// Generated from Palayan Island.html
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

const root = group('isla4_palayan');

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
function palmRing(name, list) { const pg = group(name); list.forEach(([x, z, h, l, d], k) => { pg.add(palm(name + '_' + k, x, z, h, l, d)); chk(name, x, z); }); return bake(pg); }

function dryRack(x, z, ry) { const g = group('daing_rack', x, 0, z); g.rotation.y = ry; for (const px of [-1.1, 1.1]) for (const pz of [-.4, .4]) g.add(mesh('leg', new THREE.CylinderGeometry(.04, .04, .9, 5), bamboo, px, .45, pz)); g.add(B('rack_net', 2.4, .02, .9, netM, 0, .9, 0), B('rack_frame', 2.4, .05, .05, bamboo, 0, .9, .45), B('rack_frame', 2.4, .05, .05, bamboo, 0, .9, -.45));
  for (let r = 0; r < 3; r++) for (let c = 0; c < 10; c++) { const f = mesh('daing', new THREE.SphereGeometry(.06, 6, 3), fishM, -1.05 + c * .23, .93, -.28 + r * .28); f.scale.set(2.6, .3, 1.1); g.add(f); } return g; }
function netPoles(x, z, ry) { const g = group('fishing_net_poles', x, 0, z); g.rotation.y = ry; for (const px of [-1.6, 1.6]) g.add(mesh('pole', new THREE.CylinderGeometry(.06, .07, 2.8, 6), bamboo, px, 1.4, 0)); g.add(strut('top_line', v3(-1.6, 2.7, 0), v3(1.6, 2.7, 0), .015, std('rope', { color: '#D8C08A' })));
  const ng = new THREE.PlaneGeometry(3.2, 2.2, 8, 6).translate(0, 1.6, 0), p = ng.attributes.position; for (let i = 0; i < p.count; i++) { const xx = p.getX(i), yy = p.getY(i); p.setZ(i, Math.sin(xx * 1.5) * .12); p.setY(i, yy - (1 - (xx / 1.6) ** 2) * .3 * ((yy - .5) / 2.2)); } ng.computeVertexNormals(); g.add(mesh('net', ng, netM));
  for (let k = 0; k < 7; k++) g.add(mesh('float', new THREE.SphereGeometry(.08, 6, 4), vestOrange, -1.35 + k * .45, 2.68, 0)); return g; }
function bahayKubo(name, x, z, ry) { const g = group(name, x, 0, z); g.rotation.y = ry; for (const px of [-1.5, 1.5]) for (const pz of [-1.2, 1.2]) g.add(mesh('stilt', new THREE.CylinderGeometry(.09, .1, 1.3, 6), bamboo, px, .65, pz));
  g.add(B('floor', 3.4, .12, 2.8, bamboo, 0, 1.2, 0), B('walls', 3.2, 1.7, 2.6, woven, 0, 1.32, 0), B('window', .9, .6, .04, niche, -.7, 2.0, 1.31), B('door', .7, 1.3, .04, niche, .8, 1.32, 1.31), mesh('roof', hipRoof(3.2, 2.6, 1.9, .5, .55), nipa, 0, 3.0, 0), strut('ladder', v3(.8, 0, 2.1), v3(.8, 1.2, 1.4), .05, bamboo)); return g; }
// ---------- PALAYAN MATERIALS ----------
const sm = (a, b, t) => { const u = Math.max(0, Math.min(1, (t - a) / (b - a))); return u * u * (3 - 2 * u); };
const shellTex = (cols, rows, rad, seedJ) => tex(C(256, 256, (g, s) => { for (let r = 0; r < rows; r++) for (let c = 0; c < rows; c++) { const x = (c + .5) * s / rows + (rnd() - .5) * seedJ, y = (r + .5) * s / rows + (rnd() - .5) * seedJ; g.fillStyle = pick(cols); g.beginPath(); g.arc(x, y, rad * (.7 + rnd() * .5), 0, TAU); g.fill(); } }), 1.2, 'rice_shell');
const greenShell = [0, 1, 2, 3].map(k => std('rice_seedling_' + k, { map: shellTex(['#7FD043', '#6CC23A', '#9BE05A'], 10, 9 - k * 1.6, 3), alphaTest: .5, side: THREE.DoubleSide, roughness: .7 }));
const goldShell = [0, 1, 2, 3, 4, 5].map(k => std('rice_golden_' + k, { map: shellTex(k > 3 ? ['#E8C04A', '#D9A93A', '#F2D36A'] : ['#C9B14A', '#B89E3C', '#D8C060'], 22, 6.5 - k * .8, 6), alphaTest: .5, side: THREE.DoubleSide, roughness: .75 }));
const paddyWater = std('paddy_water', { color: '#8FB3A6', roughness: .05, metalness: .25 }), paddyMud = std('paddy_mud', { map: tSoil, color: '#8A6A48', roughness: .6 }), dikeM = std('pilapil', { map: tGrass, color: '#B8C98A' });
const roadM = std('farm_road', { map: tSoil, color: '#E2C9A0', roughness: .95 }), trailM = std('terrace_trail', { map: tSoil, color: '#CDB28A', roughness: .95 });
const kalabawM = P('kalabaw', '#4A4A50', { roughness: .7 }), hornM = P('horn', '#D8CFC0'), goatM = P('goat', '#F1ECE2'), goatB = P('goat_brown', '#8E6A48'), duckM = P('duck', '#FBFBF5'), beakM = P('beak', '#F2A22A'), skin = P('skin', '#B07A52'), salakot = std('salakot', { map: tWoven, color: '#E8D2A0' });
const bambooGreen = P('bamboo_culm', '#8DB04A', { roughness: .5 }), firefly = std('firefly', { color: '#E9FF8A', emissive: '#D8FF4A', emissiveIntensity: 1 }), mangoM = P('mango_fruit', '#F7B733'), strawM = std('dayami_straw', { map: tThatch, color: '#F2DC9A' }), bananaTrunk = P('banana_trunk', '#8FA24E');
const forestM = std('forest', { map: tLeaf, color: '#7BA868', flatShading: true });

// ---------- TERRAIN FUNCTION (mountains + terraces + pool + trail shelf) ----------
const PEAKS = [[-13, -24, 15, 12.5], [13, -25, 12.5, 11.5]];
const Hraw = (x, z) => { let m = 0; for (const [px, pz, ph, pr] of PEAKS) { const d = Math.hypot((x - px) / pr, (z - pz) / (pr * 1.15)); m = Math.max(m, ph * Math.exp(-d * d * 1.1)); } return m + sm(-8, -22, z) * (2 + .9 * Math.sin(x * .3) + .5 * Math.sin(x * .8 + z * .4)); };
const TSTEP = 1.1, terrZone = (h, z) => h > .4 && h < 9.6 && z > -34;
const Hterr = (x, z) => { let h = Hraw(x, z); if (terrZone(h, z)) { const s = h / TSTEP, f = s - Math.floor(s); h = (Math.floor(s) + sm(.8, 1, f)) * TSTEP; } return h * sm(-7.5, -12.5, z); };
const POOL = V(0, -18.6), POOLY = Math.max(1.4, Hterr(0, -18.6) - .2);
const STREAM = [V(0, -16.2), V(.8, -12.5), V(-1, -9), V(1.5, -3), V(-1.2, 3), V(1, 9), V(-1, 15), V(.5, 20), V(0, 26), V(.8, 31.2)];
const MA = 26, MB = 14, MZ = 8, NM = 80, NT = 24, FORK = 30, MERGE = 50, CART_A = 66, CART_B = 14;
const mainPt = t => V(MA * Math.sin(t) * (1 + .06 * Math.cos(3 * t)), MZ + MB * Math.cos(t) * (1 + .06 * Math.cos(3 * t + 1)));
const mainCurve = new THREE.CatmullRomCurve3(Array.from({ length: 120 }, (_, i) => mainPt(i / 120 * TAU)), true);
const M = i => mainCurve.getPointAt((((i % NM) + NM) % NM) / NM);
const trailCurve = new THREE.CatmullRomCurve3([M(FORK), V(21, -9), V(13, -14.6), V(5, -14), V(0, -13.8), V(-5, -14), V(-13, -14.6), V(-21, -9), M(MERGE)]);
const trailXZ = trailCurve.getSpacedPoints(120); { const raw = trailXZ.map(p => Math.max(.05, Hterr(p.x, p.z) * .8)), out = raw.map((_, i) => { let s = 0, c = 0; for (let k = -8; k <= 8; k++) { const j = i + k; if (j >= 0 && j < raw.length) { s += raw[j]; c++; } } return s / c; }); trailXZ.forEach((p, i) => p.y = Math.max(.05, out[i] * sm(0, 10, i) * sm(0, 10, raw.length - 1 - i) + .05)); }
const trailNear = (x, z) => { let bd = 1e9, by = 0; for (const p of trailXZ) { const d = (p.x - x) ** 2 + (p.z - z) ** 2; if (d < bd) { bd = d; by = p.y; } } return [Math.sqrt(bd), by]; };
const distToSeg = (p, a, b) => { const ab = b.clone().sub(a), t = Math.max(0, Math.min(1, p.clone().sub(a).dot(ab) / ab.lengthSq())); return p.distanceTo(a.clone().add(ab.multiplyScalar(t))); };
const distPoly = (x, z, pts) => { let d = 1e9; const p = V(x, z); for (let i = 0; i < pts.length - 1; i++) d = Math.min(d, distToSeg(p, pts[i], pts[i + 1])); return d; };
function H(x, z) { let h = Hterr(x, z); const dp = Math.hypot(x - POOL.x, z - POOL.z); if (dp < 5) h = h + (POOLY - h) * sm(5, 3.2, dp);
  if (z < -8) { const ds = distPoly(x, z, STREAM.slice(0, 4)); if (ds < 2) h -= .3 * sm(2, .7, ds); }
  if (z < -5 && Math.abs(x) < 24) { const [dt, ty] = trailNear(x, z); if (dt < 3.2) h = h + (ty - .02 - h) * sm(3.2, 1.6, dt); } return Math.max(0, h); }

// ---------- PATHS ----------
const mainPts = mainCurve.getSpacedPoints(300).slice(0, -1), cartA = M(CART_A), cartB = M(CART_B);
const cartPts = new THREE.CatmullRomCurve3([cartA, V(cartA.x * .55, cartA.z + .2), V(0, cartA.z + .35), V(cartB.x * .55, cartB.z + .2), cartB]).getSpacedPoints(60);
const canalPts = new THREE.CatmullRomCurve3(STREAM).getSpacedPoints(120).map(p => { p.y = H(p.x, p.z) + .05; return p; });
const PATHS = [[mainPts, 2.3], [cartPts, 2.6], [trailXZ, 2.0], [canalPts, 3.6]];
const nearPath = (x, z, d) => PATHS.some(([pts, w]) => pts.some(p => Math.hypot(p.x - x, p.z - z) < d + w / 2));
const onBridge = p => p.z > -9 && distPoly(p.x, p.z, canalPts) < 2.2;
const interior = (x, z, m = 0) => Math.hypot(x / MA, (z - MZ) / MB) < 1 - m;
const onIslandFlat = (x, z) => inIsland(x, z, .9) && z > -9;

// ---------- PADDIES (pilapil + shell-textured rice) ----------
const PADDIES = [];
{ const pd = group('palayan_paddies'); for (let x = -19.25; x <= 19.3; x += 5.5) for (let z = -1.5; z <= 15; z += 4.3) { const w = 5.0, d = 3.9; if (Math.abs(x) < 3.4 || ![[-1, -1], [1, -1], [-1, 1], [1, 1]].every(([a, b]) => interior(x + a * w / 2, z + b * d / 2, .14))) continue;
    if (z + d / 2 > 16.6) continue; const golden = (x > 0) !== (rnd() < .15), mud = !golden && rnd() < .12; PADDIES.push({ x, z, w, d, golden, mud });
    for (const s of [-1, 1]) pd.add(B('pilapil', w + .4, .24, .4, dikeM, x, 0, z + s * d / 2), B('pilapil', .4, .24, d, dikeM, x + s * w / 2, 0, z));
    pd.add(B('paddy_floor', w - .1, .05, d - .1, golden ? paddyMud : paddyWater, x, golden ? .02 : .05, z));
    if (!mud) { const L = golden ? goldShell : greenShell; L.forEach((m, k) => { const pl = mesh('rice_shell', new THREE.PlaneGeometry(w - .3, d - .3).rotateX(-PI / 2), m, x, (golden ? .14 : .1) + k * (golden ? .14 : .07), z); pl.castShadow = k === L.length - 1; pd.add(pl); }); } }
  props.add(bake(pd)); }

// ---------- CREATURES + PEOPLE ----------
function kalabaw(name, x, z, ry, y = 0) { const g = group(name, x, y, z); g.rotation.y = ry; g.add(mesh('body', new THREE.CapsuleGeometry(.55, 1.2, 4, 10).rotateZ(PI / 2), kalabawM, 0, 1.0, 0));
  for (const dx of [-.55, .55]) for (const s of [-1, 1]) g.add(mesh('leg', new THREE.CylinderGeometry(.11, .09, .75, 6), kalabawM, dx, .38, s * .28));
  g.add(mesh('neck', new THREE.CylinderGeometry(.3, .38, .5, 8).rotateZ(-1.1), kalabawM, 1.05, 1.1, 0), B('head', .55, .38, .4, kalabawM, 1.4, .85, 0), B('muzzle', .22, .24, .32, P('kalabaw_nose', '#2E2E33'), 1.7, .82, 0));
  for (const s of [-1, 1]) { const hn = mesh('horn', new THREE.TorusGeometry(.32, .06, 5, 10, PI * .9), hornM, 1.3, 1.25, s * .25); hn.rotation.set(0, s > 0 ? 0 : PI, -.4); g.add(hn, mesh('ear', new THREE.ConeGeometry(.07, .2, 5).rotateX(s * PI / 2), kalabawM, 1.3, 1.08, s * .26)); }
  g.add(strut('tail', v3(-1.15, 1.1, 0), v3(-1.35, .55, 0), .03, kalabawM)); return g; }
function goat(name, x, z, ry, m) { const g = group(name, x, 0, z); g.rotation.y = ry; g.add(mesh('body', new THREE.CapsuleGeometry(.22, .5, 3, 8).rotateZ(PI / 2), m, 0, .55, 0), B('head', .25, .2, .18, m, .5, .72, 0), mesh('horn', new THREE.ConeGeometry(.03, .14, 4), hornM, .48, .88, 0));
  for (const dx of [-.25, .25]) for (const s of [-1, 1]) g.add(mesh('leg', new THREE.CylinderGeometry(.035, .03, .35, 5), m, dx, .18, s * .1)); return g; }
const chick = (x, z, m) => { const g = group('manok', x, 0, z); g.rotation.y = rnd() * TAU; g.add(mesh('body', new THREE.SphereGeometry(.13, 6, 4), m, 0, .18, 0), mesh('head', new THREE.SphereGeometry(.065, 6, 4), m, .11, .32, 0), B('comb', .05, .05, .02, P('comb_red', '#D7322B'), .12, .39, 0)); return g; };
const duck = (x, y, z) => { const g = group('pato', x, y, z); g.rotation.y = rnd() * TAU; g.add(mesh('body', new THREE.SphereGeometry(.16, 7, 5), duckM, 0, .08, 0), mesh('head', new THREE.SphereGeometry(.08, 6, 4), duckM, .14, .22, 0), B('beak', .08, .03, .05, beakM, .23, .21, 0)); return g; };
function farmer(name, x, z, ry, bend = 0, shirt) { const g = group(name, x, 0, z); g.rotation.y = ry; for (const s of [-1, 1]) g.add(mesh('leg', new THREE.CylinderGeometry(.06, .06, .7, 6), P('pants', '#4D5A6E'), 0, .35, s * .1));
  const up = group('upper', 0, .72, 0); up.rotation.z = -bend; up.add(mesh('torso', new THREE.CapsuleGeometry(.16, .35, 3, 8), shirt, 0, .3, 0), mesh('head', new THREE.SphereGeometry(.12, 8, 6), skin, 0, .72, 0), mesh('salakot', new THREE.ConeGeometry(.42, .2, 12), salakot, 0, .86, 0));
  for (const s of [-1, 1]) up.add(strut('arm', v3(0, .5, s * .2), v3(.32, .12 + bend * .1, s * .14), .045, skin)); g.add(up); return g; }

// ---------- FLORA ----------
function bananaPlant(name, x, z, h = 2.6, y = 0) { const g = group(name, x, y, z); g.add(mesh('trunk', new THREE.CylinderGeometry(.13, .18, h, 7), bananaTrunk, 0, h / 2, 0));
  for (let k = 0; k < 7; k++) { const L = 2.2 + rnd() * .6, geo = new THREE.PlaneGeometry(.75, L, 1, 6).translate(0, L / 2, 0).rotateX(-PI / 2), p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const t = -p.getZ(i) / L; p.setY(i, L * (.55 * t - .7 * t * t)); } geo.computeVertexNormals(); const lf = mesh('banana_leaf', geo, bananaLeaf, 0, h, 0); lf.rotation.y = k / 7 * TAU + rnd() * .3; g.add(lf); }
  if (rnd() < .6) { for (let k = 0; k < 8; k++) g.add(mesh('saging', new THREE.CapsuleGeometry(.04, .16, 2, 5), VEG.calamansi, .25 + (k % 2) * .06, h - .4 - (k >> 1) * .12, (k % 2) * .06)); g.add(mesh('puso', new THREE.ConeGeometry(.08, .25, 6).rotateX(PI), P('banana_heart', '#7A2C4E'), .3, h - 1.05, 0)); } return g; }
function mangoTree(name, x, z, s = 1, y = 0) { const g = group(name, x, y, z); g.add(mesh('trunk', new THREE.CylinderGeometry(.22 * s, .34 * s, 2.2 * s, 8), bark, 0, 1.1 * s, 0));
  [[0, 3.4, 0, 1.9], [-1.1, 3.0, .4, 1.3], [1.1, 3.1, -.3, 1.35], [.2, 4.2, -.2, 1.2], [-.3, 3.1, -1.1, 1.2]].forEach(([a, b, c, r], i) => g.add(mesh('canopy', new THREE.IcosahedronGeometry(r * s, 1), i % 2 ? forestM : leaf, a * s, b * s, c * s)));
  for (let k = 0; k < 10; k++) { const a = rnd() * TAU; g.add(mesh('mangga', new THREE.SphereGeometry(.09, 6, 4), mangoM, Math.cos(a) * 1.8 * s, (2.6 + rnd()) * s, Math.sin(a) * 1.8 * s)); } return g; }
function bambooClump(name, x, z, y = 0) { const g = group(name, x, y, z); for (let k = 0; k < 13; k++) { const a = rnd() * TAU, r = rnd() * .8, h = 6 + rnd() * 3.5, lean = .15 + rnd() * .25, top = v3(Math.cos(a) * (r + h * lean), h, Math.sin(a) * (r + h * lean));
    g.add(strut('culm', v3(Math.cos(a) * r, 0, Math.sin(a) * r), top, .06, bambooGreen)); for (let q = 0; q < 2; q++) { const c = mesh('bamboo_leaves', new THREE.IcosahedronGeometry(.8 + rnd() * .5, 0), leafLight, top.x * (.85 + q * .1), top.y - q * 1.2, top.z * (.85 + q * .1)); c.scale.y = .5; g.add(c); } }
  for (let k = 0; k < 14; k++) g.add(mesh('alitaptap', new THREE.SphereGeometry(.035, 4, 3), firefly, (rnd() - .5) * 5, 1 + rnd() * 2.5, (rnd() - .5) * 5)); return g; }
const haystack = (name, x, z, y = 0) => { const g = group(name, x, y, z); g.add(mesh('mandala', new THREE.ConeGeometry(1.5, 2.6, 10), strawM, 0, 1.3, 0), mesh('pole', new THREE.CylinderGeometry(.04, .04, 3.2, 5), bamboo, 0, 1.6, 0), mesh('base', new THREE.CylinderGeometry(1.6, 1.6, .25, 10), strawM, 0, .12, 0)); return g; };
function scarecrow(name, x, z) { const g = group(name, x, 0, z); g.rotation.y = rnd() * .6 - .3; g.add(mesh('post', new THREE.CylinderGeometry(.05, .05, 2.2, 5), bamboo, 0, 1.1, 0), strut('arms', v3(0, 1.55, -.7), v3(0, 1.55, .7), .035, bamboo), B('shirt', .3, .6, 1.1, cloth[(rnd() * 8) | 0], 0, 1.0, 0), mesh('sack_head', new THREE.SphereGeometry(.2, 8, 6), sack, 0, 1.92, 0), mesh('salakot', new THREE.ConeGeometry(.4, .2, 10), salakot, 0, 2.12, 0));
  for (let k = 0; k < 5; k++) g.add(mesh('straw', new THREE.ConeGeometry(.03, .3, 3), strawM, 0, 1.55, (k - 2) * .3).rotateX(PI)); return g; }

// ---------- TERRAIN MESH (heightfield with terrace colors) ----------
const terrainG = group('terrain'); { const body = islandBody('island_body', RX, RZ, 13, blobR, 26, 8); terrainG.add(body); root.add(bake(terrainG)); }

// ---------- LANDMARK: TALON (waterfall) + POOL + STREAM ----------
{ const wf = group('talon'); const top = V(0, -25.8), topY = H(0, -25.8) + .3; const fh = topY - POOLY; const geo = new THREE.PlaneGeometry(2.6, fh, 3, 12).translate(0, -fh / 2, 0), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const d = -p.getY(i) / fh; p.setZ(i, d * (top.z - POOL.z) * -1 * .0 + d * 5.5); p.setY(i, topY - d * fh); } geo.computeVertexNormals(); const sheet = mesh('falls', geo, fallM, 0, 0, top.z); sheet.castShadow = false; wf.add(sheet);
  wf.add(mesh('pool', new THREE.CircleGeometry(3.4, 28).rotateX(-PI / 2), channelWater, POOL.x, POOLY + .08, POOL.z), mesh('pool_foam', new THREE.TorusGeometry(3.3, .12, 4, 28).rotateX(PI / 2), foam, POOL.x, POOLY + .1, POOL.z));
  for (let k = 0; k < 10; k++) { const a = k / 10 * TAU + rnd() * .3, b = mesh('boulder', new THREE.DodecahedronGeometry(.45 + rnd() * .5, 0), rock, POOL.x + Math.cos(a) * 3.7, POOLY + .1, POOL.z + Math.sin(a) * 3.2); b.scale.y = .7; wf.add(b); }
  for (let k = 0; k < 5; k++) wf.add(mesh('mist', new THREE.SphereGeometry(.7 + rnd() * .5, 8, 6), std('mist', { color: '#FFFFFF', transparent: true, opacity: .3, depthWrite: false }), (rnd() - .5) * 2, POOLY + .5 + rnd(), top.z + 5.2 + rnd()));
  wf.add(ribbonY('stream', canalPts, 2.4, channelWater, .02), ribbonY('canal_bank', canalPts.map(q => q.clone()), 3.6, paddyMud, -.01));
  const lip = canalPts[canalPts.length - 1]; const fall2 = new THREE.PlaneGeometry(2.4, 8, 2, 8).translate(0, -4, 0), q2 = fall2.attributes.position; for (let i = 0; i < q2.count; i++) { const d = -q2.getY(i); q2.setZ(i, 1.8 * Math.sqrt(d / 8)); } fall2.computeVertexNormals(); const f2 = mesh('canal_spill', fall2, fallM, lip.x, .06, lip.z); wf.add(f2);
  for (let k = 0; k < 6; k++) wf.add(duck(-.6 + (rnd() - .5), .05, 4 + k * 3 + rnd()));
  wf.traverse(o => { if (o.isMesh && o.material === fallM) o.castShadow = false; }); landmarks.add(wf); }
// bridges
{ const br = group('bridges'); const bridgeAt = (pts, w, y, n) => { let best = 0, bd = 1e9; pts.forEach((p, i) => { const d = distPoly(p.x, p.z, canalPts.filter(c => c.z > -9)); if (d < bd) { bd = d; best = i; } }); const bp = pts[best], tg = pts[Math.min(pts.length - 1, best + 1)].clone().sub(pts[Math.max(0, best - 1)]);
    const b = group(n, bp.x, 0, bp.z); b.rotation.y = Math.atan2(tg.x, tg.z); b.add(B('deck', w, .12, 5.5, wood, 0, y, 0)); for (const s of [-1, 1]) { b.add(B('rail', .08, .08, 5.5, bamboo, s * (w / 2 - .05), y + .85, 0)); for (const zz of [-2.6, -1.3, 0, 1.3, 2.6]) b.add(mesh('post', new THREE.CylinderGeometry(.04, .04, .85, 5), bamboo, s * (w / 2 - .05), y + .45, zz)); } br.add(b); };
  bridgeAt(mainPts.filter(p => p.z < 0), 2.6, .26, 'bridge_back'); bridgeAt(mainPts.filter(p => p.z > 15), 2.6, .26, 'bridge_front'); bridgeAt(cartPts, 2.8, .24, 'bridge_cart');
  const tb = group('trail_bridge', 0, 0, -13.8); tb.rotation.y = PI / 2; const ty = trailNear(0, -13.8)[1]; tb.add(B('deck', 2.2, .12, 3.6, wood, 0, ty - .05, 0)); for (const s of [-1, 1]) tb.add(B('rail', .08, .08, 3.6, bamboo, s * 1.05, ty + .8, 0)); br.add(tb); landmarks.add(bake(br)); }
// roads
{ const rd = group('roads'); rd.add(ribbon('farm_road', mainPts, 2.3, roadM, .04, true), ribbon('cart_lane', cartPts, 2.6, roadM, .035), ribbonY('terrace_trail', trailXZ, 2.0, trailM, .03)); root.add(bake(rd)); }

// ---------- HOMESTEAD (front-left) ----------
{ const hs = group('homestead');
  hs.add(bahayKubo('bahay_kubo', -23, 23.2, .2), kalabaw('kalabaw_home', -25.5, 16.4, .8));
  { const km = group('kamalig', -28.2, 0, 19.2); for (const px of [-.9, .9]) for (const pz of [-.8, .8]) km.add(mesh('stilt', new THREE.CylinderGeometry(.08, .09, 1.4, 6), bamboo, px, .7, pz)); km.add(B('walls', 2.0, 1.6, 1.8, woven, 0, 1.4, 0), mesh('roof', hipRoof(2.0, 1.8, 2.0, 1.0, .45), nipa, 0, 3.0, 0), strut('ladder', v3(.6, 0, 1.6), v3(.6, 1.4, .9), .04, bamboo)); for (let k = 0; k < 5; k++) km.add(mesh('palay_sack', new THREE.CylinderGeometry(.25, .28, .6, 8), sack, -1.6 + (k % 3) * .55, .3 + ((k / 3) | 0) * .55, 1.6)); hs.add(km); }
  { const vg = group('gulayan', -14.5, 0, 25.6); for (const s of [-1, 1]) vg.add(B('fence', 7.4, .06, .06, bamboo, 0, .9, s * 2.1), B('fence', .06, .06, 4.2, bamboo, s * 3.7, .9, 0)); for (let k = 0; k <= 12; k++) for (const s of [-1, 1]) vg.add(mesh('fence_post', new THREE.CylinderGeometry(.04, .04, 1.1, 5), bamboo, -3.6 + k * .6, .55, s * 2.1));
    const crops = [[VEG.cabbage, .16], [VEG.tomato, .07], [VEG.eggplant, .07], [VEG.kalabasa, .17], [VEG.onion, .06], [VEG.sitaw, .05]]; for (let r = 0; r < 5; r++) { vg.add(B('plot', 6.8, .12, .55, paddyMud, 0, 0, -1.6 + r * .8)); const [m, sz] = crops[r % crops.length]; for (let c = 0; c < 11; c++) { vg.add(mesh('leaves', new THREE.IcosahedronGeometry(.16, 0), leaf, -3.1 + c * .62, .22, -1.6 + r * .8), mesh('crop', new THREE.SphereGeometry(sz, 6, 4), m, -3.1 + c * .62 + .08, .2 + sz, -1.6 + r * .8 + .06)); } }
    const tr = group('balag_trellis', 0, 0, 2.6); for (const px of [-2, 0, 2]) tr.add(mesh('post', new THREE.CylinderGeometry(.04, .04, 2.0, 5), bamboo, px, 1, 0)); tr.add(strut('top', v3(-2, 2, 0), v3(2, 2, 0), .03, bamboo)); for (let k = 0; k < 6; k++) tr.add(mesh('upo', new THREE.CapsuleGeometry(.07, .3, 2, 6), VEG.calamansi, -1.8 + k * .7, 1.6, 0), mesh('vine', new THREE.IcosahedronGeometry(.25, 0), leaf, -1.8 + k * .7, 1.95, 0)); vg.add(tr); hs.add(vg); }
  { const ps = group('poso', -21.2, 0, 22.8); ps.add(B('slab', 1.2, .12, 1.2, granite, 0, 0, 0), mesh('pump', new THREE.CylinderGeometry(.1, .12, 1.0, 8), iron, 0, .62, 0), strut('handle', v3(0, 1.05, 0), v3(.6, 1.25, 0), .03, iron), strut('spout', v3(0, .85, 0), v3(-.3, .8, 0), .04, iron), mesh('timba', new THREE.CylinderGeometry(.17, .14, .3, 10, 1, true), drumBlue, -.35, .27, 0)); hs.add(ps); }
  { const cp = group('kulungan', -23, 0, 19.8); cp.add(B('coop', 1.4, .9, 1.0, woven, 0, .4, 0), mesh('coop_roof', hipRoof(1.4, 1.0, .5, .7, .2), nipa, 0, 1.3, 0)); for (const s of [-1, 1]) cp.add(mesh('leg', new THREE.CylinderGeometry(.04, .04, .4, 5), bamboo, s * .6, .2, 0)); hs.add(cp); for (let k = 0; k < 9; k++) hs.add(chick(-23 + (rnd() - .5) * 4, 18.4 + (rnd() - .5) * 1.6, rnd() < .5 ? P('hen_brown', '#9A5B2E') : P('hen_white', '#F3EEE4'))); }
  { const lb = group('lubluban', -33.5, 0, 12.5); lb.add(mesh('mud_pool', new THREE.CircleGeometry(2.4, 18).rotateX(-PI / 2), P('wallow_mud', '#6B4A2E', { roughness: .25 }), 0, .03, 0)); lb.add(kalabaw('kalabaw_wallowing', 0, 0, 2.2, -.55)); hs.add(lb); }
  [[-33, 4.5, .4, goatM], [-34.5, 2.6, 2.2, goatB], [-32, 1.2, -1, goatM]].forEach(([x, z, r, m], k) => hs.add(goat('kambing_' + k, x, z, r, m))); hs.add(mesh('tether_post', new THREE.CylinderGeometry(.04, .04, .7, 5), wood, -33.2, .35, 2.8));
  props.add(bake(hs)); }

// ---------- FRONT-RIGHT: bilad, palay, kuliglig, sari-sari ----------
{ const fr = group('ani_area', -3.5, 0, -3.5); fr.add(B('bilad_apron', 9, .04, 4, granite, 19, 0, 27.2)); for (let k = 0; k < 4; k++) fr.add(B('palay_drying', 1.9, .05, 3.2, P('palay_gold', '#E7C55A', { roughness: .95 }), 15.8 + k * 2.2, .04, 27.2)); fr.add(strut('kalaykay', v3(23.5, .05, 25.6), v3(24.5, 1.1, 26.4), .025, wood), B('rake_head', .7, .06, .06, wood, 23.5, .03, 25.5));
  for (let k = 0; k < 9; k++) fr.add(mesh('palay_sack', new THREE.CylinderGeometry(.27, .3, .65, 8), sack, 26 + (k % 3) * .6, .33 + ((k / 3) | 0) * .02, 22.5 + ((k / 3) | 0) * .6));
  fr.add(mesh('lusong', new THREE.CylinderGeometry(.35, .3, .55, 10), doorWood, 28.5, .28, 25.5), mesh('lusong_hole', new THREE.CircleGeometry(.25, 10).rotateX(-PI / 2), niche, 28.5, .56, 25.5), strut('halo', v3(28.5, .5, 25.5), v3(28.6, 2.1, 25.6), .05, wood));
  { const kg = group('kuliglig', 31, 0, 19); kg.rotation.y = -1.1; kg.add(B('engine', .7, .5, .5, paintRed, 0, .55, 0), B('tank', .4, .25, .3, paintYellow, -.1, 1.05, 0)); for (const s of [-1, 1]) kg.add(mesh('wheel', new THREE.TorusGeometry(.38, .09, 6, 12), trashBag, .1, .38, s * .5), strut('handle', v3(-.3, .8, s * .2), v3(-1.5, 1.05, s * .35), .03, iron));
    kg.add(B('trailer', 2.0, .4, 1.3, wood, 1.6, .5, 0)); for (const s of [-1, 1]) kg.add(mesh('trailer_wheel', new THREE.TorusGeometry(.3, .07, 6, 12), trashBag, 1.6, .3, s * .7)); for (let k = 0; k < 4; k++) kg.add(mesh('sack', new THREE.CylinderGeometry(.25, .28, .6, 8).rotateZ(PI / 2), sack, 1.6, 1.1, -.4 + k * .27)); fr.add(kg); }
  { const ss = group('sari_sari_store', 8.5, 0, 28.5); ss.add(B('walls', 2.8, 2.2, 2.0, paintGreen, 0, 0, 0), B('window', 1.8, .9, .04, niche, 0, .95, 1.01), B('ledge', 2.0, .08, .3, wood, 0, .9, 1.15), B('roof', 3.2, .06, 2.6, giRoof, 0, 2.3, .1), mesh('sign', new THREE.PlaneGeometry(2.0, .4), signMat('SARI-SARI STORE'), 0, 1.95, 1.03), B('bench', 1.4, .4, .35, wood, -1.0, 0, 1.6)); fr.add(ss); }
  props.add(bake(fr)); }

// ---------- FIELD LIFE: farmers, kalabaw plow, scarecrows, rest shed ----------
{ const fl = group('field_life'); const green = PADDIES.filter(p => !p.golden && !p.mud), gold = PADDIES.filter(p => p.golden), mud = PADDIES.filter(p => p.mud);
  green.slice(0, 5).forEach((p, k) => fl.add(farmer('magsasaka_tanim_' + k, p.x + (rnd() - .5) * 2, p.z + (rnd() - .5) * 1.4, rnd() * TAU, 1.0, cloth[k % 8])));
  gold.slice(0, 4).forEach((p, k) => { fl.add(farmer('magsasaka_ani_' + k, p.x + (rnd() - .5) * 2, p.z + (rnd() - .5) * 1.2, rnd() * TAU, .5, cloth[(k + 3) % 8])); for (let q = 0; q < 4; q++) fl.add(mesh('palay_bundle', new THREE.CylinderGeometry(.12, .08, .5, 6), P('bundle_gold', '#E0B94A'), p.x - 1.6 + q * .4, .3, p.z + 1.2)); });
  const mp = mud[0] || green[green.length - 1]; if (mp) { fl.add(kalabaw('kalabaw_araro', mp.x, mp.z, .3, -.15)); fl.add(strut('araro_plow', v3(mp.x - .9, .7, mp.z - .25), v3(mp.x - 2.3, .2, mp.z - .65), .05, wood), farmer('magsasaka_araro', mp.x - 2.6, mp.z - .8, .3, .3, cloth[6])); }
  [green[1], gold[2], green[3]].filter(Boolean).forEach((p, k) => fl.add(scarecrow('panakot_' + k, p.x + 1.8, p.z - 1.2)));
  fl.add(kubo('kubo_pahingahan', 0, 11.8, 0, null, 2.6, 2.4));
  props.add(bake(fl)); }

// ---------- KALABAW CART (shortcut) ----------
{ const kc = group('kalabaw_cart'); const k0 = kalabaw('kalabaw_kariton', cartA.x + 6.5, cartA.z + 2.7, 0); kc.add(k0); const cart = group('kariton', cartA.x + 4.2, 0, cartA.z + 2.7);
  for (const s of [-1, 1]) cart.add(mesh('wheel', new THREE.TorusGeometry(.6, .06, 6, 16), doorWood, 0, .6, s * .75)); cart.add(B('bed', 2.0, .3, 1.4, bamboo, 0, .75, 0), mesh('roof', new THREE.CylinderGeometry(.75, .75, 2.0, 10, 1, false, 0, PI).rotateZ(PI / 2), nipa, 0, 1.15, 0), strut('shaft', v3(1, .85, -.4), v3(2.2, 1.0, -.25), .04, wood), strut('shaft', v3(1, .85, .4), v3(2.2, 1.0, .25), .04, wood));
  kc.add(cart); for (const [p, n] of [[cartA, 'a'], [cartB, 'b']]) { kc.add(mesh('stop_post_' + n, new THREE.CylinderGeometry(.05, .05, 2.3, 6), iron, p.x, 1.15, p.z + 2.2), mesh('stop_sign_' + n, new THREE.PlaneGeometry(1.4, .32), signMat('KARITON'), p.x, 2.1, p.z + 2.25)); }
  chk('kalabaw_cart', cartA.x + 5, cartA.z + 2.7); landmarks.add(bake(kc)); }

// ---------- ORCHARDS + GROVES ----------
{ const og = group('orchards'); [[33, -2], [34.5, 3], [31.5, 7], [35, 9.5], [30.5, -6.5], [33.5, -9]].forEach(([x, z], k) => og.add(bananaPlant('saging_' + k, x, z, 2.4 + rnd())));
  [[31, 14], [-23, -9.5], [24, -8], [33, -13]].forEach(([x, z], k) => { og.add(mangoTree('mangga_' + k, x, z, .9 + rnd() * .3)); chk('mango', x, z); });
  og.add(bambooClump('kawayan_1', -30, -9.5), bambooClump('kawayan_2', -33.5, -3), bambooClump('kawayan_3', 29.5, -14.5));
  og.add(haystack('mandala_1', 33.5, 15.8), haystack('mandala_2', -29.5, -6.5), haystack('mandala_3', 27, -12), haystack('mandala_4', -8, 27));
  [[-33, 13], [29.5, 18.5], [-37, -1], [4, 30], [-6, 30.5], [-25, -13]].forEach(([x, z], k) => { og.add(palm('niyog_' + k, x, z, 7 + rnd() * 1.2, 1 + rnd() * .6, rnd() * TAU)); chk('palm', x, z); });
  props.add(bake(og)); }

// ---------- MOUNTAIN FOREST (on slopes above the terraces) ----------
{ const mf = group('mountain_forest'); let n = 0; for (let t = 0; t < 5000 && n < 140; t++) { const x = (rnd() * 2 - 1) * RX * .95, z = -12 - rnd() * 22; if (!inIsland(x, z, .92)) continue; const h = H(x, z); if (h < 6 && !(z < -28)) continue; if (Math.hypot(x - POOL.x, z - POOL.z) < 6 || Math.abs(x) < 2.5) continue; n++;
    if (h > 13.5) { const r = mesh('peak_rock', new THREE.DodecahedronGeometry(.6 + rnd() * .8, 0), stoneGrey, x, h, z); r.scale.y = .7; mf.add(r); } else { const s = .6 + rnd() * .6, c = mesh('forest_tree', new THREE.IcosahedronGeometry(1.1 * s, 1), rnd() < .5 ? forestM : leaf, x, h + 1.4 * s, z); c.scale.y = 1.15; mf.add(c, mesh('trunk', new THREE.CylinderGeometry(.12, .16, 1.2 * s, 5), bark, x, h + .5 * s, z)); } }
  let b = 0; for (let t = 0; t < 2000 && b < 12; t++) { const x = (rnd() * 2 - 1) * 30, z = -10 - rnd() * 16, h = H(x, z); if (h < 1 || h > 9 || Math.abs(x) < 3 || !inIsland(x, z, .88) || nearPath(x, z, 1.2)) continue; b++; mf.add(bananaPlant('terrace_saging_' + b, x, z, 2.2, h - .05)); }
  for (let k = 0; k < 6; k++) { const x = -20 + k * 8, z = -11.5 - (k % 2) * 4; const h = H(x, z); if (!nearPath(x, z, 1)) mf.add(farmer('terrace_farmer_' + k, x, z, rnd() * TAU, .9, cloth[k % 8])).children.at(-1).position.y = h; }
  props.add(bake(mf)); }

// ---------- GROUND MESH + FILL (heightfield; colors terraces) ----------
{ const GS = .6, nx = Math.ceil(2 * RX / GS) + 1, nz = Math.ceil(2 * RZ / GS) + 1, x0 = -RX, z0 = IZ - RZ, occ = new Float32Array(nx * nz);
  const mark = (x, z, r) => { const ci = Math.round((x - x0) / GS), cj = Math.round((z - z0) / GS), rr = Math.ceil(r / GS); for (let j = cj - rr; j <= cj + rr; j++) for (let i = ci - rr; i <= ci + rr; i++) if (i >= 0 && j >= 0 && i < nx && j < nz) occ[j * nx + i] = 1; };
  root.updateMatrixWorld(true); const v = new THREE.Vector3(); [props, landmarks].forEach(gr => gr.traverse(o => { if (!o.isMesh || /mountain_forest/.test(o.name)) return; const p = o.geometry.attributes.position; for (let k = 0; k < p.count; k += 3) { v.fromBufferAttribute(p, k).applyMatrix4(o.matrixWorld); if (v.y < 1.0 && v.y > -.6) mark(v.x, v.z, .7); } }));
  PATHS.forEach(([pts, w]) => pts.forEach(p => mark(p.x, p.z, w / 2 + .6))); PADDIES.forEach(p => { for (let x = p.x - p.w / 2; x <= p.x + p.w / 2; x += .8) for (let z = p.z - p.d / 2; z <= p.z + p.d / 2; z += .8) mark(x, z, .6); });
  const rN = (x, z) => Math.hypot(x / RX, (z - IZ) / RZ) / blobR(Math.atan2(-(z - IZ) / RZ, x / RX));
  const pos = [], col = [], idx = [], ok = [], uv = [], cG = new THREE.Color('#62A83A'), cG2 = new THREE.Color('#86BE48'), cRice = new THREE.Color('#8CD24E'), cGold = new THREE.Color('#E8C850'), cRiser = new THREE.Color('#7A6A40'), cForest = new THREE.Color('#3F7A35'), cRock = new THREE.Color('#9A9488'), c = new THREE.Color();
  const Hs = new Float32Array(nx * nz); for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const x = x0 + i * GS, z = z0 + j * GS; let h = H(x, z); if (z > -9) h += occ[j * nx + i] ? 0 : .16 * (.5 + .5 * Math.sin(x * .7 + z * .4)) * (1 - sm(.85, .95, rN(x, z))); Hs[j * nx + i] = h + .015; }
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const x = x0 + i * GS, z = z0 + j * GS, y = Hs[j * nx + i]; pos.push(x, y, z); uv.push(x, -z); ok.push(rN(x, z) < .955);
    const hx = Hs[j * nx + Math.min(nx - 1, i + 1)] - Hs[j * nx + Math.max(0, i - 1)], hz = Hs[Math.min(nz - 1, j + 1) * nx + i] - Hs[Math.max(0, j - 1) * nx + i], slope = Math.hypot(hx, hz) / (2 * GS), hr = Hraw(x, z) * sm(-7.5, -12.5, z);
    if (z < -8 && terrZone(Hraw(x, z), z) && hr > .4) { const s = Hraw(x, z) / TSTEP, step = Math.floor(s), fr = s - step, riser = fr > .78 || slope > 1.4; c.copy(riser ? cRiser : (step % 3 === 1 ? cGold : cRice)); if (!riser && step % 4 === 2) c.copy(new THREE.Color('#7FB7B0')); }
    else if (y > 10.5) c.copy(y > 13 ? cRock : cForest).lerp(cRiser, slope > .8 ? .4 : 0); else c.copy(cG).lerp(cG2, .5 + .5 * Math.sin(x * .3 + z * .5));
    col.push(c.r, c.g, c.b); }
  for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) { const a = j * nx + i, b = a + 1, d = a + nx, e = d + 1; if (ok[a] && ok[b] && ok[d] && ok[e]) idx.push(a, d, b, b, d, e); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  const gm = mesh('ground_terraces', g, std('ground_terraces', { map: tSand, vertexColors: true, roughness: .9 })); root.add(gm);
  const fill = group('ground_fill'), tuftM = [P('grass_tuft_1', '#5FA83A'), P('grass_tuft_2', '#86C24E'), P('grass_tuft_3', '#4E8F30')], wf = [pinkF, santan, yellowF, white];
  const free = (x, z) => { const i = Math.round((x - x0) / GS), j = Math.round((z - z0) / GS); return i >= 0 && j >= 0 && i < nx && j < nz && !occ[j * nx + i] && rN(x, z) < .93 && z > -9; };
  let n = 0; for (let t = 0; t < 20000 && n < 950; t++) { const x = (rnd() * 2 - 1) * RX, z = IZ + (rnd() * 2 - 1) * RZ; if (!free(x, z)) continue; n++; const i = Math.round((x - x0) / GS), j = Math.round((z - z0) / GS), y = Hs[j * nx + i] - .02, k = rnd();
    if (k < .62) { for (let q = 0; q < 5; q++) { const bl = mesh('grass', new THREE.ConeGeometry(.045, .35 + rnd() * .35, 4), pick(tuftM), x + (rnd() - .5) * .3, y + .2, z + (rnd() - .5) * .3); bl.rotation.set((rnd() - .5) * .6, 0, (rnd() - .5) * .6); fill.add(bl); } }
    else if (k < .82) { for (let q = 0; q < 4; q++) fill.add(mesh('wildflower', new THREE.IcosahedronGeometry(.07, 0), pick(wf), x + (rnd() - .5) * .5, y + .25, z + (rnd() - .5) * .5), strut('stem', v3(x, y, z), v3(x + (rnd() - .5) * .4, y + .22, z + (rnd() - .5) * .4), .01, leaf)); }
    else if (k < .95) fill.add(bush('palumpong', x, z, .35 + rnd() * .35, rnd() < .4 ? pick(wf) : null, y));
    else { const r = mesh('bato', new THREE.DodecahedronGeometry(.2 + rnd() * .3, 0), rock, x, y + .08, z); r.scale.y = .6; fill.add(r); } }
  props.add(bake(fill)); }

// ---------- ISLETS ----------
{ const isl = group('islets'); const f = a => 1 + .07 * Math.cos(3 * a + 1) + .05 * Math.cos(2 * a);
  const i1 = group('islet_mandala', -50, -2.5, -6); i1.add(islandBody('body', 3.6, 3.2, 4, f, 6, 0, 40), haystack('mandala', 0, 0), scarecrow('panakot', 1.6, 1.0)); isl.add(bake(i1));
  const i2 = group('islet_saging', 49, 1.5, -16); i2.add(islandBody('body', 3.4, 3.0, 4.2, f, 6, 0, 40), bananaPlant('saging_a', -.6, 0, 2.6), bananaPlant('saging_b', 1.0, .8, 2.2)); isl.add(bake(i2));
  const i3 = group('islet_kalabaw', 34, -3.5, 40); i3.add(islandBody('body', 2.8, 2.6, 3.4, f, 5, 0, 36), kalabaw('kalabaw_islet', 0, 0, .6)); isl.add(bake(i3)); root.add(isl); }

// ---------- BOARD ----------
const EVENTS = { tanim: 1, ani: 1, kalabaw: 1, ulan: 1, balang: 1, bayanihan: 1 };
const TYPES = { simula: '#3B2316', piso: '#2E6FD8', utang: '#E2452E', swerte: '#F2B705', tikbalang: '#7B4BC4', sarisari: '#13A39A', jackenpoy: '#F07C1E', kasama: '#3BAA4A', tanong: '#E8559A', tanim: '#FFF4DC', ani: '#FFF4DC', kalabaw: '#FFF4DC', ulan: '#FFF4DC', balang: '#FFF4DC', bayanihan: '#FFF4DC' };
function tileTex(type) { const ev = EVENTS[type]; return tex(C(256, 256, (g, s) => { g.fillStyle = TYPES[type]; g.fillRect(0, 0, s, s); g.lineWidth = 7; g.strokeStyle = ev ? '#C9A24B' : 'rgba(255,255,255,.6)'; g.beginPath(); g.arc(128, 128, 112, 0, TAU); g.stroke();
  g.lineJoin = 'round'; g.lineCap = 'round'; g.strokeStyle = ev ? '#FFF4DC' : '#3B2316'; g.fillStyle = ev ? '#3B2316' : '#FFFFFF'; g.lineWidth = 12; g.textAlign = 'center'; g.textBaseline = 'middle';
  const txt = (t, size, y = 134) => { g.font = '900 ' + size + 'px "Arial Black", Arial, sans-serif'; g.strokeText(t, 128, y); g.fillText(t, 128, y); }; const shape = draw => { g.beginPath(); draw(); g.stroke(); g.fill(); };
  if (type === 'simula') { txt('SIMULA', 46, 112); txt('→', 80, 170); }
  else if (type === 'piso') txt('+₱', 110); else if (type === 'utang') txt('−₱', 110); else if (type === 'tanong') txt('?', 150); else if (type === 'jackenpoy') txt('VS', 100); else if (type === 'tikbalang') txt('←3', 100);
  else if (type === 'swerte') shape(() => { for (let i = 0; i < 10; i++) { const a = -PI / 2 + i * PI / 5, r = i % 2 ? 36 : 82; g.lineTo(128 + Math.cos(a) * r, 132 + Math.sin(a) * r); } g.closePath(); });
  else if (type === 'sarisari') { shape(() => g.rect(72, 118, 112, 68)); shape(() => { g.moveTo(58, 120); g.lineTo(198, 120); g.lineTo(178, 78); g.lineTo(78, 78); g.closePath(); }); g.fillStyle = '#E2452E'; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(84 + i * 26, 80); g.lineTo(96 + i * 26, 80); g.lineTo(92 + i * 28, 118); g.lineTo(76 + i * 28, 118); g.fill(); } g.fillStyle = '#3B2316'; g.fillRect(112, 140, 32, 46); }
  else if (type === 'kasama') for (const x of [94, 162]) { shape(() => g.arc(x, 96, 24, 0, TAU)); shape(() => g.roundRect(x - 32, 128, 64, 60, 22)); }
  else if (type === 'tanim') { g.strokeStyle = '#3B2316'; g.lineWidth = 12; g.beginPath(); g.moveTo(128, 200); g.lineTo(128, 110); g.stroke(); shape(() => { g.ellipse(98, 104, 34, 16, -.6, 0, TAU); }); shape(() => { g.ellipse(158, 92, 34, 16, .6, 0, TAU); }); }
  else if (type === 'ani') { g.strokeStyle = '#3B2316'; g.lineWidth = 9; for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(128, 200); g.quadraticCurveTo(128 + k * 12, 140, 128 + k * 30, 70); g.stroke(); g.beginPath(); g.ellipse(128 + k * 30, 70, 8, 16, k * .3, 0, TAU); g.fill(); } }
  else if (type === 'kalabaw') { shape(() => g.roundRect(84, 104, 88, 74, 26)); g.strokeStyle = '#3B2316'; g.lineWidth = 14; g.beginPath(); g.arc(128, 120, 66, PI * 1.05, PI * 1.95); g.stroke(); }
  else if (type === 'ulan') { shape(() => { g.arc(98, 112, 32, PI * .5, PI * 1.5); g.arc(132, 88, 38, PI, 0); g.arc(166, 112, 30, PI * 1.5, PI * .5); g.closePath(); }); g.strokeStyle = '#3B2316'; g.lineWidth = 10; for (const x of [96, 128, 160]) { g.beginPath(); g.moveTo(x, 160); g.lineTo(x - 12, 196); g.stroke(); } }
  else if (type === 'balang') { shape(() => g.ellipse(128, 128, 64, 24, -.2, 0, TAU)); g.strokeStyle = '#3B2316'; g.lineWidth = 8; for (const [a, b, c2, d] of [[100, 140, 70, 190], [150, 136, 190, 190], [176, 112, 210, 70]]) { g.beginPath(); g.moveTo(a, b); g.lineTo(c2, d); g.stroke(); } }
  else if (type === 'bayanihan') { shape(() => { g.moveTo(70, 120); g.lineTo(128, 70); g.lineTo(186, 120); g.lineTo(186, 160); g.lineTo(70, 160); g.closePath(); }); for (const x of [80, 128, 176]) { g.beginPath(); g.arc(x, 196, 14, 0, TAU); g.fill(); } }
}), 0, 'tile_' + type); }
const tileMats = Object.fromEntries(Object.keys(TYPES).map(t => [t, own(std('tile_' + t, { map: tileTex(t), roughness: .45 }))]));
const SPM = { 0: 'simula', 3: 'tanong', 4: 'ani', 6: 'utang', 8: 'sarisari', 10: 'swerte', 12: 'utang', 13: 'kasama', 15: 'tanim', 17: 'jackenpoy', 18: 'utang', 22: 'balang', 24: 'tanong', 25: 'utang', 26: 'swerte', 29: 'ani', 31: 'tikbalang', 33: 'utang', 35: 'kasama', 37: 'sarisari', 39: 'bayanihan',
  41: 'utang', 42: 'jackenpoy', 46: 'ulan', 47: 'tanong', 49: 'tikbalang', 51: 'utang', 53: 'swerte', 55: 'ani', 57: 'utang', 58: 'balang', 62: 'tanim', 64: 'tanong', 66: 'kalabaw', 68: 'bayanihan', 69: 'sarisari', 71: 'tikbalang', 72: 'kasama', 74: 'utang', 76: 'swerte', 78: 'ulan' };
const MAIN = Array.from({ length: NM }, (_, i) => SPM[i] || 'piso');
const SPT = { 2: 'utang', 4: 'balang', 6: 'swerte', 8: 'ani', 10: 'tanong', 11: 'swerte', 13: 'tanim', 15: 'jackenpoy', 17: 'ani', 19: 'utang', 21: 'swerte' };
const TRAIL = Array.from({ length: NT }, (_, j) => SPT[j] || 'piso');
const KOR = new Set(['M05', 'M16', 'M27', 'M38', 'M45', 'M54', 'M63', 'M75', 'T05', 'T16']);
const pad = n => String(n).padStart(2, '0');
{ const spaces = group('board_spaces'), graph = [], tc = new THREE.CatmullRomCurve3(trailXZ);
  const addSpace = (id, type, p) => { const big = type === 'simula', Rr = big ? .85 : .58, y = id[0] === 'T' ? p.y + .02 : onBridge(p) ? .33 : .05, g = group('space_' + id + '_' + type, p.x, y, p.z);
    g.add(mesh('rim', new THREE.CylinderGeometry(Rr + .1, Rr + .14, .18, 24), white, 0, .09, 0), mesh('top', new THREE.CircleGeometry(Rr, 32).rotateX(-PI / 2), tileMats[type], 0, .182, 0));
    if (KOR.has(id)) g.add(mesh('korona_spot_ring', new THREE.TorusGeometry(Rr + .22, .045, 4, 32).rotateX(PI / 2), gold, 0, .1, 0));
    const flood = id[0] === 'M' && PADDIES.some(q => Math.hypot(q.x - p.x, q.z - p.z) < 7.5); const node = { id, type, x: +p.x.toFixed(2), y: +y.toFixed(2), z: +p.z.toFixed(2), next: [], koronaSpot: KOR.has(id), floodable: flood }; g.userData = node; graph.push(node); spaces.add(g); };
  MAIN.forEach((t, i) => addSpace('M' + pad(i), t, M(i))); TRAIL.forEach((t, j) => addSpace('T' + pad(j), t, tc.getPointAt((j + 1) / (NT + 1))));
  graph.forEach(n => { const k = +n.id.slice(1); n.next.push(n.id[0] === 'M' ? 'M' + pad((k + 1) % NM) : (k === NT - 1 ? 'M' + pad(MERGE) : 'T' + pad(k + 1))); });
  graph.find(n => n.id === 'M' + pad(FORK)).next.push('T00'); Object.assign(graph.find(n => n.id === 'M' + pad(CART_A)), { kalabawTo: 'M' + pad(CART_B), kalabawCost: 6 });
  spaces.userData = { board: 'palayan', start: 'M00', mainLoop: NM, terraceTrail: NT, fork: 'M' + pad(FORK), merge: 'M' + pad(MERGE), kalabawCart: { from: 'M' + pad(CART_A), to: 'M' + pad(CART_B), cost: 6 }, koronaSpots: [...KOR], floodableSpaces: graph.filter(n => n.floodable).map(n => n.id), activeKoronaRange: [1, 5], nodes: graph };
  window.__palayanBoard = spaces.userData; root.add(spaces); }

let tris = 0; root.traverse(o => { if (o.isMesh) tris += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3; });


return { root, inIsland, RX, RZ, IZ };
}
