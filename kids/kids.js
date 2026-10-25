// Taympers playable kids — v5 (measured against Reference A: head W/H 0.91, shirt+sleeves = 1.3× head width, broad rounded shoulders, low-set eyes)
// v4 base: smooth toy-figure construction (Reference A: compact Stumbler-like body language).
// One skinned body per kid: swept superellipse torso / arms-with-mitten-hands / legs bend smoothly across joints.
// Units: meters, y-up, feet at y=0, facing +z. Game scale: ×60 ≈ current kid3() size (56 units).
import { sweep, ell, shell, skinWeights, surface, smooth, sp, LOD } from './kidgeo.js';
export const PAL = { hair: '#2A1A12', slip: '#3A7BD5', strap: '#F7F4EE', shorts: '#34466E', eye: '#1E1410', mouth: '#3A1A12', mouthIn: '#5A1A10', wood: '#8A5A2B', bandage: '#EBCBA0' };

export const KIDS = [
  { id: 'bunso', name: 'Bunso', face: { tilt: 0.04, lid: 1, brow: 0.02 }, gap: true, color: '#2FA35A', dark: '#1D703C', skin: '#B57A4E', hair: 'curly', top: 'tank', shorts: 0.1, prop: 'tirador', smile: 'grin', noseBandage: true, tempo: 1.1, posture: { 'chest.x': -0.03 } },
  { id: 'neneng', name: 'Neneng', face: { tilt: 0.2, lid: 0.86, brow: 0.08 }, color: '#F2B21B', dark: '#B57F05', skin: '#D9A06F', hair: 'pigtails', top: 'dress', prop: 'flower', smile: 'smile', tempo: 1.0, posture: { 'head.z': 0.07 } },
  { id: 'totoy', name: 'Totoy', face: { tilt: 0.06, lid: 1, brow: 0 }, color: '#2E6FD8', dark: '#1C4A9A', skin: '#A86F44', hair: 'bowl', top: 'tee', width: 1.1, chub: 1.12, cheek: 1.06, sleeve: 0.095, print: 'bangus', shorts: 0.13, smile: 'smile', tempo: 0.88, posture: { 'spine.x': -0.04, 'head.x': 0.03 } },
  { id: 'jun', name: 'Jun', face: { tilt: 0.14, lid: 0.82, brow: 0.2 }, color: '#E2452E', dark: '#A92A18', skin: '#C68A5B', hair: 'long', hat: 'capBack', top: 'tee', sleeve: 0.06, shorts: 0.1, smile: 'grin', cheekBandage: true, tempo: 1.05, posture: { 'hips.z': 0.03, 'head.z': -0.04 } },
];

// The other kids of the barrio: minigame helpers, the cheering crowd and the Kasama allies (Lito, Mayumi, Boyet, Dodong).
// Built with the same body, face and clothes as the four players; their shirt colours stay clear of the players' red, yellow, blue and green.
export const NPC_KIDS = [
  { id: 'lito', name: 'Lito', face: { tilt: 0.08, lid: 1, brow: 0.04 }, color: '#F7F4EE', dark: '#C9C2B4', skin: '#B57A4E', hair: 'bowl', top: 'tee', sleeve: 0.06, shorts: 0.11, smile: 'smile', tempo: 1 },
  { id: 'mayumi', name: 'Mayumi', face: { tilt: 0.18, lid: 0.9, brow: 0.06 }, color: '#F28DB2', dark: '#C2577F', skin: '#D9A06F', hair: 'pigtails', top: 'tee', sleeve: 0.06, shorts: 0.1, smile: 'smile', tempo: 1.02 },
  { id: 'boyet', name: 'Boyet', face: { tilt: 0.05, lid: 1, brow: 0.02 }, color: '#5BC0BE', dark: '#36908E', skin: '#A86F44', hair: 'curly', top: 'tank', shorts: 0.12, smile: 'grin', tempo: 0.95 },
  { id: 'dodong', name: 'Dodong', face: { tilt: 0.12, lid: 0.85, brow: 0.12 }, color: '#8E6CC9', dark: '#5E4596', skin: '#C68A5B', hair: 'long', top: 'tee', sleeve: 0.06, shorts: 0.1, smile: 'grin', tempo: 1.04 },
];

// Shared proportions (kid space, zero pose). Measured: head+hair ≈ 43% of height, shirt ≈ 29.5%, lower body ≈ 27.5% (Reference A: 43 / 29 / 27).
export const BODY = {
  hips: 0.315, armX: 0.16, legX: 0.075, skullY: 0.112,
  head: { y0: -0.17, y1: 0.19, rx: 0.163, rz: 0.156, n: 2.15, w: [[0, 0.96, 0.96], [0.27, 1.045, 1.02], [0.55, 1.0, 1.0], [0.82, 0.96, 0.97], [1, 0.93, 0.93]] },
  torso: [[0.245, 0], [0.248, 0.13], [0.258, 0.168], [0.28, 0.171], [0.33, 0.17], [0.4, 0.173], [0.45, 0.173], [0.488, 0.165], [0.514, 0.143], [0.534, 0.098], [0.547, 0]],
  dress: [[0.135, 0], [0.137, 0.18], [0.146, 0.222], [0.168, 0.22], [0.215, 0.2], [0.275, 0.183], [0.335, 0.173], [0.4, 0.173], [0.45, 0.173], [0.488, 0.165], [0.514, 0.143], [0.534, 0.098], [0.547, 0]],
  shorts: [[0.19, 0], [0.193, 0.11], [0.205, 0.155], [0.232, 0.163], [0.255, 0.158], [0.29, 0.148], [0.32, 0.138], [0.338, 0.11], [0.345, 0]],
  // arm incl. mitten hand, relative to shoulder joint; [y, rx(side), rz(front-back)]
  arm: [[-0.27, 0, 0], [-0.264, 0.03, 0.036], [-0.248, 0.043, 0.053], [-0.225, 0.047, 0.058], [-0.2, 0.043, 0.051], [-0.183, 0.039, 0.044], [-0.145, 0.042, 0.045], [-0.1, 0.045, 0.047], [-0.055, 0.048, 0.049], [-0.015, 0.051, 0.051], [0.012, 0.049, 0.049], [0.028, 0.036, 0.036], [0.034, 0, 0]],
  leg: [[-0.235, 0, 0], [-0.228, 0.036, 0.036], [-0.214, 0.047, 0.047], [-0.19, 0.052, 0.053], [-0.15, 0.056, 0.057], [-0.11, 0.055, 0.056], [-0.07, 0.059, 0.06], [-0.03, 0.062, 0.062], [0.01, 0.062, 0.062], [0.035, 0.05, 0.05], [0.045, 0, 0]],
  eye: { x: 0.056, y: -0.042, r: 0.0125, len: 0.03 }, mouthY: -0.102,
};

