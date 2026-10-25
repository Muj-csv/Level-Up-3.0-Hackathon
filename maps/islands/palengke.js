// Generated from Palengke Island v2.html
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
const RX = 37, RZ = 29, IZ = 2;
const blobR = a => (Math.abs(Math.cos(a)) ** 4 + Math.abs(Math.sin(a)) ** 4) ** -.25 * (1 + .025 * Math.cos(5 * a + 2) + .015 * Math.cos(7 * a));
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

const root = group('isla2_palengke');

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

// ---------- BOARD PATHS ----------
const W2 = 24, D2 = 14, RC = 3, NM = 80, NC = 25, FORK = 20, MERGE = 60, PAD_A = 65, PAD_B = 15;
const loop = new THREE.CurvePath(); { let cur = V(0, D2); const L = p => { loop.add(new THREE.LineCurve3(cur, p)); cur = p; }, Q = (c, p) => { loop.add(new THREE.QuadraticBezierCurve3(cur, c, p)); cur = p; };
  L(V(W2 - RC, D2)); Q(V(W2, D2), V(W2, D2 - RC)); L(V(W2, -D2 + RC)); Q(V(W2, -D2), V(W2 - RC, -D2)); L(V(-W2 + RC, -D2)); Q(V(-W2, -D2), V(-W2, -D2 + RC)); L(V(-W2, D2 - RC)); Q(V(-W2, D2), V(-W2 + RC, D2)); L(V(0, D2)); }
const M = i => loop.getPointAt((((i % NM) + NM) % NM) / NM);
const Cp = j => M(FORK).lerp(M(MERGE), (j + 1) / (NC + 1));
const padA = M(PAD_A), padB = M(PAD_B);
const padCurve = roundPath([padA, V(-30.5, padA.z), V(-30.5, 21), V(30.5, 21), V(30.5, padB.z), padB], 2.5);
const mainPts = loop.getSpacedPoints(320).slice(0, -1), centerPts = line(M(FORK), M(MERGE), 48), padPts = padCurve.getSpacedPoints(140);

// ---------- TERRAIN ----------
const terrain = group('terrain'); { const body = islandBody('island_body', RX, RZ, 13, blobR, 26, 8); body.position.z = IZ; terrain.add(body); }
terrain.add(mesh('concrete_floor', new THREE.ExtrudeGeometry(blobShape(RX, RZ, .9, blobR), { depth: .04, bevelEnabled: false, curveSegments: 2 }).rotateX(-PI / 2), concrete, 0, 0, IZ));
terrain.add(B('wet_section_floor', 52, .02, 18, concreteWet, 0, .04, -10));
terrain.add(ribbon('aisle_loop', mainPts, 2.3, aisle, .065, true), ribbon('aisle_center', centerPts, 2.3, aisle, .066), ribbon('padyak_street', padPts, 2.6, asphalt, .062));
for (const s of [-1, 1]) terrain.add(ribbon('aisle_line', offsetPts(mainPts, s * 1.2, true), .1, yellowLine, .07, true), ribbon('aisle_line', offsetPts(centerPts, s * 1.2), .1, yellowLine, .071));
terrain.add(mesh('timbangan_plaza', new THREE.CylinderGeometry(4.6, 4.6, .08, 40), aisle, 0, .04, -6.8));
root.add(bake(terrain));

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

