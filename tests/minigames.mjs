// Minigame play-test: each street game is started from Pagsasanay (practice) and played by a scripted
// "skilled" player that reacts within one frame, plus a "masher" for Sipa, Palosebo and Luksong Tinik. It checks that
// every game starts, takes input, ends, records a score, and that timing beats button-mashing.
// Pukpok Palayok: a player that counts the steps (it sees the pot only before the blindfold, like a person), one that
// swings at once and one that never swings.
// Run: node tests/minigames.mjs
import { chromium, serve, watchErrors, check, done, renderer } from './lib.mjs';

const srv = await serve();
const browser = await chromium();

// in-page players: run on requestAnimationFrame next to the game loop, read sc.peek(), press like a person
const PLAYERS = {
  tumbang: `sc => { const L = sc.peek()[0]; if (L.ready && Math.abs(L.aim) < L.tol * 0.5) sc.action(); }`,
  sipa: `sc => { const s = sc.peek()[0]; if (s.cd > .6 || s.out) return; if (s.kickable && s.ttl < s.win * 0.7) sc.action(); }`,
  sipaMash: `sc => { if (Math.random() < 0.35) sc.action(); }`,
  palosebo: `sc => { const L = sc.peek()[0]; if (L.cd > .6 || L.done || L.stun > 0) return; if (L.since > L.gap * 1.2) sc.action(); }`,
  paloseboMash: `sc => { if (Math.random() < 0.5) sc.action(); }`,
  // patintero: stop short of the next line, run sideways (turning at the walls) until its guard is a body-width
  // behind, then cut across; keep the sideways run going while crossing
  patintero: `sc => { const v = sc.peek(); if (v.cd > .6) return; const r = v.run, up = r.dir < 0, st = window.__pt || (window.__pt = { side: 1 });
    const next = v.guards.filter(g => up ? g.ly < r.y - 1 : g.ly > r.y + 1).sort((a, b) => up ? b.ly - a.ly : a.ly - b.ly)[0];
    const k = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false }, fwd = up ? 'ArrowUp' : 'ArrowDown';
    if (!next) k[fwd] = true;
    else { const dist = Math.abs(next.ly - r.y), dx = r.x - next.x;
      if (r.x > 110) st.side = -1; if (r.x < -110) st.side = 1;
      const open = Math.abs(dx) > 42 && Math.sign(dx) === st.side;
      if (dist > 42 || open || r.inv > 0) k[fwd] = true;
      if (dist < 90) k[st.side > 0 ? 'ArrowRight' : 'ArrowLeft'] = true; }
    for (const c in k) sc.key({ code: c, preventDefault() {} }, k[c]); }`,
  // luksong tinik: jump as soon as the feet are in the yellow take-off zone; the masher jumps whenever
  luksong: `sc => { const L = sc.peek()[0]; if (L.cd <= .6 && L.st === 'run' && L.inZone) sc.action(); }`,
  luksongMash: `sc => { if (Math.random() < 0.35) sc.action(); }`,
  patinteroStraight: `sc => { const v = sc.peek(); const up = v.run.dir < 0; sc.key({ code: 'ArrowUp', preventDefault() {} }, up); sc.key({ code: 'ArrowDown', preventDefault() {} }, !up); }`,
  // pukpok palayok: remember how many steps away the pot is while looking, then swing on that step
  palayok: `sc => { const L = sc.peek()[0], m = window.__pp || (window.__pp = {}); if (L.ph === 'look' && L.pot != null) m[L.tri] = Math.round(L.pot); if (L.ph === 'walk' && !L.out && m[L.tri] != null && L.steps >= m[L.tri]) sc.action(); }`,
  palayokOnce: `sc => { const L = sc.peek()[0]; if (L.ph === 'walk' && !L.out) sc.action(); }`,
  palayokNever: `sc => {}`,
  // taguan: tap only while a kid's clue is showing (never on cats, chickens and dogs); the other taps at every stop
  taguan: `sc => { const v = sc.peek(); if (v.clue === 'kid' && !v.tapped && !v.locked) sc.action(); }`,
  taguanEvery: `sc => { const v = sc.peek(); if (v.k >= 0 && !v.tapped && !v.locked) sc.action(); }`
};

async function practice(kind, player) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await renderer(page, '2d');
  const errs = watchErrors(page, kind);
  await page.goto(srv.url + '?debug');
  await page.waitForTimeout(1200);
  await page.click('#mHamon');
  await page.click('#card [data-v="practice"]');
  await page.click(`#card [data-v="${kind}"]`);
  await page.waitForSelector('#card [data-v="go"]');
  await page.click('#card [data-v="go"]');
  await page.waitForFunction(() => window.__lsu.scene && window.__lsu.scene.peek, null, { timeout: 10000 });
  await page.evaluate(src => {
    const fn = eval(src);
    const tick = () => { const sc = window.__lsu.scene; if (sc && sc.peek && !sc.ended) { try { fn(sc); } catch (e) { console.error(e); } } if (!window.__stop) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }, PLAYERS[player]);
  // the results card offers Ulitin / Ibang laro / Menu once the game is over
  await page.waitForSelector('#card [data-v="again"]', { timeout: 90000 });
  const res = await page.evaluate(() => { window.__stop = true; return { title: document.querySelector('#card h2').textContent, best: JSON.parse(localStorage.getItem('lsu-lb') || '{}') }; });
  const score = parseInt((res.title.match(/(\d+)/) || [])[1] || '-1', 10);
  await page.click('#card [data-v="menu"]');
  await page.waitForTimeout(300);
  const back = await page.evaluate(() => window.__lsu.screen);
  await page.close();
  return { score, back, errs };
}

