/* Taympers title scene: the main menu's backdrop. The Plaza island at golden hour with the four kids (kids/kids.js)
   playing on its entrance path: Bunso keeps the sipa up, Neneng cheers his kicks, Totoy waves Jun over, Jun guards
   the chalked patintero line. Ported from the team's "Taympers Title Screen Animation" design: the choreography is a
   12 s loop and every frame is a pure function of its time, so the loop closes without a seam.
   create(canvas) builds it (a few seconds; it yields between steps), then draws while shown: adaptive resolution,
   paused when hidden or when the page is in the background, one still frame with reduced motion. */
import * as T3 from '../vendor/three-r184/three.module.min.js';
import { build as buildPlaza } from './islands/plaza.js';
import { polish } from './polish.js';
import { addLife } from './life.js';
import { addLiving } from './living.js';
import { KIDS, buildKid, setExpression, applyPose, CLIPS } from '../kids/kids.js';

const TAU = Math.PI * 2, LOOP = 12, CUES = { Breeze: 0, Streak: 4, Settle: 8 };
const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const MOTION = {
  // smooth in/out window: 0 → 1 between a-f..a, back to 0 between b..b+f
  win: (t, a, b, f = .35) => ss(a - f, a, t) * (1 - ss(b, b + f, t)),
  // periodic oscillation locked to the loop: n whole cycles per loop
  osc: (t, n, L, ph = 0) => Math.sin(TAU * n * t / L + ph),
  // a gesture bump centred on c: anticipation, peak, settle
  pop: (t, c, rise = .32, fall = .42) => t < c ? ss(c - rise, c, t) : 1 - ss(c, c + fall, t),
};
// scene layout (meters, island space). The camera looks north (-z) from the south edge of the plaza.
export const LAYOUT = {
  cam: { x: .6, y: 1.75, z: 36.5, tx: -.8, ty: 2.3, tz: 0, fov: 36 },
  // the kids gather on the plaza's entrance path (cobble, x -1.3..1.3, z 20.4..31) where the patintero court is chalked
  kids: { Neneng: [-2.2, 28.6, .6], Bunso: [-1.0, 27.6, .3], Totoy: [-.15, 29.0, -.3], Jun: [1.15, 26.4, -.3] },
  kidH: 1.22, // sipa scale reference
  kidScale: 1.32, // the models are ~0.92 m tall in their own units
  span: 5.0, // meters across the four kids, kept on screen on narrow (portrait) screens
  tall: { y: 4.1, z: 34.4 }, // camera on a 1:2 portrait screen: higher, so the ground in front of the kids fills the lower half
};
const seeded = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const yieldUI = () => new Promise(r => setTimeout(r, 0));
// one stage for every build, so living.js keeps a single clock loop however often the menu is rebuilt
const stage = { _scene: null, _renderer: null, _invalidate() {} };

/* reduced: one still frame. The rest is the graphics quality (Kalidad in the game; the defaults are the design's):
   maxDpr caps the pixel ratio, shadow is the sun's shadow-map size (0: none), islShadow lets the island's buildings and
   trees cast shadows, leaf and grass are living.js's leaf cards and grass layers */
