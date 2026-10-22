// Minigame play-test: each street game is started from Pagsasanay (practice) and played by a scripted
// "skilled" player that reacts within one frame, plus a "masher" for Sipa and Palosebo. It checks that
// every game starts, takes input, ends, records a score, and that timing beats button-mashing.
// Run: node tests/minigames.mjs
import { chromium, serve, watchErrors, check, done } from './lib.mjs';

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
  patinteroStraight: `sc => { const v = sc.peek(); const up = v.run.dir < 0; sc.key({ code: 'ArrowUp', preventDefault() {} }, up); sc.key({ code: 'ArrowDown', preventDefault() {} }, !up); }`
};

async function practice(kind, player) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
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

const results = {};
const only = process.argv[2];
for (const [kind, player] of [['tumbang', 'tumbang'], ['sipa', 'sipa'], ['sipa', 'sipaMash'], ['palosebo', 'palosebo'], ['palosebo', 'paloseboMash'], ['patintero', 'patintero'], ['patintero', 'patinteroStraight']].filter(([k]) => !only || k === only)) {
  const r = await practice(kind, player);
  results[player] = r.score;
  check(r.score >= 0 && r.back === 'title', `${player}: starts, takes input, ends and returns to the menu`, 'score ' + r.score);
  check(r.errs.length === 0, `${player}: no script errors`, r.errs.slice(0, 2).join(' | '));
}
if (!only || only === 'tumbang') check(results.tumbang >= 4, 'Tumbang Preso: well-timed throws knock the can down', results.tumbang + '/5');
if (!only || only === 'sipa') check(results.sipa > results.sipaMash, 'Sipa: timing beats mashing', results.sipa + ' vs ' + results.sipaMash);
if (!only || only === 'palosebo') check(results.palosebo >= 100, 'Palosebo: steady rhythm reaches the top', results.palosebo);
if (!only || only === 'palosebo') check(results.palosebo > results.paloseboMash, 'Palosebo: rhythm beats mashing', results.palosebo + ' vs ' + results.paloseboMash);
if (!only || only === 'patintero') check(results.patintero > 0, 'Patintero: a dodging runner scores past the guards', results.patintero);
if (!only || only === 'patintero') check(results.patintero > results.patinteroStraight, 'Patintero: dodging beats running straight into the guards', results.patintero + ' vs ' + results.patinteroStraight);
console.log('scores', JSON.stringify(results));
await browser.close(); srv.close(); done();