export const JOINTS = ['root', 'hips', 'spine', 'chest', 'neck', 'head', 'upperArm_L', 'lowerArm_L', 'hand_L', 'upperArm_R', 'lowerArm_R', 'hand_R', 'upperLeg_L', 'lowerLeg_L', 'foot_L', 'upperLeg_R', 'lowerLeg_R', 'foot_R'];
const BI = (n) => JOINTS.indexOf(n);
function rng(seed) { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); }

function floralTexture(THREE, base, center) {
  const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d');
  g.fillStyle = base; g.fillRect(0, 0, 512, 512); const r = rng(5);
  for (const [bx, by] of [[70, 90], [250, 60], [420, 120], [140, 260], [340, 270], [60, 430], [240, 440], [440, 400]]) {
    const x = bx + (r() - 0.5) * 40, y = by + (r() - 0.5) * 40, s = 30 + r() * 10;
    for (const dx of [-512, 0, 512]) {
      g.save(); g.translate(x + dx, y); g.rotate(r() * 6);
      for (let k = 0; k < 5; k++) { g.rotate((Math.PI * 2) / 5); g.beginPath(); g.ellipse(0, -s * 0.85, s * 0.55, s * 0.8, 0, 0, Math.PI * 2); g.fillStyle = '#FFF6E6'; g.fill(); }
      g.beginPath(); g.arc(0, 0, s * 0.42, 0, Math.PI * 2); g.fillStyle = center; g.fill(); g.restore();
    }
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 1.6); return t;
}
function printTexture(THREE, text) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 128; const g = c.getContext('2d');
  g.fillStyle = '#FFF6E6'; g.font = 'italic 900 88px Nunito, "Segoe UI", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(text, 256, 58); g.fillRect(120, 104, 272, 9);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const scaleX = (pts, w, kz) => pts.map(([y, r]) => [y, r * w, r * kz]);

