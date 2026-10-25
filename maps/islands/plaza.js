// Generated from Plaza Island v3.html
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
const RX = 40, RZ = 38, IZ = -5;
const blobR = a => 1 + .05 * Math.sin(a) + .035 * Math.cos(3 * a + .6) + .025 * Math.cos(5 * a + 2.1);
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

const root = group('isla1_plaza');

// ---------- TERRAIN + PATHS ----------
const MA = 28, MB = 19, NM = 80, NB = 22, FORK = 31, MERGE = 49, KAL_A = 68, KAL_B = 12;
const V = (x, z) => new THREE.Vector3(x, 0, z);
const mainPt = t => { const k = 1 + .04 * Math.cos(3 * t); return V(MA * Math.sin(t) * k, MB * Math.cos(t) * k); };
const mainCurve = new THREE.CatmullRomCurve3(Array.from({ length: 120 }, (_, i) => mainPt(i / 120 * TAU)), true);
const M = i => mainCurve.getPointAt((((i % NM) + NM) % NM) / NM);
const branchCurve = new THREE.CatmullRomCurve3([M(FORK), V(14, -24), V(4, -27.5), V(-4, -27.5), V(-14, -24), M(MERGE)]);
const Bp = j => branchCurve.getPointAt((j + 1) / (NB + 1));
const line = (a, b, n) => Array.from({ length: n + 1 }, (_, i) => a.clone().lerp(b, i / n));
const kalA = M(KAL_A), kalB = M(KAL_B);
const mainPts = mainCurve.getSpacedPoints(240).slice(0, -1), branchPts = branchCurve.getSpacedPoints(80);
const chordPts = new THREE.CatmullRomCurve3([kalA, V(kalA.x * .6, kalA.z + .8), V(0, kalA.z + 1.4), V(kalB.x * .6, kalB.z + .8), kalB]).getSpacedPoints(60);
const spokes = [line(V(8, 0), V(27, 0), 20), line(V(-8, 0), V(-27, 0), 20), line(V(0, -8), V(0, -17.6), 10), line(V(0, 8), V(0, 19), 12)], entrance = line(V(0, 20.4), V(0, 31), 12);
const PATHS = [[mainPts, 2.3], [branchPts, 2.3], [chordPts, 2.6], [entrance, 2.6], ...spokes.map(s => [s, 2.2])];
const nearPath = (x, z, d) => PATHS.some(([pts, w]) => pts.some(p => Math.hypot(p.x - x, p.z - z) < d + w / 2));
function ribbon(name, pts, w, m, y, closed = false) { const n = pts.length, P = [], idx = [];
  for (let i = 0; i < n; i++) { const a = pts[closed ? (i - 1 + n) % n : Math.max(0, i - 1)], b = pts[closed ? (i + 1) % n : Math.min(n - 1, i + 1)], d = b.clone().sub(a).setY(0).normalize(), p = pts[i];
    P.push(p.x - d.z * w / 2, y, p.z + d.x * w / 2, p.x + d.z * w / 2, y, p.z - d.x * w / 2); }
  for (let i = 0; i < (closed ? n : n - 1); i++) { const a = i * 2, b = ((i + 1) % n) * 2; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setIndex(idx); g.computeVertexNormals(); return mesh(name, g, m); }
const terrain = group('terrain'); { const body = islandBody('island_body', RX, RZ, 14, blobR, 22, 8); body.position.z = IZ; terrain.add(body); }
terrain.add(ribbon('main_path', mainPts, 2.3, cobble, .05, true), ribbon('back_street', branchPts, 2.3, cobble, .046), ribbon('kalesa_road', chordPts, 2.6, cobble, .042), ribbon('entrance_path', entrance, 2.6, cobble, .04));
spokes.forEach((s, i) => terrain.add(ribbon('spoke_' + i, s, 2.2, brick, .035)));
terrain.add(mesh('plaza_border', new THREE.CylinderGeometry(8.25, 8.25, .07, 64), granite, 0, .035, 0), mesh('plaza_paving', new THREE.CylinderGeometry(8, 8, .09, 64), brick, 0, .045, 0));
terrain.add(B('atrio', 10, .045, 4, cobble, -10, 0, -29), B('munisipyo_forecourt', 9.6, .045, 4.2, cobble, 10, 0, -29.1));
root.add(bake(terrain));

const landmarks = group('landmarks'); root.add(landmarks);
// ---------- KIOSKO ----------
{ const k = group('kiosko'), FL = .9, PR = 3.15, PH = 2.75;
  k.add(mesh('base', new THREE.CylinderGeometry(3.55, 3.75, FL, 8).rotateY(PI / 8), stucco, 0, FL / 2, 0), mesh('base_trim', new THREE.CylinderGeometry(3.63, 3.63, .12, 8).rotateY(PI / 8), granite, 0, FL - .05, 0),
    mesh('floor', new THREE.CylinderGeometry(3.5, 3.5, .04, 8).rotateY(PI / 8), baldosa, 0, FL + .02, 0));
  for (let i = 0; i < 3; i++) { const h = FL * (3 - i) / 4; k.add(B('step', 2, h, .38, granite, 0, 0, 3.55 + i * .38)); }
  for (let i = 0; i < 8; i++) { const a = PI / 8 + i * PI / 4, x = Math.sin(a) * PR, z = Math.cos(a) * PR;
    k.add(mesh('post', new THREE.CylinderGeometry(.1, .12, PH, 8), white, x, FL + PH / 2, z), B('post_plinth', .32, .3, .32, white, x, FL, z), B('post_capital', .3, .18, .3, white, x, FL + PH - .18, z));
    const m = (i + 1) * PI / 4, rr = PR * Math.cos(PI / 8), L = 2 * PR * Math.sin(PI / 8), cx = Math.sin(m) * rr, cz = Math.cos(m) * rr;
    const arch = mesh('fretwork_arch', new THREE.TorusGeometry(L / 2 - .12, .045, 4, 10, PI), white, cx, FL + PH - (L / 2 - .12) - .06, cz); arch.rotation.y = m; k.add(arch);
    if (i === 7) continue;
    for (const [hy, th] of [[.85, .08], [.12, .06]]) { const r = mesh('rail', new THREE.BoxGeometry(L, th, .1), white, cx, FL + hy, cz); r.rotation.y = m; k.add(r); }
    for (let b = 1; b < 5; b++) { const t = b / 5 - .5; k.add(mesh('baluster', new THREE.CylinderGeometry(.035, .035, .72, 6), white, cx + Math.cos(m) * L * t, FL + .48, cz - Math.sin(m) * L * t)); } }
  const DB = FL + PH + .3;
  k.add(mesh('beam', new THREE.CylinderGeometry(3.3, 3.3, .3, 8).rotateY(PI / 8), white, 0, FL + PH + .15, 0), mesh('beam_band', new THREE.CylinderGeometry(3.32, 3.32, .08, 8).rotateY(PI / 8), domeRed, 0, FL + PH + .15, 0));
  k.add(mesh('soffit', new THREE.CylinderGeometry(3.93, 3.93, .04, 8).rotateY(PI / 8), white, 0, DB - .01, 0), mesh('eave_trim', new THREE.CylinderGeometry(3.99, 3.99, .16, 8, 1, true).rotateY(PI / 8), gold, 0, DB + .04, 0));
  for (let i = 0; i < 8; i++) { const p = mesh('dome_panel', new THREE.SphereGeometry(3.95, 1, 6, PI / 2 + PI / 8 + i * PI / 4, PI / 4, 0, PI / 2), i % 2 ? domeCream : domeRed, 0, DB, 0); p.scale.y = .5; k.add(p); }
  k.add(mesh('cupola', new THREE.CylinderGeometry(.6, .65, .9, 8), white, 0, DB + 2.15, 0), mesh('cupola_windows', new THREE.CylinderGeometry(.62, .62, .32, 8), glass, 0, DB + 2.25, 0));
  const md = mesh('cupola_dome', new THREE.SphereGeometry(.78, 8, 4, 0, TAU, 0, PI / 2), domeRed, 0, DB + 2.6, 0); md.scale.y = .7; k.add(md);
  k.add(mesh('finial', new THREE.SphereGeometry(.13, 10, 8), gold, 0, DB + 3.25, 0), mesh('finial_spike', new THREE.ConeGeometry(.06, .45, 6), gold, 0, DB + 3.55, 0));
  landmarks.add(bake(k)); }

// ---------- SIMBAHAN (church facade, earthquake-baroque) ----------
{ const c = group('simbahan', -10, 0, -31);
  c.add(B('plinth', 9.8, .5, 2.0, adobe, 0, 0, -.8), B('facade', 9, 8.1, 1.4, adobe, 0, .5, -.7));
  for (const x of [-4.1, -1.9, 1.9, 4.1]) c.add(B('pilaster', .6, 8.1, .3, adobe, x, .5, .1));
  c.add(B('cornice_mid', 9.6, .3, 1.8, granite, 0, 4.9, -.6), B('cornice_top', 9.8, .35, 1.9, granite, 0, 8.6, -.65));
  for (const s of [-1, 1]) c.add(B('door_jamb', .4, 2.9, .5, granite, s * 1.35, .5, .1));
  c.add(mesh('door_arch', new THREE.TorusGeometry(1.35, .2, 6, 14, PI), granite, 0, 3.4, .1), arched('door', 2.3, 2.9, .2, doorWood, 0, .5, .02));
  c.add(mesh('oculus', new THREE.CylinderGeometry(.75, .75, .2, 16).rotateX(PI / 2), glass, 0, 6.6, .05), mesh('oculus_frame', new THREE.TorusGeometry(.85, .15, 6, 16), granite, 0, 6.6, .1));
  for (const s of [-1, 1]) c.add(arched('niche', .8, 1.5, .12, niche, s * 3.0, 2.0, .02), arched('window', .7, 1.1, .12, glass, s * 3.0, 5.7, .02));
  const ped = new THREE.Shape(); ped.moveTo(-4.3, 0); ped.quadraticCurveTo(-2, .15, -1.5, 1.6); ped.lineTo(-1.1, 1.6); ped.lineTo(0, 3.0); ped.lineTo(1.1, 1.6); ped.lineTo(1.5, 1.6); ped.quadraticCurveTo(2, .15, 4.3, 0); ped.closePath();
  c.add(mesh('pediment', new THREE.ExtrudeGeometry(ped, { depth: .9, bevelEnabled: false }), adobe, 0, 8.95, -1.0));
  c.add(B('cross_v', .14, 1.0, .14, granite, 0, 11.9, -.5), B('cross_h', .6, .14, .14, granite, 0, 12.5, -.5));
  for (const s of [-1, 1]) c.add(mesh('urn', new THREE.CylinderGeometry(.18, .25, .5, 8), granite, s * 4.5, 9.2, -.4), mesh('urn_top', new THREE.SphereGeometry(.22, 8, 6), granite, s * 4.5, 9.6, -.4));
  c.add(B('nave', 8.2, 6.8, 3.6, adobe, 0, 0, -3.2)); const nr = mesh('nave_roof', hipRoof(3.6, 8.2, 2.2, 0, .35).rotateY(PI / 2), roof, 0, 6.8, -3.2); c.add(nr);
  const tx = -6.2, tz = -1.6;
  c.add(B('tower_1', 3, 8.6, 3, adobe, tx, 0, tz), B('tower_cornice_1', 3.3, .3, 3.3, granite, tx, 8.6, tz), B('tower_2', 2.6, 3, 2.6, adobe, tx, 8.9, tz), B('tower_cornice_2', 2.9, .25, 2.9, granite, tx, 11.9, tz));
  for (let i = 0; i < 4; i++) { const a = i * PI / 2, o = arched('belfry_opening', .9, 1.4, .12, niche, tx + Math.sin(a) * 1.31, 9.5, tz + Math.cos(a) * 1.31); o.rotation.y = a; c.add(o); }
  for (const y of [2.4, 5.4]) c.add(arched('tower_window', .6, .9, .12, glass, tx, y, tz + 1.51));
  c.add(mesh('tower_3', new THREE.CylinderGeometry(1.0, 1.15, 1.4, 8), adobe, tx, 12.85, tz)); const td = mesh('tower_dome', new THREE.SphereGeometry(1.05, 8, 4, 0, TAU, 0, PI / 2), adobe, tx, 13.55, tz); td.scale.y = .9; c.add(td);
  c.add(B('tower_cross_v', .1, .8, .1, granite, tx, 14.45, tz), B('tower_cross_h', .4, .1, .1, granite, tx, 14.95, tz));
  chk('church back', -14.5, -36); chk('tower corner', -17.7, -34.2);
  landmarks.add(bake(c)); }

// ---------- MUNISIPYO (town hall) ----------
{ const m = group('munisipyo', 10, 0, -31.2);
  m.add(B('plinth', 10.4, .5, 4.6, granite, 0, 0, -2.1), B('body', 10, 6.9, 4.2, stuccoCream, 0, .5, -2.1), B('floor_band', 10.3, .25, 4.4, white, 0, 3.8, -2.1), B('cornice', 10.4, .3, 4.6, white, 0, 7.4, -2.1));
  for (const s of [-1, 1]) m.add(B('corner_pilaster', .5, 6.9, .2, white, s * 4.75, .5, .02));
  for (const x of [-4, -2.7, 2.7, 4]) { m.add(arched('ground_arch', .9, 2.0, .1, glass, x, .7, .02), B('upper_frame', 1.1, 2.0, .12, white, x, 4.4, .03), B('sill', 1.3, .12, .3, white, x, 4.3, .1), mesh('capiz', new THREE.PlaneGeometry(.9, 1.8), capiz, x, 5.4, .1)); }
  m.add(arched('main_door', 1.4, 2.4, .1, doorWood, 0, .5, .02), B('upper_door_frame', 1.6, 2.4, .12, white, 0, 4.1, .03), mesh('capiz_door', new THREE.PlaneGeometry(1.4, 2.2), capiz, 0, 5.2, .1));
  for (const x of [-1.7, -.7, .7, 1.7]) m.add(mesh('column', new THREE.CylinderGeometry(.18, .2, 3.3, 12), white, x, 2.15, 1.25), B('column_base', .5, .25, .5, white, x, .0, 1.25));
  m.add(B('balcony', 4.4, .3, 1.8, white, 0, 3.8, .75), B('balcony_rail', 4.4, .1, .1, white, 0, 4.85, 1.6));
  for (const s of [-1, 1]) m.add(B('balcony_side', .1, .1, 1.6, white, s * 2.15, 4.85, .8));
  for (let i = 0; i < 14; i++) m.add(mesh('baluster', new THREE.CylinderGeometry(.04, .04, .75, 6), white, -2.05 + i * 4.1 / 13, 4.47, 1.6));
  const tri = new THREE.Shape(); tri.moveTo(-2.8, 0); tri.lineTo(2.8, 0); tri.lineTo(0, 1.3); tri.closePath();
  m.add(mesh('pediment', new THREE.ExtrudeGeometry(tri, { depth: .5, bevelEnabled: false }), stuccoCream, 0, 7.7, -.3), mesh('clock', new THREE.CylinderGeometry(.33, .33, .08, 16).rotateX(PI / 2), white, 0, 8.15, .22), mesh('clock_ring', new THREE.TorusGeometry(.35, .05, 4, 16), gold, 0, 8.15, .24));
  m.add(mesh('plaque', new THREE.PlaneGeometry(3.4, .5), plaqueMun, 0, 6.9, .02), mesh('roof', hipRoof(10, 4.2, 1.9, 1.9, .45), roof, 0, 7.7, -2.1));
  for (let i = 0; i < 3; i++) m.add(B('step', 2.6, .5 * (3 - i) / 3, .35, granite, 0, 0, .17 + i * .35));
  chk('munisipyo corner R', 15.2, -35.5); chk('munisipyo corner L', 4.8, -35.5);
  landmarks.add(bake(m)); }

// ---------- FLAGPOLES ----------
function wavingFlag(m) { const geo = new THREE.PlaneGeometry(2.4, 1.2, 12, 4).translate(1.2, 0, 0), p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); p.setZ(i, Math.sin(x * 2.4 + y * .6) * .13 * (x / 2.4)); } geo.computeVertexNormals(); return mesh('flag', geo, m); }
{ const f = group('flagpoles'); [[3.4, -30.4, flagPH], [16.6, -30.4, flagTP]].forEach(([x, z, fm], i) => { const p = group(i ? 'pole_taympers' : 'pole_pilipinas', x, 0, z);
  p.add(B('base', .9, .4, .9, granite, 0, 0, 0), mesh('pole', new THREE.CylinderGeometry(.05, .07, 8, 8), white, 0, 4.4, 0), mesh('finial', new THREE.SphereGeometry(.1, 8, 6), gold, 0, 8.45, 0));
  const fl = wavingFlag(fm); fl.position.set(.06, 7.6, 0); p.add(fl); f.add(p); chk('flagpole', x, z); }); landmarks.add(bake(f)); }

