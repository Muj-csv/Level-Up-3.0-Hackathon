/** Ported verbatim from index.html's const KCOST / ITEMS / MODES / DIFFS /
 * normCfg(). UI-only fields (icons, Filipino display text) are left out —
 * this is the numeric/decision slice a server or game-core package needs. */
export const KCOST = 10;

export const ITEMS = {
  doble: { cost: 5 },
  kendi: { cost: 3 },
  ginto: { cost: 8 },
  agimat: { cost: 4, passive: true },
};

export const MODES = { party: 'Party', torneo: 'Torneo', hamon: 'Hamon' };
export const DIFFS = ['Madali', 'Sakto', 'Mahirap'];

export function normCfg(c) {
  c = c || {};
  const mode = MODES[c.mode] ? c.mode : 'party';
  const rs = mode === 'torneo' ? [3, 5] : [3, 5, 8];
  return {
    mode,
    rounds: mode === 'hamon' ? 1 : rs.includes(+c.rounds) ? +c.rounds : 5,
    diff: [0, 1, 2].includes(+c.diff) ? +c.diff : 1,
  };
}

/** Ported from rollRange(item, n) in index.html: [min,max] dice total for a
 * roll, before Kasama bonuses. doble = two dice, kendi = +3 flat. */
export function rollRange(item, allyCount = 0) {
  const n = allyCount || 0;
  const r = item === 'doble' ? [2, 20] : item === 'kendi' ? [4, 13] : [1, 10];
  return [r[0] + n, r[1] + 2 * n];
}