export function buildKid(THREE, def) {
  const mats = {};
  const mat = (key, color, o = {}) => {
    if (mats[key]) return mats[key];
    const m = new THREE.MeshStandardMaterial({ color, roughness: o.r ?? 0.6, metalness: 0, ...(o.x || {}) });
    m.name = def.id + '_' + key; mats[key] = m; return m;
  };
  const skin = mat('skin', def.skin, { r: 0.5 }), hair = mat('hair', PAL.hair, { r: 0.42 }), shirt = mat('shirt', def.color, { r: 0.62 }), dark = mat('accent', def.dark, { r: 0.55 });
  const capM = mat('cap', def.color, { r: 0.34 });
  const eyeM = mat('eye', PAL.eye, { r: 0.35 }), mouthM = mat('mouth', PAL.mouth, { r: 0.5 }), shortsM = mat('shorts', PAL.shorts, { r: 0.66 });
  const V = (x, y, z) => new THREE.Vector3(x, y, z), Z = V(0, 0, 1);
  const add = (name, geo, m, parent, x = 0, y = 0, z = 0) => { const me = new THREE.Mesh(geo, m); me.name = name; me.position.set(x, y, z); parent.add(me); return me; };
  const grp = (name, parent, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.name = name; g.position.set(x, y, z); parent.add(g); return g; };

  const w = def.width || 1, ch = def.chub || 1, B = BODY, LX = B.legX + (ch - 1) * 0.05, AX = (def.top === 'tank' ? B.armX - 0.014 : B.armX) * w;
  const kid = new THREE.Group(); kid.name = def.name;
  const J = {}, skinned = [];
  const joint = (n, p, x, y, z) => { const b = new THREE.Bone(); b.name = n; b.position.set(x, y, z); (p ? J[p] : kid).add(b); return (J[n] = b); };
  joint('root', null, 0, 0, 0);
  joint('hips', 'root', 0, B.hips, 0); joint('spine', 'hips', 0, 0.04, 0); joint('chest', 'spine', 0, 0.1, 0);
  joint('neck', 'chest', 0, 0.09, 0); joint('head', 'neck', 0, 0.02, 0);
  const SH = B.hips + 0.14 + 0.012, UL = B.hips - 0.02;
  for (const s of [1, -1]) {
    const S = s > 0 ? 'L' : 'R';
    joint('upperArm_' + S, 'chest', s * AX, 0.012, 0); joint('lowerArm_' + S, 'upperArm_' + S, 0, -0.1, 0); joint('hand_' + S, 'lowerArm_' + S, 0, -0.085, 0);
    joint('upperLeg_' + S, 'hips', s * LX, -0.02, 0); joint('lowerLeg_' + S, 'upperLeg_' + S, 0, -0.11, 0); joint('foot_' + S, 'lowerLeg_' + S, 0, -0.11, 0);
  }
  const addSkin = (name, geo, m, fn) => { skinWeights(THREE, geo, fn); const me = new THREE.SkinnedMesh(geo, m); me.name = name; me.frustumCulled = false; kid.add(me); skinned.push(me); return me; };
  const torsoW = (x, y) => { const a = smooth(0.3, 0.38, y), b = smooth(0.42, 0.49, y); return [[BI('hips'), 1 - a], [BI('spine'), a * (1 - b)], [BI('chest'), a * b]]; };

  // torso / dress — one continuous form; shoulders are part of its top curve
  const floral = def.top === 'dress' ? floralTexture(THREE, def.color, def.dark) : null;
  const topMat = floral ? mat('dress', '#ffffff', { r: 0.66, x: { map: floral } }) : shirt;
  const torsoGeo = sweep(THREE, scaleX(def.top === 'dress' ? B.dress : B.torso, w, (def.top === 'dress' ? 0.82 : 0.8) * ch), { seg: 64, n: 2.3 });
  addSkin('torso', torsoGeo, topMat, torsoW);
  if (def.top !== 'dress') addSkin('shorts', sweep(THREE, scaleX(B.shorts, w, 0.78 * ch), { seg: 56, n: 2.3 }), shortsM, torsoW);
  if (def.print) {
    const S = surface(THREE, torsoGeo), g = new THREE.PlaneGeometry(0.19, 0.05, 24, 3), p = g.attributes.position, py = 0.385;
    for (let i = 0; i < p.count; i++) { const h = S.front(p.getX(i), py + p.getY(i)); p.setXYZ(i, p.getX(i), py + p.getY(i), (h ? h.p.z : 0.12) + 0.003); }
    g.computeVertexNormals();
    addSkin('shirt_print', g, new THREE.MeshStandardMaterial({ map: printTexture(THREE, def.print), transparent: true, roughness: 0.7, name: def.id + '_print' }), torsoW);
  }

  // arms with mitten hands: one swept form per arm, weights blend shoulder→elbow→wrist
  for (const s of [1, -1]) {
    const S = s > 0 ? 'L' : 'R', ax = s * AX, E = SH - 0.1, W = SH - 0.185;
    const g = sweep(THREE, B.arm.map(([y, a, b]) => [y, a * ch, b * ch]), { seg: 36, n: 2.1 }); g.translate(ax, SH, 0);
    addSkin('arm_' + S, g, skin, (x, y) => { const a = smooth(E + 0.03, E - 0.03, y), b = smooth(W + 0.02, W - 0.02, y); return [[BI('upperArm_' + S), 1 - a], [BI('lowerArm_' + S), a * (1 - b)], [BI('hand_' + S), a * b]]; });
    const th = add('thumb', sweep(THREE, ell(-0.022, 0.022, 0.02, 0.019, [[0, 1, 1], [1, 1, 1]], 16), { sub: 1, seg: 20 }), skin, J['hand_' + S], -s * 0.022, -0.042, 0.045); th.rotation.set(0.7, 0, s * 0.35);
    if (def.top === 'tank') add('shoulder', sweep(THREE, ell(-0.045, 0.04, 0.054, 0.054, [[0, 1, 1], [0.5, 1.02, 1.02], [1, 0.95, 0.95]], 20), { sub: 1, seg: 32 }), skin, J['upperArm_' + S], -s * 0.008, 0, 0);
    if (def.top !== 'tank') {
      const L = def.top === 'dress' ? 0.045 : def.sleeve || 0.06, R = def.top === 'dress' ? 0.074 : 0.068 * ch;
      add('sleeve', sweep(THREE, [[-L - 0.012, 0, 0], [-L - 0.009, R * 0.8, R * 0.8], [-L - 0.002, R * 1.03, R * 1.03], [-L + 0.012, R, R], [0, R * 0.97, R * 0.97], [0.03, R * 0.82, R * 0.82], [0.05, 0, 0]], { seg: 40 }), topMat, J['upperArm_' + S]);
    }
  }
  // legs + feet + tsinelas
  for (const s of [1, -1]) {
    const S = s > 0 ? 'L' : 'R', K = UL - 0.11, A = UL - 0.22, F = J['foot_' + S];
    const g = sweep(THREE, B.leg.map(([y, a, b]) => [y, a * ch, b * ch]), { seg: 36 }); g.translate(s * LX, UL, 0);
    addSkin('leg_' + S, g, skin, (x, y) => { const a = smooth(K + 0.035, K - 0.035, y), b = smooth(A + 0.02, A - 0.02, y); return [[BI('upperLeg_' + S), 1 - a], [BI('lowerLeg_' + S), a * (1 - b)], [BI('foot_' + S), a * b]]; });
    if (def.top !== 'dress') { const L = def.shorts; add('shorts_leg', sweep(THREE, [[-L - 0.014, 0, 0], [-L - 0.011, 0.06, 0.06], [-L - 0.004, 0.08, 0.08], [-L + 0.01, 0.08, 0.08], [-L + 0.022, 0.075, 0.075], [-0.02, 0.076, 0.076], [0.03, 0.073, 0.073], [0.05, 0, 0]].map(([y, a, b]) => [y, a * ch, b * ch]), { seg: 40 }), shortsM, J['upperLeg_' + S]); }
    const foot = sweep(THREE, [[-0.06, 0, 0], [-0.056, 0.036, 0.03], [-0.042, 0.05, 0.038], [-0.005, 0.053, 0.04], [0.035, 0.054, 0.038], [0.068, 0.05, 0.033], [0.086, 0.038, 0.025], [0.094, 0, 0]], { seg: 32 });
    foot.rotateX(Math.PI / 2); foot.translate(0, -0.028, 0.012); add('foot', foot, skin, F);
    const sole = sweep(THREE, [[-0.078, 0, 0], [-0.075, 0.04, 0.0055], [-0.06, 0.052, 0.006], [-0.02, 0.05, 0.006], [0.03, 0.058, 0.006], [0.085, 0.064, 0.006], [0.108, 0.052, 0.0055], [0.118, 0, 0]], { seg: 36, n: 2.8 });
    sole.rotateX(Math.PI / 2); sole.translate(0, -0.069, 0.016); add('tsinelas_sole', sole, mat('slipper', PAL.slip, { r: 0.42 }), F);
    const fr = new THREE.Raycaster(), fm = new THREE.Mesh(foot), strapM = mat('strap', PAL.strap, { r: 0.45 }), tr = 0.0072, x0 = -s * 0.012;
    const topY = (x, z) => { fr.set(V(x, 1, z), V(0, -1, 0)); const h = fr.intersectObject(fm)[0]; return h ? h.point.y : -0.063; };
    const knot = V(x0, topY(x0, 0.074) + tr * 0.8, 0.074);
    for (const side of [1, -1]) {
      const pts = [];
      for (let i = 0; i <= 6; i++) { const t = i / 6, x = side * 0.058 + (x0 - side * 0.058) * t, z = 0.074 * Math.pow(t, 0.75); pts.push(i === 6 ? knot.clone() : V(x, i === 0 ? -0.063 : Math.max(-0.062, topY(x, z) + tr * 0.8), z)); }
      add('tsinelas_strap', new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 28, tr, 10), strapM, F);
    }
    add('tsinelas_knot', new THREE.SphereGeometry(tr * 1.35, 14, 10), strapM, F).position.copy(knot);
    add('tsinelas_post', new THREE.CylinderGeometry(tr * 0.7, tr * 0.7, knot.y + 0.063, 8), strapM, F, x0, (knot.y - 0.063) / 2, 0.08);
  }

  // head: one smooth form, slightly fuller at the cheeks, softly squared cross-section; no neck, ears, nose
  const skull = grp('skull', J.head, 0, B.skullY, 0), HB = B.head;
  const ck = def.cheek || 1.015, HW = HB.w.map(([h, a, b], i) => i === 1 ? [h, a * ck, b * ck] : i === 0 ? [h, a * (1 + (ck - 1) * 0.6), b * (1 + (ck - 1) * 0.6)] : [h, a, b]);
  const headGeo = sweep(THREE, ell(HB.y0, HB.y1, HB.rx, HB.rz, HW, 44), { sub: 1, seg: 72, n: HB.n });
  add('head', headGeo, skin, skull);
  const HS = surface(THREE, headGeo);
  const place = (o, x, y, lift = 0) => { const h = HS.front(x, y); o.position.copy(h.p).addScaledVector(h.n, lift); o.quaternion.setFromUnitVectors(Z, h.n); skull.add(o); return o; };
  const EB = B.eye, face = { eyes: [], mouths: {} };
  const FD = def.face || {}, eyeHi = mat('eyeHi', '#FFFFFF', { r: 0.3 }); face.brows = [];
  for (const s of [1, -1]) {
    const eg = new THREE.Group(); eg.name = 'eye_' + (s > 0 ? 'L' : 'R'); place(eg, s * EB.x, EB.y, -0.002);
    const es = grp('eye_shape', eg); es.rotation.z = s * (FD.tilt || 0.08);
    add('eye', new THREE.SphereGeometry(1, 24, 16), eyeM, es).scale.set(0.0175, 0.021, 0.006);
    const lid = add('eye_lid', new THREE.TorusGeometry(0.019, 0.0032, 6, 24, Math.PI * 0.86), eyeM, es, 0, 0.002, 0.001); lid.rotation.z = Math.PI * 0.07; lid.scale.set(1.12, 0.95, 0.5);
    add('eye_highlight', new THREE.SphereGeometry(0.0042, 12, 8), eyeHi, es, -0.005, 0.008, 0.005).scale.z = 0.5;
    face.eyes.push(eg);
    const bg = new THREE.Group(); bg.name = 'brow_' + (s > 0 ? 'L' : 'R'); place(bg, s * (EB.x + 0.003), EB.y + 0.046, 0);
    const bm = grp('brow_arc', bg); bm.rotation.z = s * (FD.brow || 0);
    const ba = add('brow', new THREE.TorusGeometry(0.024, 0.0038, 6, 18, 1.0), eyeM, bm, 0, -0.02, 0); ba.rotation.z = Math.PI / 2 - 0.5; ba.scale.z = 0.5;
    bg.userData.s = s; bg.userData.y0 = bg.position.y; face.brows.push(bg);
  }
  const nose = new THREE.Group(); nose.name = 'nose'; place(nose, 0, -0.071, -0.003);
  add('nose', new THREE.SphereGeometry(0.011, 18, 12), skin, nose).scale.set(1.35, 0.85, 0.5);
  const mouth = new THREE.Group(); mouth.name = 'mouth'; place(mouth, 0, B.mouthY, 0.0);
  const m1 = add('mouth_smile', new THREE.TorusGeometry(0.019, 0.0048, 8, 24, Math.PI), mouthM, mouth, 0, 0.009, 0); m1.rotation.z = Math.PI; m1.scale.set(1, 0.65, 0.5);
  const m2 = add('mouth_frown', new THREE.TorusGeometry(0.016, 0.0055, 8, 24, Math.PI), mouthM, mouth, 0, -0.007, 0); m2.scale.set(1, 0.55, 0.6);
  const mf = add('mouth_flat', new THREE.CapsuleGeometry(0.005, 0.016, 4, 10), mouthM, mouth); mf.rotation.z = Math.PI / 2; mf.scale.z = 0.6;
  const sm = add('mouth_smirk', new THREE.CapsuleGeometry(0.005, 0.016, 4, 10), mouthM, mouth, 0.005, 0.002, 0); sm.rotation.z = Math.PI / 2 + 0.25; sm.scale.z = 0.6;
  const mo = add('mouth_o', new THREE.SphereGeometry(0.011, 16, 10), mat('mouthIn', PAL.mouthIn, { r: 0.6 }), mouth, 0, -0.003, -0.001); mo.scale.set(1, 1.25, 0.3);
  const mg = grp('mouth_grin', mouth);
  const gs = new THREE.Shape(); gs.moveTo(0.022, 0); gs.absarc(0, 0, 0.022, 0, Math.PI, true); gs.lineTo(0.022, 0);
  add('grin', new THREE.ShapeGeometry(gs, 24), mat('grinIn', PAL.mouthIn, { r: 0.6, x: { side: THREE.DoubleSide } }), mg, 0, 0.01, 0.0016).scale.set(1, 0.8, 1);
  const tooth = mat('teeth', '#FFFDF7', { r: 0.35 });
  if (def.gap) for (const x of [-0.0095, 0.0095]) add('tooth', new THREE.SphereGeometry(1, 16, 10), tooth, mg, x, 0.0055, 0.0028).scale.set(0.0068, 0.0042, 0.0022);
  else add('teeth', new THREE.SphereGeometry(1, 16, 10), tooth, mg, 0, 0.0055, 0.0028).scale.set(0.0165, 0.0042, 0.0022);
  face.mouths = { smile: m1, frown: m2, flat: mf, smirk: sm, o: mo, grin: mg };
  const bandMat = mat('bandage', PAL.bandage, { r: 0.7 }), band = (x, y, len, rot, lift = 0.0015) => {
    const b = new THREE.Group(); b.name = 'bandage'; place(b, x, y, lift);
    const m = add('bandage', new THREE.CapsuleGeometry(0.0105, len, 6, 16), bandMat, b); m.rotation.z = Math.PI / 2 + rot; m.scale.z = 0.22;
  };
  if (def.noseBandage) band(0, -0.074, 0.046, 0.14, 0.0062);
  if (def.cheekBandage) band(0.092, -0.08, 0.028, -0.5);

  // hair: thick offset shells of the head itself, so hairlines roll smoothly into the skull
  const H = grp('hair', skull);
  const back = (z) => Math.min(1, Math.max(0, (1 - z / HB.rz) / 2)); // 0 front … 1 back
  const hairShell = (name, off, cover, m = hair, soft) => add(name, shell(THREE, headGeo, off, cover, soft), m, H);
  if (def.hair === 'curly') {
    hairShell('hair_cap', 0.03, (x, y, z) => y - (0.085 - 0.16 * back(z)));
    const r = rng(9), n = 26, clump = (h, rad, lift) => { const c = add('curl', new THREE.SphereGeometry(rad, Math.max(10, Math.round(28 * LOD.k)), Math.max(8, Math.round(18 * LOD.k))), hair, H); c.position.copy(h.p).addScaledVector(h.n, lift); c.quaternion.setFromUnitVectors(Z, h.n); c.rotateZ(r() * 3); c.scale.set(1 + r() * 0.25, 0.9 + r() * 0.2, 0.62); };
    for (let i = 0; i < n; i++) {
      const yy = 1 - (i / (n - 1)) * 1.15, rad = Math.sqrt(Math.max(0, 1 - yy * yy)), th = i * 2.39996 + (r() - 0.5) * 0.5, d = V(Math.cos(th) * rad, yy, Math.sin(th) * rad);
      if (yy < -0.1 || (d.z > 0.45 && yy < 0.5)) continue;
      const h = HS.dir(d, V(0, 0.02, 0)); if (h) clump(h, 0.05 + r() * 0.028, 0.018 + r() * 0.01);
    }
    for (const [x, y, rr] of [[-0.085, 0.085, 0.044], [-0.03, 0.108, 0.05], [0.03, 0.112, 0.047], [0.085, 0.09, 0.042]]) { const h = HS.front(x, y); if (h) clump(h, rr, 0.012); }
  } else if (def.hair === 'pigtails') {
    hairShell('hair_cap', 0.014, (x, y, z) => y - (0.06 - 0.16 * back(z)));
    for (const s of [1, -1]) {
      const pg = grp('pigtail', skull, s * 0.132, 0.1, -0.03); pg.rotation.z = -s * 0.8;
      add('pigtail_puff', sweep(THREE, ell(0.0, 0.14, 0.05, 0.048, [[0, 0.8, 0.8], [0.5, 1.05, 1.05], [1, 0.9, 0.9]], 24), { sub: 1, seg: 32 }), hair, pg);
      add('pigtail_tie', new THREE.TorusGeometry(0.03, 0.012, 10, 24), dark, pg, 0, 0.028, 0).rotation.x = Math.PI / 2;
    }
  } else if (def.hair === 'bowl') {
    hairShell('hair_cap', 0.022, (x, y, z) => y - (0.045 - 0.075 * back(z)), hair, 0.01);
  } else if (def.hair === 'long') {
    hairShell('hair_cap', 0.013, (x, y, z) => y - (0.085 - 0.27 * Math.pow(back(z), 0.7)));
    add('hair_long', sweep(THREE, ell(-0.21, 0.02, 0.138, 0.068, [[0, 0.85, 0.8], [0.4, 1.0, 1.0], [1, 1.0, 1.0]], 28), { sub: 1, seg: 48, n: 2.2 }), hair, skull, 0, 0, -0.085);
  }
  if (def.hat === 'capBack') {
    const line = (z) => 0.07 - 0.085 * back(z);
    hairShell('cap_crown', 0.03, (x, y, z) => y - line(z), capM);
    hairShell('cap_band', 0.035, (x, y, z) => Math.min(y - line(z), line(z) + 0.022 - y), dark, 0.006);
    const sh = new THREE.Shape(); sh.moveTo(0.12, 0); sh.absellipse(0, 0, 0.12, 0.115, 0, Math.PI, false); sh.lineTo(0.12, 0);
    const bg = new THREE.ExtrudeGeometry(sh, { depth: 0.008, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.008, bevelSegments: 4, curveSegments: 32 });
    bg.rotateX(-Math.PI / 2);
    const bp = grp('cap_brim_pivot', skull); bp.rotation.y = -0.75;
    const br = add('cap_brim', bg, dark, bp, 0, line(-HB.rz) + 0.012, -HB.rz * 0.8); br.rotation.x = 0.3;
    add('cap_button', new THREE.SphereGeometry(0.016, 14, 10), capM, skull, 0, HB.y1 + 0.03, 0);
  }

  // props
  if (def.prop === 'tirador') {
    const t = grp('tirador', J.hand_R, 0.004, -0.05, 0.055); t.rotation.set(0.35, 0, 0);
    const wd = mat('wood', PAL.wood, { r: 0.55 });
    add('tirador_handle', new THREE.CapsuleGeometry(0.012, 0.06, 6, 12), wd, t);
    for (const s of [1, -1]) add('tirador_arm', new THREE.CapsuleGeometry(0.011, 0.045, 6, 12), wd, t, s * 0.02, 0.062, 0).rotation.z = -s * 0.5;
    add('tirador_band', new THREE.CylinderGeometry(0.004, 0.004, 0.07, 6), mat('rubber', '#C2577F'), t, 0, 0.088, 0).rotation.z = Math.PI / 2;
  }
  if (def.prop === 'flower') {
    const f = grp('flower', J.hand_R, 0, -0.05, 0.04); f.rotation.set(0.2, 0, -2.5);
    add('flower_stem', new THREE.CylinderGeometry(0.006, 0.006, 0.13, 8), mat('stem', '#2FA35A'), f, 0, 0.06, 0);
    const fh = grp('flower_head', f, 0, 0.13, 0);
    for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2; add('petal', new THREE.SphereGeometry(0.022, 14, 10), mat('petal', '#FFF6E6', { r: 0.5 }), fh, Math.cos(a) * 0.025, 0, Math.sin(a) * 0.025).scale.y = 0.5; }
    add('flower_center', new THREE.SphereGeometry(0.014, 12, 8), mat('petalCenter', def.color), fh, 0, 0.005, 0);
  }

  // bind in the straight zero pose, then relax into the rest pose (skinning bends the forms smoothly)
  kid.updateMatrixWorld(true);
  const skel = new THREE.Skeleton(JOINTS.map((n) => J[n]));
  for (const m of skinned) m.bind(skel);
  for (const s of [1, -1]) {
    const S = s > 0 ? 'L' : 'R';
    J['upperArm_' + S].rotation.z = s * 0.3; J['lowerArm_' + S].rotation.x = -0.12; J['hand_' + S].rotation.z = -s * 0.08;
    J['upperLeg_' + S].rotation.z = s * 0.025; J['foot_' + S].rotation.y = s * 0.1; J['foot_' + S].rotation.z = -s * 0.025;
  }
  for (const n of JOINTS) J[n].userData.rest = J[n].rotation.clone();

  const K = { def, group: kid, root: J.root, joints: J, face, mats };
  const keep = new Set(); for (const m of Object.values(face.mouths)) m.traverse(o => keep.add(o)); for (const b of face.brows) b.traverse(o => keep.add(o));
  mergeStatic(THREE, kid, keep);
  setExpression(K, 'happy');
  return K;
}