// ---------- RIZAL MONUMENT ----------
{ const r = group('rizal_monument', -12, 0, 25);
  r.add(B('step_1', 3, .3, 3, granite, 0, 0, 0), B('step_2', 2.4, .3, 2.4, granite, 0, .3, 0), B('pedestal', 1.3, 1.9, 1.3, granite, 0, .6, 0), B('pedestal_cap', 1.55, .2, 1.55, granite, 0, 2.5, 0));
  r.add(mesh('plaque', new THREE.PlaneGeometry(.9, .45), plaqueRizal, 0, 1.6, .66));
  const s = group('statue', 0, 2.7, 0);
  for (const x of [-.1, .1]) s.add(mesh('leg', new THREE.CylinderGeometry(.08, .085, .8, 8), bronze, x, .4, 0), B('shoe', .13, .08, .26, bronze, x, 0, .04));
  s.add(mesh('coat', new THREE.CylinderGeometry(.24, .33, 1.0, 10), bronze, 0, 1.05, 0), mesh('shoulders', new THREE.CylinderGeometry(.27, .24, .25, 10), bronze, 0, 1.62, 0), mesh('neck', new THREE.CylinderGeometry(.06, .07, .12, 8), bronze, 0, 1.78, 0));
  s.add(mesh('head', new THREE.SphereGeometry(.13, 12, 10), bronze, 0, 1.92, 0), mesh('hair', new THREE.SphereGeometry(.135, 12, 6, 0, TAU, 0, PI / 2), bronze, 0, 1.95, -.015));
  const la = mesh('arm_l', new THREE.CylinderGeometry(.065, .075, .72, 8), bronze, -.33, 1.3, 0); la.rotation.z = -.12; s.add(la);
  const ua = mesh('arm_r_upper', new THREE.CylinderGeometry(.07, .075, .38, 8), bronze, .31, 1.48, .02); s.add(ua); const fa = mesh('arm_r_fore', new THREE.CylinderGeometry(.06, .065, .36, 8), bronze, .22, 1.32, .16); fa.rotation.set(1.2, 0, .5); s.add(fa);
  s.add(B('book', .24, .3, .06, bronze, .08, 1.18, .27)); r.add(s);
  landmarks.add(bake(r)); }