// ---------- STALLS ----------
const ROOF = { isda: 'gi', karne: 'gi', gulay: 1, prutas: 4, dry: 0, kakanin: 3, bigasan: 'gi', bulaklak: 2, ukay: 1, carinderia: 'gi' };
const SIGN = { isda: 'ISDA', karne: 'KARNE', gulay: 'GULAY', prutas: 'PRUTAS', dry: 'GAMIT SA BAHAY', kakanin: 'KAKANIN', bigasan: 'BIGASAN', bulaklak: 'BULAKLAK', ukay: 'UKAY-UKAY', carinderia: 'CARINDERIA', sarisari: 'SARI-SARI STORE' };
function stall(kind, x, z, ry, i) { const g = group('stall_' + kind + '_' + i, x, 0, z); g.rotation.y = ry; chk(g.name, x, z);
  if (kind === 'sarisari') { g.add(B('walls', 2.9, 2.3, 2.1, paintGreen, 0, 0, -.1), B('window_hole', 2.0, 1.0, .05, niche, 0, .95, .97), B('ledge', 2.3, .08, .35, wood, 0, .92, 1.1), B('roof', 3.3, .06, 2.6, giRoof, 0, 2.35, 0));
    for (let k = 0; k < 9; k++) g.add(mesh('grille', new THREE.CylinderGeometry(.012, .012, 1.0, 4), iron, -.95 + k * .24, 1.45, 1.0)); for (let k = 0; k < 7; k++) g.add(B('tingi_strip', .12, .6, .02, pick(cloth), -.8 + k * .26, 1.2, 1.03));
    g.add(mesh('sign', new THREE.PlaneGeometry(2.2, .42), signMat(SIGN.sarisari), 0, 2.08, .96)); return g; }
  for (const px of [-1.45, 1.45]) for (const pz of [-1.05, 1.05]) g.add(mesh('post', new THREE.CylinderGeometry(.045, .045, 2.5, 6), iron, px, 1.25, pz));
  const south = Math.abs(Math.abs(ry) - PI) < .1, rm = rnd() < .7 ? (ROOF[kind] === 'gi' ? giRoof : tarps[ROOF[kind]]) : pick([giRoof, ...tarps]), rf = B('roof', 3.1 + rnd() * .5, .05, (south ? 2.0 : 2.6) + rnd() * .3, rm, (rnd() - .5) * .2, (south ? 2.25 : 2.4) + (rnd() - .5) * .3, south ? -.35 : 0); rf.rotation.set(.05 + rnd() * .14, 0, (rnd() - .5) * .08); g.add(rf);
  if (rnd() < .45) { const pt = B('tarp_patch', .7 + rnd() * .6, .02, .6 + rnd() * .5, pick(tarps), (rnd() - .5) * 1.6, rf.position.y + .04, (rnd() - .5) * 1.0); pt.rotation.copy(rf.rotation); g.add(pt); }
  g.add(B('signboard', 1.9, .42, .05, white, 0, 2.0, 1.08), mesh('sign', new THREE.PlaneGeometry(1.8, .34), signMat(SIGN[kind]), 0, 2.21, 1.11));
  const T = .85, wetc = kind === 'isda' || kind === 'karne';
  if (kind !== 'bigasan' && kind !== 'bulaklak' && kind !== 'ukay') g.add(B('counter', 2.8, T, .8, wetc ? tileWhite : pick([wood, wood, paintBlue, paintGreen, plywood]), 0, 0, .55));
  g.add(B('back_shelf', 2.8, 1.3, .32, wood, 0, 0, -.86));
  if (kind === 'isda') { g.add(B('ice_tray', 2.5, .06, .62, ice, 0, T, .55)); for (let k = 0; k < 12; k++) { const f = mesh('fish', new THREE.SphereGeometry(.07, 6, 4), k % 3 ? fishM : fishB, -1.1 + (k % 6) * .44, T + .1, .38 + ((k / 6) | 0) * .3); f.scale.set(3.2, .9, 1); f.rotation.y = (rnd() - .5) * .6; g.add(f); }
    g.add(B('styro_box', .6, .36, .42, styro, -1.0, 0, -.35), B('styro_box', .6, .36, .42, styro, -1.0, .36, -.35), drum(1.05, -.35), mesh('hanging_scale', new THREE.CylinderGeometry(.12, .12, .06, 12).rotateX(PI / 2), paintRed, 1.3, 1.65, 1.05)); }
  if (kind === 'karne') { g.add(mesh('chopping_block', new THREE.CylinderGeometry(.26, .26, .22, 12), wood, .7, T + .11, .55)); for (let k = 0; k < 6; k++) g.add(B('meat_cut', .2, .1, .16, k % 2 ? meat : fat, -1.1 + k * .3, T, .55));
    g.add(B('hook_rail', 2.8, .04, .04, steel, 0, 1.95, .92)); for (let k = 0; k < 4; k++) g.add(mesh('hanging_meat', new THREE.CapsuleGeometry(.09, .22, 2, 6), meat, -1.0 + k * .4, 1.62, .92));
    for (let s = 0; s < 3; s++) for (let k = 0; k < 6; k++) g.add(mesh('longganisa', new THREE.SphereGeometry(.045, 6, 4), longg, .5 + s * .3, 1.88 - k * .09, .92)); }
  if (kind === 'gulay') { const veg = Object.values(VEG); for (let k = 0; k < 4; k++) { const bx = -1.05 + k * .7; g.add(bilao(bx, T, .55, .3)); pile(g, veg[(k + i) % veg.length], bx, T + .05, .55, 9, k === 1 ? .1 : .06, .22, ['carrot', 'eggplant'].includes(Object.keys(VEG)[(k + i) % veg.length]) ? 'c' : 's'); } g.add(crate(-.8, 0, -.25, i), crate(.8, 0, -.25, i + 1), crate(.8, .3, -.25, i + 2)); }
  if (kind === 'prutas') { pile(g, FRUIT.mango, -.8, T, .55, 14, .075, .35); pile(g, FRUIT.papaya, .2, T, .55, 6, .1, .25, 'c'); g.add(B('fruit_rail', 2.8, .04, .04, wood, 0, 1.9, .95));
    for (let k = 0; k < 4; k++) for (let b = 0; b < 5; b++) { const ba = mesh('banana', new THREE.CapsuleGeometry(.03, .16, 2, 5), FRUIT.banana, -1.0 + k * .35 + b * .04, 1.6, .95 + (b - 2) * .04); ba.rotation.z = .5; g.add(ba); }
    for (let k = 0; k < 3; k++) g.add(mesh('watermelon', new THREE.SphereGeometry(.2, 8, 6), FRUIT.watermelon, -1.0 + k * .45, .2, -.3)); for (let k = 0; k < 2; k++) g.add(mesh('pineapple', new THREE.CylinderGeometry(.1, .1, .26, 7), FRUIT.pineapple, .8 + k * .3, T + .13, .55), mesh('pineapple_top', new THREE.ConeGeometry(.08, .22, 5), leaf, .8 + k * .3, T + .37, .55)); }
  if (kind === 'dry') { for (let k = 0; k < 4; k++) g.add(mesh('kaldero', new THREE.CylinderGeometry(.2 - k * .02, .18 - k * .02, .2, 12), steel, -1.0, .25 + k * .21, -.86), bayong(-.6 + k * .45, T, .55)); for (let k = 0; k < 4; k++) g.add(mesh('hanging_bilao', new THREE.CylinderGeometry(.24, .24, .04, 12).rotateX(PI / 2), woven, -.2 + k * .42, 1.65, -.68)); g.add(strut('walis', v3(1.25, 0, .2), v3(1.35, 1.2, .5), .02, wood), mesh('walis_head', new THREE.ConeGeometry(.13, .4, 6), woven, 1.22, .18, .14)); }
  if (kind === 'kakanin') { for (let k = 0; k < 4; k++) { const bx = -1.05 + k * .7; g.add(bilao(bx, T, .55, .3), mesh('banana_leaf', new THREE.CircleGeometry(.27, 10).rotateX(-PI / 2), bananaLeaf, bx, T + .052, .55)); for (let q = 0; q < 7; q++) { const a = q / 7 * TAU; g.add(mesh('kakanin', new THREE.CylinderGeometry(.05, .05, .035, 8), KAK[(k + q) % 4], bx + Math.cos(a) * .15, T + .07, .55 + Math.sin(a) * .15)); } } }
  if (kind === 'bigasan') { for (let k = 0; k < 6; k++) { const sx = -1.05 + (k % 3) * 1.05, sz = k < 3 ? .5 : -.3; g.add(mesh('rice_sack', new THREE.CylinderGeometry(.27, .3, .62, 8), sack, sx, .31, sz), mesh('rice', new THREE.SphereGeometry(.25, 8, 4, 0, TAU, 0, PI / 2), rice, sx, .6, sz), mesh('price_stick', new THREE.CylinderGeometry(.01, .01, .4, 4), wood, sx + .15, .8, sz), B('price_card', .16, .1, .01, white, sx + .15, .95, sz)); } }
  if (kind === 'bulaklak') { const fl = [pinkF, santan, yellowF, white, heartRed]; for (let k = 0; k < 8; k++) { const bx = -1.1 + (k % 4) * .73, bz = k < 4 ? .55 : -.2; g.add(mesh('bucket', new THREE.CylinderGeometry(.16, .13, .32, 10), crates[k % 3].userData ? paintBlue : paintBlue, bx, .16, bz));
    for (let q = 0; q < 4; q++) { const a = q / 4 * TAU, fx = bx + Math.cos(a) * .08, fz = bz + Math.sin(a) * .08; g.add(strut('stem', v3(bx, .3, bz), v3(fx, .72, fz), .008, leaf), mesh('flower', new THREE.IcosahedronGeometry(.06, 0), fl[(k + q) % 5], fx, .76, fz)); } } }
  if (kind === 'ukay') { g.add(strut('rack', v3(-1.2, 1.7, -.2), v3(1.2, 1.7, -.2), .02, steel)); for (const sx of [-1.2, 1.2]) g.add(strut('rack_leg', v3(sx, 0, -.2), v3(sx, 1.7, -.2), .02, steel)); for (let k = 0; k < 9; k++) g.add(B('shirt', .4, .55, .04, cloth[(k + i) % 8], -1.05 + k * .26, 1.08, -.2 + (k % 2) * .03));
    g.add(B('table', 2.4, .7, .7, wood, 0, 0, .65)); for (let k = 0; k < 6; k++) g.add(B('folded', .34, .12 + (k % 3) * .06, .3, cloth[(k * 3 + i) % 8], -.95 + k * .38, .7, .65)); }
  if (kind === 'carinderia') { for (let k = 0; k < 4; k++) g.add(mesh('kaldero', new THREE.CylinderGeometry(.22, .2, .28, 12), steel, -1.05 + k * .7, T + .14, .55), mesh('lid', new THREE.SphereGeometry(.22, 10, 4, 0, TAU, 0, PI / 2), steel, -1.05 + k * .7, T + .28, .55));
    g.add(B('menu_board', 1.0, .7, .04, iron, .7, 1.2, -.69)); }
  mess(g); return g; }