// Fewer draw calls: static parts with the same parent and material become one mesh (Bunso's curls, the sandal straps, petals,
// each eye and its lid). The skinned body and the expression parts (mouths, brows) stay as they are.
function mergeStatic(THREE, root, keep) {
  const groups = new Map();
  root.traverse(o => {
    if (!o.isMesh || o.isSkinnedMesh || !o.visible || o.children.length || !o.parent || keep.has(o) || keep.has(o.parent)) return;
    const k = o.parent.uuid + '|' + o.material.uuid; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(o);
  });
  for (const list of groups.values()) {
    if (list.length < 2) continue;
    const geos = list.map(o => { o.updateMatrix(); const g = o.geometry.clone(); g.applyMatrix4(o.matrix); return g; });
    const names = ['position', 'normal', 'uv'].filter(n => geos.every(g => g.attributes[n] && !g.attributes[n].isInterleavedBufferAttribute && g.attributes[n].itemSize === geos[0].attributes[n].itemSize));
    if (names[0] !== 'position' || names[1] !== 'normal') { geos.forEach(g => g.dispose()); continue; }
    let vc = 0, ic = 0; for (const g of geos) { vc += g.attributes.position.count; ic += g.index ? g.index.count : g.attributes.position.count; }
    const out = new THREE.BufferGeometry(), idx = new (vc > 65535 ? Uint32Array : Uint16Array)(ic);
    for (const n of names) {
      const sz = geos[0].attributes[n].itemSize, arr = new Float32Array(vc * sz); let off = 0;
      for (const g of geos) { const a = g.attributes[n]; for (let i = 0; i < a.count; i++) for (let c = 0; c < sz; c++) arr[(off + i) * sz + c] = a.getComponent(i, c); off += a.count; }
      out.setAttribute(n, new THREE.BufferAttribute(arr, sz));
    }
    let vo = 0, io = 0;
    for (const g of geos) { const n = g.attributes.position.count; if (g.index) { const s = g.index.array; for (let i = 0; i < s.length; i++) idx[io++] = s[i] + vo; } else for (let i = 0; i < n; i++) idx[io++] = vo + i; vo += n; g.dispose(); }
    out.setIndex(new THREE.BufferAttribute(idx, 1)); out.computeBoundingSphere();
    const first = list[0], m = new THREE.Mesh(out, first.material); m.name = first.name + '_x' + list.length; first.parent.add(m);
    for (const o of list) { o.parent.remove(o); o.geometry.dispose(); }
  }
}
// Only the big forms cast shadows (body, head, hair, sleeves, cap); eyes, mouths, straps and other small parts do not.
const SMALL = /eye|lid|highlight|brow|nose|mouth|grin|tooth|teeth|bandage|thumb|strap|knot|post|sole|foot|petal|stem|flower|tirador|button|print/;
export function castShadows(K, on = true) { K.group.traverse(o => { if (o.isMesh) o.castShadow = on && !SMALL.test(o.name); }); }

