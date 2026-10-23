// Rejoin play-test (F7.3): a host and a guest play a 5-round online match through the Supabase room adapter
// (tests/mock-supabase.js), with the grace period shortened to 15 s, while connections drop out:
//   A. the guest drops out for 8 s: no bot takes over, the guest keeps its seat;
//   B. the guest drops out while the host waits on it, for longer than the grace: a bot takes the seat,
//      and the guest gets it back at the next turn or minigame after it returns;
//   C. the host drops out for 8 s: the guest keeps waiting instead of ending the game;
//   E. the guest's page reloads: it comes back into the same game; F. the same for the host.
// Both devices must still agree on every korona and piso at the end. Run: node tests/rejoin.mjs
import path from 'path';
import { chromium, serve, watchErrors, check, done, ROOT, renderer } from './lib.mjs';

const GRACE = 15000;
const srv = await serve();
const browser = await chromium();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
await renderer(ctx, '2d');
await ctx.addInitScript(g => { window.LSU_SUPA = { url: 'https://mock.supabase.co', key: 'mock-anon-key' }; window.LSU_NET = { grace: g }; }, GRACE);
await ctx.route('**/vendor/supabase-*.js', r => r.fulfill({ path: path.join(ROOT, 'tests/mock-supabase.js'), contentType: 'text/javascript' }));

const host = await ctx.newPage(); const hostErrs = watchErrors(host, 'host');
await host.goto(srv.url + '?debug&speed=3');
await host.waitForTimeout(1500);
await host.click('#mOnline');
await host.click('#card [data-v="host"]');
await host.fill('#nmMe', 'Host');
await host.click('#card [data-v="go"]');
await host.waitForSelector('#card .codebig', { timeout: 10000 });
const code = (await host.textContent('#card .codebig')).trim();
await host.click('#card button[data-k="rounds"][data-val="5"]');
const guest = await ctx.newPage(); const guestErrs = watchErrors(guest, 'guest');
await guest.goto(srv.url + '?debug&speed=3#' + code);
await guest.waitForSelector('#card #jcode', { timeout: 10000 });
await guest.fill('#nmMe', 'Bisita');
await guest.click('#card [data-v="go"]');
await host.waitForFunction(() => /Bisita/.test((document.querySelector('#lbRoster') || {}).textContent || ''), null, { timeout: 10000 });
await host.click('#card [data-v="start"]');
await guest.waitForFunction(() => window.__lsu.screen === 'game', null, { timeout: 15000 });

// a driver that keeps answering both devices (as tests/online.mjs does) until each reaches its final standings
const finals = new Map(), paused = new Set();
let driving = true;
const driver = (async () => {
  while (driving) {
    for (const p of [host, guest]) {
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
    await host.waitForTimeout(120);
  }
})();
const offline = (p, v) => p.evaluate(v => { window.__supaOffline = v; }, v);
const seat = p => p.evaluate(() => { const q = window.__lsu.state.players[1]; return { ctrl: q.ctrl, away: q.away || null }; });
const autos = () => host.evaluate(() => Object.values(window.__lsu.NET.log).filter(r => r && r.a).length);
const until = (p, fn, ms, arg) => p.waitForFunction(fn, arg, { timeout: ms, polling: 250 }).then(() => true, () => false);

// A. a short drop-out, under the grace period
await until(host, () => window.__lsu.DBG.length >= 4, 60000);
const autosA = await autos();
await offline(guest, true); await host.waitForTimeout(8000); await offline(guest, false);
await host.waitForTimeout(4000);
check((await seat(host)).ctrl === 'remote' && (await autos()) === autosA, 'A. guest drops out for 8 s: no bot takes over, the guest keeps its seat', JSON.stringify(await seat(host)));

// B. a long drop-out while the host is waiting on the guest
paused.add(guest);
const waiting = await until(host, () => /Hinihintay si Bisita/.test(document.querySelector('#hint').textContent), 90000);
await offline(guest, true); paused.delete(guest);
const took = await until(host, () => window.__lsu.state.players[1].ctrl === 'bot', GRACE + 30000);
check(waiting && took, 'B. guest drops out past the grace period: a bot takes the seat', JSON.stringify(await seat(host)));
await offline(guest, false);
const backHost = await until(host, () => window.__lsu.state.players[1].ctrl === 'remote', 120000);
const backGuest = await until(guest, () => window.__lsu.state.players[1].ctrl === 'local', 30000);
check(backHost && backGuest, 'B. the guest gets its seat back after it returns', JSON.stringify({ host: await seat(host), guest: await seat(guest) }));

// C. the host drops out for 8 s
await offline(host, true); await host.waitForTimeout(8000); await offline(host, false);
await host.waitForTimeout(3000);
const gs = await guest.evaluate(() => ({ screen: window.__lsu.screen, card: document.querySelector('#modal').hidden ? '' : document.querySelector('#card').textContent.slice(0, 40) }));
check(gs.screen === 'game' && !/Natapos ang laro/.test(gs.card), 'C. host drops out for 8 s: the guest keeps the game going', JSON.stringify(gs));

// E. the guest's page reloads mid-game: it rejoins from the host's turn checkpoint, still a player
await guest.reload();
const backE = await until(guest, () => window.__lsu.screen === 'game' && window.__lsu.state.players[1].ctrl === 'local', 30000);
check(backE, 'E. guest page reloads: it comes back into the same game as a player', JSON.stringify(await seat(guest)));

// F. the host's page reloads mid-game: it comes back from its own checkpoint and log, and the guest carries on with it
await host.waitForTimeout(5000);
await host.reload();
const backF = await until(host, () => window.__lsu.screen === 'game' && window.__lsu.state.players[0].ctrl === 'local', 30000);
const gF = await guest.evaluate(() => ({ screen: window.__lsu.screen, card: document.querySelector('#modal').hidden ? '' : document.querySelector('#card').textContent.slice(0, 40) }));
check(backF && gF.screen === 'game' && !/Natapos ang laro/.test(gF.card), 'F. host page reloads: it comes back and the guest carries on', JSON.stringify(gF));

// D. play to the end
const t0 = Date.now();
while (finals.size < 2 && Date.now() - t0 < 420000) await host.waitForTimeout(500);
driving = false; await driver;
const fh = finals.get(host), fg = finals.get(guest);
check(!!fh && !!fg, 'D. both devices reach the end of the 5-round match');
if (fh && fg) {
  const sig = f => f.players.map(p => p.korona + '/' + p.piso).join(' ');
  check(sig(fh) === sig(fg), 'D. both devices agree on every korona and piso', 'host ' + sig(fh) + ' | guest ' + sig(fg));
  check(fh.players[1].ctrl === 'remote' && fg.players[1].ctrl === 'local', 'D. the guest ends the match as a player, not a bot', fh.players[1].ctrl + ' / ' + fg.players[1].ctrl);
}
check(hostErrs.length + guestErrs.length === 0, 'no script errors on either device', [...hostErrs, ...guestErrs].slice(0, 3).join(' | '));
await browser.close(); srv.close(); done();
