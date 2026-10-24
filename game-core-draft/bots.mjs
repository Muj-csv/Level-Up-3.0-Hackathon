import { clamp, pick } from './util.mjs';
import { koronaDist } from './scoring.mjs';
import { KCOST } from './config.mjs';

/** Ported from SPACE_VAL in index.html: how good a space is to land on,
 * used only by the Gintong dice (pick-your-number) bot heuristic. */
export const SPACE_VAL = { start: 2, piso: 2, swerte: 3, sari: 1, jack: 1.5, kasama: 2.5, tanong: 2, utang: -2, tikbalang: -3 };

/** Ported from passChance(d, item): odds an item gets a bot within `d` steps
 * of a korona. item=null means "no item", the baseline to compare against. */
export function passChance(d, item) {
  if (item === 'ginto') return d <= 10 ? 1 : 0;
  if (item === 'kendi') return clamp((14 - d) / 10, 0, 1);
  if (item === 'doble') {
    let c = 0;
    for (let a = 1; a <= 10; a++) for (let b = 1; b <= 10; b++) if (a + b >= d) c++;
    return c / 100;
  }
  return clamp((11 - d) / 10, 0, 1);
}

/** Ported from botUsesItem(p). `ctx` carries what the original read off the
 * module-global `state`: diff, round, maxRound, koronaSpots, N, items table. */
export function botUsesItem(p, ctx) {
  const it = p.item;
  if (!it || ctx.items[it].passive) return false;
  if (ctx.diff === 0 || ctx.round >= ctx.maxRound) return true;
  if (p.piso < (ctx.kcost ?? KCOST)) return false;
  const dist = koronaDist(p.pos, ctx.koronaSpots, ctx.N);
  const d = Math.max(1, Math.round(dist - 1.5 * p.allies.length));
  return passChance(d, it) - passChance(d, null) >= (ctx.diff === 2 ? 0.15 : 0.3) - 1e-9;
}

/** Ported from botGintoPick(p): which 1-10 to pick with the Gintong dice. */
export function botGintoPick(p, ctx) {
  const dist = koronaDist(p.pos, ctx.koronaSpots, ctx.N);
  const d = dist - p.allies.length;
  if (d <= 10 && p.piso >= (ctx.kcost ?? KCOST)) return Math.max(1, d);
  let best = 10;
  let bv = -9;
  for (let n = 10; n >= 1; n--) {
    const v = SPACE_VAL[ctx.path[(p.pos + n) % ctx.N].type] || 0;
    if (v > bv) {
      bv = v;
      best = n;
    }
  }
  return best;
}

/** Ported from botShop(p). `ctx.standings` is the standings() array aligned
 * to player id, `ctx.players` is the full player list (for the "has anyone
 * got more korona" lead check). */
export function botShop(p, ctx) {
  if (p.item) return 'none';
  const diff = ctx.diff;
  if (diff === 0) return p.piso >= 8 ? 'doble' : p.piso >= 3 ? 'kendi' : 'none';
  const kcost = ctx.kcost ?? KCOST;
  const spare = p.piso - kcost;
  const dist = koronaDist(p.pos, ctx.koronaSpots, ctx.N);
  const lead = ctx.standings[p.id] === 1 && ctx.players.some((q) => q.korona < p.korona);
  if (diff === 2 && lead && spare >= ctx.items.agimat.cost) return 'agimat';
  if (spare >= ctx.items.ginto.cost && (diff === 2 || dist <= 10)) return 'ginto';
  if (spare >= ctx.items.doble.cost && dist > 8) return 'doble';
  if (spare >= ctx.items.kendi.cost) return 'kendi';
  return 'none';
}

/** Ported from botRival(p, others): who a bot picks to challenge at Jack en Poy. */
export function botRival(others, diff, rng) {
  if (diff === 0) return pick(rng, others).id;
  if (diff === 2) {
    const lead = others
      .filter((q) => q.piso > 0 && q.item !== 'agimat')
      .sort((a, b) => b.korona - a.korona || b.piso - a.piso || a.id - b.id)[0];
    if (lead) return lead.id;
  }
  return [...others].sort((a, b) => b.piso - a.piso || a.id - b.id)[0].id;
}

/** Ported from the Kasama-join logic inside kasama(p): picks a friend not
 * already recruited by anyone, falling back to the full roster if all are
 * taken (shouldn't happen with max-2-allies and >2 friends, but matches the
 * original's fallback exactly). */
export function pickKasamaFriend(rng, roster, players) {
  const taken = new Set();
  players.forEach((p) => p.allies.forEach((a) => taken.add(a.n)));
  const free = roster.filter((k) => !taken.has(k.n));
  const pool = free.length ? free : roster;
  return pick(rng, pool);
}