export const EXPRESSIONS = ['neutral', 'happy', 'excited', 'surprised', 'sad', 'disappointed', 'determined', 'confused'];
export function setExpression(K, name) {
  const E = {
    neutral: { m: null, ex: 1, ey: 1 },
    happy: { m: K.def.smile, ex: 1, ey: 1 },
    excited: { m: 'grin', ex: 1.06, ey: 1.12, by: 0.004 },
    surprised: { m: 'o', ex: 1.12, ey: 1.08, by: 0.008 },
    sad: { m: 'frown', ex: 1, ey: 0.85, tilt: 0.18, bt: -0.3 },
    disappointed: { m: 'flat', ex: 1.04, ey: 0.5 },
    determined: { m: 'smirk', ex: 1, ey: 0.75, tilt: -0.15, bt: 0.3 },
    confused: { m: 'o', ex: 1, ey: 1, eyR: 0.75, mx: 0.01 },
  }[name] || {};
  for (const [k, m] of Object.entries(K.face.mouths)) m.visible = k === E.m;
  K.face.mouths.o.position.x = E.mx || 0;
  K.face.eyes.forEach((e, i) => {
    if (!e.userData.q) e.userData.q = e.quaternion.clone();
    const f = i === 1 && E.eyR ? E.eyR : 1, lid = (K.def.face && K.def.face.lid) || 1; e.scale.set(E.ex * f, E.ey * f * lid, 1);
    e.quaternion.copy(e.userData.q); if (E.tilt) e.rotateZ((i === 0 ? 1 : -1) * E.tilt);
  });
  (K.face.brows || []).forEach((b) => { b.children[0].rotation.z = b.userData.s * (((K.def.face || {}).brow || 0) + (E.bt || 0)); b.position.y = b.userData.y0 + (E.by || 0); });
  K.expression = name;
}

