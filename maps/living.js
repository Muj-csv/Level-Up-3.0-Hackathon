// Taympers "living" pass: flowing water, shell grass, leaf cards, contact AO, weathering, cloud shadows,
// bloom + tilt-shift, wandering NPCs / animals / vehicles, seasons (Fiesta, Pasko, Tag-ulan), sound spots.
// Usage (after polish + addLife): const { addLiving } = await import('./living.js'); await addLiving(THREE, stage, root, opts)
export async function addLiving(THREE, stage, root, o = {}) {
  const PI = Math.PI, TAU = PI * 2;
  let seed = o.seed ?? 7; const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const pick = a => a[(rnd() * a.length) | 0];
  const S = stage._living || (stage._living = { islands: [], U: { value: 0 }, season: 'normal', tilt: true, sounds: false }), U = S.U;
  const scene = stage._scene, renderer = stage._renderer, isl = { name: o.name || 'island', agents: [], tick: [], season: {}, emissive: [], wet: [] };
  const life = new THREE.Group(); life.name = 'living_' + isl.name; scene.add(life); S.islands.push(isl);
  root.updateMatrixWorld(true);
  const mn = m => (m && m.name) || '';
  const RX_WATER = /water|lagoon|channel|pool|puddle|wallow/i, RX_FALL = /waterfall|falls|mist/i;
  const RX_GROUND = o.ground || /^grass$|^white_sand$|sand_dunes|ground_terraces|^soil$|^rock$/;
  const RX_GRASS = o.grassOn || /^grass$|sand_dunes|ground_terraces/;
  const RX_FOLIAGE = /^(leaf|leaf_light|leaf_dark|forest|mangrove_leaf|canopy)$/;
  const RX_WALL = /stucco|adobe|concrete|cement|wall|plywood|hollow|granite|brick|limestone|stone|tile_white/;
  const T0 = performance.now(), TM = (k) => (o.timing && (o.timing[k] = Math.round(performance.now() - T0)));
  const meshes = []; root.traverse(m => { if (m.isMesh && !m.isInstancedMesh && m.geometry?.attributes?.position && !Array.isArray(m.material)) meshes.push(m); });
  const overlay = meshes.some(m => /sand_dunes|ground_terraces/.test(mn(m.material)));
  const isGrassTarget = m => RX_GRASS.test(mn(m.material)) && !(overlay && mn(m.material) === 'grass' && /^terrain/.test(m.name));

  // ---------- island raster: ground height, blockers, obstacles, canopy, water, board band ----------
  const bb = new THREE.Box3(), tb = new THREE.Box3();
  meshes.forEach(m => { if (RX_GROUND.test(mn(m.material)) && !/islet/.test(m.name)) { tb.setFromObject(m); bb.union(tb); } });
  if (bb.isEmpty()) bb.setFromObject(root);
  const CS = .2, x0 = bb.min.x - 2, z0 = bb.min.z - 2, NX = Math.ceil((bb.max.x - bb.min.x + 4) / CS), NZ = Math.ceil((bb.max.z - bb.min.z + 4) / CS), N = NX * NZ;
  const cellOf = (x, z) => { const i = Math.floor((x - x0) / CS), j = Math.floor((z - z0) / CS); return (i < 0 || j < 0 || i >= NX || j >= NZ) ? -1 : j * NX + i; };
  const ccx = c => x0 + (c % NX + .5) * CS, ccz = c => z0 + (((c / NX) | 0) + .5) * CS;
  function raster(ax, az, bx, bz, cx, cz, fn) {
    let i0 = Math.floor((Math.min(ax, bx, cx) - x0) / CS), i1 = Math.floor((Math.max(ax, bx, cx) - x0) / CS), j0 = Math.floor((Math.min(az, bz, cz) - z0) / CS), j1 = Math.floor((Math.max(az, bz, cz) - z0) / CS);
    if (i1 < 0 || j1 < 0 || i0 >= NX || j0 >= NZ) return; i0 = Math.max(0, i0); j0 = Math.max(0, j0); i1 = Math.min(NX - 1, i1); j1 = Math.min(NZ - 1, j1);
    const d = (bx - ax) * (cz - az) - (bz - az) * (cx - ax);
    if (Math.abs(d) > 1e-7) for (let j = j0; j <= j1; j++) { const pz = z0 + (j + .5) * CS; for (let i = i0; i <= i1; i++) { const px = x0 + (i + .5) * CS, w0 = ((bx - px) * (cz - pz) - (bz - pz) * (cx - px)) / d, w1 = ((cx - px) * (az - pz) - (cz - pz) * (ax - px)) / d; if (w0 >= -1e-4 && w1 >= -1e-4 && 1 - w0 - w1 >= -1e-4) fn(j * NX + i); } }
    if (i1 - i0 < 2 || j1 - j0 < 2 || Math.abs(d) < CS * CS) { const seg = (a1, b1, a2, b2) => { const k = Math.max(1, Math.ceil(Math.hypot(a2 - a1, b2 - b1) / (CS * .7))); for (let s = 0; s <= k; s++) { const c = cellOf(a1 + (a2 - a1) * s / k, b1 + (b2 - b1) * s / k); if (c >= 0) fn(c); } }; seg(ax, az, bx, bz); seg(bx, bz, cx, cz); seg(cx, cz, ax, az); }
  }
  const v = new THREE.Vector3();
  const worldTris = m => { const g = m.geometry, p = g.attributes.position, W = new Float32Array(p.count * 3); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(m.matrixWorld); W[i * 3] = v.x; W[i * 3 + 1] = v.y; W[i * 3 + 2] = v.z; } return { W, I: g.index ? g.index.array : null, n: g.index ? g.index.count : p.count }; };
  const eachTri = (m, fn) => { const { W, I, n } = worldTris(m); for (let t = 0; t < n; t += 3) { const a = (I ? I[t] : t) * 3, b = (I ? I[t + 1] : t + 1) * 3, c = (I ? I[t + 2] : t + 2) * 3; fn(W[a], W[a + 1], W[a + 2], W[b], W[b + 1], W[b + 2], W[c], W[c + 1], W[c + 2]); } };
  const Hg = new Float32Array(N).fill(-1e9), block = new Uint8Array(N), obst = new Uint8Array(N), canopy = new Uint8Array(N), water = new Uint8Array(N), band = new Uint8Array(N);
  meshes.forEach(m => { if (!RX_GROUND.test(mn(m.material)) || /islet/.test(m.name)) return; eachTri(m, (ax, ay, az, bx, by, bz, cx, cy, cz) => { const y = (ay + by + cz * 0 + cy) / 3; raster(ax, az, bx, bz, cx, cz, c => { if (y > Hg[c]) Hg[c] = y; }); }); });
  TM('ground'); const Hw = Hg.slice();
  meshes.forEach(m => { const nm = mn(m.material); if (RX_GROUND.test(nm) || /islet|cloud|ibon|paruparo|sky/.test(m.name) || RX_FALL.test(nm)) return; const wet = RX_WATER.test(nm);
    eachTri(m, (ax, ay, az, bx, by, bz, cx, cy, cz) => { const c0 = cellOf((ax + bx + cx) / 3, (az + bz + cz) / 3); const hg = c0 >= 0 && Hg[c0] > -1e8 ? Hg[c0] : 0, mi = Math.min(ay, by, cy), ma = Math.max(ay, by, cy);
      if (wet) { raster(ax, az, bx, bz, cx, cz, c => { water[c] = 1; block[c] = 1; }); return; }
      const near = mi < hg + .6, tall = ma > hg + .25 && mi < hg + 1.5, high = mi > hg + 1.8 && !/flag|banderita|string|wire/.test(nm);
      if (!near && !tall && !high) return;
      const ux = bx - ax, uy = by - ay, uz = bz - az, wx = cx - ax, wy = cy - ay, wz = cz - az, ny = uz * wx - ux * wz, nl = Math.hypot(uy * wz - uz * wy, ny, ux * wy - uy * wx) || 1, up = Math.abs(ny / nl) > .85 && ma < hg + .3;
      raster(ax, az, bx, bz, cx, cz, c => { if (near) block[c] = 1; if (tall) obst[c] = 1; if (high) canopy[c] = 1; if (up && ma > Hw[c]) Hw[c] = ma; }); }); });
  TM('classify'); const board = root.getObjectByName('board_spaces'), nodes = board?.userData?.nodes || [];
  const nodeW = Object.fromEntries(nodes.map(n => [n.id, new THREE.Vector3(n.x, n.y ?? .05, n.z).applyMatrix4(root.matrixWorld)]));
  const stamp = (arr, x, z, r) => { const ci = Math.floor((x - x0) / CS), cj = Math.floor((z - z0) / CS), rr = Math.ceil(r / CS); for (let j = cj - rr; j <= cj + rr; j++) for (let i = ci - rr; i <= ci + rr; i++) if (i >= 0 && j >= 0 && i < NX && j < NZ && (i - ci) ** 2 + (j - cj) ** 2 <= rr * rr) arr[j * NX + i] = 1; };
  nodes.forEach(n => n.next.forEach(id => { const a = nodeW[n.id], b = nodeW[id]; if (!b) return; const L = a.distanceTo(b); if (L > 12) return; for (let s = 0; s <= L; s += .3) { const t = s / L; stamp(band, a.x + (b.x - a.x) * t, a.z + (b.z - a.z) * t, 1.6); } }));
  const blur = (src, r) => { let a = Float32Array.from(src), b = new Float32Array(N); for (let it = 0; it < 2; it++) { for (let j = 0; j < NZ; j++) { let s = 0; const o0 = j * NX; for (let i = -r; i <= r; i++) s += a[o0 + Math.min(NX - 1, Math.max(0, i))]; for (let i = 0; i < NX; i++) { b[o0 + i] = s / (2 * r + 1); s += a[o0 + Math.min(NX - 1, i + r + 1)] - a[o0 + Math.max(0, i - r)]; } }
      for (let i = 0; i < NX; i++) { let s = 0; for (let j = -r; j <= r; j++) s += b[Math.min(NZ - 1, Math.max(0, j)) * NX + i]; for (let j = 0; j < NZ; j++) { a[j * NX + i] = s / (2 * r + 1); s += b[Math.min(NZ - 1, j + r + 1) * NX + i] - b[Math.max(0, j - r) * NX + i]; } } } return a; };
  const aoB = blur(obst, 3), caB = blur(canopy, 7), blB = blur(block, 4), bdB = blur(band, 9), data = new Uint8Array(N * 4);
  for (let c = 0; c < N; c++) { data[c * 4] = block[c] ? 255 : 0; data[c * 4 + 1] = Math.min(255, aoB[c] * 1.7 * 255); data[c * 4 + 2] = Math.min(255, caB[c] * 1.3 * 255); data[c * 4 + 3] = Math.min(255, Math.max(blB[c] * 1.4, bdB[c] * 1.25) * 255); }
  const maskTex = new THREE.DataTexture(data, NX, NZ, THREE.RGBAFormat); maskTex.magFilter = maskTex.minFilter = THREE.LinearFilter; maskTex.needsUpdate = true;
  TM('masks'); const MB = new THREE.Vector4(x0, z0, 1 / (NX * CS), 1 / (NZ * CS));
  // walkable grid for agents
  const walk = new Uint8Array(N); { const bad = new Uint8Array(N); for (let c = 0; c < N; c++) bad[c] = (obst[c] || water[c] || Hg[c] < -1e8) ? 1 : 0; const badB = blur(bad, 2); for (let c = 0; c < N; c++) walk[c] = (badB[c] < .02 && !band[c] && Hg[c] > -1e8) ? 1 : 0; }
  const walkAt = (x, z) => { const c = cellOf(x, z); return c >= 0 && walk[c] === 1; }, hAt = (x, z) => { const c = cellOf(x, z); return c >= 0 && Hw[c] > -1e8 ? Hw[c] : 0; };
  const freeCells = []; for (let c = 0; c < N; c += 2) if (walk[c]) freeCells.push(c);

  // ---------- shader helpers ----------
  const NOISE = 'float lv_h(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }\nfloat lv_n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f); return mix(mix(lv_h(i), lv_h(i + vec2(1., 0.)), f.x), mix(lv_h(i + vec2(0., 1.)), lv_h(i + vec2(1., 1.)), f.x), f.y); }\nfloat lv_f(vec2 p){ return lv_n(p) * .55 + lv_n(p * 2.03 + 7.1) * .3 + lv_n(p * 4.1 + 3.7) * .15; }\n';
  const CLOUD = '{ float lvc = smoothstep(.42, .72, lv_f(vLWP.xz * .016 + vec2(uLT * .011, uLT * .006))); gl_FragColor.rgb *= 1. - lvc * .2; }';
  const chain = (m, key, fn) => { if (m.userData['lv_' + key]) return; m.userData['lv_' + key] = 1; const prev = m.onBeforeCompile, pk = m.customProgramCacheKey ? m.customProgramCacheKey.bind(m) : () => ''; m.onBeforeCompile = (sh, r) => { prev.call(m, sh, r); fn(sh); }; m.customProgramCacheKey = () => pk() + '|' + key; m.needsUpdate = true; };
  const WATER_V = 'vW = aW; if (aW.x >= 0.0) { float wk = smoothstep(0.0, 1.2, aW.x); transformed.y += (sin(lw.x * .55 + uLT * 1.1) * .6 + sin(lw.z * .8 - uLT * 1.45 + lw.x * .3) * .4) * aW.w * wk; lw = modelMatrix * vec4(transformed, 1.0); }';
  const WATER_F = `{ float dep = vW.x >= 0. ? clamp(vW.x / max(vW.z, .6), 0., 1.) : 1. - abs(vW.y); vec3 bc = diffuseColor.rgb;
    diffuseColor.rgb = mix(mix(bc, vec3(.45, .82, .78), .3), bc * vec3(.42, .70, .86), smoothstep(0., 1., dep)); diffuseColor.a *= mix(.7, 1., dep); float fo = 0.;
    if (vW.x >= 0.) { float bnd = .3 + .17 * sin(uLT * 1.4 + lv_n(vLWP.xz * .5) * 6.2832); fo = smoothstep(bnd, bnd * .3, vW.x) * smoothstep(.25, .6, lv_n(vLWP.xz * 3. + uLT * .3)); }
    else { fo = smoothstep(.6, .86, lv_n(vec2(vW.y * 3., vW.z * .9 - uLT * 1.6))) * .8 + smoothstep(.72, 1., abs(vW.y)) * .45; }
    fo = clamp(fo, 0., 1.) * .85; diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.9, .95, .95), fo); diffuseColor.a = max(diffuseColor.a, fo); }`;
  const SPARK = '{ float sp = pow(lv_n(vLWP.xz * 4.3 + vec2(uLT * .5, -uLT * .35)) * lv_n(vLWP.xz * 6.7 - vec2(uLT * .4, uLT * .6)), 12.) * 90.; gl_FragColor.rgb += vec3(1., .97, .9) * clamp(sp, 0., 1.6) * (vW.x < 0. ? 1. : smoothstep(.009, .02, vW.w)); }';
  const WEATHER = `{ float gy = vLWP.y; float grime = 1. - smoothstep(0., 1.1, gy); float n1 = lv_f(vLWP.xz * 1.3 + vLWP.y * .4);
    diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(.55, .7, .38), grime * smoothstep(.45, .72, n1) * .6); diffuseColor.rgb *= 1. - grime * .16;
    float st = lv_n(vec2((vLWP.x + vLWP.z) * 3.1, vLWP.y * .35)); diffuseColor.rgb *= 1. - smoothstep(.62, .86, st) * .15;
    float cr = abs(lv_n((vLWP.xz + vLWP.y) * 1.7) - .5); diffuseColor.rgb *= 1. - (1. - smoothstep(0., .02, cr)) * .3 * smoothstep(.5, .7, lv_n(vLWP.xz * .35 + 4.)); }`;
  const AO = wear => `{ vec4 mk = texture2D(uLMask, (vLWP.xz - uLMB.xy) * uLMB.zw); diffuseColor.rgb *= 1. - mk.g * .42 - mk.b * .2; ${wear ? 'diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.33, .24, .14), mk.a * .45 * (1. - mk.r));' : ''} }`;
  function applyChain(m, f = {}) { if (!m.isMeshStandardMaterial) return; const key = 'lv' + (f.water ? 'w' : '') + (f.ao ? 'a' : '') + (f.wear ? 'r' : '') + (f.weather ? 't' : '') + (f.sway ? 's' : '');
    chain(m, key, sh => { sh.uniforms.uLT = U; sh.uniforms.uLMask = { value: maskTex }; sh.uniforms.uLMB = { value: MB };
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uLT; varying vec3 vLWP;' + (f.water ? '\nattribute vec4 aW; varying vec4 vW;' : ''))
        .replace('#include <project_vertex>', `{ vec4 lw = modelMatrix * vec4(transformed, 1.0);\n#ifdef USE_INSTANCING\nlw = modelMatrix * instanceMatrix * vec4(transformed, 1.0);\n#endif\n${f.sway ? 'transformed.x += sin(uLT * 1.8 + lw.x * .4 + lw.z * .3) * .07 * uv.y; transformed.z += cos(uLT * 1.5 + lw.z * .35) * .05 * uv.y;' : ''}${f.water ? WATER_V : ''}\nvLWP = lw.xyz; }\n#include <project_vertex>`);
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uLT; uniform sampler2D uLMask; uniform vec4 uLMB; varying vec3 vLWP;' + (f.water ? '\nvarying vec4 vW;' : '') + '\n' + NOISE)
        .replace('#include <color_fragment>', '#include <color_fragment>\n' + (f.water ? WATER_F : '') + (f.weather ? WEATHER : '') + (f.ao ? AO(f.wear) : ''))
        .replace('#include <dithering_fragment>', '#include <dithering_fragment>\n' + CLOUD + (f.water ? SPARK : '')); }); }

  // ---------- WATER: retessellate flat water, depth + shore foam + waves, flowing ribbons ----------
  const ribbons = [], stillPts = [], deepPts = [];
  function processWater(m) { const nm = mn(m.material), g0 = m.geometry, P0 = g0.attributes.position;
    if (g0.index && P0.count % 2 === 0 && P0.count >= 6) { const n = P0.count / 2, w = []; for (let i = 0; i < n; i++) w.push(Math.hypot(P0.getX(2 * i) - P0.getX(2 * i + 1), P0.getZ(2 * i) - P0.getZ(2 * i + 1))); const mw = w.reduce((a, b) => a + b, 0) / n;
      if (mw > .3 && mw < 9 && w.every(x => Math.abs(x - mw) < mw * .25)) { const aw = new Float32Array(P0.count * 4), line = []; let s = 0;
        for (let i = 0; i < n; i++) { const cx = (P0.getX(2 * i) + P0.getX(2 * i + 1)) / 2, cy = (P0.getY(2 * i) + P0.getY(2 * i + 1)) / 2, cz = (P0.getZ(2 * i) + P0.getZ(2 * i + 1)) / 2; if (i) s += Math.hypot(cx - line[i - 1].x, cz - line[i - 1].z); line.push(new THREE.Vector3(cx, cy, cz)); aw.set([-1, -1, s, 0], 8 * i); aw.set([-1, 1, s, 0], 8 * i + 4); }
        g0.setAttribute('aW', new THREE.BufferAttribute(aw, 4)); ribbons.push({ m, pts: line.map(p => p.clone().applyMatrix4(m.matrixWorld)), w: mw }); return; } }
    const g = g0.index ? g0.toNonIndexed() : g0, P = g.attributes.position, Cl = g.attributes.color, n = P.count, flat = [], other = []; let area = 0;
    for (let t = 0; t < n; t += 3) { const ax = P.getX(t), ay = P.getY(t), az = P.getZ(t), ux = P.getX(t + 1) - ax, uy = P.getY(t + 1) - ay, uz = P.getZ(t + 1) - az, wx = P.getX(t + 2) - ax, wy = P.getY(t + 2) - ay, wz = P.getZ(t + 2) - az, ny = uz * wx - ux * wz, nl = Math.hypot(uy * wz - uz * wy, ny, ux * wy - uy * wx) || 1;
      if (Math.abs(ny / nl) > .9) { flat.push(t); area += Math.abs(ny) / 2; } else other.push(t); }
    const pos = [], col = [], aw = [], nor = [], uv = [], hasC = !!Cl;
    const pushV = (x, y, z, c, a) => { pos.push(x, y, z); nor.push(0, 1, 0); uv.push(x, -z); if (hasC) col.push(...c); aw.push(...a); };
    let gridOK = false;
    if (!/puddle|mud|wallow|ice/.test(nm) && area > 2) { let bx0 = 1e9, bz0 = 1e9, bx1 = -1e9, bz1 = -1e9; flat.forEach(t => { for (let k = 0; k < 3; k++) { const x = P.getX(t + k), z = P.getZ(t + k); bx0 = Math.min(bx0, x); bx1 = Math.max(bx1, x); bz0 = Math.min(bz0, z); bz1 = Math.max(bz1, z); } });
      const cs = area > 300 ? .6 : area > 60 ? .45 : area > 12 ? .3 : .2, gx = Math.ceil((bx1 - bx0) / cs) + 1, gz = Math.ceil((bz1 - bz0) / cs) + 1, BK = 2, bk = new Map();
      if (gx * gz < 400000) { gridOK = true; flat.forEach(t => { let a0 = 1e9, a1 = -1e9, b0 = 1e9, b1 = -1e9; for (let k = 0; k < 3; k++) { a0 = Math.min(a0, P.getX(t + k)); a1 = Math.max(a1, P.getX(t + k)); b0 = Math.min(b0, P.getZ(t + k)); b1 = Math.max(b1, P.getZ(t + k)); } for (let i = Math.floor(a0 / BK); i <= Math.floor(a1 / BK); i++) for (let j = Math.floor(b0 / BK); j <= Math.floor(b1 / BK); j++) { const k = i + ',' + j; if (!bk.has(k)) bk.set(k, []); bk.get(k).push(t); } });
        const ins = new Uint8Array(gx * gz), Y = new Float32Array(gx * gz), CC = new Float32Array(gx * gz * 3);
        for (let j = 0; j < gz; j++) for (let i = 0; i < gx; i++) { const px = bx0 + i * cs, pz = bz0 + j * cs, list = bk.get(Math.floor(px / BK) + ',' + Math.floor(pz / BK)); if (!list) continue; let best = -1e9;
          for (const t of list) { const ax = P.getX(t), az = P.getZ(t), bx = P.getX(t + 1), bz = P.getZ(t + 1), cx = P.getX(t + 2), cz = P.getZ(t + 2), d = (bx - ax) * (cz - az) - (bz - az) * (cx - ax); if (Math.abs(d) < 1e-9) continue;
            const w0 = ((bx - px) * (cz - pz) - (bz - pz) * (cx - px)) / d, w1 = ((cx - px) * (az - pz) - (cz - pz) * (ax - px)) / d, w2 = 1 - w0 - w1; if (w0 < -2e-3 || w1 < -2e-3 || w2 < -2e-3) continue;
            const y = w0 * P.getY(t) + w1 * P.getY(t + 1) + w2 * P.getY(t + 2); if (y > best) { best = y; const q = j * gx + i; ins[q] = 1; Y[q] = y; if (hasC) for (let k = 0; k < 3; k++) CC[q * 3 + k] = w0 * Cl.array[t * 3 + k] + w1 * Cl.array[(t + 1) * 3 + k] + w2 * Cl.array[(t + 2) * 3 + k]; } } }
        const D = new Float32Array(gx * gz).fill(1e9); for (let j = 0; j < gz; j++) for (let i = 0; i < gx; i++) { const q = j * gx + i; if (!ins[q]) { D[q] = -1; continue; } const o2 = (a, b) => a < 0 || b < 0 || a >= gx || b >= gz || !ins[b * gx + a]; if (o2(i - 1, j) || o2(i + 1, j) || o2(i, j - 1) || o2(i, j + 1)) D[q] = 0; }
        const rel = (q, q2, w) => { if (D[q2] >= 0 && D[q2] + w < D[q]) D[q] = D[q2] + w; };
        for (let j = 0; j < gz; j++) for (let i = 0; i < gx; i++) { const q = j * gx + i; if (D[q] <= 0) continue; if (i) rel(q, q - 1, 1); if (j) { rel(q, q - gx, 1); if (i) rel(q, q - gx - 1, 1.414); if (i < gx - 1) rel(q, q - gx + 1, 1.414); } }
        for (let j = gz - 1; j >= 0; j--) for (let i = gx - 1; i >= 0; i--) { const q = j * gx + i; if (D[q] <= 0) continue; if (i < gx - 1) rel(q, q + 1, 1); if (j < gz - 1) { rel(q, q + gx, 1); if (i < gx - 1) rel(q, q + gx + 1, 1.414); if (i) rel(q, q + gx - 1, 1.414); } }
        let maxE = 0; for (let q = 0; q < gx * gz; q++) if (D[q] > 0) { D[q] *= cs; maxE = Math.max(maxE, D[q]); }
        const amp = /paddy/.test(nm) ? .008 : area > 150 ? .06 : area > 30 ? .03 : .012, still = /pool|lagoon|fountain/.test(nm) || (/channel/.test(nm) && area > 12);
        const V = q => [bx0 + (q % gx) * cs, Y[q], bz0 + ((q / gx) | 0) * cs], E = q => [Math.max(0, D[q]), 0, maxE, amp], CCq = q => [CC[q * 3], CC[q * 3 + 1], CC[q * 3 + 2]], tri = (a, b, c) => [a, b, c].forEach(q => { const p = V(q); pushV(p[0], p[1], p[2], CCq(q), E(q)); });
        for (let j = 0; j < gz - 1; j++) for (let i = 0; i < gx - 1; i++) { const a = j * gx + i, b = a + 1, c = a + gx, d = c + 1, A = ins[a], Bq = ins[b], Cq = ins[c], Dq = ins[d], k = A + Bq + Cq + Dq;
          if (k === 4) { tri(a, c, b); tri(b, c, d); } else if (k === 3) { if (!A) tri(b, c, d); else if (!Dq) tri(a, c, b); else if (!Bq) tri(a, c, d); else tri(a, d, b); } }
        if (still) for (let q = 0; q < gx * gz; q += 3) if (D[q] > .7) { const p = V(q), w = new THREE.Vector3(p[0], p[1], p[2]).applyMatrix4(m.matrixWorld); stillPts.push(w); if (D[q] > maxE * .6) deepPts.push(w); } } }
    if (!gridOK) other.push(...flat);
    other.forEach(t => { for (let k = 0; k < 3; k++) pushV(P.getX(t + k), P.getY(t + k), P.getZ(t + k), hasC ? [Cl.array[(t + k) * 3], Cl.array[(t + k) * 3 + 1], Cl.array[(t + k) * 3 + 2]] : null, [2.5, 0, 1, 0]); });
    if (other.length) { const base = pos.length / 3 - other.length * 3; const on = g.attributes.normal; other.forEach((t, oi) => { for (let k = 0; k < 3; k++) if (on) { nor[(base + oi * 3 + k) * 3] = on.getX(t + k); nor[(base + oi * 3 + k) * 3 + 1] = on.getY(t + k); nor[(base + oi * 3 + k) * 3 + 2] = on.getZ(t + k); } }); }
    const ng = new THREE.BufferGeometry(); ng.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); ng.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); ng.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); if (hasC) ng.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); ng.setAttribute('aW', new THREE.Float32BufferAttribute(aw, 4));
    m.geometry = ng; if (g !== g0) g.dispose(); }
  const waterMats = new Set();
  meshes.forEach(m => { const nm = mn(m.material); if (RX_WATER.test(nm) && !RX_FALL.test(nm)) { try { processWater(m); } catch (e) { console.warn('water', m.name, e); } waterMats.add(m.material); } });
  waterMats.forEach(m => { m.transparent = true; m.depthWrite = true; applyChain(m, { water: true }); });
  TM('water');
  // waterfall mist + splash
  meshes.filter(m => RX_FALL.test(mn(m.material)) && !/mist/.test(mn(m.material))).forEach(m => { const { W } = worldTris(m); let minY = 1e9; for (let i = 1; i < W.length; i += 3) minY = Math.min(minY, W[i]); const base = new THREE.Vector3(); let k = 0; for (let i = 0; i < W.length; i += 3) if (W[i + 1] < minY + .4) { base.x += W[i]; base.y += W[i + 1]; base.z += W[i + 2]; k++; } if (!k) return; base.divideScalar(k);
    const NP = 140, geo = new THREE.BufferGeometry(), pp = new Float32Array(NP * 3), st = []; for (let i = 0; i < NP; i++) st.push({ t: rnd() * 2.6, vx: (rnd() - .5) * 1.2, vy: .6 + rnd() * 1.2, vz: (rnd() - .5) * 1.2 }); geo.setAttribute('position', new THREE.BufferAttribute(pp, 3));
    const tx = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({ map: tx, size: .6, transparent: true, opacity: .35, depthWrite: false, color: '#F4FDFF' })); pts.name = 'mist_splash'; pts.frustumCulled = false; life.add(pts);
    isl.tick.push(dt => { for (let i = 0; i < NP; i++) { const s = st[i]; s.t += dt; if (s.t > 2.6) s.t = 0; const t = s.t; pp[i * 3] = base.x + s.vx * t; pp[i * 3 + 1] = base.y + .1 + s.vy * t - .25 * t * t; pp[i * 3 + 2] = base.z + s.vz * t; } geo.attributes.position.needsUpdate = true; }); });
  // floating leaves, lily pads, bobbing bangka
  { const leafM = new THREE.MeshStandardMaterial({ color: '#7FA845', roughness: .7, side: THREE.DoubleSide }), padM = new THREE.MeshStandardMaterial({ color: '#4E9A3A', roughness: .5, side: THREE.DoubleSide }), lotusM = new THREE.MeshStandardMaterial({ color: '#F4A6C6', roughness: .5 });
    const lg = new THREE.CircleGeometry(.12, 6).rotateX(-PI / 2); lg.scale(1.8, 1, 1); const drift = [];
    ribbons.forEach(r => { const c = new THREE.CatmullRomCurve3(r.pts), L = c.getLength(); for (let k = 0; k < Math.min(14, L / 3); k++) { const mm = new THREE.Mesh(lg, leafM); life.add(mm); drift.push({ mm, c, L, s: rnd() * L, off: (rnd() - .5) * r.w * .6, sp: .5 + rnd() * .4 }); } });
    if (drift.length) isl.tick.push(dt => drift.forEach(d => { d.s = (d.s + d.sp * dt) % d.L; const t = d.s / d.L, p = d.c.getPointAt(t), tg = d.c.getTangentAt(t); d.mm.position.set(p.x - tg.z * d.off, p.y + .04, p.z + tg.x * d.off); d.mm.rotation.y = Math.atan2(-tg.z, tg.x) + Math.sin(U.value + d.off * 9) * .3; }));
    const pads = []; const pg = new THREE.CircleGeometry(.32, 16, .3, TAU - .6).rotateX(-PI / 2);
    for (let k = 0; k < Math.min(18, stillPts.length / 6); k++) { const p = pick(stillPts), mm = new THREE.Mesh(pg, padM); mm.position.copy(p).y += .03; mm.rotation.y = rnd() * TAU; mm.scale.setScalar(.7 + rnd() * .7); life.add(mm); if (rnd() < .3) { const fl = new THREE.Mesh(new THREE.SphereGeometry(.09, 8, 6), lotusM); fl.position.set(.05, .06, 0); fl.scale.y = .7; mm.add(fl); } pads.push({ mm, y: mm.position.y, ph: rnd() * 6 }); }
    if (pads.length) isl.tick.push(() => pads.forEach(p => { p.mm.position.y = p.y + Math.sin(U.value * 1.3 + p.ph) * .015; p.mm.rotation.y += .0006; }));
    if (deepPts.length && o.bangka !== false && deepPts.length > 30) { const p = pick(deepPts), g = new THREE.Group(); g.name = 'bangka_bobbing'; const hull = new THREE.Mesh(new THREE.CapsuleGeometry(.32, 2.4, 3, 10).rotateZ(PI / 2), new THREE.MeshStandardMaterial({ color: '#FBF7EF', roughness: .5 })); hull.scale.set(1, .5, .75); g.add(hull);
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.6, .06, .5), new THREE.MeshStandardMaterial({ color: '#2E6FD8' })); stripe.position.y = .14; g.add(stripe); for (const s of [-1, 1]) { const k = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, 2.6, 6).rotateZ(PI / 2), new THREE.MeshStandardMaterial({ color: '#C9A75A' })); k.position.set(0, .05, s * 1.2); g.add(k); }
      g.position.copy(p); life.add(g); const y0 = p.y; isl.tick.push(() => { const t = U.value; g.position.y = y0 + .04 + Math.sin(t * 1.4) * .05; g.rotation.z = Math.sin(t * 1.1) * .05; g.rotation.x = Math.sin(t * .9 + 1) * .04; g.rotation.y += .0005; }); } }

  // ---------- GRASS: shell-layered blade field ----------
  const NL = o.grassLayers ?? 12, GH = o.grassHeight ?? .1;
  { const pos = [], nor = [], col = []; let hasCol = true;
    meshes.filter(isGrassTarget).forEach(m => { const ca = m.geometry.attributes.color; if (!ca) hasCol = false; });
    meshes.filter(isGrassTarget).forEach(m => { const g = m.geometry, P = g.attributes.position, Cl = g.attributes.color, I = g.index ? g.index.array : null, n = I ? I.length : P.count, nm3 = new THREE.Matrix3().getNormalMatrix(m.matrixWorld), a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), nn = new THREE.Vector3();
      for (let t = 0; t < n; t += 3) { const ia = I ? I[t] : t, ib = I ? I[t + 1] : t + 1, ic = I ? I[t + 2] : t + 2; a.fromBufferAttribute(P, ia).applyMatrix4(m.matrixWorld); b.fromBufferAttribute(P, ib).applyMatrix4(m.matrixWorld); c.fromBufferAttribute(P, ic).applyMatrix4(m.matrixWorld);
        nn.subVectors(c, a).cross(v.subVectors(b, a)).normalize(); if (nn.y < 0) nn.negate(); if (nn.y < .5) continue;
        if (Cl && ![ia, ib, ic].some(i => Cl.getY(i) - Math.max(Cl.getX(i), Cl.getZ(i) * 1.05) > .004)) continue;
        const blocked = [a, b, c, a.clone().add(b).add(c).divideScalar(3)].every(p => { const q = cellOf(p.x, p.z); return q >= 0 && block[q]; }); if (blocked) continue;
        const fl = (nn.y > 0) && ((b.x - a.x) * (c.z - a.z) - (b.z - a.z) * (c.x - a.x)) > 0; const order = fl ? [a, c, b] : [a, b, c], ids = fl ? [ia, ic, ib] : [ia, ib, ic];
        order.forEach((p, k) => { pos.push(p.x, p.y, p.z); nor.push(nn.x, nn.y, nn.z); if (hasCol) col.push(Cl.getX(ids[k]), Cl.getY(ids[k]), Cl.getZ(ids[k])); }); } });
    if (pos.length) { const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); sg.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); if (hasCol) sg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
      const SHV = 'uniform float uLT; uniform float uLL; uniform float uLH; varying vec3 vSW;';
      const SHF = `{ vec4 mk = texture2D(uLMask, (vSW.xz - uLMB.xy) * uLMB.zw); if (mk.r > .5) discard; float gm = 1.;
        #ifdef USE_COLOR
        gm = smoothstep(.0, .03, vColor.g - max(vColor.r, vColor.b * 1.05));
        #endif
        float hMul = gm * (1. - mk.a * .85); vec2 gp = vSW.xz * 9.; vec2 id = floor(gp); vec2 f = fract(gp) - .5; float h1 = lv_h(id), h2 = lv_h(id + 17.31), h3 = lv_h(id + 41.7), h4 = lv_h(id + 7.9);
        vec2 off = (vec2(h2, h4) - .5) * .4; float r = length(f - off); float farK = smoothstep(45., 120., length(vViewPosition)); vec3 col; float L = uLL;
        if (h3 < .022) { float hh = .95 * hMul; if (L > hh) discard; if (L < hh * .72) { if (r > .07 + farK * .3) discard; col = vec3(.12, .32, .07); } else { if (r > .34 + farK * .2) discard; float fl = lv_h(id + 3.3); col = fl < .35 ? vec3(.95, .22, .05) : fl < .7 ? vec3(.8, .03, .08) : vec3(1.); if (fl >= .7 && r < .12) col = vec3(1., .75, .05); } }
        else if (h2 < .09) { float hh = .34 * hMul; if (L > hh || r > .46 + farK * .1) discard; col = mix(vec3(.05, .17, .03), vec3(.1, .3, .05), L / max(hh, .01)); }
        else { float hh = (.42 + .5 * h1) * hMul; if (L > hh) discard; float th = .36 * (1. - L / hh) + .05 + farK * .35; if (r > th) discard; vec3 base = mix(vec3(.05, .16, .025), vec3(.08, .22, .03), h4), tip = mix(vec3(.2, .42, .06), vec3(.3, .5, .08), h1); col = mix(base, tip, L / hh); }
        float dry = smoothstep(.55, .78, lv_f(vSW.xz * .07 + 3.1)); col = mix(col, vec3(.34, .27, .08) * (.6 + .5 * L), dry * .7); col *= 1. - mk.g * .45 * (1. - L * .4) - mk.b * .3; diffuseColor.rgb = col; }`;
      for (let l = 1; l <= NL; l++) { const mat = new THREE.MeshStandardMaterial({ name: 'grass_shell', roughness: .95, vertexColors: hasCol }); const L = l / NL;
        mat.onBeforeCompile = sh => { sh.uniforms.uLT = U; sh.uniforms.uLL = { value: L }; sh.uniforms.uLH = { value: GH }; sh.uniforms.uLMask = { value: maskTex }; sh.uniforms.uLMB = { value: MB };
          sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\n' + SHV).replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed += objectNormal * uLH * uLL;')
            .replace('#include <project_vertex>', '{ vec4 sw = modelMatrix * vec4(transformed, 1.0); float k = uLL * uLL; transformed.x += sin(uLT * 1.6 + sw.x * .35 + sw.z * .21) * .035 * k; transformed.z += cos(uLT * 1.25 + sw.z * .31 + sw.x * .17) * .025 * k; vSW = (modelMatrix * vec4(transformed, 1.0)).xyz; }\n#include <project_vertex>');
          sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uLT; uniform float uLL; uniform sampler2D uLMask; uniform vec4 uLMB; varying vec3 vSW;\n' + NOISE).replace('#include <color_fragment>', '#include <color_fragment>\n' + SHF)
            .replace('#include <dithering_fragment>', '#include <dithering_fragment>\n{ float lvc = smoothstep(.42, .72, lv_f(vSW.xz * .016 + vec2(uLT * .011, uLT * .006))); gl_FragColor.rgb *= 1. - lvc * .2; }'); };
        mat.customProgramCacheKey = () => 'lv_shell'; const sm = new THREE.Mesh(sg, mat); sm.name = 'grass_shell_' + l; sm.receiveShadow = true; sm.castShadow = false; sm.renderOrder = 1; life.add(sm); } } }

  TM('grass');
  // ---------- TREES: layered leaf cards over canopy blobs ----------
  { const blobs = meshes.filter(m => RX_FOLIAGE.test(mn(m.material))), tris = []; let total = 0;
    blobs.forEach(m => eachTri(m, (ax, ay, az, bx, by, bz, cx, cy, cz) => { const u = new THREE.Vector3(bx - ax, by - ay, bz - az), w = new THREE.Vector3(cx - ax, cy - ay, cz - az), n = u.clone().cross(w), A = n.length() / 2; if (A < 1e-4) return; total += A; tris.push([ax, ay, az, bx, by, bz, cx, cy, cz, n.normalize(), m.material.color, total]); }));
    const count = Math.min(o.leafCards ?? 9000, Math.round(total * 1.2));
    if (count > 10) { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
      for (let k = 0; k < 9; k++) { const a = k / 9 * TAU + rnd() * .3, r = 18 + rnd() * 22, x = 64 + Math.cos(a) * r * .9, y = 64 + Math.sin(a) * r * .9; g.save(); g.translate(x, y); g.rotate(a + PI / 2); const gr = g.createLinearGradient(0, -26, 0, 26); gr.addColorStop(0, pick(['#5DBE45', '#6CCB5E', '#4DB04A'])); gr.addColorStop(1, pick(['#2F7F33', '#3A8F3A'])); g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, 9 + rnd() * 4, 24 + rnd() * 6, 0, 0, TAU); g.fill(); g.strokeStyle = 'rgba(20,60,20,.5)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, -22); g.lineTo(0, 22); g.stroke(); g.restore(); }
      const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; const mat = new THREE.MeshStandardMaterial({ name: 'leaf_cards', map: tx, alphaTest: .45, side: THREE.DoubleSide, roughness: .8 }); applyChain(mat, { sway: true });
      const geo = new THREE.PlaneGeometry(1, 1), im = new THREE.InstancedMesh(geo, mat, count), q = new THREE.Quaternion(), q2 = new THREE.Quaternion(), mx = new THREE.Matrix4(), sc = new THREE.Vector3(), Z = new THREE.Vector3(0, 0, 1), cc = new THREE.Color();
      for (let i = 0; i < count; i++) { const r = rnd() * total; let lo = 0, hi = tris.length - 1; while (lo < hi) { const mid = (lo + hi) >> 1; if (tris[mid][11] < r) lo = mid + 1; else hi = mid; } const t = tris[lo]; let u = rnd(), w = rnd(); if (u + w > 1) { u = 1 - u; w = 1 - w; }
        const px = t[0] + (t[3] - t[0]) * u + (t[6] - t[0]) * w, py = t[1] + (t[4] - t[1]) * u + (t[7] - t[1]) * w, pz = t[2] + (t[5] - t[2]) * u + (t[8] - t[2]) * w, n = t[9];
        q.setFromUnitVectors(Z, n); q2.setFromAxisAngle(n, rnd() * TAU); q.premultiply(q2); const s = .5 + rnd() * .45; sc.set(s, s, s); mx.compose(v.set(px + n.x * .06, py + n.y * .06, pz + n.z * .06), q, sc); im.setMatrixAt(i, mx); cc.copy(t[10]).multiplyScalar(.8 + rnd() * .35); im.setColorAt(i, cc); }
      im.castShadow = true; im.receiveShadow = true; im.name = 'leaf_cards'; life.add(im); } }

  TM('trees');
  // ---------- material passes on the island: cloud shadows, AO, wear, weathering ----------
  { const info = new Map(); meshes.forEach(m => { const mat = m.material; if (!mat.isMeshStandardMaterial || waterMats.has(mat)) return; let it = info.get(mat); if (!it) info.set(mat, it = { big: false, ny: 0, n: 0 }); tb.setFromObject(m); const sx = tb.max.x - tb.min.x, sz = tb.max.z - tb.min.z, sy = tb.max.y - tb.min.y; if (Math.max(sx, sz) > 10 && sy < 1.2) it.big = true;
      const nrm = m.geometry.attributes.normal; if (nrm) for (let i = 0; i < nrm.count; i += 7) { it.ny += Math.abs(nrm.getY(i)); it.n++; } });
    info.forEach((it, mat) => { const nm = mn(mat), ground = RX_GROUND.test(nm) || it.big, wall = RX_WALL.test(nm) && it.n && it.ny / it.n < .65 && !/board|tile_|path|road|cobble|paving/.test(nm);
      applyChain(mat, { ao: ground, wear: ground && RX_GRASS.test(nm), weather: wall }); if (ground) isl.wet.push([mat, mat.roughness]); if (mat.emissive && mat.emissiveIntensity > 0 && mat.emissive.getHex()) isl.emissive.push([mat, mat.emissiveIntensity]); }); }

  // ---------- AGENTS: people, kids, vendors, tambays, animals, insects, vehicles ----------
  const MC = new Map(), M = (c, ex) => { const k = c + (ex ? JSON.stringify(ex) : ''); if (!MC.has(k)) MC.set(k, new THREE.MeshStandardMaterial({ color: c, roughness: .75, ...ex })); return MC.get(k); };
  const mk = (geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; return m; };
  const SKIN = ['#C68B5E', '#B07A52', '#8E5B3A', '#D9A57A'], SHIRT = ['#E2452E', '#2E6FD8', '#FFC93C', '#3BAA4A', '#FBF7EF', '#E8559A', '#13A39A', '#F07C1E'], PANTS = ['#2F3A56', '#4D5A6E', '#6B4A2E', '#1E1E1E', '#3B6E9A'];
  function person(s = 1, hat = false) { const g = new THREE.Group(), skin = M(pick(SKIN)), sh = M(pick(SHIRT)), pa = M(pick(PANTS));
    const limb = (y, z, len, r, mat) => { const p = new THREE.Group(); p.position.set(0, y * s, z * s); p.add(mk(new THREE.CylinderGeometry(r * s, r * .85 * s, len * s, 6).translate(0, -len * s / 2, 0), mat)); g.add(p); return p; };
    const legL = limb(.78, -.1, .76, .065, pa), legR = limb(.78, .1, .76, .065, pa);
    g.add(mk(new THREE.CapsuleGeometry(.17 * s, .36 * s, 3, 8), sh, 0, 1.1 * s, 0), mk(new THREE.SphereGeometry(.13 * s, 10, 8), skin, 0, 1.55 * s, 0), mk(new THREE.SphereGeometry(.137 * s, 10, 6, 0, TAU, 0, PI / 2), M('#1E1712'), 0, 1.57 * s, 0));
    if (hat) g.add(mk(new THREE.ConeGeometry(.36 * s, .18 * s, 12), M('#E8D2A0'), 0, 1.74 * s, 0));
    return { g, legL, legR, armL: limb(1.36, -.23, .6, .05, skin), armR: limb(1.36, .23, .6, .05, skin), s }; }
  function quad(kind) { const g = new THREE.Group(), legs = []; let tail, head;
    if (kind === 'chicken') { const m = M(pick(['#F3EEE4', '#9A5B2E', '#C2783A'])); g.add(mk(new THREE.SphereGeometry(.14, 8, 6), m, 0, .22, 0)); head = new THREE.Group(); head.position.set(.13, .34, 0); head.add(mk(new THREE.SphereGeometry(.065, 6, 4), m), mk(new THREE.BoxGeometry(.05, .05, .02), M('#D7322B'), 0, .07, 0), mk(new THREE.ConeGeometry(.025, .06, 4).rotateZ(-PI / 2), M('#F2A22A'), .07, 0, 0)); g.add(head); tail = mk(new THREE.ConeGeometry(.07, .16, 5).rotateZ(PI / 2.6), m, -.15, .3, 0); g.add(tail);
      for (const z of [-.05, .05]) { const p = new THREE.Group(); p.position.set(0, .14, z); p.add(mk(new THREE.CylinderGeometry(.012, .012, .14, 4).translate(0, -.07, 0), M('#F2A22A'))); g.add(p); legs.push(p); } return { g, legs, tail, head }; }
    const cat = kind === 'cat', m = M(cat ? pick(['#E8A050', '#3A3A3A', '#F2EDE4', '#8A7A6A']) : pick(['#C9A06A', '#E8DCC8', '#5A4636', '#2E2A28'])), sc = cat ? .6 : 1;
    g.add(mk(new THREE.CapsuleGeometry(.13 * sc, .42 * sc, 3, 8).rotateZ(PI / 2), m, 0, .42 * sc, 0)); head = new THREE.Group(); head.position.set(.33 * sc, .58 * sc, 0); head.add(mk(new THREE.SphereGeometry(.12 * sc, 8, 6), m), mk(new THREE.BoxGeometry(.13 * sc, .08 * sc, .09 * sc), m, .1 * sc, -.04 * sc, 0));
    for (const z of [-.06, .06]) head.add(mk(new THREE.ConeGeometry(.04 * sc, .1 * sc, 4), m, -.02 * sc, .12 * sc, z * sc)); g.add(head);
    for (const x of [-.2, .2]) for (const z of [-.08, .08]) { const p = new THREE.Group(); p.position.set(x * sc, .36 * sc, z * sc); p.add(mk(new THREE.CylinderGeometry(.035 * sc, .03 * sc, .36 * sc, 5).translate(0, -.18 * sc, 0), m)); g.add(p); legs.push(p); }
    tail = new THREE.Group(); tail.position.set(-.3 * sc, .48 * sc, 0); tail.add(mk(new THREE.CylinderGeometry(.025 * sc, .015 * sc, .3 * sc, 4).translate(0, .15 * sc, 0), m)); tail.rotation.z = cat ? .2 : .9; g.add(tail); return { g, legs, tail, head }; }
  const used = [], far = (x, z, d) => used.every(([a, b]) => (a - x) ** 2 + (b - z) ** 2 > d * d);
  const spot = (cond, d = 2.5) => { for (let t = 0; t < 500 && freeCells.length; t++) { const c = pick(freeCells), x = ccx(c), z = ccz(c); if (far(x, z, d) && (!cond || cond(x, z))) { used.push([x, z]); return [x, z]; } } return null; };
  const obstDir = (x, z, r = 1.1) => { for (let k = 0; k < 12; k++) { const a = k / 12 * TAU, c = cellOf(x + Math.cos(a) * r, z + Math.sin(a) * r); if (c >= 0 && obst[c]) return a; } return null; };
  const lineOK = (ax, az, bx, bz) => { const L = Math.hypot(bx - ax, bz - az); for (let s = 0; s <= L; s += .3) if (!walkAt(ax + (bx - ax) * s / L, az + (bz - az) * s / L)) return false; return true; };
  const face = (g, dx, dz) => { g.rotation.y = Math.atan2(-dz, dx); };
  const place = (g, x, z, dy = 0) => { g.position.set(x, hAt(x, z) + dy, z); life.add(g); };
  // wanderers (adults strolling off-path, dogs, cats, chickens)
  function wanderer(rig, speed, kind) { const p = spot(null, 1.5); if (!p) return; place(rig.g, p[0], p[1]); const a = { rig, x: p[0], z: p[1], tx: p[0], tz: p[1], sp: speed, wait: rnd() * 3, ph: 0, kind };
    isl.agents.push(a); isl.tick.push(dt => { const r = a.rig; if (a.wait > 0) { a.wait -= dt; if (kind === 'chicken') r.head.rotation.z = Math.max(0, Math.sin(U.value * 6 + a.x)) * -.9; if (kind === 'dog' && r.tail) r.tail.rotation.x = Math.sin(U.value * 14) * .5; if (a.wait <= 0) { for (let t = 0; t < 12; t++) { const ang = rnd() * TAU, d = 2 + rnd() * 6, nx = a.x + Math.cos(ang) * d, nz = a.z + Math.sin(ang) * d; if (walkAt(nx, nz) && lineOK(a.x, a.z, nx, nz)) { a.tx = nx; a.tz = nz; break; } } } return; }
      const dx = a.tx - a.x, dz = a.tz - a.z, L = Math.hypot(dx, dz); if (L < .15) { a.wait = 1.5 + rnd() * (kind === 'person' ? 6 : 4); (r.legs || [r.legL, r.legR]).forEach(l => l && (l.rotation.z = 0)); return; }
      const st = Math.min(L, a.sp * dt), nx = a.x + dx / L * st, nz = a.z + dz / L * st; if (!walkAt(nx, nz)) { a.wait = .5; a.tx = a.x; a.tz = a.z; return; } a.x = nx; a.z = nz; a.ph += st * (kind === 'person' ? 4.2 : 9);
      r.g.position.set(a.x, hAt(a.x, a.z), a.z); face(r.g, dx, dz); const sw = Math.sin(a.ph);
      if (kind === 'person') { r.legL.rotation.z = sw * .55; r.legR.rotation.z = -sw * .55; r.armL.rotation.z = -sw * .45; r.armR.rotation.z = sw * .45; } else { r.legs.forEach((l, i) => l.rotation.z = sw * .6 * (i % 2 ? 1 : -1) * (i < 2 ? 1 : -1)); if (r.tail && kind !== 'chicken') r.tail.rotation.x = Math.sin(U.value * 10) * .35; } }); }
  for (let i = 0; i < (o.strollers ?? 3); i++) wanderer(person(1, !!o.hat), .9 + rnd() * .3, 'person');
  for (let i = 0; i < (o.dogs ?? 2); i++) wanderer(quad('dog'), 1.3, 'dog');
  for (let i = 0; i < (o.cats ?? 2); i++) wanderer(quad('cat'), .8, 'cat');
  for (let i = 0; i < (o.chickens ?? 3); i++) wanderer(quad('chicken'), .45, 'chicken');
  // kids playing habulan (chase in a ring)
  for (let k = 0; k < (o.kidGroups ?? 2); k++) { const R = 1.3, p = spot((x, z) => { for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; if (!walkAt(x + Math.cos(a) * (R + .4), z + Math.sin(a) * (R + .4))) return false; } return true; }, 4); if (!p) continue;
    const kids = Array.from({ length: 3 }, (_, i) => { const r = person(.62); place(r.g, p[0], p[1]); return { r, a: i / 3 * TAU }; }), w = 1.6 + rnd() * .6;
    isl.tick.push(dt => kids.forEach((kd, i) => { kd.a += w * dt * (1 + .15 * Math.sin(U.value * .7 + i)); const x = p[0] + Math.cos(kd.a) * R, z = p[1] + Math.sin(kd.a) * R, ph = U.value * 11 + i * 2; kd.r.g.position.set(x, hAt(x, z) + Math.abs(Math.sin(ph)) * .07, z); face(kd.r.g, -Math.sin(kd.a), Math.cos(kd.a)); kd.r.legL.rotation.z = Math.sin(ph) * .8; kd.r.legR.rotation.z = -Math.sin(ph) * .8; kd.r.armL.rotation.z = -Math.sin(ph) * .7; kd.r.armR.rotation.z = Math.sin(ph) * .7; })); }
  // vendors calling + tambays
  const bubble = txt => { const c = document.createElement('canvas'); c.width = 256; c.height = 96; const g = c.getContext('2d'); g.fillStyle = '#FFFFFF'; g.strokeStyle = '#3B2316'; g.lineWidth = 5; g.beginPath(); g.roundRect(6, 6, 244, 66, 22); g.fill(); g.stroke(); g.beginPath(); g.moveTo(110, 70); g.lineTo(128, 92); g.lineTo(140, 70); g.fill(); g.fillStyle = '#3B2316'; g.font = '900 34px "Arial Black", Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 128, 40);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthWrite: false })); sp.scale.set(1.5, .56, 1); return sp; };
  const lines = o.vendorLines || ['Bili na!', 'Mura lang!', 'Suki!'];
  for (let k = 0; k < (o.vendors ?? 3); k++) { const p = spot((x, z) => obstDir(x, z) !== null, 3); if (!p) continue; const r = person(1, !!o.hat), a = obstDir(p[0], p[1]); place(r.g, p[0], p[1]); face(r.g, -Math.cos(a), -Math.sin(a)); const b = bubble(lines[k % lines.length]); b.position.set(0, 2.25, 0); b.visible = false; r.g.add(b); const ph = rnd() * 8;
    isl.tick.push(() => { const t = (U.value + ph) % 8, on = t < 2.4; b.visible = on; r.armR.rotation.x = on ? -2.3 + Math.sin(U.value * 9) * .35 : 0; r.armL.rotation.z = on ? .3 : 0; r.g.position.y = hAt(p[0], p[1]) + (on ? Math.abs(Math.sin(U.value * 9)) * .02 : 0); }); }
  for (let k = 0; k < (o.tambays ?? 3); k++) { const p = spot((x, z) => obstDir(x, z, .9) !== null, 2.5); if (!p) continue; const r = person(1, !!o.hat), a = obstDir(p[0], p[1], .9); place(r.g, p[0], p[1], -.42); face(r.g, -Math.cos(a), -Math.sin(a)); r.legL.rotation.z = r.legR.rotation.z = PI / 2; r.armL.rotation.z = r.armR.rotation.z = .6; const ph = rnd() * 6;
    isl.tick.push(() => { r.g.children[2] && (r.g.children[2].rotation.z = 0); r.g.rotation.z = Math.sin(U.value * .8 + ph) * .03; }); }
  // dragonflies over water, butterflies already from addLife
  { const pts = stillPts.length ? stillPts : ribbons.flatMap(r => r.pts); if (pts.length) for (let k = 0; k < (o.dragonflies ?? 6); k++) { const p = pick(pts).clone(), g = new THREE.Group(), bm = M('#2E8FB8', { emissive: '#145A78', emissiveIntensity: .3 }), wm = M('#E8F6FF', { transparent: true, opacity: .55, side: THREE.DoubleSide });
      g.add(mk(new THREE.CylinderGeometry(.012, .008, .14, 4).rotateZ(PI / 2), bm)); const wings = []; for (const s of [-1, 1]) for (const x of [-.01, .03]) { const w = mk(new THREE.PlaneGeometry(.05, .12).translate(0, 0, .06).rotateX(-PI / 2), wm, x, .01, 0); w.scale.z = s; g.add(w); wings.push(w); } life.add(g); const ph = rnd() * 9;
      isl.tick.push(() => { const t = U.value + ph, dart = Math.floor(t / 2.5); const ox = Math.sin(dart * 12.9) * 1.6, oz = Math.cos(dart * 7.3) * 1.6, f = Math.min(1, (t % 2.5) * 3); g.position.set(p.x + ox * f + Math.sin(t * 3) * .05, p.y + .5 + Math.sin(t * 2) * .1, p.z + oz * f); g.rotation.y = dart; wings.forEach((w, i) => w.rotation.x = Math.sin(t * 60 + i) * .5); }); } }
  // vehicles ping-ponging beside the board road
  { const main = nodes.filter(n => n.id[0] === 'M').sort((a, b) => a.id.localeCompare(b.id)).map(n => nodeW[n.id]);
    const VEH = { tricycle: () => { const g = new THREE.Group(), body = M(pick(['#2E6FD8', '#E2452E', '#3BAA4A'])), blk = M('#1E1E1E'); const wheels = []; for (const [x, z] of [[-.55, 0], [.6, 0], [.1, 1.3]]) { const w = mk(new THREE.TorusGeometry(.28, .07, 6, 14), blk, x, .3, z); g.add(w); wheels.push(w); }
        g.add(mk(new THREE.BoxGeometry(1, .35, .3), body, 0, .45, 0), mk(new THREE.BoxGeometry(1.5, 1, .9), body, 0, .8, .85), mk(new THREE.BoxGeometry(1.7, .08, 1.5), M('#FFC93C'), -.05, 1.75, .55), mk(new THREE.BoxGeometry(.04, .5, .8), M('#2D4A63', { roughness: .2 }), .76, 1.05, .85)); g.position.z = -.4; const o2 = new THREE.Group(); o2.add(g); return { g: o2, wheels, sp: 2.6, w: 1.9 }; },
      jeep: () => { const g = new THREE.Group(), blk = M('#1E1E1E'), wheels = []; g.add(mk(new THREE.BoxGeometry(4.2, 1.4, 1.9), M('#FBF7EF'), -.4, 1.25, 0), mk(new THREE.BoxGeometry(1.2, .75, 1.7), M('#2E6FD8'), 2.25, .92, 0), mk(new THREE.BoxGeometry(4.6, .14, 2.05), M('#C9CED6', { metalness: .6, roughness: .35 }), -.4, 2.02, 0));
        for (const s of [-1, 1]) { g.add(mk(new THREE.BoxGeometry(4.25, .12, .02), M('#E2452E'), -.4, 1.0, s * .96), mk(new THREE.BoxGeometry(3.6, .45, .02), M('#2D4A63', { roughness: .2 }), -.5, 1.55, s * .96)); for (const x of [-1.7, 1.9]) { const w = mk(new THREE.CylinderGeometry(.42, .42, .3, 14).rotateX(PI / 2), blk, x, .42, s * .85); g.add(w); wheels.push(w); } } return { g, wheels, sp: 2.2, w: 2.3, roll: 'z' }; },
      kalabaw_cart: () => { const g = new THREE.Group(), kb = M('#4A4A50'), wheels = []; g.add(mk(new THREE.CapsuleGeometry(.5, 1.1, 4, 10).rotateZ(PI / 2), kb, 1.6, .95, 0), mk(new THREE.BoxGeometry(.5, .36, .38), kb, 2.55, .85, 0)); for (const s of [-1, 1]) g.add(mk(new THREE.TorusGeometry(.3, .05, 5, 10, PI * .9), M('#D8CFC0'), 2.4, 1.2, s * .22));
        const legs = []; for (const x of [1.1, 2.1]) for (const s of [-1, 1]) { const p = new THREE.Group(); p.position.set(x, .75, s * .26); p.add(mk(new THREE.CylinderGeometry(.1, .08, .72, 6).translate(0, -.36, 0), kb)); g.add(p); legs.push(p); }
        for (const s of [-1, 1]) { const w = mk(new THREE.TorusGeometry(.6, .06, 6, 16), M('#5A3420'), -.4, .6, s * .75); g.add(w); wheels.push(w); } g.add(mk(new THREE.BoxGeometry(2, .3, 1.4), M('#C9A75A'), -.4, .9, 0), mk(new THREE.CylinderGeometry(.75, .75, 2, 10, 1, true, 0, PI).rotateZ(PI / 2), M('#B48A4E', { side: THREE.DoubleSide }), -.4, 1.1, 0)); const drv = person(1, true); drv.g.position.set(.3, .45, 0); drv.legL.rotation.z = drv.legR.rotation.z = PI / 2; g.add(drv.g); return { g, wheels, legs, sp: .9, w: 1.8 }; },
      kuliglig: () => { const g = new THREE.Group(), blk = M('#1E1E1E'), wheels = []; g.add(mk(new THREE.BoxGeometry(.7, .5, .5), M('#E2452E'), 1.0, .6, 0), mk(new THREE.BoxGeometry(2, .4, 1.3), M('#A8683A'), -.6, .7, 0)); for (const s of [-1, 1]) { const w = mk(new THREE.TorusGeometry(.38, .09, 6, 12), blk, 1.1, .38, s * .5); g.add(w); wheels.push(w); const w2 = mk(new THREE.TorusGeometry(.3, .07, 6, 12), blk, -.6, .3, s * .7); g.add(w2); wheels.push(w2); }
        const drv = person(1, true); drv.g.position.set(-.1, .45, 0); drv.legL.rotation.z = drv.legR.rotation.z = PI / 2; g.add(drv.g); return { g, wheels, sp: 1.4, w: 1.6 }; } };
    if (main.length > 8) { const curve = new THREE.CatmullRomCurve3(main, true), L = curve.getLength(), Np = Math.ceil(L / .5), base = curve.getSpacedPoints(Np).slice(0, -1); const usedOff = [];
      (o.vehicles || []).forEach(kind => { if (!VEH[kind]) return; let best = null;
        for (const off of [3.4, -3.4, 4.4, -4.4, 5.6, -5.6]) { if (usedOff.includes(off)) continue; const pts = base.map((p, i) => { const a = base[(i - 1 + base.length) % base.length], b = base[(i + 1) % base.length], d = b.clone().sub(a).setY(0).normalize(); return { p: new THREE.Vector3(p.x - d.z * off, 0, p.z + d.x * off), nx: -d.z, nz: d.x }; });
          const ok = pts.map(q => walkAt(q.p.x, q.p.z) && walkAt(q.p.x + q.nx * 1, q.p.z + q.nz * 1) && walkAt(q.p.x - q.nx * 1, q.p.z - q.nz * 1)); let bs = 0, bl = 0; for (let s = 0; s < ok.length; s++) { if (!ok[s] || ok[(s - 1 + ok.length) % ok.length]) continue; let l = 0; while (l < ok.length && ok[(s + l) % ok.length]) l++; if (l > bl) { bl = l; bs = s; } }
          if (ok.every(Boolean)) { bl = ok.length; bs = 0; } if (bl * .5 > 12 && (!best || bl > best.bl)) best = { off, bs, bl, pts }; }
        if (!best) return; usedOff.push(best.off); const route = Array.from({ length: best.bl }, (_, i) => best.pts[(best.bs + i) % best.pts.length].p), loop = best.bl === best.pts.length, rc = new THREE.CatmullRomCurve3(route, loop), RL = rc.getLength(), veh = VEH[kind](); life.add(veh.g); let s = rnd() * RL, dir = 1, pause = 0;
        isl.tick.push(dt => { if (pause > 0) { pause -= dt; return; } s += veh.sp * dt * dir; if (!loop && (s > RL || s < 0)) { s = Math.max(0, Math.min(RL, s)); dir *= -1; pause = 1.8; } if (loop) s = (s + RL) % RL; const t = s / RL, p = rc.getPointAt(t), tg = rc.getTangentAt(t).multiplyScalar(dir);
          veh.g.position.set(p.x, hAt(p.x, p.z), p.z); face(veh.g, tg.x, tg.z); veh.wheels.forEach(w => w.rotation.z -= veh.sp * dt * 3); if (veh.legs) veh.legs.forEach((l, i) => l.rotation.z = Math.sin(U.value * 5 + i * PI) * .45); }); }); } }

  TM('agents');
  // ---------- SOUND SPOTS (markers for the game's audio later) ----------
  { const spots = []; (o.sounds || []).forEach(([frag, sound]) => { const m = meshes.find(x => x.name.includes(frag)); if (!m) return; tb.setFromObject(m); const c = tb.getCenter(new THREE.Vector3()); c.y = tb.max.y * .5 + tb.min.y * .5; const mk2 = new THREE.Object3D(); mk2.name = 'sfx_' + sound; mk2.position.copy(c); mk2.userData = { sound, radius: Math.max(6, tb.getSize(v).length() * .6) }; life.add(mk2);
      const sp = bubble('♪ ' + sound); sp.position.copy(c).y = tb.max.y + 1.2; sp.scale.set(2.4, .9, 1); sp.visible = S.sounds; mk2.userData.icon = sp; life.add(sp); spots.push(mk2); });
    isl.sounds = spots; root.userData.soundSpots = spots.map(s => ({ sound: s.userData.sound, x: +s.position.x.toFixed(2), y: +s.position.y.toFixed(2), z: +s.position.z.toFixed(2), radius: +s.userData.radius.toFixed(1) })); window.__taympersSoundSpots = Object.assign(window.__taympersSoundSpots || {}, { [isl.name]: root.userData.soundSpots }); }

  // ---------- SEASONS: Fiesta banderitas, Pasko parols + fireflies, Tag-ulan rain ----------
  { const main = nodes.filter(n => n.id[0] === 'M').sort((a, b) => a.id.localeCompare(b.id)).map(n => nodeW[n.id]), side = (i, off) => { const a = main[(i - 1 + main.length) % main.length], b = main[(i + 1) % main.length], d = b.clone().sub(a).setY(0).normalize(); return new THREE.Vector3(main[i].x - d.z * off, 0, main[i].z + d.x * off); };
    const fiesta = new THREE.Group(); fiesta.name = 'season_fiesta'; fiesta.visible = false; life.add(fiesta);
    if (main.length > 8) { const poleM = M('#C9A75A'), strM = M('#3B3F4A'), cols = ['#E2452E', '#2E6FD8', '#FFC93C', '#FBF7EF', '#3BAA4A', '#E8559A'], fg = new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(-.16, 0), new THREE.Vector2(.16, 0), new THREE.Vector2(0, -.38)])), flags = [];
      for (const off of [2.7, -2.7]) { let prev = null; for (let i = 0; i < main.length; i += 4) { const p = side(i, off); if (!walkAt(p.x, p.z)) { prev = null; continue; } p.y = hAt(p.x, p.z); fiesta.add(mk(new THREE.CylinderGeometry(.05, .06, 4.4, 6), poleM, p.x, p.y + 2.2, p.z));
          if (prev && prev.distanceTo(p) < 16) { const a = prev.clone().setY(prev.y + 4.3), b = p.clone().setY(p.y + 4.3), pts = []; for (let k = 0; k <= 12; k++) { const t = k / 12, q = a.clone().lerp(b, t); q.y -= Math.sin(PI * t) * .6; pts.push(q); } const c = new THREE.CatmullRomCurve3(pts); fiesta.add(mk(new THREE.TubeGeometry(c, 14, .012, 3), strM)); const yaw = Math.atan2(-(b.z - a.z), b.x - a.x); for (let k = 1; k < 12; k++) flags.push([c.getPoint(k / 12), yaw, cols[k % cols.length]]); }
          prev = p; } }
      if (flags.length) { const im = new THREE.InstancedMesh(fg, new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: .7 }), flags.length), mx = new THREE.Matrix4(), q = new THREE.Quaternion(), cc = new THREE.Color(), one = new THREE.Vector3(1, 1, 1); flags.forEach(([p, yaw, c], i) => { q.setFromEuler(new THREE.Euler(0, yaw, 0)); mx.compose(p, q, one); im.setMatrixAt(i, mx); im.setColorAt(i, cc.set(c)); }); fiesta.add(im); isl.tick.push(() => { if (fiesta.visible) im.rotation.x = 0; }); } }
    const pasko = new THREE.Group(); pasko.name = 'season_pasko'; pasko.visible = false; life.add(pasko);
    if (main.length > 8) { const star = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = PI / 2 + i * PI / 5, r = i % 2 ? .16 : .38; i ? star.lineTo(Math.cos(a) * r, Math.sin(a) * r) : star.moveTo(Math.cos(a) * r, Math.sin(a) * r); } const sg = new THREE.ExtrudeGeometry(star, { depth: .08, bevelEnabled: false }).translate(0, 0, -.04), cols = ['#FF3B3B', '#FFD23F', '#3B8CFF', '#3BFF7A', '#FF7AE0'];
      for (let i = 2; i < main.length; i += 6) { const p = side(i, (i / 6) % 2 ? 2.2 : -2.2); if (!walkAt(p.x, p.z)) continue; p.y = hAt(p.x, p.z); const c = pick(cols), em = new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 1.6, roughness: .4 }); pasko.add(mk(new THREE.CylinderGeometry(.04, .05, 2.8, 6), M('#C9A75A'), p.x, p.y + 1.4, p.z)); const pr = mk(sg, em, p.x, p.y + 2.5, p.z); pr.rotation.y = rnd() * PI; pasko.add(pr); for (const s of [-1, 1]) { const tl = mk(new THREE.BoxGeometry(.03, .5, .02), em, p.x + s * .06, p.y + 2.0, p.z); tl.rotation.z = s * .15; pasko.add(tl); } }
      const NF = 160, fp = new Float32Array(NF * 3), ph = new Float32Array(NF); for (let i = 0; i < NF; i++) { let x = 0, z = 0; for (let t = 0; t < 30; t++) { const c = pick(freeCells); x = ccx(c); z = ccz(c); if (canopy[cellOf(x, z)] || caB[cellOf(x, z)] > .15) break; } fp.set([x, hAt(x, z) + .5 + rnd() * 2, z], i * 3); ph[i] = rnd() * 6.28; }
      const fgeo = new THREE.BufferGeometry(); fgeo.setAttribute('position', new THREE.BufferAttribute(fp, 3)); fgeo.setAttribute('ph', new THREE.BufferAttribute(ph, 1));
      const fm = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uLT: U }, vertexShader: 'uniform float uLT; attribute float ph; varying float vA; void main(){ vec3 p = position + vec3(sin(uLT * .7 + ph) * .4, sin(uLT * 1.1 + ph * 2.) * .25, cos(uLT * .6 + ph) * .4); vA = pow(max(0., sin(uLT * 2.2 + ph * 3.)), 3.); vec4 mv = modelViewMatrix * vec4(p, 1.); gl_PointSize = 90. / -mv.z; gl_Position = projectionMatrix * mv; }', fragmentShader: 'varying float vA; void main(){ float d = length(gl_PointCoord - .5); gl_FragColor = vec4(vec3(.85, 1., .35) * 2., vA * smoothstep(.5, .0, d)); }' });
      const ff = new THREE.Points(fgeo, fm); ff.frustumCulled = false; pasko.add(ff); }
    const ulan = new THREE.Group(); ulan.name = 'season_ulan'; ulan.visible = false; life.add(ulan);
    { const NR = 2600, rp = new Float32Array(NR * 6), sx = bb.max.x - bb.min.x + 10, sz = bb.max.z - bb.min.z + 10, top = 22; for (let i = 0; i < NR; i++) { const x = bb.min.x - 5 + rnd() * sx, z = bb.min.z - 5 + rnd() * sz, y = rnd() * top; rp.set([x, y, z, x + .05, y - .5, z], i * 6); }
      const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.BufferAttribute(rp, 3)); const rl = new THREE.LineSegments(rg, new THREE.LineBasicMaterial({ color: '#CFE3F0', transparent: true, opacity: .55 })); rl.frustumCulled = false; ulan.add(rl);
      isl.tick.push(dt => { if (!ulan.visible) return; for (let i = 0; i < NR; i++) { let y = rp[i * 6 + 1] - 14 * dt; if (y < -1) y += top; rp[i * 6 + 1] = y; rp[i * 6 + 4] = y - .5; } rg.attributes.position.needsUpdate = true; }); }
    isl.season = { fiesta, pasko, ulan }; }
  TM('seasons'); MC.forEach(m => applyChain(m, {}));

  // ---------- STAGE-LEVEL: post FX (bloom + tilt-shift), season lighting, UI, loop ----------
  if (!S.postTried && renderer && o.post !== false) { S.postTried = true; try { const base = 'https://unpkg.com/three@0.184.0/examples/jsm/postprocessing/';
      const [{ EffectComposer }, { RenderPass }, { UnrealBloomPass }, { ShaderPass }, { OutputPass }] = await Promise.all(['EffectComposer', 'RenderPass', 'UnrealBloomPass', 'ShaderPass', 'OutputPass'].map(n => import(base + n + '.js')));
      const size = renderer.getSize(new THREE.Vector2()), pr = renderer.getPixelRatio(), rt = new THREE.WebGLRenderTarget(Math.max(1, size.x * pr), Math.max(1, size.y * pr), { type: THREE.HalfFloatType, samples: 4 });
      const comp = new EffectComposer(renderer, rt), rpass = new RenderPass(scene, null); comp.addPass(rpass); const bloom = new UnrealBloomPass(size.clone(), .35, .5, 1.1); comp.addPass(bloom);
      const TS = { uniforms: { tDiffuse: { value: null }, uDir: { value: new THREE.Vector2(1, 0) }, uRes: { value: new THREE.Vector2(1, 1) }, uAmt: { value: 2.4 }, uFocus: { value: .5 }, uBand: { value: .17 } }, vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
        fragmentShader: 'uniform sampler2D tDiffuse; uniform vec2 uDir; uniform vec2 uRes; uniform float uAmt; uniform float uFocus; uniform float uBand; varying vec2 vUv; void main(){ float d = smoothstep(uBand, uBand + .38, abs(vUv.y - uFocus)); vec2 st = uDir / uRes * uAmt * d * (uRes.y / 900.); vec4 c = texture2D(tDiffuse, vUv) * .2270270270; c += (texture2D(tDiffuse, vUv + st * 1.3846153846) + texture2D(tDiffuse, vUv - st * 1.3846153846)) * .3162162162; c += (texture2D(tDiffuse, vUv + st * 3.2307692308) + texture2D(tDiffuse, vUv - st * 3.2307692308)) * .0702702703; gl_FragColor = c; }' };
      const tsH = new ShaderPass(TS), tsV = new ShaderPass(TS); tsV.uniforms.uDir.value.set(0, 1); comp.addPass(tsH); comp.addPass(tsV); comp.addPass(new OutputPass()); S.fx = { comp, bloom, tsH, tsV };
      const orig = renderer.render.bind(renderer); let inside = false, lw = 0, lh = 0, lp = 0;
      renderer.render = (s, c) => { if (inside || s !== scene || S.postOff) return orig(s, c); inside = true; try { renderer.getSize(size); const p2 = renderer.getPixelRatio(); if (size.x !== lw || size.y !== lh || p2 !== lp) { lw = size.x; lh = size.y; lp = p2; comp.setPixelRatio(p2); comp.setSize(lw, lh); tsH.uniforms.uRes.value.set(lw * p2, lh * p2); tsV.uniforms.uRes.value.set(lw * p2, lh * p2); } tsH.enabled = tsV.enabled = S.tilt; rpass.camera = c; comp.render(); } catch (e) { S.postOff = true; console.warn('post fx off', e); orig(s, c); } finally { inside = false; } };
    } catch (e) { console.warn('post fx unavailable', e); } }
  if (!S.lights) { S.lights = []; scene.traverse(l => { if (l.isLight) S.lights.push([l, l.intensity, l.color.clone()]); }); const sky = scene.getObjectByName('sky_dome'); S.skyU = sky && { u: sky.material.uniforms, top: sky.material.uniforms.top.value.clone(), hor: sky.material.uniforms.hor.value.clone() }; S.fog = scene.fog && { c: scene.fog.color.clone(), near: scene.fog.near, far: scene.fog.far }; S.bg = scene.background?.isColor ? scene.background.clone() : null; S.exp = renderer ? renderer.toneMappingExposure : 1; }
  S.apply = name => { S.season = name; const P = { normal: [1, null, null, null, 1, 1.7], fiesta: [1, null, null, null, 1, 2.4], pasko: [.32, '#FFB27A', '#1E2B52', '#F0A070', .95, 2.6], ulan: [.45, '#DDE6EE', '#7C8894', '#C5CCD1', .92, 1] }[name];
    S.lights.forEach(([l, i, c]) => { l.intensity = i * (l.isHemisphereLight ? (name === 'pasko' ? .5 : name === 'ulan' ? .8 : 1) : P[0]); l.color.copy(c); if (P[1] && l.isDirectionalLight) l.color.set(P[1]); });
    if (S.skyU) { S.skyU.u.top.value.copy(S.skyU.top); S.skyU.u.hor.value.copy(S.skyU.hor); if (P[2]) { S.skyU.u.top.value.set(P[2]); S.skyU.u.hor.value.set(P[3]); } }
    if (S.fog && scene.fog) { scene.fog.color.copy(S.fog.c); scene.fog.near = S.fog.near; scene.fog.far = S.fog.far; if (P[3]) scene.fog.color.set(P[3]); if (name === 'ulan') { scene.fog.near = S.fog.near * .25; scene.fog.far = S.fog.far * .6; } }
    if (S.bg && scene.background?.isColor) { scene.background.copy(S.bg); if (P[3]) scene.background.set(P[3]); } if (renderer) renderer.toneMappingExposure = S.exp * P[4];
    S.islands.forEach(I => { I.emissive.forEach(([m, e]) => m.emissiveIntensity = e * P[5]); I.wet.forEach(([m, r]) => m.roughness = name === 'ulan' ? r * .35 : r); I.season.fiesta && (I.season.fiesta.visible = name === 'fiesta'); I.season.pasko && (I.season.pasko.visible = name === 'pasko'); I.season.ulan && (I.season.ulan.visible = name === 'ulan'); });
    if (S.fx) { S.fx.bloom.strength = name === 'pasko' ? .85 : name === 'fiesta' ? .5 : .35; S.fx.bloom.threshold = name === 'pasko' ? .75 : 1.1; } S.ui && S.ui.querySelectorAll('[data-season]').forEach(b => { const on = b.dataset.season === name; b.style.background = on ? '#3B2316' : '#FFFFFF'; b.style.color = on ? '#FFFFFF' : '#3B2316'; }); stage._invalidate?.(); };
  if (o.ui !== false && !S.ui) { const ui = document.createElement('div'); S.ui = ui; ui.style.cssText = 'position:fixed;left:16px;bottom:96px;display:flex;flex-wrap:wrap;gap:6px;align-items:center;z-index:5;font:600 13px/1 var(--font-body,system-ui);background:var(--color-bg,#f2f2f3);padding:6px 8px;border-radius:10px;max-width:calc(100vw - 32px)';
    const btn = (label, fn, attr) => { const b = document.createElement('button'); b.textContent = label; b.style.cssText = 'font:inherit;padding:7px 10px;border-radius:8px;border:1.5px solid #3B2316;background:#fff;color:#3B2316;cursor:pointer'; if (attr) b.dataset.season = attr; b.onclick = fn; ui.appendChild(b); return b; };
    const lab = document.createElement('span'); lab.textContent = 'Panahon'; lab.style.marginRight = '2px'; ui.appendChild(lab);
    [['Normal', 'normal'], ['Fiesta', 'fiesta'], ['Pasko', 'pasko'], ['Tag-ulan', 'ulan']].forEach(([l, k]) => btn(l, () => S.apply(k), k));
    const tg = (label, get, set) => { const b = btn(label, () => { set(!get()); paint(); }); const paint = () => { b.style.background = get() ? '#FFC93C' : '#fff'; }; paint(); };
    tg('Tilt-shift', () => S.tilt, x => { S.tilt = x; stage._invalidate?.(); }); tg('Sound spots', () => S.sounds, x => { S.sounds = x; S.islands.forEach(I => (I.sounds || []).forEach(s => s.userData.icon.visible = x)); stage._invalidate?.(); });
    document.body.appendChild(ui); }
  S.apply(S.season);
  if (!S.loop) { S.loop = true; let last = performance.now(); const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const frame = now => { const dt = Math.min(.05, (now - last) / 1000) * (reduce ? .3 : 1); last = now; U.value += dt; S.islands.forEach(I => I.tick.forEach(f => { try { f(dt); } catch (e) { } })); stage._invalidate?.(); requestAnimationFrame(frame); }; requestAnimationFrame(frame); }
  return isl;
}