// ---------- I ♥ TP SIGN ----------
{ const sg = group('i_love_tp', 10.5, 0, 24.2); sg.rotation.y = -.25; const H = 1.6, ex = { depth: .45, bevelEnabled: true, bevelThickness: .05, bevelSize: .05, bevelSegments: 2, curveSegments: 10 };
  const I = new THREE.Shape(); I.moveTo(0, 0); I.lineTo(.55, 0); I.lineTo(.55, H); I.lineTo(0, H); I.closePath();
  const hr = new THREE.Shape(); hr.moveTo(0, 0); hr.bezierCurveTo(-.9, .7, -.85, 1.55, -.42, 1.6); hr.bezierCurveTo(-.15, 1.62, 0, 1.45, 0, 1.3); hr.bezierCurveTo(0, 1.45, .15, 1.62, .42, 1.6); hr.bezierCurveTo(.85, 1.55, .9, .7, 0, 0);
  const T = new THREE.Shape(); [[0, H], [1.3, H], [1.3, 1.1], [.925, 1.1], [.925, 0], [.375, 0], [.375, 1.1], [0, 1.1]].forEach(([x, y], i) => i ? T.lineTo(x, y) : T.moveTo(x, y)); T.closePath();
  const P = new THREE.Shape(); P.moveTo(0, 0); P.lineTo(.55, 0); P.lineTo(.55, .55); P.lineTo(.82, .55); P.absarc(.82, 1.075, .525, -PI / 2, PI / 2, false); P.lineTo(0, H); P.closePath();
  const ph = new THREE.Path(); ph.moveTo(.55, .95); ph.lineTo(.82, .95); ph.absarc(.82, 1.075, .125, -PI / 2, PI / 2, false); ph.lineTo(.55, 1.2); ph.closePath(); P.holes.push(ph);
  const Y = .4, Z = -.25; [[I, -2.8, white, 'letter_I'], [hr, -1.15, heartRed, 'heart'], [T, -.05, white, 'letter_T'], [P, 1.45, white, 'letter_P']].forEach(([sh, x, mt, n]) => sg.add(mesh(n, new THREE.ExtrudeGeometry(sh, ex), mt, x, Y, Z)));
  sg.add(B('plinth', 6.3, .4, 1.0, granite, 0, 0, 0), B('planter', 6.3, .3, .8, granite, 0, 0, .95), B('planter_soil', 6.0, .32, .55, soil, 0, 0, .95));
  for (let i = 0; i < 9; i++) { const x = -2.8 + i * .7, fl = [santan, pinkF, yellowF][i % 3]; sg.add(mesh('planter_bush', new THREE.IcosahedronGeometry(.3, 1), i % 2 ? leaf : leafLight, x, .5, .95)); for (let k = 0; k < 4; k++) sg.add(mesh('flower', new THREE.IcosahedronGeometry(.08, 0), fl, x + (rnd() - .5) * .45, .62 + rnd() * .15, .95 + (rnd() - .3) * .35)); }
  chk('sign right', 14.2, 24.7); landmarks.add(bake(sg)); }

// ---------- KALESA (paid shortcut) ----------
{ const k = group('kalesa', kalA.x + 9, 0, kalA.z + 3.1);
  for (const s of [-1, 1]) { const w = group('wheel', 0, .75, s * .78); w.add(mesh('rim', new THREE.TorusGeometry(.72, .05, 6, 18), doorWood), mesh('hub', new THREE.CylinderGeometry(.09, .09, .16, 8).rotateX(PI / 2), iron));
    for (let i = 0; i < 6; i++) { const sp = mesh('spoke', new THREE.BoxGeometry(.04, 1.4, .04), doorWood); sp.rotation.z = i * PI / 6; w.add(sp); } k.add(w); }
  k.add(B('axle', .1, .1, 1.6, iron, 0, .7, 0), B('cab', 1.5, .8, 1.3, domeRed, -.1, .9, 0), B('cab_trim', 1.56, .08, 1.36, gold, -.1, 1.68, 0), B('seat', .5, .12, 1.1, wood, -.2, 1.25, 0), B('driver_seat', .45, .12, 1.0, wood, .85, 1.3, 0));
  k.add(mesh('roof', new THREE.CylinderGeometry(.75, .75, 1.7, 10, 1, false, 0, PI).rotateZ(PI / 2), iron, -.1, 1.78, 0));
  for (const s of [-1, 1]) k.add(B('shaft', 2.6, .06, .06, wood, 2.2, .95, s * .45));
  k.add(mesh('horse_body', new THREE.CapsuleGeometry(.36, 1.0, 4, 10).rotateZ(PI / 2), horseM, 3.2, 1.25, 0));
  for (const dx of [-.45, .45]) for (const s of [-1, 1]) k.add(mesh('horse_leg', new THREE.CylinderGeometry(.075, .06, 1.0, 6), horseM, 3.2 + dx, .5, s * .18));
  const neck = mesh('horse_neck', new THREE.CylinderGeometry(.16, .22, .85, 8), horseM, 3.85, 1.68, 0); neck.rotation.z = -.6; k.add(neck);
  const head = mesh('horse_head', new THREE.BoxGeometry(.58, .26, .26), horseM, 4.25, 2.0, 0); head.rotation.z = -.55; k.add(head);
  const mane = mesh('horse_mane', new THREE.BoxGeometry(.08, .7, .07), maneM, 3.76, 1.82, 0); mane.rotation.z = -.6; k.add(mane);
  const tail = mesh('horse_tail', new THREE.ConeGeometry(.08, .6, 6), maneM, 2.62, 1.12, 0); tail.rotation.z = -2.6; k.add(tail);
  k.add(mesh('harness', new THREE.TorusGeometry(.37, .04, 4, 14).rotateY(PI / 2), domeRed, 3.55, 1.25, 0));
  for (const [p, n] of [[kalA, 'stop_a'], [kalB, 'stop_b']]) { const s = group('kalesa_' + n, p.x - k.position.x, 0, p.z + 2.0 - k.position.z); s.add(mesh('post', new THREE.CylinderGeometry(.05, .05, 2.3, 6), iron, 0, 1.15, 0), mesh('sign', new THREE.PlaneGeometry(1.2, .35), plaqueKal, 0, 2.1, 0)); k.add(s); }
  chk('kalesa', k.position.x, k.position.z); landmarks.add(bake(k)); }

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