// rows: [kind for x<0, kind for x>0], z, rotation, skip-center half-width
const XS = Array.from({ length: 13 }, (_, k) => -19.8 + k * 3.3);
const ROWS = [[['isda', 'karne'], -16.65, 0, 0], [['gulay', 'prutas'], -11.35, PI, 6], [['prutas', 'gulay'], -2.65, 0, 6], [['kakanin', 'bulaklak'], 2.65, PI, 6], [['bigasan', 'dry'], 11.35, 0, 0], [['ukay', 'dry'], 16.65, PI, 1]];
{ const st = group('stalls'); landmarks.add(st); let n = 0;
  ROWS.forEach(([kinds, z, ry, gap], ri) => { const row = group('stall_row_' + ri); XS.forEach(x => { if (Math.abs(x) < gap) return; const kind = Math.abs(x) > 19 && z > 15 ? 'carinderia' : kinds[x < 0 ? 0 : 1]; if (rnd() < .1) row.add(groundVendor('ground_vendor_' + n++, x + (rnd() - .5) * .6, z, ry)); else row.add(stall(kind, x + (rnd() - .5) * .5, z + (rnd() - .5) * .25, ry + (rnd() - .5) * .08, n++)); }); st.add(bake(row)); });
  [['isda', 'gulay', 'sarisari', 'ukay', 'bulaklak'], ['karne', 'isda', 'sarisari', 'dry', 'carinderia']].forEach((kinds, side) => { const row = group(side ? 'stall_row_east' : 'stall_row_west'); [-9.9, -6.6, -3.3, 0, 3.3].forEach((z, k) => { const x = side ? 26.65 : -26.65; row.add(stall(kinds[k], x, z, side ? -PI / 2 : PI / 2, n++)); }); st.add(bake(row)); }); }

// ---------- TIMBANGAN NG BAYAN ----------
{ const t = group('timbangan_ng_bayan', 0, 0, -6.8), H = 7.6;
  t.add(B('base', 5.4, .2, 2.4, granite, 0, .06, 0), B('base_step', 4.6, .2, 1.8, granite, 0, .26, 0));
  for (const s of [-1, 1]) t.add(B('post', .45, H - .46, .45, paintBlue, s * 2.4, .46, 0), B('post_foot', .7, .3, .7, granite, s * 2.4, .46, 0));
  t.add(B('beam', 5.6, .55, .6, paintBlue, 0, H, 0), B('beam_cap', 5.8, .12, .8, white, 0, H + .55, 0), mesh('sign', new THREE.PlaneGeometry(4.4, .45), signMat('TIMBANGAN NG BAYAN'), 0, H + .27, .31));
  t.add(mesh('top_hook', new THREE.CylinderGeometry(.05, .05, .7, 6), steel, 0, H - .35, 0), mesh('top_ring', new THREE.TorusGeometry(.14, .035, 6, 12), steel, 0, 6.85, 0));
  t.add(mesh('dial_housing', new THREE.CylinderGeometry(1.15, 1.15, .45, 28).rotateX(PI / 2), paintRed, 0, 5.6, 0), mesh('dial_face', new THREE.CircleGeometry(1.0, 32), dialMat, 0, 5.6, .231), mesh('dial_bezel', new THREE.TorusGeometry(1.05, .07, 6, 28), steel, 0, 5.6, .24), mesh('dial_back', new THREE.CircleGeometry(1.0, 24).rotateY(PI), dialMat, 0, 5.6, -.231));
  t.add(mesh('lower_hook', new THREE.CylinderGeometry(.05, .05, .6, 6), steel, 0, 4.2, 0)); for (let k = 0; k < 3; k++) { const a = k / 3 * TAU; t.add(strut('chain', v3(0, 3.9, 0), v3(Math.cos(a) * 1.05, 2.95, Math.sin(a) * 1.05), .025, steel)); }
  t.add(mesh('pan', new THREE.SphereGeometry(1.1, 18, 6, 0, TAU, PI / 2, PI / 2), steel, 0, 2.95, 0), mesh('pan_rim', new THREE.TorusGeometry(1.1, .05, 4, 24).rotateX(PI / 2), steel, 0, 2.95, 0));
  pile(t, [VEG.tomato, VEG.cabbage, VEG.kalabasa, FRUIT.mango], 0, 2.1, 0, 16, .17, .65);
  landmarks.add(bake(t));
  const us = group('umbrella_stalls'); [[-4.3, -9.7, 0], [4.3, -9.7, 0], [-4.4, -3.4, .3], [4.4, -3.4, -.3], [-3.2, 2.9, PI], [3.2, 2.9, PI]].forEach(([x, z, ry], k) => { const g = group('umbrella_stall_' + k, x, 0, z); g.rotation.y = ry;
    g.add(B('table', 1.8, .05, .9, wood, 0, .75, 0)); for (const sx of [-.8, .8]) for (const sz of [-.38, .38]) g.add(mesh('leg', new THREE.CylinderGeometry(.03, .03, .75, 5), wood, sx, .375, sz));
    umbrellaTop(g, 0, 2.4, k > 3 ? 1.6 : 1.35, k % 2 ? [paintYellow, paintRed] : [paintBlue, white]); const vg = Object.values(VEG), fr = Object.values(FRUIT);
    g.add(bilao(-.45, .8, 0, .32), bilao(.45, .8, 0, .32)); pile(g, vg[k % vg.length], -.45, .85, 0, 10, .07, .22); pile(g, fr[k % fr.length], .45, .85, 0, 8, .08, .2); g.add(crate(-.5, 0, -.2, k), crate(.3, 0, -.25, k + 1), monobloc(.4, -.95, PI + .3, k % 2 ? plasticRed : plasticWhite));
    us.add(g); }); landmarks.add(bake(us)); }