// --- animation clips: functions of (t seconds) → { 'joint.axis': radians, rootY, rootZ } ---
function kfp(t, keys) {
  const out = {}; let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++;
  const [t0, a] = keys[i - 1], [t1, b] = keys[i];
  let u = Math.min(1, Math.max(0, (t - t0) / (t1 - t0))); u = u * u * (3 - 2 * u);
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) out[k] = (a[k] || 0) + ((b[k] || 0) - (a[k] || 0)) * u;
  return out;
}
const crouch = (c, extra = {}) => ({ 'upperLeg_L.x': -0.65 * c, 'upperLeg_R.x': -0.65 * c, 'lowerLeg_L.x': 1.3 * c, 'lowerLeg_R.x': 1.3 * c, 'foot_L.x': -0.65 * c, 'foot_R.x': -0.65 * c, rootY: -0.057 * c * 0.85, 'spine.x': 0.22 * c, ...extra });
const sin = Math.sin, cos = Math.cos, abs = Math.abs, P2 = Math.PI * 2;

export const CLIPS = {
  idle: { dur: 2.4, f: (t, d) => { const p = (t / d) * P2, b = sin(p); return { 'spine.x': 0.02 * b, 'chest.x': -0.015 * b, 'head.z': 0.035 * sin(p + 1), 'head.x': -0.01 * b, 'upperArm_L.z': 0.03 * b, 'upperArm_R.z': -0.03 * b, rootY: 0.004 * b }; } },
  walk: { dur: 0.9, f: (t, d) => { const p = (t / d) * P2, s = sin(p), c = cos(p); return {
    'upperLeg_L.x': -0.5 * s, 'upperLeg_R.x': 0.5 * s, 'lowerLeg_L.x': 0.75 * Math.max(0, c), 'lowerLeg_R.x': 0.75 * Math.max(0, -c), 'foot_L.x': 0.25 * s, 'foot_R.x': -0.25 * s,
    'upperArm_L.x': 0.45 * s, 'upperArm_R.x': -0.45 * s, 'lowerArm_L.x': -0.25, 'lowerArm_R.x': -0.25, 'hips.y': -0.1 * s, 'spine.y': 0.14 * s, 'head.y': -0.06 * s, 'spine.x': 0.04, rootY: 0.018 * abs(c) - 0.006 }; } },
  run: { dur: 0.56, f: (t, d) => { const p = (t / d) * P2, s = sin(p), c = cos(p); return {
    'upperLeg_L.x': -0.9 * s - 0.15, 'upperLeg_R.x': 0.9 * s - 0.15, 'lowerLeg_L.x': 1.2 * Math.max(0, c) + 0.3, 'lowerLeg_R.x': 1.2 * Math.max(0, -c) + 0.3, 'foot_L.x': 0.3 * s, 'foot_R.x': -0.3 * s,
    'upperArm_L.x': 0.9 * s, 'upperArm_R.x': -0.9 * s, 'lowerArm_L.x': -1.2, 'lowerArm_R.x': -1.2, 'upperArm_L.z': 0.1, 'upperArm_R.z': -0.1, 'spine.x': 0.24, 'head.x': -0.16, 'spine.y': 0.18 * s, 'hips.y': -0.12 * s, rootY: 0.045 * abs(c) - 0.03 }; } },
  jump: { dur: 1.3, f: (t) => kfp(t, [[0, {}], [0.24, crouch(1, { 'upperArm_L.x': 0.7, 'upperArm_R.x': 0.7 })], [0.34, { rootY: 0.05, 'upperLeg_L.x': 0.15, 'upperLeg_R.x': 0.15, 'foot_L.x': 0.4, 'foot_R.x': 0.4, 'upperArm_L.z': 2.2, 'upperArm_R.z': -2.2 }],
    [0.56, { rootY: 0.34, 'upperLeg_L.x': -0.5, 'upperLeg_R.x': -0.25, 'lowerLeg_L.x': 0.9, 'lowerLeg_R.x': 0.6, 'upperArm_L.z': 2.6, 'upperArm_R.z': -2.6, 'head.x': -0.12 }], [0.78, { rootY: 0.02, 'upperLeg_L.x': -0.15, 'upperLeg_R.x': -0.15, 'lowerLeg_L.x': 0.2, 'lowerLeg_R.x': 0.2, 'upperArm_L.z': 1.2, 'upperArm_R.z': -1.2 }],
    [0.88, crouch(0.85, { 'upperArm_L.z': 0.6, 'upperArm_R.z': -0.6, 'upperArm_L.x': -0.4, 'upperArm_R.x': -0.4 })], [1.08, crouch(0.15)], [1.3, {}]]) },
  fall: { dur: 2.8, f: (t) => kfp(t, [[0, {}], [0.2, { 'spine.x': -0.25, 'head.x': -0.3, 'upperArm_L.z': 1.4, 'upperArm_R.z': -1.4, 'upperLeg_L.x': -0.5, 'lowerLeg_L.x': 0.2, rootZ: -0.04 }],
    [0.5, { rootY: -0.255, rootZ: -0.08, 'upperLeg_L.x': -1.45, 'upperLeg_R.x': -1.3, 'lowerLeg_L.x': 0.3, 'lowerLeg_R.x': 0.5, 'foot_L.x': -0.2, 'spine.x': -0.32, 'head.x': 0.15, 'upperArm_L.x': 0.9, 'upperArm_R.x': 0.9, 'upperArm_L.z': 0.4, 'upperArm_R.z': -0.4 }],
    [0.62, { rootY: -0.25, rootZ: -0.08, 'upperLeg_L.x': -1.4, 'upperLeg_R.x': -1.25, 'lowerLeg_L.x': 0.35, 'lowerLeg_R.x': 0.55, 'spine.x': -0.18, 'head.x': 0.25, 'head.z': 0.2, 'upperArm_L.x': 0.8, 'upperArm_R.x': 0.8, 'upperArm_L.z': 0.35, 'upperArm_R.z': -0.35 }],
    [1.3, { rootY: -0.25, rootZ: -0.08, 'upperLeg_L.x': -1.4, 'upperLeg_R.x': -1.25, 'lowerLeg_L.x': 0.35, 'lowerLeg_R.x': 0.55, 'spine.x': -0.1, 'head.x': 0.2, 'head.z': -0.2, 'upperArm_L.x': 0.8, 'upperArm_R.x': 0.8, 'upperArm_L.z': 0.35, 'upperArm_R.z': -0.35 }],
    [1.8, { rootY: -0.145, rootZ: -0.04, 'upperLeg_L.x': -1.0, 'upperLeg_R.x': -1.0, 'lowerLeg_L.x': 1.9, 'lowerLeg_R.x': 1.9, 'foot_L.x': -0.9, 'foot_R.x': -0.9, 'spine.x': 0.6, 'head.x': -0.25, 'upperArm_L.x': -0.6, 'upperArm_R.x': -0.6 }],
    [2.3, crouch(0.1, { 'upperArm_L.z': 0.2, 'upperArm_R.z': -0.2 })], [2.8, {}]]) },
  victory: { dur: 1.6, f: (t, d) => { const p = (t / d) * P2, h = Math.max(0, sin(2 * p)), c = Math.max(0, -sin(2 * p)); return { ...crouch(0.35 * c), rootY: 0.09 * h - 0.02 * c, 'upperArm_L.z': 2.55 + 0.15 * sin(2 * p), 'upperArm_R.z': -2.55 - 0.15 * sin(2 * p), 'lowerArm_L.x': -0.2, 'lowerArm_R.x': -0.2, 'head.x': -0.18, 'head.z': 0.08 * sin(p), 'upperLeg_L.x': -0.2 * h, 'lowerLeg_L.x': 0.4 * h }; } },
  defeat: { dur: 2.6, f: (t, d) => { const p = (t / d) * P2; return { 'spine.x': 0.32 + 0.03 * sin(p), 'chest.x': 0.14, 'head.x': 0.42, 'head.y': 0.16 * sin(p), 'upperArm_L.x': -0.12, 'upperArm_R.x': -0.12, 'upperArm_L.z': -0.06, 'upperArm_R.z': 0.06, 'upperLeg_L.x': -0.12, 'upperLeg_R.x': -0.12, 'lowerLeg_L.x': 0.24, 'lowerLeg_R.x': 0.24, 'foot_L.x': -0.12, 'foot_R.x': -0.12, rootY: -0.012 - 0.006 * sin(p) }; } },
  pickUp: { dur: 2.0, f: (t) => kfp(t, [[0, {}], [0.55, crouch(0.9, { 'spine.x': 0.6, 'chest.x': 0.25, 'upperArm_R.x': -1.0, 'lowerArm_R.x': -0.3, 'upperArm_L.x': -0.3, 'head.x': 0.15 })], [0.85, crouch(0.9, { 'spine.x': 0.6, 'chest.x': 0.25, 'upperArm_R.x': -1.05, 'lowerArm_R.x': -0.5, 'upperArm_L.x': -0.3, 'head.x': 0.15 })],
    [1.3, { 'upperArm_R.x': -1.7, 'lowerArm_R.x': -0.7, 'head.x': -0.1, 'spine.x': -0.05, rootY: 0.01 }], [1.6, { 'upperArm_R.x': -1.7, 'lowerArm_R.x': -0.7, 'head.x': -0.1, 'spine.x': -0.05 }], [2.0, {}]]) },
  kick: { dur: 1.1, f: (t) => kfp(t, [[0, {}], [0.32, { 'upperLeg_R.x': 0.65, 'lowerLeg_R.x': 1.0, 'lowerLeg_L.x': 0.2, 'upperLeg_L.x': -0.1, 'foot_L.x': -0.1, 'spine.x': 0.08, 'upperArm_L.x': -0.5, 'upperArm_R.x': 0.5, 'upperArm_L.z': 0.4, 'upperArm_R.z': -0.4, rootY: -0.01 }],
    [0.46, { 'upperLeg_R.x': -1.35, 'lowerLeg_R.x': 0.05, 'foot_R.x': 0.4, 'lowerLeg_L.x': 0.2, 'upperLeg_L.x': -0.1, 'foot_L.x': -0.1, 'spine.x': -0.22, 'upperArm_L.x': 0.6, 'upperArm_R.x': -0.6, 'upperArm_L.z': 0.6, 'upperArm_R.z': -0.6, rootY: -0.01 }],
    [0.62, { 'upperLeg_R.x': -1.55, 'lowerLeg_R.x': 0.15, 'foot_R.x': 0.3, 'lowerLeg_L.x': 0.18, 'spine.x': -0.26, 'upperArm_L.x': 0.5, 'upperArm_R.x': -0.5, 'upperArm_L.z': 0.7, 'upperArm_R.z': -0.7, rootY: 0.0 }], [1.1, {}]]) },
  throw: { dur: 1.3, f: (t) => kfp(t, [[0, {}], [0.45, { 'upperArm_R.x': 2.5, 'lowerArm_R.x': -0.9, 'upperArm_L.x': -1.1, 'spine.y': 0.45, 'spine.x': -0.12, 'upperLeg_L.x': -0.35, 'upperLeg_R.x': 0.2, 'lowerLeg_R.x': 0.2, 'head.y': -0.3 }],
    [0.6, { 'upperArm_R.x': -1.3, 'lowerArm_R.x': -0.1, 'upperArm_L.x': 0.5, 'spine.y': -0.4, 'spine.x': 0.22, 'upperLeg_L.x': -0.4, 'lowerLeg_L.x': 0.3, 'upperLeg_R.x': 0.25, 'lowerLeg_R.x': 0.1, rootY: -0.02 }],
    [0.8, { 'upperArm_R.x': -0.9, 'lowerArm_R.x': -0.3, 'upperArm_L.x': 0.4, 'spine.y': -0.3, 'spine.x': 0.15, 'upperLeg_L.x': -0.3, 'lowerLeg_L.x': 0.2, rootY: -0.01 }], [1.3, {}]]) },
  wave: { dur: 1.4, f: (t, d) => { const p = (t / d) * P2; return { 'upperArm_R.z': -2.5, 'upperArm_R.x': -0.25, 'lowerArm_R.z': 0.35 * sin(2 * p), 'lowerArm_R.x': -0.3, 'head.z': -0.1, 'spine.z': 0.04, rootY: 0.004 * sin(p) }; } },
};

