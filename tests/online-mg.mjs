// Online play-test for the new minigames, through the stand-in room (tests/mock-room.js), as the new-minigames PRD
// asks for every phase (D3): two phones on the same build play a 3-game Torneo forced to one new minigame
// (?debug&mg=<key>), each running a scripted player, and must agree on every score: the scores both phones logged and
// every lane's total on each phone's screen. Also checks the build check: a phone on another build can't join a room.
// Run: node tests/online-mg.mjs [game]
//      node tests/online-mg.mjs live [game]   (the real Supabase project in index.html, same as
//      `online.mjs live`; needs internet. This is the D3 "real-phone Supabase check" for the new
//      minigames specifically, from a laptop — it still does not replace an actual multi-phone test
//      on the venue network, which needs real devices.)
import path from 'path';
import { chromium, serve, watchErrors, check, done, ROOT, renderer } from './lib.mjs';

const LIVE = process.argv[2] === 'live';
console.log('room service: ' + (LIVE ? 'Supabase adapter, real project' : 'Claude room (mock-room.js)'));

// in-page players (the local kid's lane is `i`) and what each phone shows as every lane's total when a game is over
// (read when the scene hands back its result, so an online player's last move has arrived)
const GAMES = {
  palayok: {
    player: `(sc, i) => { const L = sc.peek()[i], m = window.__pp || (window.__pp = {}); if (L.ph === 'look' && L.pot != null) m[L.tri] = Math.round(L.pot); if (L.ph === 'walk' && !L.out && m[L.tri] != null && L.steps >= m[L.tri]) sc.action(); }`,
    totals: `sc => sc.v3.lanes.map(L => sc.v3.total(L))`
  },
  taguan: {
    player: `(sc, i) => { const v = sc.peek(); if (v.clue === 'kid' && !v.tapped && !v.locked) sc.action(); }`,
    totals: `sc => sc.v3.P.map(pl => pl.mode === 'remote' ? Math.max(0, Math.min(100, (pl.rf | 0) * 10 - (pl.rw | 0) * 2)) : sc.v3.score(pl))`
  },
  piko: {
    player: `(sc, i) => { const v = sc.peek()[i], s = window.__pk || (window.__pk = {}); if (s.down) { if (s.need === 'tap' || v.fired) { sc.actionUp(1); s.down = false; } return; } if (v.need && !v.hopping && !v.between && !v.patay && !v.pressing) { s.need = v.need; s.down = true; sc.actionDown(1); } }`,
    totals: `sc => sc.v3.lanes.map(L => Math.max(0, L.hk))`
  }
};

const srv = await serve();
const browser = await chromium();
const allErrs = [];
async function phone(ctx, query, build) {
  const p = await ctx.newPage(); allErrs.push(watchErrors(p, build ? 'old build' : query));
  if (build) await p.addInitScript(b => { window.LSU_NET = { build: b }; }, build);
  await p.goto(srv.url + query); await p.waitForFunction(() => window.__lsu && window.__lsu.screen === 'title', null, { timeout: 15000 });
  return p;
}
async function newCtx() { const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } }); await renderer(ctx, '2d'); if (!LIVE) await ctx.addInitScript({ path: path.join(ROOT, 'tests/mock-room.js') }); return ctx; }
async function hostRoom(host, mode) {
  await host.click('#mOnline'); await host.click('#card [data-v="host"]'); await host.fill('#nmMe', 'Host'); await host.click('#card [data-v="go"]');
  await host.waitForSelector('#card .codebig', { timeout: 10000 });
  if (mode) await host.click(`#card button[data-k="mode"][data-val="${mode}"]`);
  await host.click('#card button[data-k="rounds"][data-val="3"]');
  return (await host.textContent('#card .codebig')).trim();
}
async function join(guest, code, name) { await guest.click('#mOnline'); await guest.click('#card [data-v="join"]'); await guest.fill('#jcode', code); await guest.fill('#nmMe', name); await guest.click('#card [data-v="go"]'); }

