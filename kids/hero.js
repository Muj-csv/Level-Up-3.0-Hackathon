/* Taympers hero kids: the four rigged kids (kids.js) on one transparent orthographic WebGL layer, for the splash
   screen and the main menu. Adapted from the splash design's "3D kids v4": they hop in from the sides, Neneng waves
   once, and all four cheer on cue. Full frame rate only while something moves, about 20 fps idle, paused when the
   page is hidden. */
import * as T3 from '../vendor/three-r184/three.module.min.js';
import { KIDS, buildKid, setExpression, applyPose, poseAt, CLIPS } from './kids.js';
const PI3 = Math.PI, TILT = 0.2, CT = Math.cos(TILT), KH = 0.95;
const cl = (v, a, b) => Math.max(a, Math.min(b, v));
const ease = p => 1 - Math.pow(1 - p, 3);
function mix(a, b, w) { if (w <= 0) return a; if (w >= 1) return b; const o = {}; for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) o[k] = (a[k] || 0) * (1 - w) + (b[k] || 0) * w; return o; }
export const ORDER = KIDS.map(k => k.name); // Bunso, Neneng, Totoy, Jun (left → right)

export function create(canvas, { reduced = false, maxDpr = 2 } = {}) {
  const ren = new T3.WebGLRenderer({ canvas, antialias: true, alpha: true });
  ren.setPixelRatio(Math.min(maxDpr, window.devicePixelRatio || 1));
  ren.shadowMap.enabled = true; ren.shadowMap.type = T3.PCFShadowMap; ren.outputColorSpace = T3.SRGBColorSpace;
  const S = new T3.Scene();
  const cam = new T3.OrthographicCamera(-1, 1, 1, -1, -4000, 4000);
  cam.position.set(0, Math.sin(TILT) * 1000, Math.cos(TILT) * 1000); cam.lookAt(0, 0, 0);
  S.add(new T3.HemisphereLight('#FFF4E2', '#BDE7A6', 1.5));
  const key = new T3.DirectionalLight('#FFF1DC', 1.7); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0008;
  const front = new T3.DirectionalLight('#FFFFFF', 0.7);
  S.add(key, key.target, front, front.target);

  /* entrance: hop in from the side (jump clip), then idle; Neneng waves once; all cheer (victory) on cue */
  const ROLE = [
    { delay: 800, from: -1, tile: '#FFC93C' },
    { delay: 1160, from: -1, tile: '#F7A8A0', wave: true },
    { delay: 980, from: 1, tile: '#9DD6DF' },
    { delay: 1340, from: 1, tile: '#BDE7A6' }];
  const tileGeo = new T3.CylinderGeometry(.3, .3, .07, 6), rimM = new T3.MeshBasicMaterial({ color: 0x3B2316, side: T3.BackSide });
  const kids = KIDS.map((def, i) => {
    const K = buildKid(T3, def), slot = new T3.Group(), hop = new T3.Group();
    K.group.traverse(o => { if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; } });
    hop.add(K.group); slot.add(hop); S.add(slot);
    const tile = new T3.Mesh(tileGeo, new T3.MeshStandardMaterial({ color: ROLE[i].tile, roughness: .85 }));
    tile.rotation.y = PI3 / 6; tile.position.y = -.035; tile.receiveShadow = true;
    const rim = new T3.Mesh(tileGeo, rimM); rim.scale.set(1.06, 1.4, 1.06); tile.add(rim);
    slot.add(tile);
    setExpression(K, 'happy'); applyPose(K, poseAt(K, 'idle', 0));
    return { K, slot, hop, r: ROLE[i], i, expr: 'happy' };
  });

  let t0 = performance.now(), readyAt = -1, raf = 0, lastR = 0, dead = false, laid = false, hidden = false, entrance = true;
  const now = () => performance.now();
  function layout(slots, w, h) {
    ren.setSize(w, h, false);
    Object.assign(cam, { left: -w / 2, right: w / 2, top: h / 2, bottom: -h / 2 }); cam.updateProjectionMatrix();
    const D = Math.max(w, h);
    key.position.set(-.5 * D, 1.4 * D, .9 * D); front.position.set(0, .4 * D, 1.2 * D);
    Object.assign(key.shadow.camera, { left: -D * .7, right: D * .7, top: D * .7, bottom: -D * .7, near: 1, far: 5 * D }); key.shadow.camera.updateProjectionMatrix();
    slots.forEach((s, i) => { const k = kids[i]; k.slot.position.set(s.x - w / 2, (h / 2 - s.y) / CT, s.z || 0); k.slot.scale.setScalar(s.h / KH); k.slot.rotation.y = s.yaw || 0; });
    laid = true; kick();
  }
  function expr(k, e) { if (k.expr !== e) { setExpression(k.K, e); k.expr = e; } }
  function step(t) {
    let busy = false;
    for (const k of kids) {
      const { K, r } = k, lt = reduced || !entrance ? 1e9 : t - r.delay;
      K.group.visible = lt >= 0; if (lt < 0) { busy = true; continue; }
      const ts = lt / 1000, tempo = K.def.tempo || 1;
      let pose = poseAt(K, 'idle', reduced ? 0 : (t / 1000) * tempo), dx = 0;
      const JD = CLIPS.jump.dur;
      if (ts < JD) {
        pose = poseAt(K, 'jump', ts); busy = true;
        dx = r.from * (1 - ease(cl((ts - .3) / .6, 0, 1))) * .75;
      } else if (r.wave && ts > JD + .1 && ts < JD + .1 + CLIPS.wave.dur * 1.5) {
        const wt = ts - JD - .1, w = Math.min(1, wt / .25, (CLIPS.wave.dur * 1.5 - wt) / .25);
        pose = mix(pose, poseAt(K, 'wave', wt), w); busy = true;
      }
      if (readyAt >= 0) {
        const vt = (t - readyAt) / 1000 - k.i * .12, VD = CLIPS.victory.dur;
        if (!reduced && vt >= 0 && vt < VD) { const w = Math.min(1, vt / .2, (VD - vt) / .25); pose = mix(pose, poseAt(K, 'victory', vt), w); busy = true; expr(k, 'excited'); }
        else if (vt >= VD || reduced) expr(k, 'happy');
      }
      k.hop.position.x = dx;
      applyPose(K, pose);
    }
    return busy;
  }
  function frame() {
    raf = 0; if (dead || !laid || hidden) return;
    const tn = now(), busy = step(tn - t0);
    if (busy || tn - lastR > 48 || reduced) { ren.render(S, cam); lastR = tn; }
    if (!reduced && !document.hidden) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf && !dead && !hidden) raf = requestAnimationFrame(frame); }
  const vis = () => { if (!document.hidden) kick(); };
  document.addEventListener('visibilitychange', vis);
  return {
    layout,
    /* start (or restart) the hop-in entrance; withEntrance false shows the kids standing at once */
    play(withEntrance = true) { t0 = now(); readyAt = -1; entrance = withEntrance; kick(); },
    /* all four cheer, one after another */
    cheer() { readyAt = now() - t0; kick(); },
    show(on) { hidden = !on; if (on) kick(); },
    renderOnce() { if (!laid) return; step(now() - t0); ren.render(S, cam); },
    dispose() { dead = true; cancelAnimationFrame(raf); document.removeEventListener('visibilitychange', vis); ren.dispose(); }
  };
}