const results = {}, runs = {};
const only = process.argv[2];
for (const [kind, player] of [['tumbang', 'tumbang'], ['sipa', 'sipa'], ['sipa', 'sipaMash'], ['palosebo', 'palosebo'], ['palosebo', 'paloseboMash'], ['patintero', 'patintero'], ['patintero', 'patinteroStraight'], ['luksong', 'luksong'], ['luksong', 'luksongMash'],
  ['palayok', 'palayok'], ['palayok', 'palayok'], ['palayok', 'palayok'], ['palayok', 'palayokOnce'], ['palayok', 'palayokNever'],
  ['taguan', 'taguan'], ['taguan', 'taguanEvery']].filter(([k]) => !only || k === only)) {
  const r = await practice(kind, player);
  results[player] = r.score; (runs[player] || (runs[player] = [])).push(r.score);
  check(r.score >= 0 && r.back === 'title', `${player}: starts, takes input, ends and returns to the menu`, 'score ' + r.score);
  check(r.errs.length === 0, `${player}: no script errors`, r.errs.slice(0, 2).join(' | '));
}
if (!only || only === 'tumbang') check(results.tumbang >= 4, 'Tumbang Preso: well-timed throws knock the can down', results.tumbang + '/5');
if (!only || only === 'sipa') check(results.sipa > results.sipaMash, 'Sipa: timing beats mashing', results.sipa + ' vs ' + results.sipaMash);
if (!only || only === 'palosebo') check(results.palosebo >= 100, 'Palosebo: steady rhythm reaches the top', results.palosebo);
if (!only || only === 'palosebo') check(results.palosebo > results.paloseboMash, 'Palosebo: rhythm beats mashing', results.palosebo + ' vs ' + results.paloseboMash);
if (!only || only === 'patintero') check(results.patintero > 0, 'Patintero: a dodging runner scores past the guards', results.patintero);
if (!only || only === 'patintero') check(results.patintero > results.patinteroStraight, 'Patintero: dodging beats running straight into the guards', results.patintero + ' vs ' + results.patinteroStraight);
if (!only || only === 'luksong') check(results.luksong >= 6, 'Luksong Tinik: jumping from the zone clears most heights', results.luksong + '/8');
if (!only || only === 'luksong') check(results.luksong > results.luksongMash, 'Luksong Tinik: timing beats mashing', results.luksong + ' vs ' + results.luksongMash);
if (!only || only === 'palayok') {
  // bots: each level's three tries add up inside its range (Madali 6–15, Sakto 12–21, Mahirap 18–27)
  const page = await browser.newPage(); await renderer(page, '2d'); await page.goto(srv.url + '?debug'); await page.waitForFunction(() => window.__lsu);
  const bots = await page.evaluate(() => [0, 1, 2].map(d => { const M = window.__lsu.MG.palayok, a = []; for (let i = 0; i < 400; i++) { const pre = M.preroll(d); a.push(pre.length === 3 ? M.botScore(pre) : -1); } return [Math.min(...a), Math.max(...a), a.reduce((x, y) => x + y, 0) / a.length]; }));
  await page.close();
  check(bots[0][0] >= 6 && bots[0][1] <= 15 && bots[1][0] >= 12 && bots[1][1] <= 21 && bots[2][0] >= 18 && bots[2][1] <= 27 && bots[0][2] < bots[1][2] && bots[1][2] < bots[2][2],
    'Pukpok Palayok: bots score inside their level (Madali 6–15, Sakto 12–21, Mahirap 18–27)', bots.map(b => b[0] + '–' + b[1] + ' avg ' + b[2].toFixed(1)).join(' / '));
  const avg = runs.palayok.reduce((a, b) => a + b, 0) / runs.palayok.length;
  check(avg >= 20, 'Pukpok Palayok: counting the steps averages 20 points or more', runs.palayok.join(', ') + ' (average ' + avg.toFixed(1) + ')');
  check(results.palayokOnce === 0 && results.palayokNever === 0, 'Pukpok Palayok: swinging at once or never swinging scores 0', results.palayokOnce + ' / ' + results.palayokNever);
}
if (!only || only === 'taguan') {
  check(results.taguan >= 80, 'Taguan: tapping only on real clues finds at least 8 of 10 kids', results.taguan + ' points');
  check(results.taguan > results.taguanEvery, 'Taguan: reading the clues beats tapping at every spot', results.taguan + ' vs ' + results.taguanEvery);
  const page = await browser.newPage(); await renderer(page, '2d'); await page.goto(srv.url + '?debug'); await page.waitForFunction(() => window.__lsu);
  const bots = await page.evaluate(() => [0, 1, 2].map(d => { const M = window.__lsu.MG.taguan, a = []; for (let i = 0; i < 400; i++) a.push(M.preroll(d)); return { f: [Math.min(...a.map(p => p.f)), Math.max(...a.map(p => p.f))], w: [Math.min(...a.map(p => p.w)), Math.max(...a.map(p => p.w))], s: M.botScore({ f: 9, w: 1 }) }; }));
  await page.close();
  check(bots[0].f[0] === 3 && bots[0].f[1] === 5 && bots[0].w[1] === 2 && bots[1].f[0] === 5 && bots[1].f[1] === 7 && bots[1].w[1] === 1 && bots[2].f[0] === 7 && bots[2].f[1] === 9 && bots[2].w[1] === 0 && bots[0].s === 88,
    'Taguan: bots find 3–5 / 5–7 / 7–9 kids with 0–2 / 0–1 / 0 wrong taps, scored found × 10 − wrong × 2', JSON.stringify(bots));
}
console.log('scores', JSON.stringify(results));
await browser.close(); srv.close(); done();
