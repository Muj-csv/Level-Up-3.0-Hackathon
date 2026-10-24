// Four-device play-test (F7 Phase 3): a host and three guests play a 5-round online match through the Supabase room
// adapter (tests/mock-supabase.js), with the grace period shortened to 15 s:
//   A. guest 2 drops out past the grace while the host waits on it: a bot takes the seat, and it goes back to the guest;
//   B. guest 3's page reloads: it comes back into the game as a player;
//   C. all four devices agree on every korona and piso, and every guest ends the match as a player.
// It also measures traffic as Supabase counts it (a broadcast = 1 sent + 1 per listening device) against the
// free plan's 100 messages/s. Needs about 2 GB of free memory (four pages). Run: node tests/four.mjs
import path from 'path';
import { chromium, serve, watchErrors, check, done, ROOT, renderer } from './lib.mjs';

const GRACE = 15000, LIMIT = 100;
const srv = await serve();
const browser = await chromium();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
await renderer(ctx, '2d');
await ctx.addInitScript(g => { window.LSU_SUPA = { url: 'https://mock.supabase.co', key: 'mock-anon-key' }; window.LSU_NET = { grace: g }; }, GRACE);
await ctx.route('**/vendor/supabase-*.js', r => r.fulfill({ path: path.join(ROOT, 'tests/mock-supabase.js'), contentType: 'text/javascript' }));

const host = await ctx.newPage(); const errs = [watchErrors(host, 'host')];
await host.goto(srv.url + '?debug&speed=3');
await host.waitForTimeout(1500);
await host.click('#mOnline');
await host.click('#card [data-v="host"]');
await host.fill('#nmMe', 'Host');
await host.click('#card [data-v="go"]');
await host.waitForSelector('#card .codebig', { timeout: 10000 });
const code = (await host.textContent('#card .codebig')).trim();
await host.click('#card button[data-k="rounds"][data-val="5"]');
const guests = [];
for (const name of ['Bisita1', 'Bisita2', 'Bisita3']) {
  const g = await ctx.newPage(); errs.push(watchErrors(g, name));
  await g.goto(srv.url + '?debug&speed=3#' + code);
  await g.waitForSelector('#card #jcode', { timeout: 10000 });
  await g.fill('#nmMe', name);
  await g.click('#card [data-v="go"]');
  await host.waitForFunction(n => new RegExp(n).test((document.querySelector('#lbRoster') || {}).textContent || ''), name, { timeout: 15000 });
  guests.push(g);
}
check(true, 'host lobby lists all three guests');
await host.click('#card [data-v="start"]');
const pages = [host, ...guests];
for (const g of guests) await g.waitForFunction(() => window.__lsu.screen === 'game', null, { timeout: 20000 });
const seats = await host.evaluate(() => window.__lsu.state.players.map(p => p.ctrl).join(','));
check(seats === 'local,remote,remote,remote', 'four people, four seats: no bots', seats);

// driver: keeps answering every device until each reaches its final standings
const finals = new Map(), paused = new Set();
let driving = true;
const driver = (async () => {
  while (driving) {
    for (const p of pages) {
      if (finals.has(p) || paused.has(p)) continue;
      const st = await p.evaluate(() => {
        const L = window.__lsu, fin = L.DBG.filter(e => e.type === 'final').pop();
        if (fin) return { fin };
        const card = document.querySelector('#card [data-primary]') || (L.screen === 'game' && document.querySelector('#card .row button'));
        if (!document.querySelector('#modal').hidden && card) { card.click(); return {}; }
        const a = document.querySelector('#actionBtn');
        if (!a.hidden) a.click();
        return {};
      }).catch(() => ({}));
      if (st.fin) finals.set(p, st.fin);
    }
    await host.waitForTimeout(150);
  }
})();

// traffic: total broadcasts sent by all devices, sampled every 5 s; Supabase counts each as 1 sent + 3 received
const rates = [];
let lastSent = null, sampling = true;
const sampler = (async () => {
  while (sampling) {
    const sent = (await Promise.all(pages.map(p => p.evaluate(() => window.__supaSent || 0).catch(() => 0)))).reduce((a, b) => a + b, 0);
    if (lastSent !== null && sent >= lastSent) rates.push((sent - lastSent) * 4 / 5);
    lastSent = sent;
    await host.waitForTimeout(5000);
  }
})();

const offline = (p, v) => p.evaluate(v => { window.__supaOffline = v; }, v);
const until = (p, fn, ms, arg) => p.waitForFunction(fn, arg, { timeout: ms, polling: 250 }).then(() => true, () => false);
const seat = (p, i) => p.evaluate(i => window.__lsu.state.players[i].ctrl, i);

// A. guest 2 (seat 2) drops out past the grace while the host waits on it
const g2 = guests[1];
paused.add(g2);
const waiting = await until(host, () => /Hinihintay si Bisita2/.test(document.querySelector('#hint').textContent), 120000);
await offline(g2, true); paused.delete(g2);
const took = await until(host, () => window.__lsu.state.players[2].ctrl === 'bot', GRACE + 30000);
check(waiting && took, 'A. guest 2 drops out past the grace: a bot takes its seat', await seat(host, 2));
await offline(g2, false);
const back = await until(host, () => window.__lsu.state.players[2].ctrl === 'remote', 150000);
check(back && (await seat(g2, 2)) === 'local', 'A. guest 2 gets its seat back after it returns', (await seat(host, 2)) + ' / ' + (await seat(g2, 2)));

// B. guest 3's page reloads
const g3 = guests[2];
await g3.reload();
const backB = await until(g3, () => window.__lsu.screen === 'game' && window.__lsu.state.players[3].ctrl === 'local', 30000);
check(backB, 'B. guest 3 page reloads: it comes back into the game as a player', await seat(g3, 3).catch(() => '?'));

// C. play to the end
const t0 = Date.now();
while (finals.size < 4 && Date.now() - t0 < 540000) await host.waitForTimeout(500);
driving = false; sampling = false; await driver; await sampler;
check(finals.size === 4, 'C. all four devices reach the end of the 5-round match', finals.size + ' of 4');
if (finals.size === 4) {
  const sig = f => f.players.map(p => p.korona + '/' + p.piso).join(' ');
  const sigs = pages.map(p => sig(finals.get(p)));
  check(sigs.every(s => s === sigs[0]), 'C. all four devices agree on every korona and piso', sigs[0]);
  const ctrls = pages.map(p => finals.get(p).players.map(q => q.ctrl).join(','));
  check(ctrls[0] === 'local,remote,remote,remote', 'C. every guest ends the match as a player (host view)', ctrls[0]);
}
const peak = Math.max(...rates), avg = rates.reduce((a, b) => a + b, 0) / Math.max(1, rates.length);
console.log(`traffic (Supabase messages/s, 5 s windows): peak ${peak.toFixed(1)}, average ${avg.toFixed(1)}, ${rates.length} windows`);
check(peak < LIMIT, `peak traffic stays under the free plan's ${LIMIT} messages/s`, peak.toFixed(1));
const all = errs.flat();
check(all.length === 0, 'no script errors on any device', all.slice(0, 3).join(' | '));
await browser.close(); srv.close(); done();
