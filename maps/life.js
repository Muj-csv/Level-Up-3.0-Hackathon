// Taympers island "life": ambient motion, NPCs, korona models, banners.
// Usage: const { addLife } = await import('./life.js'); addLife(THREE, stage, root, opts)
export function addLife(THREE, stage, root, o = {}) {
  const PI = Math.PI, TAU = PI * 2, U = { value: 0 }, reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let seed = o.seed ?? 91; const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const life = new THREE.Group(); life.name = 'life_' + (o.name || 'island'); root.add(life);
  const M = (name, color, x = {}) => Object.assign(new THREE.MeshStandardMaterial({ color, roughness: .6, ...x }), { name });
  const mesh = (geo, m, x = 0, y = 0, z = 0) => { const k = new THREE.Mesh(geo, m); k.position.set(x, y, z); k.castShadow = true; return k; };

  // ---- shader sway + flowing / pulsing materials ----
  const mats = new Set(); root.traverse(m => { if (m.isMesh) [].concat(m.material).forEach(x => mats.add(x)); });
  const sway = (mat, y0, h, amp, f) => { if (mat.userData.sway) return; mat.userData.sway = 1; const prevC = mat.onBeforeCompile, prevK = mat.customProgramCacheKey ? mat.customProgramCacheKey.bind(mat) : () => ''; mat.customProgramCacheKey = () => prevK() + '|sway' + y0 + h + amp + f; mat.onBeforeCompile = (sh, r) => { prevC.call(mat, sh, r); sh.uniforms.uTime = U;
    sh.vertexShader = 'uniform float uTime;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n float sw = clamp((position.y - ' + y0.toFixed(2) + ') / ' + h.toFixed(2) + ', 0., 1.);\n transformed.x += sin(uTime * ' + f.toFixed(2) + ' + position.x * .35 + position.z * .27) * ' + amp.toFixed(3) + ' * sw;\n transformed.z += cos(uTime * ' + (f * .8).toFixed(2) + ' + position.x * .3 + position.z * .2) * ' + (amp * .6).toFixed(3) + ' * sw;'); }; mat.needsUpdate = true; };
  const flow = [], pulse = [];
  mats.forEach(m => { const n = m.name || '';
    if (/palm_frond/.test(n)) sway(m, 3, 5, .22, 1.3);
    else if (/^leaf|forest|mangrove_leaf|banana_leaf|bamboo_leaves|canopy/.test(n)) sway(m, 1.2, 6, .07, 1.1);
    else if (/flag_|banderita|banner_|hammock|sail_|tarp_|clothes|awning_stripes/.test(n)) sway(m, 0, 6, .06, 2.4);
    else if (/beach_grass|grass_tuft|pandan|rice_/.test(n)) sway(m, 0, .9, .05, 1.8);
    if (m.map && /waterfall|caustics/.test(n)) flow.push(m);
    if (m.emissive && /fiesta_bulb|firefly|lamp_glow|bare_bulb|flame|scale_dial/.test(n)) pulse.push([m, m.emissiveIntensity, rnd() * 6, /firefly/.test(n) ? 3 : 1]); });

  // ---- name banner ----
  if (o.banner) { const b = o.banner, g = new THREE.Group(); g.name = 'island_banner'; g.position.set(b.x, 0, b.z); g.rotation.y = b.ry || 0;
    const pole = M('banner_pole', '#C9A75A'); for (const s of [-1, 1]) g.add(mesh(new THREE.CylinderGeometry(.09, .11, 5.2, 8), pole, s * 2.9, 2.6, 0), mesh(new THREE.SphereGeometry(.16, 8, 6), M('banner_finial', '#FFC93C', { metalness: .5, roughness: .3 }), s * 2.9, 5.3, 0));
    const c = document.createElement('canvas'); c.width = 1024; c.height = 300; const x = c.getContext('2d'); x.fillStyle = b.color || '#E2452E'; x.fillRect(0, 0, 1024, 300); x.fillStyle = '#FFC93C'; for (let i = 0; i < 32; i++) { x.fillRect(i * 32, 0, 16, 18); x.fillRect(i * 32 + 16, 282, 16, 18); }
    x.fillStyle = '#FFF4DC'; x.strokeStyle = '#3B2316'; x.lineWidth = 16; x.lineJoin = 'round'; x.font = '900 150px "Arial Black", Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.strokeText(b.text, 512, 140); x.fillText(b.text, 512, 140);
    x.font = '900 40px "Arial Black", Arial, sans-serif'; x.lineWidth = 8; x.strokeText(b.sub || 'TAYMPERS', 512, 245); x.fillText(b.sub || 'TAYMPERS', 512, 245);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const geo = new THREE.PlaneGeometry(5.6, 1.65, 16, 4); const cm = M('banner_cloth', '#ffffff', { map: t, side: THREE.DoubleSide, roughness: .8 });
    sway(cm, -9, 1, .12, 2.6); const cl = mesh(geo, cm, 0, 4.05, 0); g.add(cl); life.add(g); }

  // ---- korona models on active spots ----
  const board = root.getObjectByName('board_spaces'), nodes = board ? Object.fromEntries(board.userData.nodes.map(n => [n.id, n])) : {}, spots = board ? board.userData.koronaSpots : [];
  const gold = M('korona_gold', '#FFC93C', { metalness: .85, roughness: .22, emissive: '#6E4A00', emissiveIntensity: .35 }), gemCols = ['#E2452E', '#2E6FD8', '#3BAA4A', '#E8559A', '#7B4BC4'];
  const crown = () => { const g = new THREE.Group(); g.name = 'korona'; g.add(mesh(new THREE.CylinderGeometry(.42, .36, .3, 24, 1, true), gold), mesh(new THREE.TorusGeometry(.38, .05, 6, 24).rotateX(PI / 2), gold, 0, -.15, 0), mesh(new THREE.TorusGeometry(.43, .04, 6, 24).rotateX(PI / 2), gold, 0, .15, 0));
    for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; g.add(mesh(new THREE.ConeGeometry(.1, .34, 6), gold, Math.cos(a) * .4, .32, Math.sin(a) * .4), mesh(new THREE.SphereGeometry(.065, 8, 6), M('korona_gem_' + i, gemCols[i], { roughness: .1, metalness: .2, emissive: gemCols[i], emissiveIntensity: .25 }), Math.cos(a) * .42, 0, Math.sin(a) * .42), mesh(new THREE.SphereGeometry(.05, 6, 4), gold, Math.cos(a) * .4, .52, Math.sin(a) * .4)); }
    g.add(mesh(new THREE.TorusGeometry(.75, .03, 4, 32).rotateX(PI / 2), M('korona_glow', '#FFE38A', { emissive: '#FFC93C', emissiveIntensity: .8, transparent: true, opacity: .7 }), 0, -1.35, 0)); g.scale.setScalar(1.5); return g; };
  const koronas = []; const setKorona = n => { koronas.splice(0).forEach(k => life.remove(k)); n = Math.max(0, Math.min(5, n | 0)); for (let i = 0; i < n && spots.length; i++) { const id = spots[Math.floor((i + .5) * spots.length / n)], nd = nodes[id]; if (!nd) continue; const k = crown(); k.position.set(nd.x, (nd.y || 0) + 1.7, nd.z); k.userData.base = k.position.y; k.userData.ph = i; life.add(k); koronas.push(k); } stage._invalidate?.(); };
  setKorona(o.korona ?? 3);
  if (o.ui !== false && spots.length) { const ui = document.createElement('div'); ui.style.cssText = 'position:fixed;left:16px;bottom:52px;display:flex;gap:6px;align-items:center;z-index:5;font:600 13px/1 var(--font-body,system-ui);background:var(--color-bg,#f2f2f3);padding:8px 10px;border:1px solid var(--color-neutral-300,#ccc)';
    ui.innerHTML = '<span style="margin-right:4px">Korona</span>'; const btns = []; for (let n = 1; n <= 5; n++) { const b = document.createElement('button'); b.className = 'btn btn-secondary'; b.textContent = n; b.style.minWidth = '34px'; b.onclick = () => { setKorona(n); btns.forEach((x, i) => x.className = 'btn ' + (i === n - 1 ? 'btn-primary' : 'btn-secondary')); }; btns.push(b); ui.appendChild(b); }
    btns[(o.korona ?? 3) - 1].className = 'btn btn-primary'; document.body.appendChild(ui); }

  // ---- walkers along the main loop ----
  const walkers = []; const main = board ? board.userData.nodes.filter(n => n.id[0] === 'M').sort((a, b) => a.id.localeCompare(b.id)) : [];
  if (main.length > 8) { const curve = new THREE.CatmullRomCurve3(main.map(n => new THREE.Vector3(n.x, Math.max(0, (n.y || 0) - .05), n.z)), true), L = curve.getLength(), skinM = M('npc_skin', '#B07A52'), pants = M('npc_pants', '#4D5A6E'), hatM = M('npc_salakot', '#E8D2A0');
    const shirts = ['#E2452E', '#2E6FD8', '#F2B705', '#3BAA4A', '#E8559A', '#13A39A', '#FBF7EF', '#7B4BC4'].map((c, i) => M('npc_shirt_' + i, c));
    for (let i = 0; i < (o.walkers ?? 6); i++) { const g = new THREE.Group(), s = .75 + rnd() * .35; g.name = 'npc_' + i; const legs = []; for (const z of [-.09, .09]) { const lg = new THREE.Group(); lg.position.set(0, .62, z); lg.add(mesh(new THREE.CylinderGeometry(.055, .05, .62, 6), pants, 0, -.31, 0)); g.add(lg); legs.push(lg); }
      g.add(mesh(new THREE.CapsuleGeometry(.15, .32, 3, 8), shirts[i % 8], 0, .95, 0), mesh(new THREE.SphereGeometry(.12, 8, 6), skinM, 0, 1.33, 0)); if (o.hats) g.add(mesh(new THREE.ConeGeometry(.38, .18, 12), hatM, 0, 1.47, 0));
      const arms = []; for (const z of [-.2, .2]) { const ar = new THREE.Group(); ar.position.set(0, 1.12, z); ar.add(mesh(new THREE.CylinderGeometry(.04, .04, .45, 5), skinM, 0, -.22, 0)); g.add(ar); arms.push(ar); }
      g.scale.setScalar(s); life.add(g); walkers.push({ g, legs, arms, u: i / (o.walkers ?? 6) + rnd() * .05, v: (.7 + rnd() * .5) / L, side: (rnd() < .5 ? -1 : 1) * (2.15 + rnd() * .35), curve, ph: rnd() * 6 }); } }

  // ---- birds ----
  const birds = []; const cz = o.centerZ ?? 0, birdM = M('bird', '#3B2316', { side: THREE.DoubleSide }), wingGeo = new THREE.PlaneGeometry(.7, .22).translate(.35, 0, 0).rotateX(-PI / 2);
  for (let i = 0; i < (o.birds ?? 7); i++) { const g = new THREE.Group(); g.name = 'ibon_' + i; g.add(mesh(new THREE.CapsuleGeometry(.07, .3, 2, 6).rotateZ(PI / 2), birdM)); const wl = mesh(wingGeo, birdM), wr = mesh(wingGeo, birdM); wr.rotation.y = PI; g.add(wl, wr); life.add(g); birds.push({ g, wl, wr, r: 14 + rnd() * 12, h: 13 + rnd() * 6, w: (.12 + rnd() * .1) * (rnd() < .5 ? 1 : -1), a: rnd() * TAU, ph: rnd() * 6 }); }

  // ---- butterflies ----
  const flies = []; const bfCols = ['#FFC93C', '#E8559A', '#FBF7EF', '#F07C1E', '#2E6FD8'].map((c, i) => M('paruparo_' + i, c, { side: THREE.DoubleSide, emissive: c, emissiveIntensity: .15 })), bwGeo = new THREE.CircleGeometry(.12, 6).translate(.12, 0, 0).rotateX(-PI / 2);
  for (let i = 0; i < (o.butterflies ?? 14) && main.length; i++) { const nd = main[Math.floor(rnd() * main.length)], a = rnd() * TAU, base = new THREE.Vector3(nd.x + Math.cos(a) * 3, .9 + rnd() * .8, nd.z + Math.sin(a) * 3), g = new THREE.Group(), m = bfCols[i % 5]; g.name = 'paruparo_' + i;
    const l = mesh(bwGeo, m), r = mesh(bwGeo, m); r.rotation.y = PI; g.add(l, r); life.add(g); flies.push({ g, l, r, base, ph: rnd() * 6, s: .6 + rnd() * .6 }); }

  // ---- boat (ping-pong along a polyline) ----
  const pingers = []; const pingPong = (obj, pts, speed, bob) => { const c = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(p[0], p[1] ?? 0, p[2] ?? p[1]))); pingers.push({ obj, c, L: c.getLength(), u: rnd(), dir: 1, speed, bob, ph: rnd() * 6 }); };
  if (o.boat) { const g = new THREE.Group(); g.name = 'bangka_sailing'; const hull = mesh(new THREE.CapsuleGeometry(.4, 3.2, 3, 10).rotateZ(PI / 2), M('boat_hull', '#FBF7EF')); hull.scale.set(1, .55, .7); hull.position.y = .25; g.add(hull, mesh(new THREE.BoxGeometry(3.4, .08, .05), M('boat_stripe', '#2E6FD8'), 0, .36, .29), mesh(new THREE.BoxGeometry(3.4, .08, .05), M('boat_stripe', '#2E6FD8'), 0, .36, -.29));
    for (const s of [-1, 1]) { g.add(mesh(new THREE.CylinderGeometry(.05, .05, 3.2, 6).rotateZ(PI / 2), M('boat_katig', '#C9A75A'), 0, .12, s * 1.5)); for (const x of [-.9, .9]) g.add(mesh(new THREE.CylinderGeometry(.03, .03, 1.6, 5).rotateX(PI / 2), M('boat_katig', '#C9A75A'), x, .45, s * .75)); }
    g.add(mesh(new THREE.CylinderGeometry(.03, .04, 2.6, 6), M('boat_mast', '#8B5A35'), .2, 1.6, 0)); const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.quadraticCurveTo(1, 1.4, .2, 2.6); sh.lineTo(-.05, 2.4); sh.quadraticCurveTo(.6, 1.3, -.8, .3); sh.closePath();
    const sail = mesh(new THREE.ShapeGeometry(sh), M('sail_life', '#F2B705', { side: THREE.DoubleSide }), .3, .5, 0); sway(sail.material, 0, 3, .08, 2); g.add(sail); life.add(g); pingPong(g, o.boat, 1.2, .06); }
  if (o.ducks) for (let i = 0; i < 4; i++) { const g = new THREE.Group(); g.name = 'pato_' + i; const w = M('duck_life', '#FBFBF5'); g.add(mesh(new THREE.SphereGeometry(.16, 8, 6), w, 0, .08, 0), mesh(new THREE.SphereGeometry(.08, 6, 4), w, .14, .22, 0), mesh(new THREE.BoxGeometry(.08, .03, .05), M('duck_beak', '#F2A22A'), .23, .21, 0)); g.scale.setScalar(1.2); life.add(g); pingPong(g, o.ducks, .35 + rnd() * .2, .03); }
  const clouds = root.getObjectByName('clouds');

  // ---- loop ----
  let last = performance.now(); const tmp = new THREE.Vector3(), tg = new THREE.Vector3();
  const tick = now => { const dt = Math.min(.05, Math.max(0, (now - last) / 1000) || 0); last = now; try {
    if (!reduce) { U.value += dt; const t = U.value;
      flow.forEach(m => { if (/caustics/.test(m.name)) { m.map.offset.x += dt * .02; m.map.offset.y += dt * .013; } else m.map.offset.y += dt * .9; });
      pulse.forEach(([m, b, ph, k]) => { m.emissiveIntensity = b * (k > 1 ? Math.max(0, Math.sin(t * 2.2 + ph)) * 1.6 : .75 + .25 * Math.sin(t * 3 + ph)); });
      koronas.forEach(k => { k.rotation.y += dt * 1.1; k.position.y = k.userData.base + Math.sin(t * 2 + k.userData.ph) * .18; });
      walkers.forEach(w => { w.u = (w.u + w.v * dt) % 1; w.curve.getPointAt(w.u, tmp); w.curve.getTangentAt(w.u, tg); w.g.position.set(tmp.x - tg.z * w.side, tmp.y + Math.abs(Math.sin(t * 7 + w.ph)) * .04, tmp.z + tg.x * w.side); w.g.rotation.y = Math.atan2(tg.x, tg.z) - PI / 2;
        const sw = Math.sin(t * 7 + w.ph) * .5; w.legs[0].rotation.z = sw; w.legs[1].rotation.z = -sw; w.arms[0].rotation.z = -sw * .8; w.arms[1].rotation.z = sw * .8; });
      birds.forEach(b => { b.a += b.w * dt; b.g.position.set(Math.cos(b.a) * b.r, b.h + Math.sin(t * .5 + b.ph) * 1.5, cz + Math.sin(b.a) * b.r * .8); b.g.rotation.y = -b.a - Math.sign(b.w) * PI / 2 + PI / 2; const f = Math.sin(t * 9 + b.ph) * .7; b.wl.rotation.x = f; b.wr.rotation.x = -f; });
      flies.forEach(f => { const k = t * f.s + f.ph; f.g.position.set(f.base.x + Math.sin(k) * 1.6, f.base.y + Math.sin(k * 2.3) * .35, f.base.z + Math.sin(k * 1.4 + 1) * 1.2); f.g.rotation.y = k; const a = Math.sin(t * 18 + f.ph) * 1.1; f.l.rotation.x = a; f.r.rotation.x = -a; });
      pingers.forEach(p => { p.u += p.dir * p.speed * dt / p.L; if (p.u > 1) { p.u = 1; p.dir = -1; } if (p.u < 0) { p.u = 0; p.dir = 1; } p.c.getPointAt(p.u, tmp); p.c.getTangentAt(p.u, tg); p.obj.position.set(tmp.x, tmp.y + Math.sin(t * 2 + p.ph) * p.bob, tmp.z); p.obj.rotation.set(Math.sin(t * 1.6 + p.ph) * .04, Math.atan2(-tg.z * p.dir, tg.x * p.dir), 0); });
      if (clouds) clouds.rotation.y += dt * .01; }
    } catch (e) { } stage._invalidate?.(); if (!o.stopped || !o.stopped()) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  return { setKorona, group: life };
}
