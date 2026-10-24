import { TAU, lerp } from './util.mjs';

/** The current 4-island layout from index.html (ISL const), ported verbatim.
 * Geometry (x/y/rx/ry) only matters for spacing the path; game logic only
 * reads each space's .type, .isl and .br. */
export const DEFAULT_ISLANDS = [
  { id: 0, name: 'Plaza', x: 420, y: 520, rx: 270, ry: 200, seed: 1.3 },
  { id: 1, name: 'Palengke', x: 1080, y: 320, rx: 240, ry: 178, seed: 2.9 },
  { id: 2, name: 'Dalampasigan', x: 1290, y: 830, rx: 250, ry: 185, seed: 4.4 },
  { id: 3, name: 'Bukid', x: 640, y: 1080, rx: 240, ry: 178, seed: 6.1 },
];

export const DEFAULT_ISLAND_PATTERNS = [
  ['start', 'piso', 'jack', 'kasama', 'swerte', 'piso', 'utang'],
  ['piso', 'sari', 'tanong', 'swerte', 'sari', 'utang'],
  ['piso', 'jack', 'kasama', 'swerte', 'piso', 'utang'],
  ['tanong', 'tikbalang', 'piso', 'sari', 'swerte', 'piso'],
];

export const DEFAULT_BRIDGE_PATTERNS = [
  ['piso', 'utang', 'piso'],
  ['piso', 'jack', 'utang'],
  ['piso', 'tikbalang', 'piso'],
  ['utang', 'piso', 'piso'],
];

function shapeR(isl, th) {
  const s = isl.seed;
  return 1 + 0.05 * Math.sin(3 * th + s) + 0.035 * Math.sin(5 * th + 2 * s) + 0.02 * Math.sin(9 * th + 3 * s);
}
function paramToward(a, b) {
  return Math.atan2((b.y - a.y) / a.ry, (b.x - a.x) / a.rx);
}

/** Ported from buildPath() in index.html, generalised from "4 islands" to
 * "n islands" (identical result for n=4 — (i+3)%4 === (i+n-1)%n there).
 * Returns the space list with .x/.y/.isl/.br/.t, no .type yet. */
export function buildPath(islands, pointK = 0.6) {
  const n = islands.length;
  const ISL = islands.map((isl) => ({ ...isl }));
  ISL.forEach((isl, i) => {
    const prev = ISL[(i + n - 1) % n];
    const next = ISL[(i + 1) % n];
    let a0 = paramToward(isl, prev);
    let a1 = paramToward(isl, next);
    while (a1 <= a0) a1 += TAU;
    isl.a0 = a0;
    isl.a1 = a1;
  });
  const pts = [];
  ISL.forEach((isl, i) => {
    const next = ISL[(i + 1) % n];
    const steps = Math.ceil((isl.a1 - isl.a0) / 0.01);
    for (let k = 0; k <= steps; k++) {
      const th = isl.a0 + (isl.a1 - isl.a0) * (k / steps);
      pts.push({ x: isl.x + Math.cos(th) * isl.rx * pointK, y: isl.y + Math.sin(th) * isl.ry * pointK, isl: i });
    }
    const p0 = { x: isl.x + Math.cos(isl.a1) * isl.rx * pointK, y: isl.y + Math.sin(isl.a1) * isl.ry * pointK };
    const q = { x: next.x + Math.cos(next.a0) * next.rx * pointK, y: next.y + Math.sin(next.a0) * next.ry * pointK };
    const L = Math.hypot(q.x - p0.x, q.y - p0.y);
    const segN = Math.ceil(L / 4);
    for (let k = 1; k < segN; k++) {
      const t = k / segN;
      pts.push({ x: lerp(p0.x, q.x, t), y: lerp(p0.y, q.y, t), br: i, t });
    }
  });
  const cum = [0];
  for (let k = 1; k <= pts.length; k++) {
    const a = pts[k - 1];
    const b = pts[k % pts.length];
    cum.push(cum[k - 1] + Math.hypot(b.x - a.x, b.y - a.y));
  }
  const total = cum[pts.length];
  const N = Math.round(total / 108);
  const step = total / N;
  const out = [];
  let j = 0;
  for (let k = 0; k < N; k++) {
    const s = k * step;
    while (cum[j + 1] < s) j++;
    const a = pts[j];
    const b = pts[(j + 1) % pts.length];
    const u = (s - cum[j]) / (cum[j + 1] - cum[j] || 1);
    out.push({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), isl: a.isl, br: a.br, t: a.t });
  }
  return out;
}

/** Ported from the assignTypes() IIFE in index.html. Mutates `path` in place,
 * setting .type on every space; space 0 is always 'start'. */
export function assignTypes(path, islandPatterns, bridgePatterns) {
  let seg = '';
  let k = 0;
  path.forEach((s) => {
    const key = s.isl !== undefined ? 'i' + s.isl : 'b' + s.br;
    if (key !== seg) {
      seg = key;
      k = 0;
    }
    const pat = s.isl !== undefined ? islandPatterns[s.isl] : bridgePatterns[s.br];
    s.type = pat[k % pat.length];
    k++;
  });
  path[0].type = 'start';
}

/** Ported from KORONA_CANDS in index.html. `skipFirst` (default 4) keeps
 * korona away from the start space, same as the original's hardcoded i>3. */
export function koronaCandidates(path, skipFirst = 4) {
  return path
    .map((s, i) => i)
    .filter((i) => i >= skipFirst && path[i].isl !== undefined && ['piso', 'kasama', 'tanong'].includes(path[i].type));
}

/** Builds the full board (path + types + korona candidates) from island defs.
 * Pass custom islands/patterns for a future 5+ island board (F5); the current
 * 4-island layout is the default so this matches the live game today. */
export function buildBoard({
  islands = DEFAULT_ISLANDS,
  islandPatterns = DEFAULT_ISLAND_PATTERNS,
  bridgePatterns = DEFAULT_BRIDGE_PATTERNS,
  pointK = 0.6,
  koronaSkipFirst = 4,
} = {}) {
  const path = buildPath(islands, pointK);
  assignTypes(path, islandPatterns, bridgePatterns);
  const koronaSpots = koronaCandidates(path, koronaSkipFirst);
  return { path, N: path.length, koronaCandidates: koronaSpots };
}