// ---------- PADYAK SHORTCUT ----------
{ const pd = group('padyak_terminal'); pd.add(padyak('padyak_1', -30.5, 13.5, -PI / 2), padyak('padyak_2', 31.6, 17, PI / 2));
  for (const [p, n] of [[padA, 'stop_a'], [padB, 'stop_b']]) { const s = group('padyak_' + n, p.x + Math.sign(p.x) * 2.2, 0, p.z + 1.8); s.add(mesh('post', new THREE.CylinderGeometry(.05, .05, 2.3, 6), iron, 0, 1.15, 0), mesh('sign', new THREE.PlaneGeometry(1.2, .3), signMat('PADYAK'), 0, 2.1, 0)); pd.add(s); }
  landmarks.add(bake(pd)); }

// ---------- STORAGE CLUTTER between back-to-back rows ----------
{ const cl = group('market_clutter'); const spots = []; for (const z of [-7.0, 7.0]) for (const x of [-19, -15.5, -12, -8.5, 8.5, 12, 15.5, 19]) spots.push([x + (rnd() - .5) * 1.2, z + (rnd() - .5) * 3]);
  spots.forEach(([x, z], k) => { const r = k % 7; if (r === 0) cl.add(kariton('kariton_' + k, x, z, rnd() * TAU)); else if (r === 1) { cl.add(drum(x, z), drum(x + .65, z + .1)); } else if (r === 2) { for (let q = 0; q < 5; q++) cl.add(crate(x + (q % 2) * .52, ((q / 2) | 0) * .3, z, q)); }
    else if (r === 3) cl.add(bicycle('bicycle_' + k, x, z, rnd() * TAU)); else if (r === 4) { cl.add(monoTable(x, z), monobloc(x + .7, z, -PI / 2), monobloc(x - .7, z, PI / 2, plasticRed)); }
    else if (r === 5) { for (let q = 0; q < 4; q++) { const s = mesh('rice_sack', new THREE.CylinderGeometry(.27, .3, .8, 8).rotateZ(PI / 2), sack, x, .27 + ((q / 3) | 0) * .5, z + (q % 3) * .55 - .55); cl.add(s); } }
    else { cl.add(B('styro_box', .6, .36, .42, styro, x, 0, z), B('styro_box', .6, .36, .42, styro, x + .65, 0, z), bayong(x + .3, .36, z)); } });
  [[-9, 20.3], [9, 20.3]].forEach(([x, z]) => cl.add(bicycle('parked_bicycle', x, z - 1.7, 0)));
  props.add(bake(cl)); }

// ---------- EDGE GREENERY ----------
{ const palms = group('palms'); [['palm_1', -30.5, -16, 7.6, 1.2, PI * .8], ['palm_2', 30.5, -16.5, 7.2, 1.1, .2], ['palm_3', -32, 4, 8, 1.3, PI], ['palm_4', 32.5, 2, 7.4, 1.2, 0], ['palm_5', -26, 25, 7.8, 1.3, PI * .7], ['palm_6', 27, 25, 7.1, 1.0, -.5]].forEach(p => { palms.add(palm(...p)); chk(p[0], p[1], p[2]); }); props.add(bake(palms));
  const sh = group('shrubs'); let placed = 0; for (let t = 0; t < 1500 && placed < 30; t++) { const a = rnd() * TAU, rr = .92 + rnd() * .05, x = Math.cos(a) * RX * rr * blobR(a), z = IZ - Math.sin(a) * RZ * rr * blobR(a);
    if (Math.abs(z - 21) < 2 && Math.abs(x) < 32) continue; sh.add(bush('shrub_' + (++placed), x, z, .4 + rnd() * .4, rnd() > .5 ? pick([pinkF, santan, yellowF]) : null)); } props.add(bake(sh)); }

