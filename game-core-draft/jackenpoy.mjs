/** Ported from the Jack en Poy hand logic in index.html (HANDKEYS, BEATS,
 * and the win/transfer math inside jackEnPoy()). UI/animation (the reveal
 * sequence, up to 3 tie retries) is not ported — that's presentation, not a
 * rule. */
export const HANDKEYS = ['bato', 'papel', 'gunting'];
export const BEATS = { bato: 'gunting', gunting: 'papel', papel: 'bato' };

/** 1 = a beats b, -1 = b beats a, 0 = tie. Invalid hands fall back to 'bato',
 * matching the original's `if(!HAND[a])a='bato'`. */
export function resolve(a, b) {
  if (!HANDKEYS.includes(a)) a = 'bato';
  if (!HANDKEYS.includes(b)) b = 'bato';
  if (a === b) return 0;
  return BEATS[a] === b ? 1 : -1;
}

/** Ported from `const amt=Math.min(5,los.piso)`: a win transfers up to 5
 * piso, capped at what the loser actually has. */
export function transferAmount(loserPiso) {
  return Math.min(5, loserPiso);
}