const PALMS = [['palm_1', -21, 23, 7.8, 1.3, PI * .8], ['palm_2', 17.5, 19.8, 7.4, 1.2, -.4], ['palm_3', -33, 4, 8.2, 1.4, PI], ['palm_4', 33, 2, 7.6, 1.1, 0], ['palm_5', -15, 5, 7.2, 1.0, PI * .7], ['palm_6', 15, 5.5, 7.9, 1.2, -.6], ['palm_7', -22, -5, 8.0, 1.3, PI * 1.1], ['palm_8', 23, -4, 7.3, 1.0, .2]];
const ACAC = [['acacia_1', -15, -10, 1.2], ['acacia_2', 15, -10, 1.1], ['acacia_3', -31, -16, 1.25], ['acacia_4', 31, -18, 1.15]];
{ const palms = group('palms'); PALMS.forEach(p => { palms.add(palm(...p)); chk(p[0], p[1], p[2]); }); props.add(bake(palms)); }
{ const trees = group('acacia_trees'); ACAC.forEach(t => { trees.add(acacia(...t)); chk(t[0], t[1], t[2]); }); props.add(bake(trees)); }
{ const b = group('benches'); for (let i = 0; i < 8; i++) b.add(bench('bench_' + (i + 1), PI / 8 + i * PI / 4, 6.4)); props.add(bake(b)); }
const lampTops = []; { const l = group('lampposts'); for (let i = 0; i < 8; i++) { const a = PI / 8 + i * PI / 4, x = Math.sin(a) * 7.4, z = Math.cos(a) * 7.4; l.add(lamp('lamp_' + (i + 1), x, z)); lampTops.push(new THREE.Vector3(x, 4.0, z)); } props.add(bake(l)); }
{ const beds = group('flower_beds');
  beds.add(bed('bed_church_l', -13.6, -30.3, 2.0, 1.0, [pinkF, santan]), bed('bed_church_r', -6.4, -30.3, 2.0, 1.0, [santan, pinkF]), bed('bed_munisipyo_l', 5.8, -30.5, 2.2, .9, [yellowF, pinkF]), bed('bed_munisipyo_r', 14.2, -30.5, 2.2, .9, [pinkF, yellowF]));
  [[-11, 11.5], [11, 11.5], [-11, -11.5], [11, -11.5]].forEach(([x, z], i) => beds.add(bed('bed_plaza_' + i, x, z * .82, 3.2, 1.2, [santan, pinkF, yellowF])));
  const rz = group('bed_rizal', -12, 0, 25); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + PI / 8; rz.add(bush('rizal_plant', Math.cos(a) * 2.0, Math.sin(a) * 2.0, .32, [santan, yellowF][i % 2])); } beds.add(rz);
  props.add(bake(beds)); }
const STALLS = { fishball: [-20, 4], taho: [20, 3.5], sorbetes: [-5.6, 10], lobo: [5.6, 10], ferris: [20.5, -8], perya: [-20.5, -9.6] };
{ const sh = group('shrubs'); const avoid = [[-10, -34, 8], [-16.2, -32.6, 3], [10, -33.5, 7.5], [3.4, -30.4, 1], [16.6, -30.4, 1], [-12, 25, 3], [11, 25.5, 4.6], [kalA.x + 11, kalA.z + 3.1, 4], ...PALMS.map(p => [p[1], p[2], 2]), ...ACAC.map(a => [a[1], a[2], 3.6]), [-11, 9.4, 2.4], [11, 9.4, 2.4], [-11, -9.4, 2.4], [11, -9.4, 2.4], ...Object.entries(STALLS).map(([k, [x, z]]) => [x, z, k === 'ferris' ? 4.2 : k === 'perya' ? 3.2 : 1.9])];
  let placed = 0; for (let t = 0; t < 2000 && placed < 36; t++) { const x = (rnd() * 2 - 1) * RX, z = IZ + (rnd() * 2 - 1) * RZ;
    if (!inIsland(x, z, .9) || Math.hypot(x, z) < 9.5 || nearPath(x, z, 1.3) || avoid.some(([ax, az, r]) => Math.hypot(x - ax, z - az) < r)) continue;
    sh.add(bush('shrub_' + (++placed), x, z, .45 + rnd() * .45, rnd() > .45 ? pick([pinkF, santan, yellowF]) : null)); }
  props.add(bake(sh)); }