// ---------- 1. a phone on another build can't join ----------
{
  const ctx = await newCtx();
  const host = await phone(ctx, '?debug'), old = await phone(ctx, '?debug', 'an-older-build');
  const code = await hostRoom(host);
  await join(old, code, 'Luma');
  const told = await old.waitForFunction(() => /Iba ang bersiyon ng laro mo\. I-refresh para makasali\./.test(document.querySelector('#card').textContent), null, { timeout: 10000 }).then(() => true, () => false);
  await host.waitForTimeout(1500);
  const listed = await host.evaluate(() => /Luma/.test((document.querySelector('#lbRoster') || {}).textContent || ''));
  const left = await old.evaluate(() => !window.__lsu.NET.rm);
  check(told && left, 'a phone on another build is told to reload and leaves the room');
  check(!listed, 'the host never seats a phone on another build');
  const same = await phone(ctx, '?debug');
  await join(same, code, 'Bago');
  const seated = await host.waitForFunction(() => /Bago/.test((document.querySelector('#lbRoster') || {}).textContent || ''), null, { timeout: 10000 }).then(() => true, () => false);
  check(seated, 'a phone on the same build joins the same room');
  await ctx.close();
}

// ---------- 2. two phones play each new minigame and agree on every score ----------
async function playUntilFinal(pages, ms) {
  const t0 = Date.now(), finals = new Map();
  while (Date.now() - t0 < ms && finals.size < pages.length) {
    for (const p of pages) {
      if (finals.has(p)) continue;
      const fin = await p.evaluate(() => { const L = window.__lsu, f = L.DBG.filter(e => e.type === 'final').pop(); if (f) return f;
        const b = L.screen === 'game' && !document.querySelector('#modal').hidden && document.querySelector('#card [data-primary]'); if (b) b.click(); return null; });
      if (fin) finals.set(p, fin);
    }
    await pages[0].waitForTimeout(150);
  }
  return finals;
}
const only = LIVE ? process.argv[3] : process.argv[2];
for (const [kind, G] of Object.entries(GAMES).filter(([k]) => !only || k === only)) {
  const ctx = await newCtx(), q = `?debug&speed=2&mg=${kind}`;
  const host = await phone(ctx, q), guest = await phone(ctx, q);
  const code = await hostRoom(host, 'torneo');
  await join(guest, code, 'Bisita');
  await host.waitForFunction(() => /Bisita/.test((document.querySelector('#lbRoster') || {}).textContent || ''), null, { timeout: 10000 });
  await host.click('#card [data-v="start"]');
  for (const p of [host, guest]) await p.evaluate(([src, tot]) => {
    const fn = eval(src), totals = eval(tot); window.__ends = [];
    const tick = () => { const L = window.__lsu, sc = L.scene, i = L.state.players.findIndex(q => q.ctrl === 'local');
      if (sc && sc.peek && i >= 0) { if (!sc.ended && !(sc.cd > .6)) { try { fn(sc, i); } catch (e) { console.error(e); } } else if (sc.ended && !sc.__rec) { sc.__rec = 1; sc.done.then(() => window.__ends.push(totals(sc))); } }
      requestAnimationFrame(tick); };
    requestAnimationFrame(tick); }, [G.player, G.totals]);
  const finals = await playUntilFinal([host, guest], 600000);
  check(finals.size === 2, `${kind} online: both phones finish a 3-game Torneo of it`);
  const mg = p => p.evaluate(() => window.__lsu.DBG.filter(e => e.type === 'mg').map(e => ({ kind: e.kind, scores: e.scores })));
  const [mh, mg2] = [await mg(host), await mg(guest)], [eh, eg] = [await host.evaluate(() => window.__ends), await guest.evaluate(() => window.__ends)];
  check(mh.length === 3 && mh.every(e => e.kind === kind), `${kind} online: all three games were ${kind}`, mh.map(e => e.kind).join(','));
  check(JSON.stringify(mh) === JSON.stringify(mg2), `${kind} online: both phones log the same scores for every game`, JSON.stringify(mh.map(e => e.scores)) + ' | ' + JSON.stringify(mg2.map(e => e.scores)));
  check(eh.length === 3 && JSON.stringify(eh) === JSON.stringify(eg), `${kind} online: both phones show the same total in every lane`, JSON.stringify(eh) + ' | ' + JSON.stringify(eg));
  check(JSON.stringify(eh) === JSON.stringify(mh.map(e => e.scores)), `${kind} online: the lanes on screen match the scored results`);
  check(mh.some(e => e.scores[0] > 0 || e.scores[1] > 0), `${kind} online: the two people's scripted players scored`, JSON.stringify(mh.map(e => e.scores.slice(0, 2))));
  await ctx.close();
}

check(allErrs.flat().length === 0, 'no script errors on any phone', allErrs.flat().slice(0, 3).join(' | '));
await browser.close(); srv.close(); done();