// ---------- MUD + PUDDLES ----------
{ const mudG = group('mud_and_puddles'), mud = P('mud_wet', '#5E4128', { roughness: .3 }), mudDry = P('mud_dry', '#8A6A48', { roughness: .95 }), puddle = P('puddle', '#56656E', { roughness: .04, metalness: .35 }), mudSoft = P('mud_soft', '#9A8063', { roughness: .95 });
  const blob = r => { const sh = new THREE.Shape(), n = 28, p1 = rnd() * TAU, p2 = rnd() * TAU, sq = .55 + rnd() * .35; for (let i = 0; i < n; i++) { const a = i / n * TAU, rr = r * (1 + .22 * Math.sin(3 * a + p1) + .12 * Math.sin(5 * a + p2)), x = Math.cos(a) * rr, y = Math.sin(a) * rr * sq; i ? sh.lineTo(x, y) : sh.moveTo(x, y); } sh.closePath(); return new THREE.ShapeGeometry(sh).rotateX(-PI / 2); };
  let placed = 0; for (let t = 0; t < 900 && placed < 90; t++) { const x = (rnd() * 2 - 1) * RX * .92, z = IZ + (rnd() * 2 - 1) * RZ * .92; if (!inIsland(x, z, .9)) continue; const wet = z < -1 && z > -19, outer = Math.abs(z - 25) < 3.5 || z < -18.5 || Math.abs(x) > 28.5;
    if (!(wet || outer) && rnd() < .55) continue; placed++; const r = rnd(); const d = mesh('mud', blob(.35 + rnd() * (outer ? 1.0 : .7)), r < .35 ? puddle : r < .6 ? mud : r < .8 ? mudDry : mudSoft, x, .075 + rnd() * .004, z); d.rotation.y = rnd() * TAU; mudG.add(d); }
  for (let k = 0; k < 6; k++) { const d = mesh('mud_patch', blob(1.6 + rnd() * .8), mudSoft, -22 + k * 8.8 + (rnd() - .5) * 3, .073, 25 + (rnd() - .5) * 1.5); mudG.add(d); }
  props.add(bake(mudG)); }

// ---------- OUTER MARKET ----------
function tricycle(name, x, z, ry, body) { const g = group(name, x, 0, z); g.rotation.y = ry; for (const dx of [-.55, .6]) g.add(mesh('wheel', new THREE.TorusGeometry(.28, .07, 6, 14), trashBag, dx, .3, 0));
  g.add(B('moto_body', 1.0, .35, .3, body, 0, .45, 0), B('moto_seat', .6, .08, .26, trashBag, -.15, .8, 0), strut('fork', v3(.6, .3, 0), v3(.45, 1.0, 0), .03, steel), strut('handlebar', v3(.45, 1.0, -.3), v3(.45, 1.0, .3), .02, steel), mesh('headlight', new THREE.CylinderGeometry(.08, .08, .06, 8).rotateZ(PI / 2), steel, .55, .95, 0));
  g.add(B('sidecar', 1.5, 1.0, .9, body, 0, .3, .85), B('sidecar_roof', 1.7, .08, 1.5, paintYellow, -.05, 1.75, .55), B('windshield', .04, .5, .8, glass, .76, 1.05, .85), mesh('sidecar_wheel', new THREE.TorusGeometry(.25, .07, 6, 14), trashBag, .1, .27, 1.32));
  for (const dx of [-.8, .7]) g.add(mesh('roof_post', new THREE.CylinderGeometry(.025, .025, .5, 5), steel, dx, 1.5, 1.28)); g.add(B('stripe', 1.52, .08, .92, paintRed, 0, .95, .85)); return g; }
function jeepney(name, x, z, ry) { const g = group(name, x, 0, z); g.rotation.y = ry;
  g.add(B('body', 4.2, 1.4, 1.9, white, -.4, .55, 0), B('hood', 1.2, .75, 1.7, paintBlue, 2.25, .55, 0), B('grille', .06, .55, 1.3, steel, 2.88, .6, 0), B('roof', 4.6, .14, 2.05, steel, -.4, 1.95, 0), B('windows_l', 3.6, .45, .02, glass, -.5, 1.4, .96), B('windows_r', 3.6, .45, .02, glass, -.5, 1.4, -.96), B('windshield', .05, .55, 1.6, glass, 1.66, 1.35, 0));
  for (const s of [-1, 1]) { g.add(B('stripe_red', 4.25, .1, .02, paintRed, -.4, .95, s * .96), B('stripe_yellow', 4.25, .06, .02, paintYellow, -.4, 1.1, s * .96), B('stripe_green', 4.25, .06, .02, paintGreen, -.4, .82, s * .96)); for (const dx of [-1.7, 1.9]) g.add(mesh('wheel', new THREE.CylinderGeometry(.42, .42, .3, 14).rotateX(PI / 2), trashBag, dx, .42, s * .85)); }
  g.add(B('rear_step', .3, .1, 1.0, steel, -2.6, .35, 0), mesh('hood_ornament', new THREE.ConeGeometry(.08, .3, 6), steel, 2.7, 1.45, 0), mesh('route_sign', new THREE.PlaneGeometry(1.6, .3), signMat('PALENGKE'), 1.68, 1.82, 0).rotateY(PI / 2)); return g; }
