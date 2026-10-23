/** Ported from koronaDist(), standings(), rankPay() and bonusList() in
 * index.html. All pure functions over plain player-shaped objects:
 * { id, pos, piso, korona, allies: [...], stats: { wins, dice, dn } }. */

export function koronaDist(pos, koronaSpots, N) {
  let best = N;
  for (const i of koronaSpots) {
    const d = ((i - pos + N) % N) || N;
    if (d < best) best = d;
  }
  return best;
}

/** 1-based rank per player: most korona first, then most piso; ties share a place. */
export function standings(players) {
  return players.map(
    (p) => 1 + players.filter((q) => q.korona > p.korona || (q.korona === p.korona && q.piso > p.piso)).length,
  );
}

/** Minigame payout from raw scores: 1st=10, 2nd=5, 3rd=3, 4th=0; ties share
 * the better payout and the next rank skips down. Works for any player count,
 * not just 4 (the original hardcoded [0,1,2,3]). */
export function rankPay(scores) {
  const T = [10, 5, 3, 0];
  const order = scores.map((_, i) => i).sort((a, b) => scores[b] - scores[a] || a - b);
  const pay = new Array(scores.length).fill(0);
  const rank = new Array(scores.length).fill(0);
  let r = 0;
  order.forEach((pi, k) => {
    if (k > 0 && scores[pi] < scores[order[k - 1]]) r = k;
    rank[pi] = r;
    pay[pi] = T[Math.min(r, T.length - 1)];
  });
  return { order, pay, rank };
}

/** End-of-party bonus korona: Hari ng Laro (most minigame wins), Mayaman
 * (most piso), Malas sa Dice (lowest average roll). A bonus is skipped if
 * every player ties for it (not a useful distinction) or it hit the "no
 * data" sentinel (0 wins, or 99 = no dice rolled). */
export function bonusList(players) {
  const mk = (name, desc, val, best) => {
    const vals = players.map(val);
    const tgt = best(...vals);
    const winners = players.filter((p, i) => vals[i] === tgt);
    return winners.length && winners.length < players.length ? { name, desc, winners: winners.map((p) => p.id), val: tgt } : null;
  };
  const avgRoll = (p) => (p.stats.dn ? Math.round((p.stats.dice / p.stats.dn) * 100) / 100 : 99);
  return [
    mk('Hari ng Laro', 'Pinakamaraming panalo sa mga laro', (p) => p.stats.wins, Math.max),
    mk('Mayaman', 'Pinakamaraming piso sa dulo', (p) => p.piso, Math.max),
    mk('Malas sa Dice', 'Pinakamababang average ng dice', avgRoll, Math.min),
  ]
    .filter(Boolean)
    .filter((b) => !(b.name === 'Hari ng Laro' && b.val === 0) && b.val !== 99);
}