// ---------- FIESTA STALLS (fill the lawns inside the loop) ----------
{ const fiesta = group('fiesta_stalls'); props.add(fiesta);
  const steel = std('steel', { color: '#C9CED6', metalness: .7, roughness: .35 }), yellowP = std('paint_yellow', { color: '#FFC93C', roughness: .5 }), blueP = std('paint_blue', { color: '#2E6FD8', roughness: .5 }), greenP = std('paint_green', { color: '#3BAA4A', roughness: .5 }), pinkP = std('paint_pink', { color: '#E8559A', roughness: .5 });
  const awning = std('awning_stripes', { map: tex(C(256, 256, (g, s) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#FBF7EF' : '#E2452E'; g.fillRect(i * 32, 0, 32, s); } }), 1, 'awning_stripes'), side: THREE.DoubleSide, roughness: .7 });
  const colorGame = own(std('color_game_board', { map: tex(C(384, 256, (g) => { ['#E2452E', '#2E6FD8', '#FFC93C', '#3BAA4A', '#FBF7EF', '#E8559A'].forEach((c, i) => { const x = (i % 3) * 128, y = ((i / 3) | 0) * 128; g.fillStyle = c; g.fillRect(x, y, 128, 128); g.strokeStyle = '#3B2316'; g.lineWidth = 6; g.strokeRect(x + 3, y + 3, 122, 122); }); }), 0, 'color_game'), roughness: .6 }));
  const signMat = t => own(std('sign_' + t.toLowerCase(), { map: plaque(t, '#FFF4DC', '#3B2316'), side: THREE.DoubleSide }));
  const strut = (n, a, b, r, m) => { const d = b.clone().sub(a), o = mesh(n, new THREE.CylinderGeometry(r, r, d.length(), 6), m, (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2); o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return o; };
  const wheels = (g, x, r, sep) => { for (const s of [-1, 1]) g.add(mesh('wheel', new THREE.TorusGeometry(r, .04, 5, 14), iron, x, r, s * sep)); g.add(mesh('axle', new THREE.CylinderGeometry(.03, .03, sep * 2, 6).rotateX(PI / 2), iron, x, r, 0)); };
  const umbrella = (g, x, y, r, cols) => { g.add(mesh('umbrella_pole', new THREE.CylinderGeometry(.03, .03, y, 6), iron, x, y / 2, 0)); for (let i = 0; i < 8; i++) g.add(mesh('umbrella_panel', new THREE.ConeGeometry(r, .45, 1, 1, true, i * PI / 4, PI / 4), cols[i % 2], x, y + .2, 0)); };
  const place = (name, rotY) => { const [x, z] = STALLS[name.split('_')[0]], g = group(name, x, 0, z); g.rotation.y = rotY; chk(name, x, z); return g; };
  { const g = place('fishball_cart', .5); wheels(g, -.35, .32, .44);
    g.add(B('cart', 1.4, .72, .8, blueP, 0, .34, 0), B('cart_trim', 1.44, .08, .84, yellowP, 0, .98, 0), B('counter', 1.5, .06, .9, steel, 0, 1.06, 0), B('stand_leg', .06, .34, .06, iron, .62, 0, 0));
    g.add(mesh('wok', new THREE.SphereGeometry(.3, 12, 6, 0, TAU, PI / 2, PI / 2), steel, -.32, 1.4, 0), mesh('oil', new THREE.CircleGeometry(.27, 12).rotateX(-PI / 2), coconutM, -.32, 1.32, 0));
    [domeRed, santan, yellowF].forEach((m, i) => g.add(mesh('sauce_jar', new THREE.CylinderGeometry(.07, .07, .22, 8), m, .25 + i * .17, 1.2, .22)));
    for (let i = 0; i < 5; i++) g.add(mesh('skewer', new THREE.CylinderGeometry(.01, .01, .35, 4), wood, .45 + (i % 3) * .04, 1.27, -.2 + i * .03));
    umbrella(g, .15, 2.1, 1.05, [yellowP, domeRed]); g.add(mesh('sign', new THREE.PlaneGeometry(1.1, .17), signMat('FISHBALL'), 0, .7, .41)); fiesta.add(bake(g)); }
  { const g = place('taho_vendor', -.5);
    for (const s of [-1, 1]) g.add(mesh('bucket', new THREE.CylinderGeometry(.26, .22, .5, 12), steel, s * .7, .25, 0), mesh('bucket_lid', new THREE.CylinderGeometry(.27, .27, .04, 12), steel, s * .7, .52, 0), mesh('lid_knob', new THREE.SphereGeometry(.04, 6, 4), steel, s * .7, .57, 0));
    g.add(mesh('yoke', new THREE.CylinderGeometry(.03, .03, 1.9, 6).rotateZ(PI / 2), wood, 0, .62, 0), B('table', .8, .7, .5, wood, 0, 0, -.85), B('stool', .35, .4, .35, wood, .9, 0, .6));
    for (let i = 0; i < 4; i++) g.add(mesh('cup', new THREE.CylinderGeometry(.05, .04, .1, 8), white, -.27 + i * .18, .75, -.85));
    g.add(mesh('sign_post', new THREE.CylinderGeometry(.03, .03, 1.7, 6), wood, .3, .85, -1.05), mesh('sign', new THREE.PlaneGeometry(.9, .25), signMat('TAHO'), .3, 1.6, -1.0)); fiesta.add(bake(g)); }
  { const g = place('sorbetes_cart', .3); wheels(g, -.35, .35, .4);
    g.add(B('body', 1.2, .6, .7, yellowP, 0, .35, 0), B('band_red', 1.22, .12, .72, domeRed, 0, .48, 0), B('band_blue', 1.22, .12, .72, blueP, 0, .74, 0), B('top', 1.24, .06, .74, white, 0, .95, 0));
    for (let i = 0; i < 3; i++) g.add(mesh('canister_lid', new THREE.CylinderGeometry(.12, .12, .07, 10), steel, -.35 + i * .35, 1.04, 0), mesh('lid_knob', new THREE.SphereGeometry(.035, 6, 4), steel, -.35 + i * .35, 1.1, 0));
    g.add(strut('handle', new THREE.Vector3(.6, .9, -.3), new THREE.Vector3(1.0, 1.05, -.3), .02, iron), strut('handle', new THREE.Vector3(.6, .9, .3), new THREE.Vector3(1.0, 1.05, .3), .02, iron), mesh('bell', new THREE.SphereGeometry(.05, 6, 4), gold, .6, 1.08, .3));
    umbrella(g, -.1, 2.0, .9, [greenP, pinkP]); g.add(mesh('sign', new THREE.PlaneGeometry(1.0, .15), signMat('SORBETES'), 0, .62, .361)); fiesta.add(bake(g)); }
  { const g = place('lobo_vendor', 0); g.add(mesh('post', new THREE.CylinderGeometry(.04, .05, 1.5, 6), wood, 0, .75, 0), B('base', .4, .1, .4, wood, 0, 0, 0)); const cols = [domeRed, yellowP, blueP, greenP, pinkP];
    for (let i = 0; i < 14; i++) { const a = i * 2.4, r = .25 + (i % 3) * .2, p = new THREE.Vector3(Math.cos(a) * r, 2.0 + (i % 4) * .22, Math.sin(a) * r); g.add(mesh('balloon', new THREE.SphereGeometry(.2, 8, 6), cols[i % 5], p.x, p.y, p.z), strut('string', new THREE.Vector3(0, 1.5, 0), p.clone().setY(p.y - .2), .006, white)); }
    fiesta.add(bake(g)); }
  { const g = place('ferris_wheel', -.35), Rw = 2.8, H = 3.4, cols = [domeRed, yellowP, greenP, pinkP];
    g.add(B('platform', 4.4, .25, 2.4, wood, 0, 0, 0), mesh('axle', new THREE.CylinderGeometry(.09, .09, 1.3, 8).rotateX(PI / 2), iron, 0, H, 0));
    for (const s of [-1, 1]) { g.add(mesh('rim', new THREE.TorusGeometry(Rw, .06, 5, 32), blueP, 0, H, s * .45));
      for (let k = 0; k < 4; k++) { const sp = mesh('spoke', new THREE.BoxGeometry(.05, Rw * 2, .05), white, 0, H, s * .45); sp.rotation.z = k * PI / 4; g.add(sp); }
      for (const dx of [-1.7, 1.7]) g.add(strut('leg', new THREE.Vector3(dx, .25, s * .75), new THREE.Vector3(0, H, s * .5), .07, white)); }
    for (let k = 0; k < 8; k++) { const a = k * PI / 4 + PI / 8, px = Math.sin(a) * Rw, py = H + Math.cos(a) * Rw;
      g.add(B('gondola', .6, .45, .72, cols[k % 4], px, py - .7, 0), B('gondola_roof', .7, .06, .82, white, px, py - .25, 0), mesh('hanger', new THREE.CylinderGeometry(.02, .02, .25, 4), iron, px, py - .13, 0)); }
    for (let k = 0; k < 24; k++) { const a = k / 24 * TAU; g.add(mesh('fiesta_bulb', new THREE.SphereGeometry(.06, 6, 4), fiestaBulb, Math.sin(a) * Rw, H + Math.cos(a) * Rw, .53)); }
    g.add(B('ticket_booth', .8, 1.1, .7, pinkP, 1.7, .25, 1.6), B('booth_roof', 1.0, .08, .9, yellowP, 1.7, 1.35, 1.6), mesh('sign', new THREE.PlaneGeometry(1.0, .3), signMat('PERYA'), 1.7, 1.05, 1.96));
    fiesta.add(bake(g)); }
  { const g = place('perya_color_game', .35);
    for (const x of [-1.4, 1.4]) for (const z of [-.8, .8]) g.add(mesh('post', new THREE.CylinderGeometry(.05, .05, 2.4, 6), wood, x, 1.2, z));
    const roof = B('awning', 3.2, .06, 2.1, awning, 0, 2.4, 0); roof.rotation.x = .12; g.add(roof);
    g.add(B('counter', 2.8, .9, .7, wood, 0, 0, .55), mesh('color_board', new THREE.PlaneGeometry(1.2, .8).rotateX(-PI / 2), colorGame, 0, .915, .55), B('prize_shelf', 2.6, 1.3, .3, wood, 0, .5, -.6));
    for (let i = 0; i < 8; i++) g.add(B('prize', .22, .22 + (i % 3) * .08, .2, [domeRed, yellowP, blueP, greenP, pinkP][i % 5], -1.05 + i * .3, 1.82, -.6));
    g.add(mesh('sign', new THREE.PlaneGeometry(1.6, .38), signMat('COLOR GAME'), 0, 2.1, .86)); fiesta.add(bake(g)); }
}

// ---------- BANDERITAS ----------
{ const bd = group('banderitas'), tri = new THREE.Shape(); tri.moveTo(-.14, 0); tri.lineTo(.14, 0); tri.lineTo(0, -.34); const tg = new THREE.ShapeGeometry(tri);
  lampTops.forEach((end, i) => { const dir = end.clone().setY(0).normalize(), start = new THREE.Vector3(dir.x * .7, 6.2, dir.z * .7), pts = [];
    for (let j = 0; j <= 20; j++) { const t = j / 20, p = start.clone().lerp(end, t); p.y -= Math.sin(PI * t) * .55; pts.push(p); }
    const curve = new THREE.CatmullRomCurve3(pts); bd.add(mesh('string', new THREE.TubeGeometry(curve, 24, .015, 4), iron)); const yaw = Math.atan2(-dir.z, dir.x);
    for (let j = 1; j < 16; j++) { const p = curve.getPoint(j / 16), f = mesh('flag', tg, bandColors[(j + i) % 4], p.x, p.y, p.z); f.rotation.y = yaw; bd.add(f); if (j % 2) bd.add(mesh('fiesta_bulb', new THREE.SphereGeometry(.06, 6, 4), fiestaBulb, p.x, p.y + .03, p.z)); } });
  root.add(bake(bd)); }

// ---------- ISLETS ----------
{ const isl = group('islets'); const f = a => 1 + .07 * Math.cos(3 * a + 1) + .05 * Math.cos(2 * a);
  const i1 = group('islet_palm', -50, -2.5, -6); i1.add(islandBody('body', 3.6, 3.2, 4, f, 6, 0, 40), palm('palm', 0, 0, 5.5, .9, PI * .8), bush('bush', 1.6, 1.2, .45, null)); isl.add(bake(i1));
  const i2 = group('islet_acacia', 49, 1.5, -20); i2.add(islandBody('body', 3.4, 3.2, 4.2, f, 6, 0, 40), acacia('acacia', 0, 0, .55), bush('bush', -1.8, .8, .4, pinkF)); isl.add(bake(i2));
  const i3 = group('islet_bougainvillea', 36, -3.5, 40); i3.add(islandBody('body', 2.6, 2.4, 3.2, f, 5, 0, 36), bush('bougainvillea_1', -.5, 0, .7, pinkF), bush('bougainvillea_2', .8, .6, .5, pinkF), bush('santan', .3, -.9, .4, santan)); isl.add(bake(i3));
  root.add(isl); }

// ---------- BOARD: 80-space main loop + 22-space back street (fork M31 → merge M49) + kalesa shortcut (M68 → M12) ----------
const EVENTS = { kampana: 1, munisipyo: 1, banda: 1, rizal: 1, kalesa: 1 };
const TYPES = { simula: '#3B2316', piso: '#2E6FD8', utang: '#E2452E', swerte: '#F2B705', tikbalang: '#7B4BC4', sarisari: '#13A39A', jackenpoy: '#F07C1E', kasama: '#3BAA4A', tanong: '#E8559A', kampana: '#FFF4DC', munisipyo: '#FFF4DC', banda: '#FFF4DC', rizal: '#FFF4DC', kalesa: '#FFF4DC' };
function tileTex(type) { const ev = EVENTS[type]; return tex(C(256, 256, (g, s) => { g.fillStyle = TYPES[type]; g.fillRect(0, 0, s, s); g.lineWidth = 7; g.strokeStyle = ev ? '#C9A24B' : 'rgba(255,255,255,.6)'; g.beginPath(); g.arc(128, 128, 112, 0, TAU); g.stroke();
  g.lineJoin = 'round'; g.strokeStyle = ev ? '#FFF4DC' : '#3B2316'; g.fillStyle = ev ? '#3B2316' : '#FFFFFF'; g.lineWidth = 12; g.textAlign = 'center'; g.textBaseline = 'middle';
  const txt = (t, size, y = 134) => { g.font = `900 ${size}px "Arial Black", Arial, sans-serif`; g.strokeText(t, 128, y); g.fillText(t, 128, y); };
  const shape = draw => { g.beginPath(); draw(); g.stroke(); g.fill(); };
  if (type === 'simula') { txt('SIMULA', 46, 112); txt('→', 80, 170); }
  else if (type === 'piso') txt('+₱', 110); else if (type === 'utang') txt('−₱', 110); else if (type === 'tanong') txt('?', 150); else if (type === 'jackenpoy') txt('VS', 100); else if (type === 'tikbalang') txt('←3', 100);
  else if (type === 'banda') txt('♪♫', 100); else if (type === 'rizal') txt('R', 140);
  else if (type === 'swerte') shape(() => { for (let i = 0; i < 10; i++) { const a = -PI / 2 + i * PI / 5, r = i % 2 ? 36 : 82; g.lineTo(128 + Math.cos(a) * r, 132 + Math.sin(a) * r); } g.closePath(); });
  else if (type === 'sarisari') { shape(() => g.rect(72, 118, 112, 68)); shape(() => { g.moveTo(58, 120); g.lineTo(198, 120); g.lineTo(178, 78); g.lineTo(78, 78); g.closePath(); }); g.fillStyle = '#E2452E'; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(84 + i * 26, 80); g.lineTo(96 + i * 26, 80); g.lineTo(92 + i * 28, 118); g.lineTo(76 + i * 28, 118); g.fill(); } g.fillStyle = '#3B2316'; g.fillRect(112, 140, 32, 46); }
  else if (type === 'kasama') for (const x of [94, 162]) { shape(() => g.arc(x, 96, 24, 0, TAU)); shape(() => g.roundRect(x - 32, 128, 64, 60, 22)); }
  else if (type === 'kampana') { shape(() => { g.moveTo(128, 56); g.bezierCurveTo(90, 56, 86, 100, 84, 146); g.lineTo(64, 176); g.lineTo(192, 176); g.lineTo(172, 146); g.bezierCurveTo(170, 100, 166, 56, 128, 56); g.closePath(); }); shape(() => g.arc(128, 194, 14, 0, TAU)); }
  else if (type === 'munisipyo') { shape(() => { g.moveTo(60, 100); g.lineTo(128, 56); g.lineTo(196, 100); g.closePath(); }); for (const x of [76, 108, 140, 172]) shape(() => g.rect(x - 8, 108, 16, 60)); shape(() => g.rect(56, 170, 144, 16)); }
  else if (type === 'kalesa') { g.strokeStyle = '#3B2316'; g.lineWidth = 12; g.beginPath(); g.arc(128, 128, 62, 0, TAU); g.stroke(); g.lineWidth = 8; for (let i = 0; i < 8; i++) { const a = i * PI / 4; g.beginPath(); g.moveTo(128, 128); g.lineTo(128 + Math.cos(a) * 62, 128 + Math.sin(a) * 62); g.stroke(); } g.beginPath(); g.arc(128, 128, 14, 0, TAU); g.fill(); }
}), 0, 'tile_' + type); }
const tileMats = Object.fromEntries(Object.keys(TYPES).map(t => [t, own(std('tile_' + t, { map: tileTex(t), roughness: .45 }))]));
const SPM = { 0: 'simula', 2: 'sarisari', 3: 'tanong', 5: 'kasama', 6: 'kampana', 7: 'utang', 9: 'sarisari', 10: 'swerte', 11: 'utang', 12: 'kalesa', 14: 'jackenpoy', 15: 'kasama', 16: 'swerte', 18: 'utang',
  19: 'banda', 20: 'banda', 22: 'tanong', 23: 'tanong', 25: 'tikbalang', 26: 'munisipyo', 27: 'utang', 28: 'swerte', 30: 'jackenpoy', 32: 'sarisari', 34: 'kasama', 35: 'utang', 36: 'kampana',
  37: 'jackenpoy', 39: 'utang', 40: 'swerte', 41: 'sarisari', 43: 'kasama', 44: 'tikbalang', 46: 'tanong', 47: 'utang', 48: 'banda', 50: 'tanong', 52: 'kasama', 53: 'munisipyo', 54: 'swerte',
  56: 'utang', 57: 'jackenpoy', 58: 'tikbalang', 60: 'banda', 61: 'sarisari', 62: 'utang', 64: 'jackenpoy', 65: 'kampana', 66: 'tanong', 68: 'swerte', 70: 'tikbalang', 71: 'kasama', 72: 'rizal',
  74: 'banda', 76: 'rizal', 77: 'tanong', 78: 'utang', 79: 'swerte' };
const MAIN = Array.from({ length: NM }, (_, i) => SPM[i] || 'piso');
const BRANCH = ['piso', 'swerte', 'piso', 'utang', 'munisipyo', 'munisipyo', 'sarisari', 'munisipyo', 'piso', 'tanong', 'jackenpoy', 'utang', 'piso', 'kampana', 'sarisari', 'jackenpoy', 'kampana', 'piso', 'swerte', 'utang', 'kampana', 'piso'];
const KOR = new Set(['M06', 'M22', 'M33', 'M43', 'M53', 'M63', 'M74', 'B05', 'B12', 'B20']);
const pad = n => String(n).padStart(2, '0');
{ const spaces = group('board_spaces'), graph = [];
  const addSpace = (id, type, p) => { const big = type === 'simula', R = big ? .85 : .58, g = group(`space_${id}_${type}`, p.x, .05, p.z);
    g.add(mesh('rim', new THREE.CylinderGeometry(R + .1, R + .14, .18, 24), white, 0, .09, 0), mesh('top', new THREE.CircleGeometry(R, 32).rotateX(-PI / 2), tileMats[type], 0, .182, 0));
    if (KOR.has(id)) g.add(mesh('korona_spot_ring', new THREE.TorusGeometry(R + .22, .045, 4, 32).rotateX(PI / 2), gold, 0, .1, 0));
    const node = { id, type, x: +p.x.toFixed(2), z: +p.z.toFixed(2), next: [], koronaSpot: KOR.has(id) }; g.userData = node; graph.push(node); spaces.add(g); };
  MAIN.forEach((t, i) => addSpace('M' + pad(i), t, M(i))); BRANCH.forEach((t, j) => addSpace('B' + pad(j), t, Bp(j)));
  graph.forEach(n => { const k = +n.id.slice(1); n.next.push(n.id[0] === 'M' ? 'M' + pad((k + 1) % NM) : (k === NB - 1 ? 'M' + pad(MERGE) : 'B' + pad(k + 1))); });
  graph.find(n => n.id === 'M' + pad(FORK)).next.push('B00'); Object.assign(graph.find(n => n.id === 'M' + pad(KAL_B)), { kalesaTo: 'M' + pad(KAL_A), kalesaCost: 8 });   // the kalesa leaves from M12 for M68 (along its road)
  spaces.userData = { board: 'plaza', start: 'M00', mainLoop: NM, branch: NB, fork: 'M' + pad(FORK), merge: 'M' + pad(MERGE), kalesa: { from: 'M' + pad(KAL_B), to: 'M' + pad(KAL_A), cost: 8 }, koronaSpots: [...KOR], activeKoronaRange: [1, 5], nodes: graph };
  window.__plazaBoard = spaces.userData; root.add(spaces); }

// ---------- PLAZA EXTRAS: laro ng lahi, court, playground, fountain, food carts + fill ----------
{ const GS = 1, x0 = -RX, z0 = IZ - RZ, nx = Math.ceil(2 * RX) + 1, nz = Math.ceil(2 * RZ) + 1, occ = new Uint8Array(nx * nz);
  const cell = (x, z) => [Math.round((x - x0) / GS), Math.round((z - z0) / GS)];
  const mark = (x, z, r) => { const [ci, cj] = cell(x, z), rr = Math.ceil(r / GS); for (let j = cj - rr; j <= cj + rr; j++) for (let i = ci - rr; i <= ci + rr; i++) if (i >= 0 && j >= 0 && i < nx && j < nz) occ[j * nx + i] = 1; };
  const isFree = (x, z, r) => { if (![[0, 0], [r, 0], [-r, 0], [0, r], [0, -r]].every(([a, b]) => inIsland(x + a, z + b, .95))) return false; const [ci, cj] = cell(x, z), rr = Math.ceil(r / GS); for (let j = cj - rr; j <= cj + rr; j++) for (let i = ci - rr; i <= ci + rr; i++) { if ((i - ci) ** 2 + (j - cj) ** 2 > rr * rr) continue; if (i < 0 || j < 0 || i >= nx || j >= nz || occ[j * nx + i]) return false; } return true; };
  root.updateMatrixWorld(true); const v = new THREE.Vector3(); [props, landmarks].forEach(gr => gr.traverse(o => { if (!o.isMesh || /^shrubs__/.test(o.name)) return; const p = o.geometry.attributes.position; for (let k = 0; k < p.count; k += 3) { v.fromBufferAttribute(p, k).applyMatrix4(o.matrixWorld); if (v.y < 1.2 && v.y > -.6) mark(v.x, v.z, .5); } }));
  PATHS.forEach(([pts, w]) => pts.forEach(p => mark(p.x, p.z, w / 2 + .8))); mark(0, 0, 8.6);
  const spot = r => { for (let t = 0; t < 12000; t++) { const x = (rnd() * 2 - 1) * RX * .9, z = IZ + (rnd() * 2 - 1) * RZ * .9; if (isFree(x, z, r)) { mark(x, z, r * .85); return [x, z]; } } return null; };
  const S = (n, a, b, r, m) => { const d = b.clone().sub(a), o = mesh(n, new THREE.CylinderGeometry(r, r, d.length(), 6), m, (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2); o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return o; }, V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const chalk = std('chalk_lines', { color: '#FFFFFF', roughness: .9 }), orange = std('paint_orange', { color: '#F07C1E', roughness: .5 }), blueP = std('paint_blue_x', { color: '#2E6FD8', roughness: .5 }), yellowP = std('paint_yellow_x', { color: '#FFC93C', roughness: .5 }), greenP = std('paint_green_x', { color: '#3BAA4A', roughness: .5 }), waterP = std('fountain_water', { color: '#8FD3E8', roughness: .05, metalness: .2, transparent: true, opacity: .85 }), sandP = std('play_sand', { color: '#E9D9B6', roughness: .95 });
  const ex = group('plaza_extras'); const put = (r, fn) => { const s = spot(r); if (s) { const g = fn(s[0], s[1]); g.rotation.y = g.rotation.y || (rnd() - .5) * .8; ex.add(g); } };
  put(5.4, (x, z) => { const g = group('basketball_court', x, 0, z); g.scale.setScalar(.72); g.add(B('slab', 14, .06, 8, granite, 0, 0, 0)); for (const s of [-1, 1]) g.add(B('line', 14, .01, .08, chalk, 0, .06, s * 3.9), B('line', .08, .01, 8, chalk, s * 6.95, .06, 0));
    g.add(B('line', .08, .01, 8, chalk, 0, .06, 0), mesh('circle', new THREE.TorusGeometry(1.6, .04, 3, 32).rotateX(PI / 2), chalk, 0, .07, 0));
    for (const s of [-1, 1]) { g.add(mesh('hoop_pole', new THREE.CylinderGeometry(.08, .1, 3.4, 8), iron, s * 7.6, 1.7, 0), B('backboard', .06, .9, 1.4, white, s * 7.2, 2.7, 0), mesh('rim', new THREE.TorusGeometry(.23, .025, 4, 16).rotateX(PI / 2), orange, s * 6.9, 3.05, 0), mesh('net', new THREE.CylinderGeometry(.23, .15, .4, 10, 1, true), chalk, s * 6.9, 2.83, 0)); }
    g.add(mesh('ball', new THREE.SphereGeometry(.12, 10, 8), orange, 2, .12, 1.5)); return g; });
  put(5.4, (x, z) => { const g = group('palaruan', x, 0, z); g.add(mesh('sand_pad', new THREE.CylinderGeometry(5, 5, .04, 32), sandP, 0, .02, 0));
    const sw = group('swing', -2, 0, -1.5); for (const s of [-1, 1]) sw.add(S('a_frame', V3(s * 1.6, 0, -.7), V3(s * 1.6, 2.4, 0), .05, domeRed), S('a_frame', V3(s * 1.6, 0, .7), V3(s * 1.6, 2.4, 0), .05, domeRed)); sw.add(S('top', V3(-1.6, 2.4, 0), V3(1.6, 2.4, 0), .05, domeRed));
    for (const s of [-1, 1]) { sw.add(B('seat', .5, .05, .25, yellowP, s * .7, .55, 0)); for (const c of [-.2, .2]) sw.add(S('chain', V3(s * .7 + c, .58, 0), V3(s * .7 + c, 2.4, 0), .01, iron)); } g.add(sw);
    const sl = group('slide', 2, 0, -1); sl.add(B('platform', .9, .08, .9, blueP, 0, 1.6, 0)); for (const a of [-.4, .4]) for (const b of [-.4, .4]) sl.add(mesh('leg', new THREE.CylinderGeometry(.04, .04, 1.6, 5), iron, a, .8, b)); const ch = B('chute', .7, .06, 2.6, yellowP, 0, .8, 1.5); ch.rotation.x = .6; sl.add(ch); sl.add(S('ladder', V3(0, 0, -1.4), V3(0, 1.6, -.45), .05, iron)); g.add(sl);
    const ss = group('seesaw', 0, 0, 2.4); ss.add(mesh('pivot', new THREE.CylinderGeometry(.15, .2, .45, 8), iron, 0, .22, 0)); const bd = B('board', 3, .06, .3, greenP, 0, .45, 0); bd.rotation.z = .15; ss.add(bd); g.add(ss); return g; });
  put(3.4, (x, z) => { const g = group('fountain', x, 0, z); g.add(mesh('basin', new THREE.CylinderGeometry(2.8, 3, .55, 32), stucco, 0, .27, 0), mesh('water', new THREE.CylinderGeometry(2.55, 2.55, .05, 32), waterP, 0, .5, 0), mesh('pillar', new THREE.CylinderGeometry(.25, .35, 1.4, 12), stucco, 0, .9, 0), mesh('bowl', new THREE.CylinderGeometry(1.0, .3, .35, 16), stucco, 0, 1.6, 0), mesh('bowl_water', new THREE.CylinderGeometry(.9, .9, .04, 16), waterP, 0, 1.76, 0), mesh('top', new THREE.SphereGeometry(.18, 10, 8), gold, 0, 2.0, 0));
    for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; g.add(mesh('spout', new THREE.ConeGeometry(.08, .9, 6), waterP, Math.cos(a) * 1.3, .9, Math.sin(a) * 1.3)); } return g; });
  [['KWEK-KWEK', orange], ['ISAW', domeRed], ['MAIS', yellowP]].forEach(([n, m]) => put(2.4, (x, z) => { const g = group('food_cart_' + n.toLowerCase(), x, 0, z); for (const s of [-1, 1]) g.add(mesh('wheel', new THREE.TorusGeometry(.3, .04, 5, 14), iron, -.35, .3, s * .45)); g.add(B('cart', 1.3, .7, .8, m, 0, .32, 0), B('counter', 1.4, .05, .9, iron, 0, 1.02, 0), mesh('wok', new THREE.SphereGeometry(.25, 10, 5, 0, TAU, PI / 2, PI / 2), iron, -.3, 1.3, 0), mesh('sign', new THREE.PlaneGeometry(1.1, .22), own(std('sign_' + n, { map: plaque(n, '#FFF4DC', '#3B2316', 512, 96, 52), side: THREE.DoubleSide })), 0, .7, .41));
    g.add(mesh('pole', new THREE.CylinderGeometry(.03, .03, 2.1, 6), iron, .2, 1.05, 0)); for (let k = 0; k < 8; k++) g.add(mesh('umbrella', new THREE.ConeGeometry(1.0, .42, 1, 1, true, k * PI / 4, PI / 4), k % 2 ? yellowP : domeRed, .2, 2.25, 0)); for (const s of [-1, 1]) g.add(mesh('stool', new THREE.CylinderGeometry(.16, .16, .45, 8), blueP, 1.0, .22, s * .55)); return g; }));
  put(2.6, (x, z) => { const g = group('piko', x, 0, z); [[0, 0], [0, .7], [-.35, 1.4], [.35, 1.4], [0, 2.1], [-.35, 2.8], [.35, 2.8], [0, 3.5]].forEach(([a, b]) => { for (const s of [-1, 1]) g.add(B('chalk', .7, .01, .04, chalk, a, .01, b - 1.75 + s * .33), B('chalk', .04, .01, .7, chalk, a + s * .33, .01, b - 1.75)); }); g.add(mesh('pamato', new THREE.CylinderGeometry(.06, .06, .02, 8), granite, .1, .02, -.3)); return g; });
  put(4.3, (x, z) => { const g = group('patintero', x, 0, z); for (let k = 0; k <= 3; k++) g.add(B('chalk', 8, .01, .06, chalk, 0, .01, -2.1 + k * 1.4)); for (const s of [-1, 0, 1]) g.add(B('chalk', .06, .01, 4.2, chalk, s * 4, .01, 0)); return g; });
  put(2.6, (x, z) => { const g = group('tumbang_preso', x, 0, z); g.add(mesh('circle', new THREE.TorusGeometry(.45, .03, 3, 24).rotateX(PI / 2), chalk, 0, .02, 0), mesh('lata', new THREE.CylinderGeometry(.08, .08, .2, 12), domeRed, 0, .1, 0), B('throw_line', 2.4, .01, .06, chalk, 0, .01, 2.2)); for (let k = 0; k < 3; k++) { const t = B('tsinelas', .12, .025, .3, [blueP, yellowP, greenP][k], -.6 + k * .55, .01, 1.9 + (k % 2) * .2); t.rotation.y = rnd(); g.add(t); } return g; });
  for (let k = 0; k < 9; k++) put(2.8, (x, z) => acacia('acacia_x' + k, x, z, .9 + rnd() * .3));
  for (let k = 0; k < 11; k++) put(2.2, (x, z) => palm('palm_x' + k, x, z, 6.5 + rnd() * 1.5, .8 + rnd() * .6, rnd() * TAU));
  for (let k = 0; k < 5; k++) put(2.2, (x, z) => { const g = group('tiangge_' + k, x, 0, z), c = [domeRed, blueP, greenP, yellowP, orange][k]; for (const a of [-1.1, 1.1]) for (const b of [-.8, .8]) g.add(mesh('post', new THREE.CylinderGeometry(.04, .04, 2.2, 5), iron, a, 1.1, b)); g.add(mesh('tent_roof', hipRoof(2.4, 1.8, .7, 1.2, .2), c, 0, 2.2, 0), B('table', 2.0, .75, .8, wood, 0, 0, .2));
    for (let q = 0; q < 6; q++) g.add(B('goods', .25, .2 + rnd() * .2, .2, [white, domeRed, blueP, yellowP, greenP][q % 5], -.75 + q * .3, .75, .2)); return g; });
  for (let k = 0; k < 13; k++) put(1.7, (x, z) => { const g = group('bench_lamp_' + k, x, 0, z); g.add(B('seat', 1.6, .07, .45, wood, 0, .42, 0), B('back', 1.6, .3, .05, wood, 0, .58, -.22)); for (const s of [-1, 1]) g.add(B('leg', .07, .45, .45, iron, s * .68, 0, 0)); g.add(lamp('lamp', 1.3, 0)); return g; });
  for (let k = 0; k < 10; k++) put(2.0, (x, z) => bed('bed_x' + k, x, z, 2.6, 1.2, [pinkF, santan, yellowF]));
  props.add(bake(ex));
  const fill = group('plaza_fill'), tuft = [std('grass_tuft_a', { color: '#5FA83A' }), std('grass_tuft_b', { color: '#86C24E' })], wf = [pinkF, santan, yellowF, white];
  let n = 0; for (let t = 0; t < 30000 && n < 1400; t++) { const x = (rnd() * 2 - 1) * RX, z = IZ + (rnd() * 2 - 1) * RZ; const [i, j] = cell(x, z); if (i < 0 || j < 0 || i >= nx || j >= nz || occ[j * nx + i] || !inIsland(x, z, .92)) continue; n++; const k = rnd();
    if (k < .6) for (let q = 0; q < 5; q++) { const bl = mesh('grass', new THREE.ConeGeometry(.045, .3 + rnd() * .3, 4), pick(tuft), x + (rnd() - .5) * .3, .17, z + (rnd() - .5) * .3); bl.rotation.set((rnd() - .5) * .6, 0, (rnd() - .5) * .6); fill.add(bl); }
    else if (k < .85) for (let q = 0; q < 4; q++) fill.add(mesh('wildflower', new THREE.IcosahedronGeometry(.07, 0), pick(wf), x + (rnd() - .5) * .5, .22, z + (rnd() - .5) * .5));
    else fill.add(bush('palumpong_' + n, x, z, .35 + rnd() * .35, rnd() < .4 ? pick(wf) : null)); }
  props.add(bake(fill)); }

let tris = 0; root.traverse(o => { if (o.isMesh) tris += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3; });


return { root, inIsland, RX, RZ, IZ };
}