const pole = (x, z) => { const g = group('electric_pole', x, 0, z); g.add(mesh('pole', new THREE.CylinderGeometry(.1, .14, 8, 8), granite, 0, 4, 0), B('crossarm', 1.6, .1, .1, wood, 0, 7.4, 0), B('crossarm_2', 1.2, .08, .08, wood, 0, 6.9, 0)); return g; };
{ const om = group('outer_market');
  // electric poles + tangled wires
  const PO = [[-29, -21.5], [-16, -24.5], [0, -24], [16, -24.6], [30, -22], [33.5, -8], [33.6, 8], [30, 25.5], [16, 28], [0, 28.3], [-16, 28], [-29, 24.5], [-33.6, 8], [-33.5, -8]];
  PO.forEach(([x, z]) => { om.add(pole(x, z)); chk('pole', x, z); }); om.add(mesh('transformer', new THREE.CylinderGeometry(.35, .35, .9, 10), steel, 0.5, 6.2, -24), mesh('transformer', new THREE.CylinderGeometry(.35, .35, .9, 10), steel, -15.5, 6.2, 28));
  const wire = (a, b, sag) => { const pts = []; for (let i = 0; i <= 14; i++) { const t = i / 14, p = a.clone().lerp(b, t); p.y -= Math.sin(PI * t) * sag; pts.push(p); } return mesh('wire', new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, .014, 3), wireM); };
  PO.forEach(([x, z], i) => { const [x2, z2] = PO[(i + 1) % PO.length]; for (let k = 0; k < 3; k++) om.add(wire(v3(x + (k - 1) * .6, 7.4 - (k === 1 ? .5 : 0), z), v3(x2 + (k - 1) * .6, 7.4 - (k === 1 ? .5 : 0), z2), .5 + rnd() * .5)); });
  for (let k = 0; k < 14; k++) { const [px, pz] = pick(PO), tx = (rnd() * 2 - 1) * 22, tz = pick([-16.65, -11.35, -2.65, 2.65, 11.35, 16.65]) + (rnd() - .5); om.add(wire(v3(px, 6.9, pz), v3(tx, 2.6, tz), 1 + rnd() * 1.5)); }
  for (let k = 0; k < 10; k++) { const z = pick([-14, 0, 14]), x = (rnd() * 2 - 1) * 20; om.add(wire(v3(x, 2.6, z - 2.6), v3(x + (rnd() - .5) * 2, 2.6, z + 2.6), .35)); }
  // entrance banner
  for (const s of [-1, 1]) om.add(mesh('banner_pole', new THREE.CylinderGeometry(.06, .06, 4.8, 6), steel, s * 4.4, 2.4, 18.8)); om.add(mesh('banner', new THREE.PlaneGeometry(8.4, 1.0), own(std('banner_palengke', { map: plaque('PALENGKE NG BAYAN', '#E2452E', '#FFF4DC', 1024, 120, 62), side: THREE.DoubleSide })), 0, 4.3, 18.8));
  // front: talipapa on the ground + buko + ihaw-ihaw
  [-17, -11, -5, 5, 11].forEach((x, k) => om.add(groundVendor('talipapa_' + k, x + (rnd() - .5), 25 + (rnd() - .5) * 1.2, PI + (rnd() - .5) * .3)));
  { const b = kariton('buko_cart', -22.5, 24.2, .3); pile(b, buko, 0, .55, 0, 14, .14, .45); om.add(b, mesh('sign', new THREE.PlaneGeometry(1, .25), signMat('BUKO'), -22.5, 1.9, 24.8), mesh('sign_post', new THREE.CylinderGeometry(.03, .03, 1.9, 5), wood, -23, .95, 24.8)); pile(om, buko, -21, 0, 25.6, 18, .15, .6); }
  { const i = group('ihaw_ihaw', 18, 0, 24.8); i.add(B('grill', 1.3, .22, .45, iron, 0, .78, 0)); for (const sx of [-.55, .55]) for (const sz of [-.18, .18]) i.add(mesh('leg', new THREE.CylinderGeometry(.03, .03, .78, 5), iron, sx, .39, sz));
    for (let k = 0; k < 10; k++) { i.add(mesh('skewer', new THREE.CylinderGeometry(.01, .01, .45, 3).rotateX(PI / 2), wood, -.5 + k * .11, 1.03, 0)); for (let q = 0; q < 3; q++) i.add(mesh('bbq', new THREE.SphereGeometry(.035, 5, 3), longg, -.5 + k * .11, 1.04, -.08 + q * .07)); }
    i.add(mesh('sign', new THREE.PlaneGeometry(1.3, .28), signMat('IHAW-IHAW'), 0, 2.0, .3), mesh('sign_post', new THREE.CylinderGeometry(.03, .03, 2, 5), wood, .7, 1, .3), monoTable(1.8, .4), monobloc(2.5, .4, -PI / 2, plasticRed), monobloc(1.1, .4, PI / 2), monoTable(3.6, -.2), monobloc(4.3, -.2, -PI / 2)); om.add(i); }
  // back: delivery area
  om.add(jeepney('delivery_jeepney', -13, -21.3, 0)); for (let k = 0; k < 6; k++) { const x = -22 + k * 1.1, t = group('banyera', x, 0, -20 + (k % 2) * .9); t.add(mesh('tub', new THREE.CylinderGeometry(.42, .35, .32, 10), k % 2 ? drumBlue : paintRed, 0, .16, 0), mesh('ice', new THREE.CircleGeometry(.38, 10).rotateX(-PI / 2), ice, 0, .3, 0)); for (let q = 0; q < 5; q++) { const f = mesh('fish', new THREE.SphereGeometry(.06, 6, 4), fishM, (rnd() - .5) * .5, .33, (rnd() - .5) * .4); f.scale.set(3, .9, 1); f.rotation.y = rnd() * 3; t.add(f); } om.add(t); }
  for (let k = 0; k < 8; k++) om.add(B('styro_box', .6, .36, .42, styro, -4 + (k % 4) * .62, ((k / 4) | 0) * .36, -20.2), B('ice_block', .5, .28, .28, ice, -6.5 + k * .4, 0, -21.6));
  { const gb = group('garbage_area', 21, 0, -21); for (let k = 0; k < 3; k++) gb.add(drum(k * .7, 0)); for (let k = 0; k < 9; k++) gb.add(mesh('trash_bag', new THREE.SphereGeometry(.25 + rnd() * .1, 6, 4), k % 3 ? trashBag : pick(plasticBag), 2.2 + (rnd() - .5) * 1.6, .2, (rnd() - .5) * 1.4)); for (let k = 0; k < 4; k++) { const c = B('cardboard', .6, .4, .45, cardboard, 3.6 + (rnd() - .5), 0, (rnd() - .5) * 1.2); c.rotation.y = rnd() * 3; gb.add(c); } om.add(gb, kariton('kariton_back', 9, -20.5, .5)); }
  // right side: tricycle terminal
  [-14, -11, -8, -5].forEach((z, k) => om.add(tricycle('tricycle_' + k, 31.2, z, -PI / 2 + (rnd() - .5) * .2, [paintBlue, paintRed, paintGreen, paintYellow][k])));
  om.add(mesh('sign', new THREE.PlaneGeometry(1.8, .35), signMat('TODA TERMINAL'), 31.3, 2.3, -2.8), mesh('sign_post', new THREE.CylinderGeometry(.04, .04, 2.4, 5), steel, 31.3, 1.2, -2.85));
  // left side: chickens, bananas, uling, water gallons
  { const cg = group('manukan', -31.4, 0, -13); for (let k = 0; k < 6; k++) { const cx = (k % 3) * .7, cy = ((k / 3) | 0) * .55; cg.add(B('cage', .65, .5, .6, cageM, cx, cy, 0)); for (let q = 0; q < 2; q++) { const cm = rnd() < .5 ? chickenW : chickenB, px = cx - .15 + q * .3; cg.add(mesh('chicken', new THREE.SphereGeometry(.12, 6, 4), cm, px, cy + .14, 0), mesh('chicken_head', new THREE.SphereGeometry(.06, 6, 4), cm, px + .1, cy + .28, 0), mesh('comb', new THREE.BoxGeometry(.05, .05, .02), comb, px + .1, cy + .35, 0)); } } om.add(cg); }
  { const bn = group('saging_pile', -31.4, 0, -8.5); bn.add(B('sack_mat', 2.2, .02, 1.2, sack, 0, 0, 0)); for (let k = 0; k < 7; k++) for (let b = 0; b < 6; b++) { const ba = mesh('banana', new THREE.CapsuleGeometry(.035, .18, 2, 5), k % 3 ? FRUIT.banana : VEG.sitaw, -.85 + k * .28, .08 + (b % 2) * .07, -.3 + b * .1); ba.rotation.set(0, .3, .6); bn.add(ba); } om.add(bn); }
  for (let k = 0; k < 6; k++) om.add(mesh('uling_sack', new THREE.CylinderGeometry(.25, .28, .6, 8), charcoal, -32 + (k % 3) * .6, .3 + ((k / 3) | 0) * .02, -4.5 + ((k / 3) | 0) * .6));
  for (let k = 0; k < 9; k++) om.add(mesh('water_gallon', new THREE.CylinderGeometry(.14, .14, .42, 10), gallon, -32.2 + (k % 3) * .32, .21 + ((k / 3) | 0) * .43, -.5));
  om.add(bicycle('parked_bike_l1', -31.6, 3, PI / 2), bicycle('parked_bike_l2', -32.4, 3.4, PI / 2 + .2), kariton('kariton_side', 31.8, 4.2, PI / 2));
  props.add(bake(om)); }