export function applyPose(K, d) {
  const post = K.def.posture || {};
  for (const n of JOINTS) {
    const j = K.joints[n], r = j.userData.rest;
    j.rotation.set(r.x + (d[n + '.x'] || 0) + (post[n + '.x'] || 0), r.y + (d[n + '.y'] || 0) + (post[n + '.y'] || 0), r.z + (d[n + '.z'] || 0) + (post[n + '.z'] || 0));
  }
  K.root.position.set(0, d.rootY || 0, d.rootZ || 0);
}
export function poseAt(K, clip, t) { const c = CLIPS[clip]; return c.f(((t % c.dur) + c.dur) % c.dur, c.dur); }

// Bake every clip into THREE.AnimationClips (quaternion + root position tracks) so GLB exports carry them.
export function bakeClips(THREE, K, fps = 30) {
  const out = [];
  for (const [name, c] of Object.entries(CLIPS)) {
    const n = Math.ceil(c.dur * fps) + 1, times = [], q = {}, rp = [];
    for (const j of JOINTS) q[j] = [];
    for (let i = 0; i < n; i++) {
      const t = Math.min(c.dur, i / fps); times.push(t); applyPose(K, c.f(t === c.dur ? 0 : t, c.dur));
      for (const j of JOINTS) q[j].push(...K.joints[j].quaternion.toArray());
      rp.push(...K.root.position.toArray());
    }
    const tracks = JOINTS.map((j) => new THREE.QuaternionKeyframeTrack(j + '.quaternion', times, q[j]));
    tracks.push(new THREE.VectorKeyframeTrack('root.position', times, rp));
    out.push(new THREE.AnimationClip(name, c.dur, tracks));
  }
  applyPose(K, {});
  return out;
}
