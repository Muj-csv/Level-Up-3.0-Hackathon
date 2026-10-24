// Taympers graphics polish: board path + curbs + edge lights, chunky tiles, surface detail,
// sky dome + fog + environment reflections, rim light, foliage variation, water ripples, grading.
export function polish(THREE, stage, root, o = {}) {
  const PI = Math.PI, TAU = PI * 2, G = { sky: '#8FD0F2', horizon: '#EAF6F8', sun: '#FFF1D6', fog: '#DDEFF4', exposure: 1.0, rim: '#FFF4DC', rimK: .22, tint: '#FFFFFF', ...o.grade };
  const scene = stage._scene, renderer = stage._renderer, U = { value: 0 };
  // ---------- shader chain helper ----------
  const chain = (m, key, fn) => { const prev = m.onBeforeCompile, pk = m.customProgramCacheKey ? m.customProgramCacheKey.bind(m) : () => '';
    m.onBeforeCompile = (sh, r) => { prev.call(m, sh, r); fn(sh); }; m.customProgramCacheKey = () => pk() + '|' + key; m.needsUpdate = true; };
  // ---------- surface detail: normal maps from albedo ----------
  const nmCache = new Map();
  const normalFrom = (tex, k = 2.2) => { if (o.normals === false) return null; if (nmCache.has(tex)) return nmCache.get(tex); const img = tex.image; if (!img || !img.width) return null; const w = Math.min(512, img.width), h = Math.min(512, img.height);
    const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.drawImage(img, 0, 0, w, h); const src = g.getImageData(0, 0, w, h).data, L = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) L[i] = (src[i * 4] * .3 + src[i * 4 + 1] * .59 + src[i * 4 + 2] * .11) / 255;
    const out = g.createImageData(w, h), at = (x, y) => L[((y + h) % h) * w + ((x + w) % w)];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const dx = (at(x + 1, y) - at(x - 1, y)) * k, dy = (at(x, y + 1) - at(x, y - 1)) * k, l = Math.hypot(dx, dy, 1), i = (y * w + x) * 4; out.data[i] = (-dx / l * .5 + .5) * 255; out.data[i + 1] = (dy / l * .5 + .5) * 255; out.data[i + 2] = (1 / l * .5 + .5) * 255; out.data[i + 3] = 255; }
    g.putImageData(out, 0, 0); const t = new THREE.CanvasTexture(c); t.wrapS = tex.wrapS; t.wrapT = tex.wrapT; t.repeat.copy(tex.repeat); t.offset.copy(tex.offset); t.anisotropy = 8; nmCache.set(tex, t); return t; };
  // ---------- ripple normal (water) ----------
  const ripple = (() => { const s = 256, c = document.createElement('canvas'); c.width = c.height = s; const g = c.getContext('2d'), d = g.createImageData(s, s), H = (x, y) => Math.sin(x / s * TAU * 3 + Math.sin(y / s * TAU * 2) * 1.5) * .5 + Math.sin(y / s * TAU * 5 + x / s * TAU) * .3 + Math.sin((x + y) / s * TAU * 7) * .2;
    for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) { const dx = (H(x + 1, y) - H(x - 1, y)) * 6, dy = (H(x, y + 1) - H(x, y - 1)) * 6, l = Math.hypot(dx, dy, 1), i = (y * s + x) * 4; d.data[i] = (-dx / l * .5 + .5) * 255; d.data[i + 1] = (dy / l * .5 + .5) * 255; d.data[i + 2] = (1 / l * .5 + .5) * 255; d.data[i + 3] = 255; }
    g.putImageData(d, 0, 0); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(.12, .12); return t; })();
  // ---------- per-material upgrades ----------
  const mats = new Set(); root.traverse(m => { if (m.isMesh) [].concat(m.material).forEach(x => mats.add(x)); });
  const water = [];
  mats.forEach(m => { if (!m.isMeshStandardMaterial) return; const n = m.name || '';
    if (/water|lagoon|channel|pool|puddle|ice$/.test(n) && !/waterfall/.test(n)) { m.normalMap = ripple; m.normalScale = new THREE.Vector2(.35, .35); m.roughness = .04; m.metalness = Math.max(m.metalness, .15); m.envMapIntensity = 2.2; water.push(m); }
    else if (m.map && !m.userData.ownUV && !m.alphaTest && !m.transparent) { const nm = normalFrom(m.map, /grass|leaf|forest/.test(n) ? 1.4 : 2.6); if (nm) { m.normalMap = nm; m.normalScale = new THREE.Vector2(.9, .9); } }
    if (/^tile_/.test(n) && m.map) { const nm = normalFrom(m.map, 5); if (nm) { nm.repeat.set(1, 1); m.normalMap = nm; m.normalScale = new THREE.Vector2(1.6, 1.6); } m.roughness = .3; m.metalness = 0; m.envMapIntensity = .6; }
    // foliage color variation
    if (/^leaf|forest|grass|canopy|mangrove|palm_frond|bush|tuft|banana_leaf|bamboo/.test(n)) chain(m, 'var', sh => { sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;').replace('#include <color_fragment>', '#include <color_fragment>\nfloat nv = sin(vWP.x * .23 + sin(vWP.z * .17) * 2.) * .5 + sin(vWP.z * .31 + vWP.x * .07) * .5;\ndiffuseColor.rgb *= vec3(1.0 + nv * .10, 1.0 + nv * .06, 1.0 - nv * .08);'); });
    // rim light on everything
    chain(m, 'rim', sh => { sh.uniforms.uRim = { value: new THREE.Color(G.rim) }; sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec3 uRim;').replace('#include <dithering_fragment>', '#include <dithering_fragment>\nfloat rimF = pow(1.0 - clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0), 3.0);\ngl_FragColor.rgb += uRim * rimF * ' + G.rimK.toFixed(3) + ';'); }); });
  // ---------- sky dome, fog, environment, grading ----------
  const R = o.skyRadius ?? 420; const skyM = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: { top: { value: new THREE.Color(G.sky) }, hor: { value: new THREE.Color(G.horizon) }, sun: { value: new THREE.Color(G.sun) }, sd: { value: new THREE.Vector3(.4, .55, .35).normalize() } },
    vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 top; uniform vec3 hor; uniform vec3 sun; uniform vec3 sd; varying vec3 vD; void main(){ float h = clamp(vD.y * 1.4 + .08, 0., 1.); vec3 c = mix(hor, top, pow(h, .7)); float s = pow(max(dot(vD, sd), 0.), 64.); c += sun * s * .8 + sun * pow(max(dot(vD, sd), 0.), 6.) * .18; if (vD.y < 0.) c = mix(hor, top * .9, clamp(-vD.y * 1.6, 0., 1.)); gl_FragColor = vec4(c, 1.); }' });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(R, 32, 16), skyM); sky.name = 'sky_dome'; sky.renderOrder = -1; sky.frustumCulled = false; sky.userData.noExport = true;
  if (scene) { scene.add(sky); scene.fog = new THREE.Fog(G.fog, R * .55, R * 1.3); scene.background = new THREE.Color(G.horizon);
    if (renderer) { renderer.toneMappingExposure = G.exposure * .92; const pm = new THREE.PMREMGenerator(renderer), es = new THREE.Scene(); es.add(new THREE.Mesh(new THREE.SphereGeometry(10, 32, 16), skyM.clone())); scene.environment = pm.fromScene(es, .02).texture; scene.environmentIntensity = G.env ?? .4; pm.dispose(); }
    const rimLight = new THREE.DirectionalLight(G.rim, .55); rimLight.position.set(-60, 30, -70); rimLight.name = 'rim_light'; scene.add(rimLight); const hemi = new THREE.HemisphereLight(G.sky, G.tint, .12); hemi.name = 'grade_fill'; scene.add(hemi); }
  // ---------- board path + curbs + edge lights + chunky tiles ----------
  const board = root.getObjectByName('board_spaces');
  if (board) { const nodes = board.userData.nodes, byId = Object.fromEntries(nodes.map(n => [n.id, n])), P = new THREE.Group(); P.name = 'board_path';
    const pathM = new THREE.MeshStandardMaterial({ name: 'board_path_stone', color: G.path || '#D9CBAE', roughness: .8 }), curbM = new THREE.MeshStandardMaterial({ name: 'board_curb', color: G.curb || '#8E8577', roughness: .7 }), glowM = new THREE.MeshStandardMaterial({ name: 'board_edge_light', color: '#FFF6D6', emissive: '#FFD873', emissiveIntensity: .9 }), postM = new THREE.MeshStandardMaterial({ name: 'board_light_post', color: '#3B3F4A', roughness: .5, metalness: .4 });
    // stone texture for path
    { const s = 512, c = document.createElement('canvas'); c.width = c.height = s; const g = c.getContext('2d'); g.fillStyle = '#9C8E78'; g.fillRect(0, 0, s, s); for (let r = 0; r < 8; r++) for (let k = -1; k < 9; k++) { const w = s / 8, x = k * w + (r % 2) * w / 2; const v = 205 + Math.random() * 35 | 0; g.fillStyle = 'rgb(' + v + ',' + (v - 8) + ',' + (v - 22) + ')'; g.beginPath(); g.roundRect(x + 3, r * w + 3, w - 6, w - 6, 10); g.fill(); }
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; pathM.map = t; pathM.color.set('#FFFFFF'); pathM.normalMap = normalFrom(t, 3.5); }
    const chainFrom = (startId, stopIds) => { const out = []; let id = startId, guard = 0; while (id && guard++ < 400) { out.push(byId[id]); const nx = byId[id].next[0]; if (stopIds.includes(nx)) { out.push(byId[nx]); break; } id = nx; if (id === startId) break; } return out; };
    const main = nodes.filter(n => n.id[0] === 'M').sort((a, b) => a.id.localeCompare(b.id)), loops = [[main, true]];
    const branchIds = [...new Set(nodes.filter(n => n.id[0] !== 'M').map(n => n.id[0]))]; branchIds.forEach(L => { const br = nodes.filter(n => n.id[0] === L).sort((a, b) => a.id.localeCompare(b.id)); const fork = nodes.find(n => n.next.includes(br[0].id)), merge = byId[br[br.length - 1].next[0]]; loops.push([[fork, ...br, merge].filter(Boolean), false]); });
    const strip = (pts, w, y0, th, mat, closed) => { const n = pts.length, pos = [], uv = [], idx = []; let acc = 0;
      for (let i = 0; i < n; i++) { const a = pts[closed ? (i - 1 + n) % n : Math.max(0, i - 1)], b = pts[closed ? (i + 1) % n : Math.min(n - 1, i + 1)], d = b.clone().sub(a).setY(0).normalize(), p = pts[i], nx = -d.z, nz = d.x; if (i) acc += p.distanceTo(pts[i - 1]);
        const y = p.y + y0; [[-w / 2 - th, y - th], [-w / 2, y], [w / 2, y], [w / 2 + th, y - th]].forEach(([o2, yy], k) => { pos.push(p.x + nx * o2, yy, p.z + nz * o2); uv.push((o2 + w / 2) / 2.4, acc / 2.4); }); }
      const segs = closed ? n : n - 1; for (let i = 0; i < segs; i++) { const a = i * 4, b = ((i + 1) % n) * 4; for (let k = 0; k < 3; k++) idx.push(a + k, a + k + 1, b + k, a + k + 1, b + k + 1, b + k); }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); const m = new THREE.Mesh(g, mat); m.receiveShadow = true; return m; };
    loops.forEach(([list, closed]) => { if (list.length < 3) return; const c = new THREE.CatmullRomCurve3(list.map(n => new THREE.Vector3(n.x, n.y ?? .05, n.z)), closed, 'centripetal'), L = c.getLength(), pts = c.getSpacedPoints(Math.ceil(L / .5)); if (closed) pts.pop();
      P.add(strip(pts, 2.0, .06, .08, pathM, closed)); for (const s of [-1, 1]) { const cp = pts.map((p, i) => { const a = pts[closed ? (i - 1 + pts.length) % pts.length : Math.max(0, i - 1)], b = pts[closed ? (i + 1) % pts.length : Math.min(pts.length - 1, i + 1)], d = b.clone().sub(a).setY(0).normalize(); return new THREE.Vector3(p.x - d.z * s * 1.15, p.y + .12, p.z + d.x * s * 1.15); });
        const curb = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cp, closed), cp.length, .1, 6, closed), curbM); curb.castShadow = curb.receiveShadow = true; P.add(curb);
        for (let i = 0; i < cp.length; i += 9) { const p = cp[i]; const post = new THREE.Mesh(new THREE.CylinderGeometry(.04, .05, .45, 6), postM); post.position.set(p.x, p.y + .2, p.z); const bulb = new THREE.Mesh(new THREE.SphereGeometry(.07, 8, 6), glowM); bulb.position.set(p.x, p.y + .45, p.z); P.add(post, bulb); } } });
    root.add(P);
    // chunky beveled tiles
    const rimM = new THREE.MeshPhysicalMaterial({ name: 'tile_ceramic_rim', color: '#FBF7EF', roughness: .25, clearcoat: 1, clearcoatRoughness: .15 }), goldRim = new THREE.MeshPhysicalMaterial({ name: 'tile_gold_rim', color: '#FFC93C', metalness: .8, roughness: .25, clearcoat: .6 });
    const lathe = (R2, h) => new THREE.LatheGeometry([[0, 0], [R2 + .16, 0], [R2 + .22, .05], [R2 + .22, h - .07], [R2 + .16, h], [R2 + .02, h], [R2, h - .03], [0, h - .03]].map(([x, y]) => new THREE.Vector2(x, y)), 40);
    board.children.forEach(sp => { const rim = sp.getObjectByName('rim'), top = sp.getObjectByName('top'), ring = sp.getObjectByName('korona_spot_ring'); if (!rim || !top) return; const R2 = top.geometry.parameters.radius;
      rim.geometry.dispose(); rim.geometry = lathe(R2, .28); rim.position.y = .02; rim.material = rimM; top.position.y = .275; if (ring) { ring.material = goldRim; ring.position.y = .12; } }); }
  // ---------- animate ripples ----------
  let last = performance.now(); const tick = now => { const dt = Math.min(.05, (now - last) / 1000); last = now; ripple.offset.x += dt * .015; ripple.offset.y += dt * .01; requestAnimationFrame(tick); }; requestAnimationFrame(tick);
  stage._invalidate?.();
  return { sky };
}