// ---------- ISLETS ----------
{ const isl = group('islets'); const f = a => 1 + .07 * Math.cos(3 * a + 1) + .05 * Math.cos(2 * a);
  const i1 = group('islet_palm', -46, -2.5, -6); i1.add(islandBody('body', 3.6, 3.2, 4, f, 6, 0, 40), palm('palm', 0, 0, 5.5, .9, PI * .8), bush('bush', 1.6, 1.2, .45, null)); isl.add(bake(i1));
  const i2 = group('islet_delivery', 45, 1.5, -14); i2.add(islandBody('body', 3.4, 3.0, 4.2, f, 6, 0, 40), bicycle('delivery_bike', -.6, .6, .5)); for (let q = 0; q < 6; q++) i2.add(crate(.8 + (q % 2) * .52, ((q / 2) | 0) * .3, -.6, q)); i2.add(mesh('sack', new THREE.CylinderGeometry(.27, .3, .8, 8).rotateZ(PI / 2), sack, -.4, .27, -1.2)); isl.add(bake(i2));
  const i3 = group('islet_bayong', 32, -3.5, 36); i3.add(islandBody('body', 2.8, 2.6, 3.4, f, 5, 0, 36), bush('bush', -1, -.6, .55, pinkF), bayong(.4, 0, .3), bayong(.9, 0, -.2), bilao(.2, 0, -.9, .4)); pile(i3, coconutM, -.2, 0, .9, 8, .15, .35); isl.add(bake(i3));
  root.add(isl); }

// ---------- BOARD ----------
const EVENTS = { tawad: 1, timbangan: 1, suki: 1, basa: 1, padyak: 1, ulan: 1 };
const TYPES = { simula: '#3B2316', piso: '#2E6FD8', utang: '#E2452E', swerte: '#F2B705', tikbalang: '#7B4BC4', sarisari: '#13A39A', jackenpoy: '#F07C1E', kasama: '#3BAA4A', tanong: '#E8559A', tawad: '#FFF4DC', timbangan: '#FFF4DC', suki: '#FFF4DC', basa: '#FFF4DC', padyak: '#FFF4DC', ulan: '#FFF4DC' };
function tileTex(type) { const ev = EVENTS[type]; return tex(C(256, 256, (g, s) => { g.fillStyle = TYPES[type]; g.fillRect(0, 0, s, s); g.lineWidth = 7; g.strokeStyle = ev ? '#C9A24B' : 'rgba(255,255,255,.6)'; g.beginPath(); g.arc(128, 128, 112, 0, TAU); g.stroke();
  g.lineJoin = 'round'; g.lineCap = 'round'; g.strokeStyle = ev ? '#FFF4DC' : '#3B2316'; g.fillStyle = ev ? '#3B2316' : '#FFFFFF'; g.lineWidth = 12; g.textAlign = 'center'; g.textBaseline = 'middle';
  const txt = (t, size, y = 134) => { g.font = '900 ' + size + 'px "Arial Black", Arial, sans-serif'; g.strokeText(t, 128, y); g.fillText(t, 128, y); };
  const shape = draw => { g.beginPath(); draw(); g.stroke(); g.fill(); };
  if (type === 'simula') { txt('SIMULA', 46, 112); txt('→', 80, 170); }
  else if (type === 'piso') txt('+₱', 110); else if (type === 'utang') txt('−₱', 110); else if (type === 'tanong') txt('?', 150); else if (type === 'jackenpoy') txt('VS', 100); else if (type === 'tikbalang') txt('←3', 100);
  else if (type === 'tawad') txt('%', 130); else if (type === 'suki') txt('SUKI', 66);
  else if (type === 'swerte') shape(() => { for (let i = 0; i < 10; i++) { const a = -PI / 2 + i * PI / 5, r = i % 2 ? 36 : 82; g.lineTo(128 + Math.cos(a) * r, 132 + Math.sin(a) * r); } g.closePath(); });
  else if (type === 'sarisari') { shape(() => g.rect(72, 118, 112, 68)); shape(() => { g.moveTo(58, 120); g.lineTo(198, 120); g.lineTo(178, 78); g.lineTo(78, 78); g.closePath(); }); g.fillStyle = '#E2452E'; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(84 + i * 26, 80); g.lineTo(96 + i * 26, 80); g.lineTo(92 + i * 28, 118); g.lineTo(76 + i * 28, 118); g.fill(); } g.fillStyle = '#3B2316'; g.fillRect(112, 140, 32, 46); }
  else if (type === 'kasama') for (const x of [94, 162]) { shape(() => g.arc(x, 96, 24, 0, TAU)); shape(() => g.roundRect(x - 32, 128, 64, 60, 22)); }
  else if (type === 'timbangan') { g.strokeStyle = '#3B2316'; g.lineWidth = 10; g.beginPath(); g.moveTo(128, 40); g.lineTo(128, 62); g.stroke(); g.beginPath(); g.arc(128, 100, 38, 0, TAU); g.stroke(); g.beginPath(); g.moveTo(128, 100); g.lineTo(150, 82); g.stroke(); g.beginPath(); g.moveTo(128, 138); g.lineTo(128, 160); g.stroke(); shape(() => { g.moveTo(66, 160); g.quadraticCurveTo(128, 222, 190, 160); g.closePath(); }); }
  else if (type === 'basa') shape(() => { g.moveTo(128, 46); g.bezierCurveTo(150, 92, 184, 120, 184, 152); g.bezierCurveTo(184, 186, 158, 206, 128, 206); g.bezierCurveTo(98, 206, 72, 186, 72, 152); g.bezierCurveTo(72, 120, 106, 92, 128, 46); });
  else if (type === 'ulan') { shape(() => { g.arc(98, 112, 32, PI * .5, PI * 1.5); g.arc(132, 88, 38, PI, 0); g.arc(166, 112, 30, PI * 1.5, PI * .5); g.closePath(); }); g.strokeStyle = '#3B2316'; g.lineWidth = 10; for (const x of [96, 128, 160]) { g.beginPath(); g.moveTo(x, 160); g.lineTo(x - 12, 196); g.stroke(); } }
  else if (type === 'padyak') { g.strokeStyle = '#3B2316'; g.lineWidth = 12; g.beginPath(); g.arc(128, 128, 62, 0, TAU); g.stroke(); g.lineWidth = 8; for (let i = 0; i < 8; i++) { const a = i * PI / 4; g.beginPath(); g.moveTo(128, 128); g.lineTo(128 + Math.cos(a) * 62, 128 + Math.sin(a) * 62); g.stroke(); } g.beginPath(); g.arc(128, 128, 14, 0, TAU); g.fill(); }
}), 0, 'tile_' + type); }
const tileMats = Object.fromEntries(Object.keys(TYPES).map(t => [t, own(std('tile_' + t, { map: tileTex(t), roughness: .45 }))]));
const SPM = { 0: 'simula', 2: 'tanong', 4: 'tawad', 5: 'sarisari', 6: 'utang', 7: 'kasama', 8: 'sarisari', 10: 'swerte', 12: 'utang', 13: 'jackenpoy', 14: 'tawad', 15: 'padyak', 16: 'tikbalang', 18: 'tanong',
  19: 'utang', 21: 'swerte', 22: 'basa', 23: 'swerte', 25: 'utang', 26: 'suki', 28: 'kasama', 29: 'kasama', 30: 'basa', 31: 'utang', 33: 'jackenpoy', 34: 'swerte', 36: 'sarisari', 37: 'suki', 38: 'suki',
  39: 'utang', 41: 'basa', 42: 'tanong', 44: 'tikbalang', 45: 'tanong', 46: 'utang', 47: 'swerte', 49: 'kasama', 51: 'utang', 52: 'timbangan', 53: 'jackenpoy', 55: 'tanong', 57: 'tikbalang',
  58: 'jackenpoy', 59: 'utang', 62: 'tawad', 63: 'sarisari', 64: 'utang', 67: 'tikbalang', 68: 'tawad', 69: 'sarisari', 71: 'tanong', 72: 'utang', 74: 'tawad', 75: 'swerte', 76: 'swerte', 77: 'suki' };
