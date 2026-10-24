// Smooth sculpt helpers for Taympers kids v4: profile-swept superellipse bodies with seamless normals, offset hair shells, skin weights.
// Taympers game: detail level for the swept forms (1 = as designed; the game sets less on phones and tablets)
export const LOD = { k: 1 };
export const sp = (v, e) => Math.sign(v) * Math.pow(Math.abs(v), e);
export const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const cr = (a, b, c, d, t) => 0.5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (3 * b - a - 3 * c + d) * t * t * t);

function fixSeams(g) {
  const { rows, cols } = g.userData.grid, n = g.attributes.normal, v = [0, 0, 0];
  for (let r = 0; r < rows; r++) {
    const pole = r === 0 || r === rows - 1, a = r * cols, b = a + cols - 1;
    const list = pole ? Array.from({ length: cols }, (_, j) => a + j) : [a, b];
    v[0] = v[1] = v[2] = 0;
    for (const i of list) { v[0] += n.getX(i); v[1] += n.getY(i); v[2] += n.getZ(i); }
    const l = Math.hypot(...v) || 1;
    for (const i of list) n.setXYZ(i, v[0] / l, v[1] / l, v[2] / l);
  }
  n.needsUpdate = true;
}

// pts: [[y, rx, rz], ...] bottom→top; r=0 at ends closes the form. n: cross-section exponent (2 = ellipse, >2 softly squarer).
export function sweep(THREE, pts, o = {}) {
  const seg = Math.max(8, Math.round((o.seg || 48) * LOD.k)), sub = o.sub ?? 4, n = o.n || 2;
  let P = pts;
  if (sub > 1) {
    P = []; const k = pts.length;
    for (let i = 0; i < k - 1; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[i], c = pts[i + 1], d = pts[Math.min(k - 1, i + 2)];
      for (let s = 0; s < sub; s++) { const t = s / sub; P.push([0, 1, 2].map((j) => cr(a[j], b[j], c[j], d[j], t))); }
    }
    P.push(pts[k - 1]);
  }
  const rows = P.length, cols = seg + 1, pos = [], uv = [], idx = [], L = [0];
  for (let i = 1; i < rows; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
  for (let i = 0; i < rows; i++) {
    const [y, rx, rz] = P[i];
    for (let j = 0; j <= seg; j++) {
      const u = (j / seg) * Math.PI * 2;
      pos.push(Math.max(0, rx) * sp(Math.cos(u), 2 / n), y, Math.max(0, rz) * sp(Math.sin(u), 2 / n));
      uv.push(j / seg, L[i] / L[rows - 1]);
    }
  }
  for (let i = 0; i < rows - 1; i++) for (let j = 0; j < seg; j++) { const a = i * cols + j, b = a + cols; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.userData.grid = { rows, cols };
  g.computeVertexNormals(); fixSeams(g);
  return g;
}

// Ellipsoid-based profile with width modulation W(h) → [wx, wz], h = 0 bottom … 1 top. Round at both poles.
export function ell(y0, y1, Rx, Rz, knots, rows = 40) {
  const W = (h) => {
    let i = 1; while (i < knots.length - 1 && h > knots[i][0]) i++;
    const [h0, ax, az] = knots[i - 1], [h1, bx, bz] = knots[i], t = smooth(h0, h1, h);
    return [ax + (bx - ax) * t, az + (bz - az) * t];
  };
  const out = [];
  for (let i = 0; i <= rows; i++) {
    const v = Math.PI * (i / rows), h = (1 - Math.cos(v)) / 2, r = Math.sin(v), [wx, wz] = W(h);
    out.push([y0 + (y1 - y0) * h, Rx * r * wx, Rz * r * wz]);
  }
  return out;
}

// Offset copy of a swept surface: covered (cover>0) regions push out by `off`, the rest tucks inside → rolled, thick edge.
export function shell(THREE, base, off, cover, soft = 0.016, inset = 0.012) {
  const g = base.clone(), p = g.attributes.position, n = base.attributes.normal;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), t = smooth(-soft, soft, cover(x, y, z)), d = -inset + (off + inset) * t;
    p.setXYZ(i, x + n.getX(i) * d, y + n.getY(i) * d, z + n.getZ(i) * d);
  }
  g.userData.grid = base.userData.grid; g.computeVertexNormals(); fixSeams(g);
  return g;
}

export function skinWeights(THREE, g, fn) {
  const p = g.attributes.position, c = p.count, si = new Uint16Array(c * 4), sw = new Float32Array(c * 4);
  for (let i = 0; i < c; i++) {
    const ws = fn(p.getX(i), p.getY(i), p.getZ(i)).filter((w) => w[1] > 1e-4).slice(0, 4);
    const tot = ws.reduce((s, w) => s + w[1], 0) || 1;
    ws.forEach(([b, w], k) => { si[i * 4 + k] = b; sw[i * 4 + k] = w / tot; });
  }
  g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4));
  g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(sw, 4));
  return g;
}

// Surface hit helpers (for placing face features / prints / curls exactly on a swept surface).
export function surface(THREE, geo) {
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })), ray = new THREE.Raycaster();
  return {
    front(x, y) { ray.set(new THREE.Vector3(x, y, 2), new THREE.Vector3(0, 0, -1)); const h = ray.intersectObject(m)[0]; return h && { p: h.point, n: h.face.normal.clone() }; },
    dir(d, c = new THREE.Vector3()) { ray.set(c, d.clone().normalize()); const h = ray.intersectObject(m); const f = h[h.length - 1]; return f && { p: f.point, n: f.face.normal.clone() }; },
  };
}