export function create(canvas, { reduced = false, maxDpr = 2, shadow = 2048, islShadow = true, leaf = 2500, grass = 6 } = {}) {
  let ctx = null, made = null, dead = false, shown = false, raf = 0, t0 = performance.now(), cheerAt = -99, view = { w: 0, h: 0, focus: null };
  const stop = { v: false };
  const ready = (async () => {
    const ren = new T3.WebGLRenderer({ canvas, antialias: true });
    ren.shadowMap.enabled = shadow > 0; ren.shadowMap.type = T3.PCFShadowMap;
    const scene = new T3.Scene(); stage._scene = scene; stage._renderer = ren; made = { ren, scene };

    // ---- island (unchanged game asset) ----
    await yieldUI(); const root = (await buildPlaza(T3)).root; if (dead) throw new Error('disposed'); scene.add(root);
    root.traverse(o => { if (o.isMesh) { o.castShadow = islShadow; o.receiveShadow = true; } });

    // ---- golden-hour lights (the game's island rig, warmed and lowered) ----
    const sunDir = new T3.Vector3(.78, .30, -.42).normalize();
    scene.add(new T3.HemisphereLight(0xFFE0BA, 0x9A8F6A, 1.0));
    const sun = new T3.DirectionalLight(0xFFC890, 2.35); sun.position.copy(sunDir).multiplyScalar(140); sun.target.position.set(0, 0, 0);
    sun.castShadow = shadow > 0; sun.shadow.mapSize.setScalar(shadow || 1024); sun.shadow.bias = -.0004; sun.shadow.normalBias = .03;
    const sc = sun.shadow.camera; sc.left = sc.bottom = -62; sc.right = sc.top = 62; sc.near = 1; sc.far = 400; scene.add(sun, sun.target);
    const fill = new T3.DirectionalLight(0xC4CCEE, .5); fill.position.set(-40, 25, 60); scene.add(fill);

    await yieldUI(); polish(T3, stage, root, { normals: false, skyRadius: 900, grade: { sky: '#E59C78', horizon: '#FFD59A', sun: '#FFE7B0', fog: '#F6CB95', exposure: 1.04, rim: '#FFD7A0', rimK: .26, tint: '#C9A878', path: '#E4D6BA', env: .35 }, stopped: () => stop.v });
    await yieldUI(); try { const l = addLife(T3, stage, root, { name: 'plaza', ui: false, korona: 0, seed: 91, walkers: 0, birds: 0, butterflies: 0, centerZ: -5, stopped: () => stop.v }); l && l.setKorona && l.setKorona(0); } catch (e) { console.warn(e); }
    await yieldUI(); try { made.isl = await addLiving(T3, stage, root, { name: 'plaza', ui: false, post: false, sounds: false, leafCards: leaf, grassLayers: grass, seed: 11, vendors: 0, strollers: 0, tambays: 0, kidGroups: 0, dogs: 0, cats: 0, chickens: 0, dragonflies: 0, vehicles: [] }); } catch (e) { console.warn(e); }
    if (dead) throw new Error('disposed');
    const bs = root.getObjectByName('board_spaces'); if (bs) bs.visible = false;

    // ---- sky + haze ----
    const sky = scene.getObjectByName('sky_dome'), skyDir = new T3.Vector3(.30, .075, -.95).normalize();
    if (sky) { const u = sky.material.uniforms; u.top.value.set('#E89A7E'); u.hor.value.set('#FFD79C'); u.sun.value.set('#FFE9B8'); u.sd.value.copy(skyDir); }
    scene.fog = new T3.Fog(0xF7CC96, 70, 640); scene.background = new T3.Color('#FFD59A');

    // ---- toon kit, the same as the kids' materials ----
    const gm = new T3.DataTexture(new Uint8Array([48, 48, 48, 255, 134, 134, 134, 255, 255, 255, 255, 255]), 3, 1, T3.RGBAFormat); gm.needsUpdate = true; gm.minFilter = gm.magFilter = T3.NearestFilter;
    const MC = new Map();
    const M = (c, o) => { if (!o) { const k = String(c); if (MC.has(k)) return MC.get(k); const m = new T3.MeshToonMaterial({ color: c, gradientMap: gm }); MC.set(k, m); return m; } return new T3.MeshToonMaterial(Object.assign({ color: c, gradientMap: gm }, o)); };
    const OUT = new T3.MeshBasicMaterial({ color: 0x3B2316, side: T3.BackSide });
    const mesh = (geo, mat, x, y, z) => { const m = new T3.Mesh(geo, mat); m.position.set(x || 0, y || 0, z || 0); return m; };
    const ol = (m, k) => { const o = new T3.Mesh(m.geometry, OUT); o.scale.setScalar(1 + k); o.userData.ol = 1; m.add(o); return m; };
    const shadowAll = o => o.traverse(m => { if (m.isMesh && !m.userData.ol) m.castShadow = true; });

    // the sipa: a washer with twelve paper streamers, as in the game's Sipa minigame
    function sipaToy() { const g = new T3.Group(); const w = mesh(new T3.TorusGeometry(4.2, 1.7, 8, 16), M('#A9B1BA'), 0, 0, 0); w.rotation.x = Math.PI / 2; ol(w, .08); g.add(w);
      const cols = ['#E2452E', '#F2B21B', '#2E6FD8', '#2FA35A', '#F28DB2', '#FFF6E6']; for (let i = 0; i < 12; i++) { const piv = new T3.Group(); piv.rotation.y = i / 12 * TAU; const st = mesh(new T3.BoxGeometry(1.4, 13, .5), M(cols[i % 6]), 3, 6, 0); st.rotation.z = -.45; piv.add(st); g.add(piv); } shadowAll(g); scene.add(g); return g; }

    // ground height under a point (first opaque hit on the island)
    const rc = new T3.Raycaster(); const groundAt = (x, z) => { rc.set(new T3.Vector3(x, 30, z), new T3.Vector3(0, -1, 0)); const hits = rc.intersectObject(root, true);
      for (const h of hits) { const m = h.object, mt = Array.isArray(m.material) ? m.material[0] : m.material; if (m.isInstancedMesh || !m.visible || (mt && (mt.transparent || mt.alphaTest > 0)) || /blade|leaf|shell|tuft/i.test(m.name)) continue; return h.point.y; } return 0; };

    const S = LAYOUT.kidH / 57, kids = {};
    KIDS.forEach(def => { const K = buildKid(T3, def), L = LAYOUT.kids[def.name]; K.base = { x: L[0], z: L[1], yaw: L[2], y: groundAt(L[0], L[1]) };
      K.group.position.set(K.base.x, K.base.y + .004, K.base.z); K.group.rotation.y = K.base.yaw; K.group.scale.setScalar(LAYOUT.kidScale);
      K.group.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); scene.add(K.group); kids[def.name] = K; });
    // where Bunso's kicking foot meets the sipa (from the model's own kick clip at contact)
    { const K = kids.Bunso; applyPose(K, CLIPS.kick.f(.5, CLIPS.kick.dur)); K.group.updateMatrixWorld(true); const v = new T3.Vector3(); K.joints.foot_R.localToWorld(v.set(0, -.03, .07)); kids.contact = v.clone(); applyPose(K, {}); }
    const sipa = sipaToy(); sipa.scale.setScalar(S * 1.35);
    const center = new T3.Vector3(); KIDS.forEach(d => center.add(new T3.Vector3(kids[d.name].base.x, kids[d.name].base.y + .65, kids[d.name].base.z))); center.divideScalar(KIDS.length); center.x -= .2; // Neneng stands nearest the camera, so the group looks wider on her side

    // ---- patintero court chalked on the plaza ----
    const chalk = new T3.MeshBasicMaterial({ color: 0xFFF6E6, transparent: true, opacity: .78, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
    const court = new T3.Group(); scene.add(court);
    const line = (x0, z0, x1, z1) => { const L = Math.hypot(x1 - x0, z1 - z0); const m = new T3.Mesh(new T3.PlaneGeometry(L, .07), chalk); m.rotation.x = -Math.PI / 2; m.rotation.z = -Math.atan2(z1 - z0, x1 - x0); const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2; m.position.set(mx, groundAt(mx, mz) + .012, mz); court.add(m); };
    { const x0 = -1.15, x1 = 1.15, z0 = 22.4, z1 = 28.5; line(x0, z0, x1, z0); line(x0, z1, x1, z1); line(x0, z0, x0, z1); line(x1, z0, x1, z1); line(0, z0, 0, z1); for (const z of [24.43, 26.47]) line(x0, z, x1, z); }

    // ---- distant hills, rooftops and trees beyond the plaza (fogged into the haze) ----
    const far = new T3.Group(); scene.add(far); const hr = seeded(321);
    const dome = new T3.SphereGeometry(1, 28, 12, 0, TAU, 0, Math.PI / 2);
    const hillLayers = [{ d: 150, n: 9, r: [34, 60], h: [14, 24], c: '#8DB65C' }, { d: 260, n: 10, r: [55, 90], h: [24, 40], c: '#A9B868' }, { d: 430, n: 9, r: [90, 140], h: [40, 70], c: '#C7AE84' }];
    const hillTops = [];
    hillLayers.forEach((L, li) => { const mat = M(L.c, { fog: true }); for (let i = 0; i < L.n; i++) { const a = -Math.PI / 2 + (i / (L.n - 1) - .5) * 1.9 + (hr() - .5) * .12, d = L.d * (.9 + hr() * .2), x = Math.cos(a) * d, z = Math.sin(a) * d - 5;
      const r = L.r[0] + hr() * (L.r[1] - L.r[0]), h = L.h[0] + hr() * (L.h[1] - L.h[0]); const m = new T3.Mesh(dome, mat); m.scale.set(r, h, r * .7); m.position.set(x, -10, z); far.add(m); if (li === 0) hillTops.push({ x, z, r, h }); } });
    const houseCols = ['#F4E3C3', '#F2C9A0', '#CFE6E0', '#F6D6C8', '#EAD9A8'], roofCols = ['#C8553D', '#2F8F8A', '#B86B3F', '#D9A441'];
    const treeM = M('#5E9A45', { fog: true }), trunkM = M('#7A5A3A', { fog: true });
    hillTops.forEach((H, i) => { for (let k = 0; k < 5; k++) { const ox = (hr() - .5) * H.r * 1.1, oz = (hr() - .5) * H.r * .4, k2 = 1 - (ox * ox) / (H.r * H.r) - (oz * oz) / (H.r * H.r * .49); if (k2 <= .05) continue; const y = -10 + H.h * Math.sqrt(k2);
        if (hr() < .45 && i % 2 === 0) { const w = 3 + hr() * 2, g = new T3.Group(); g.add(mesh(new T3.BoxGeometry(w, 2.4, w * .8), M(houseCols[k % 5], { fog: true }), 0, 1.2, 0)); const rf = mesh(new T3.ConeGeometry(w * .82, 1.8, 4), M(roofCols[(i + k) % 4], { fog: true }), 0, 3.3, 0); rf.rotation.y = Math.PI / 4; rf.scale.z = .8; g.add(rf); g.position.set(H.x + ox, y - .3, H.z + oz); g.rotation.y = hr() * TAU; far.add(g); }
        else { const s = 2.5 + hr() * 2.5; far.add(mesh(new T3.CylinderGeometry(.25 * s, .3 * s, 1.6 * s, 6), trunkM, H.x + ox, y + .6 * s, H.z + oz)); const c = mesh(new T3.SphereGeometry(s, 10, 8), treeM, H.x + ox, y + 2 * s, H.z + oz); c.scale.y = .85; far.add(c); } } });

    // ---- sun disc low on the horizon ----
    const sunDisc = new T3.Mesh(new T3.CircleGeometry(30, 48), new T3.MeshBasicMaterial({ color: 0xFFF3CC, fog: false, transparent: true, opacity: .95, depthWrite: false }));
    sunDisc.position.copy(skyDir).multiplyScalar(820); sunDisc.lookAt(0, 0, 0); sunDisc.renderOrder = 0; scene.add(sunDisc);

    // ---- drifting clouds (depth pre-pass so a fading cloud stays one clean shape) ----
    const cloudGeo = new T3.SphereGeometry(1, 16, 12), cr = seeded(99), clouds = [];
    const CL = [[-260, 92, -470, 30], [-90, 70, -520, 36], [70, 112, -560, 40], [210, 58, -430, 28], [330, 96, -520, 34], [-400, 60, -500, 32], [10, 46, -380, 22], [-200, 130, -600, 44], [260, 150, -640, 46]];
    CL.forEach(([x, y, z, s], i) => { const g = new T3.Group(), n = 5 + Math.floor(cr() * 4); const col = new T3.MeshToonMaterial({ color: '#FFF1E2', gradientMap: gm, transparent: true, depthWrite: false, depthFunc: T3.LessEqualDepth, fog: false }), dep = new T3.MeshBasicMaterial({ colorWrite: false });
      for (let k = 0; k < n; k++) { const sc2 = s * (.6 + cr() * .6), px = (k - n / 2) * s * .75, py = cr() * s * .35, pz = (cr() - .5) * s * .8; const a = new T3.Mesh(cloudGeo, dep), c = new T3.Mesh(cloudGeo, col); [a, c].forEach(m => { m.scale.setScalar(sc2); m.position.set(px, py, pz); g.add(m); }); a.renderOrder = 1; c.renderOrder = 2; }
      g.scale.y = .6; g.position.set(x, y, z); scene.add(g); clouds.push({ g, col, x, ph: i / CL.length, v: 70 + cr() * 40 }); });

    // ---- the animated shader clocks (life.js uTime; living.js uLT is stage._living.U), driven by the loop ----
    const tU = new Set();
    scene.traverse(o => { const ms = Array.isArray(o.material) ? o.material : (o.material ? [o.material] : []); ms.forEach(m => { if (m.__tp) return; m.__tp = 1; const prev = m.onBeforeCompile; m.onBeforeCompile = function (sh, r) { prev.call(this, sh, r); if (sh.uniforms.uTime) tU.add(sh.uniforms.uTime); }; }); });

    const cam = new T3.PerspectiveCamera(LAYOUT.cam.fov, 16 / 9, .1, 3000);
    cam.position.set(LAYOUT.cam.x, LAYOUT.cam.y, LAYOUT.cam.z); cam.lookAt(LAYOUT.cam.tx, LAYOUT.cam.ty, LAYOUT.cam.tz);
    await yieldUI(); if (dead) throw new Error('disposed');
    try { await ren.compileAsync(scene, cam); } catch (e) { console.warn(e); }
    if (dead) throw new Error('disposed');
    ctx = { ren, scene, cam, kids, sipa, clouds, tU, sun, center, dolly: new T3.Vector3(), drift: 1, res: 1 };
    if (view.w) layout(view.w, view.h, view.focus);
    return true;
  })();
  ready.catch(() => {});

  // ---------- choreography: everything is a function of T on a 12 s loop ----------
  const clip = (n, tt) => CLIPS[n].f(((tt % CLIPS[n].dur) + CLIPS[n].dur) % CLIPS[n].dur, CLIPS[n].dur);
  const mix = (A, B, w) => { if (w <= 0) return A; const o = Object.assign({}, A); for (const k in B) o[k] = (A[k] || 0) * (1 - w) + B[k] * w; for (const k in A) if (!(k in B)) o[k] = A[k] * (1 - w); return o; };
  const add = (A, B) => { const o = Object.assign({}, A); for (const k in B) o[k] = (o[k] || 0) + B[k]; return o; };
  function render(T) {
    const { ren, scene, cam, kids, sipa, clouds, tU, dolly } = ctx, L = LOOP;
    const t = ((T % L) + L) % L;
    // foliage & bunting clock: periodic, so leaves return to the same pose at the seam
    const sway = 2.2 * MOTION.osc(t, 1, L) + .6 * MOTION.osc(t, 2, L, 1);
    tU.forEach(u => u.value = sway); if (stage._living) stage._living.U.value = sway;

    // camera: slow elliptical drift → continuous parallax, closes on itself (raised and calmer on narrow screens)
    const C = LAYOUT.cam, dr = ctx.drift;
    const cx = C.x + dr * .55 * MOTION.osc(t, 1, L, Math.PI / 2), cz = C.z - dr * .45 * (MOTION.osc(t, 1, L) * .5 + .5), cy = C.y + dr * .06 * MOTION.osc(t, 2, L);
    cam.position.set(cx + dolly.x, cy + dolly.y, cz + dolly.z); cam.lookAt(C.tx + dr * .2 * MOTION.osc(t, 1, L, Math.PI / 2) + dolly.x, C.ty + dolly.y, C.tz + dolly.z);

    // clouds drift right-to-left and fade at the ends of their cycle
    clouds.forEach(c => { const u = (t / L + c.ph) % 1; c.g.position.x = c.x + (.5 - u) * c.v; c.col.opacity = ss(0, .28, u) * (1 - ss(.72, 1, u)) * .96; });

    const lookYaw = (K, wx, wz) => { const B0 = K.base; let a = Math.atan2(wx - B0.x, wz - B0.z) - B0.yaw; while (a > Math.PI) a -= TAU; while (a < -Math.PI) a += TAU; return Math.max(-.8, Math.min(.8, a)); };
    const blinkAt = ts => ts.some(b => t >= b && t < b + .13);
    // Maglaro pressed: all four cheer, one after another, over whatever they were doing
    const VD = CLIPS.victory.dur, cheer = i => { const vt = T - cheerAt - i * .12; return vt >= 0 && vt < VD ? { w: Math.min(1, vt / .2, (VD - vt) / .25), vt } : null; };
    const pose = (K, p, i) => { const c = cheer(i); applyPose(K, c ? mix(p, CLIPS.victory.f(c.vt, VD), c.w) : p); return c && c.w > .3; };
    const face = (K, expr, blink) => { setExpression(K, expr); if (blink) K.face.eyes.forEach(e => e.scale.y *= .12); };

    // ---- sipa streak (Bunso): a kick every 2.4 s, timed to the model's kick clip (contact ≈ 0.5 s in)
    const P = 2.4, K0 = .6, up = ((t - K0) / P % 1 + 1) % 1;
    let kd = ((t - K0) % P + P) % P; if (kd > P / 2) kd -= P;
    const ct = kids.contact, h = 4 * up * (1 - up), apex = 1.05;
    sipa.position.set(ct.x - .04 * Math.sin(up * TAU), ct.y + apex * h, ct.z + .03 * Math.sin(up * Math.PI)); sipa.rotation.set(Math.sin(up * TAU) * .25, up * TAU * 2, 0);
    const Bu = kids.Bunso, kc = Math.min(CLIPS.kick.dur, Math.max(0, kd + .5));
    const cB = pose(Bu, add(mix(clip('idle', t), CLIPS.kick.f(kc === CLIPS.kick.dur ? 0 : kc, CLIPS.kick.dur), kc > 0 && kc < CLIPS.kick.dur ? 1 : 0), { 'head.x': .25 - .55 * h }), 0);
    face(Bu, cB || h > .3 ? 'excited' : 'happy', blinkAt([2.05, 8.9]));

    // Neneng: watches the sipa, cheers two of the kicks
    const Ne = kids.Neneng, nc = Math.max(MOTION.win(t, CUES.Streak + 1.55, CUES.Streak + 2.55, .3), MOTION.win(t, CUES.Settle + 2.3, CUES.Settle + 3.2, .3));
    const cN = pose(Ne, add(mix(clip('idle', t + .6), clip('victory', t), nc), { 'head.y': lookYaw(Ne, sipa.position.x, sipa.position.z) * (1 - nc), 'head.x': -.35 * h * (1 - nc) }), 1);
    face(Ne, cN || nc > .3 ? 'excited' : 'happy', blinkAt([1.35, 4.6, 9.3]));

    // Totoy: watches, then turns and waves Jun over
    const To = kids.Totoy, wave = MOTION.win(t, CUES.Streak + 2.7, CUES.Settle + .9, .45), turn = MOTION.win(t, CUES.Streak + 2.4, CUES.Settle + 1.2, .5);
    const tyaw = lookYaw(To, sipa.position.x, sipa.position.z) * (1 - turn) + lookYaw(To, kids.Jun.base.x, kids.Jun.base.z) * turn;
    To.group.rotation.y = To.base.yaw + .25 * turn;
    const cT = pose(To, add(mix(clip('idle', t + 1.2), clip('wave', t), wave), { 'head.y': tyaw - .25 * turn, 'head.x': -.3 * h * (1 - turn) }), 2);
    face(To, cT || wave > .2 ? 'excited' : 'happy', blinkAt([3.3, 7.2, 11.4]));

    // Jun: patintero guard on the chalk line, bouncing; hops when Totoy waves
    const Ju = kids.Jun, hopJ = MOTION.pop(t, CUES.Settle + .55, .28, .38), dipJ = MOTION.pop(t, CUES.Settle + .22, .2, .2);
    const look = MOTION.win(t, CUES.Streak + 3.1, CUES.Settle + 1.5, .45), bob = .5 + .5 * MOTION.osc(t, 12, L, -Math.PI / 2), c = .32 + .18 * (1 - bob) + .45 * dipJ - .3 * hopJ;
    Ju.group.position.x = Ju.base.x + .14 * MOTION.osc(t, 2, L);
    const cJ = pose(Ju, { 'upperLeg_L.x': -.65 * c, 'upperLeg_R.x': -.65 * c, 'lowerLeg_L.x': 1.3 * c, 'lowerLeg_R.x': 1.3 * c, 'foot_L.x': -.65 * c, 'foot_R.x': -.65 * c, 'upperLeg_L.z': .12, 'upperLeg_R.z': -.12,
      rootY: -.048 * c + .11 * hopJ, 'spine.x': .2 * c + .06, 'upperArm_L.z': .7 + .5 * hopJ, 'upperArm_R.z': -.7 - .5 * hopJ, 'upperArm_L.x': -.5, 'upperArm_R.x': -.5, 'lowerArm_L.x': -.5, 'lowerArm_R.x': -.5,
      'head.x': -.1 - .1 * c, 'head.y': -.15 * (1 - look) + lookYaw(Ju, To.base.x, To.base.z) * look, 'head.z': .04 * MOTION.osc(t, 2, L) }, 3);
    face(Ju, cJ || look > .3 ? 'excited' : 'determined', blinkAt([.9, 5.9, 10.8]));

    ren.render(scene, cam);
  }

  /* size the drawing buffer to the screen. focus {x, y, fw} places the kids: the point (0..1 of the screen) they stand
     around, and the fraction of the screen's width left free for them by the menu. When that free area is narrower
     than the design's frame, the camera rises (so the ground in front of the kids fills the lower part, not the
     island's edge), calms its drift and widens until all four kids fit across */
  const RES = [.5, .75, 1];
  function layout(w, h, focus) {
    view = { w, h, focus: focus || null }; if (!ctx || !w || !h) return;
    const { ren, cam, center, dolly } = ctx, C = LAYOUT.cam, TL = LAYOUT.tall, f = focus || {}, fw = f.fw || 1, pr = Math.min(maxDpr, window.devicePixelRatio || 1) * RES[ctx.res];
    ren.setPixelRatio(1); ren.setSize(Math.max(1, Math.round(w * pr)), Math.max(1, Math.round(h * pr)), false);
    cam.aspect = w / h; cam.clearViewOffset();
    // n: 0 when the free area is square or wider, 1 when it is 1:2 portrait
    const n = Math.min(1, Math.max(0, (1 - cam.aspect * fw) / .5));
    dolly.set(0, (TL.y - C.y) * n, (TL.z - C.z) * n); ctx.drift = 1 - .7 * n;
    cam.position.set(C.x, C.y, C.z - .225).add(dolly); cam.lookAt(C.tx + dolly.x, C.ty + dolly.y, C.tz + dolly.z);
    const d = cam.position.distanceTo(center); cam.fov = Math.max(C.fov, 2 * Math.atan(LAYOUT.span / fw / 2 / (d * cam.aspect)) * 180 / Math.PI);
    cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    if (f.x != null || f.y != null) { const v = center.clone().project(cam), px = (v.x + 1) / 2, py = (1 - v.y) / 2;
      cam.setViewOffset(w, h, f.x != null ? (px - f.x) * w : 0, f.y != null ? (py - f.y) * h : 0, w, h); }
    if (shown) { if (reduced) render(0); else kick(); }
  }

  // frame pump: steps the resolution down while frames are slow and back up while they are cheap
  let last = 0, avg = 0, cheap = 0, lastStep = 0;
  // raf stays set while a frame runs, so a layout() from inside it cannot start a second loop
  function frame(now) {
    if (dead || !shown || !ctx || document.hidden) { raf = 0; return; }
    const dt = last ? now - last : 16; last = now; avg = avg ? avg * .9 + dt * .1 : dt;
    if (now - lastStep > 1500) {
      if (avg > 45 && ctx.res > 0) { ctx.res--; lastStep = now; layout(view.w, view.h, view.focus); }
      else if (avg < 20 && ctx.res < RES.length - 1) { if (++cheap > 90) { ctx.res++; cheap = 0; lastStep = now; layout(view.w, view.h, view.focus); } }
      else cheap = 0;
    }
    try { render((now - t0) / 1000); } catch (e) { console.error(e); raf = 0; return; }
    raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf && !dead && shown && ctx && !reduced && !document.hidden) { last = 0; raf = requestAnimationFrame(frame); } }
  const vis = () => kick();
  document.addEventListener('visibilitychange', vis);

  return {
    ready,
    layout,
    /* draw while shown (the loop restarts from the opening frame each time the menu opens) */
    show(on) { if (shown === !!on) return; shown = !!on; if (!shown) { cancelAnimationFrame(raf); raf = 0; return; } t0 = performance.now(); cheerAt = -99; if (ctx && reduced) render(0); else kick(); },
    /* all four kids cheer, one after another */
    cheer() { if (reduced) return; cheerAt = (performance.now() - t0) / 1000; },
    /* one frame at loop time T (for the still picture) */
    still(T = 0) { if (ctx) render(T); },
    /* the pixel-ratio cap, the pixel ratio drawn at now (the frame pump may lower it) and the shadow-map size */
    info() { const cap = Math.min(maxDpr, window.devicePixelRatio || 1); return { cap, pr: ctx ? cap * RES[ctx.res] : 0, shadow: shadow > 0 ? shadow : 0 }; },
    dispose() {
      dead = true; stop.v = true; shown = false; cancelAnimationFrame(raf); document.removeEventListener('visibilitychange', vis);
      // a build still under way (shaders compiling) stops at its next step; free the GPU memory once it has
      const free = () => { if (!made) return; const { ren, scene, isl } = made; ctx = made = null;
        const LV = stage._living, i = LV ? LV.islands.indexOf(isl) : -1; if (i >= 0) LV.islands.splice(i, 1);   // only this build's water, grass and leaves
        scene.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) [].concat(o.material).forEach(m => { for (const k in m) { const v = m[k]; if (v && v.isTexture) v.dispose(); } m.dispose(); }); });
        if (scene.environment) scene.environment.dispose(); ren.dispose(); };
      ctx = null; ready.then(free, free);
    }
  };
}