const MAIN = Array.from({ length: NM }, (_, i) => SPM[i] || 'piso');
const SPC = { 2: 'utang', 3: 'basa', 5: 'kasama', 6: 'ulan', 8: 'utang', 10: 'timbangan', 11: 'suki', 12: 'swerte', 14: 'timbangan', 16: 'utang', 17: 'tanong', 18: 'ulan', 20: 'jackenpoy', 21: 'suki', 23: 'tanong',
  24: 'timbangan' };
const CENTER = Array.from({ length: NC }, (_, j) => SPC[j] || 'piso');
const KOR = new Set(['M05', 'M17', 'M27', 'M35', 'M45', 'M54', 'M63', 'M75', 'C04', 'C17']);
const pad = n => String(n).padStart(2, '0');
{ const spaces = group('board_spaces'), graph = [];
  const addSpace = (id, type, p) => { const big = type === 'simula', Rr = big ? .85 : .58, g = group('space_' + id + '_' + type, p.x, .07, p.z);
    g.add(mesh('rim', new THREE.CylinderGeometry(Rr + .1, Rr + .14, .18, 24), white, 0, .09, 0), mesh('top', new THREE.CircleGeometry(Rr, 32).rotateX(-PI / 2), tileMats[type], 0, .182, 0));
    if (KOR.has(id)) g.add(mesh('korona_spot_ring', new THREE.TorusGeometry(Rr + .22, .045, 4, 32).rotateX(PI / 2), gold, 0, .1, 0));
    const node = { id, type, x: +p.x.toFixed(2), z: +p.z.toFixed(2), next: [], koronaSpot: KOR.has(id) }; g.userData = node; graph.push(node); spaces.add(g); };
  MAIN.forEach((t, i) => addSpace('M' + pad(i), t, M(i))); CENTER.forEach((t, j) => addSpace('C' + pad(j), t, Cp(j)));
  graph.forEach(n => { const k = +n.id.slice(1); n.next.push(n.id[0] === 'M' ? 'M' + pad((k + 1) % NM) : (k === NC - 1 ? 'M' + pad(MERGE) : 'C' + pad(k + 1))); });
  graph.find(n => n.id === 'M' + pad(FORK)).next.push('C00'); Object.assign(graph.find(n => n.id === 'M' + pad(PAD_B)), { padyakTo: 'M' + pad(PAD_A), padyakCost: 8 });   // the padyak leaves from M15 for M65 (along its street)
  spaces.userData = { board: 'palengke', start: 'M00', mainLoop: NM, centerAisle: NC, fork: 'M' + pad(FORK), merge: 'M' + pad(MERGE), padyak: { from: 'M' + pad(PAD_B), to: 'M' + pad(PAD_A), cost: 8 }, koronaSpots: [...KOR], activeKoronaRange: [1, 5], nodes: graph };
  window.__palengkeBoard = spaces.userData; root.add(spaces); }

let tris = 0; root.traverse(o => { if (o.isMesh) tris += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3; });


return { root, inIsland, RX, RZ, IZ };
}
