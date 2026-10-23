// Online play-test: a host and a guest play a full Party match through tests/mock-room.js,
// then the guest drops out of a rematch and the host must finish with a bot in its seat.
// Run: node tests/online.mjs            (the Claude room service, through tests/mock-room.js)
//      node tests/online.mjs supabase   (the game's Supabase room adapter, through tests/mock-supabase.js)
import path from 'path';
import { chromium, serve, watchErrors, check, done, ROOT, renderer } from './lib.mjs';

const SUPA = process.argv[2] === 'supabase';
console.log('room service: ' + (SUPA ? 'Supabase adapter (mock-supabase.js)' : 'Claude room (mock-room.js)'));
const srv = await serve();
const browser = await chromium();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
await renderer(ctx, '2d');
if (SUPA) {
  await ctx.addInitScript(() => { window.LSU_SUPA = { url: 'https://mock.supabase.co', key: 'mock-anon-key' }; });
  await ctx.route('**/vendor/supabase-*.js', r => r.fulfill({ path: path.join(ROOT, 'tests/mock-supabase.js'), contentType: 'text/javascript' }));
} else await ctx.addInitScript({ path: path.join(ROOT, 'tests/mock-room.js') });

const host = await ctx.newPage(); const hostErrs = watchErrors(host, 'host');
await host.goto(srv.url + '?debug&speed=3');
await host.waitForTimeout(1500);
await host.click('#mOnline');
await host.click('#card [data-v="host"]');
await host.fill('#nmMe', 'Host');
await host.click('#card [data-v="go"]');
await host.waitForSelector('#card .codebig', { timeout: 10000 });
const code = (await host.textContent('#card .codebig')).trim();
check(/^[A-Z0-9]{4}$/.test(code), 'host gets a 4-character room code', code);
await host.click('#card button[data-k="rounds"][data-val="3"]');

const guest = await ctx.newPage(); const guestErrs = watchErrors(guest, 'guest');
await guest.goto(srv.url + '?debug&speed=3#' + code);
await guest.waitForSelector('#card #jcode', { timeout: 10000 });
check((await guest.inputValue('#jcode')) === code, 'QR/link hash pre-fills the code on the guest');
await guest.fill('#nmMe', 'Bisita');
await guest.click('#card [data-v="go"]');
await guest.waitForFunction(() => /Nasa room/.test(document.querySelector('#card').textContent), null, { timeout: 10000 });
await host.waitForFunction(() => /Bisita/.test((document.querySelector('#lbRoster') || {}).textContent || ''), null, { timeout: 10000 });
check(true, 'host lobby lists the guest');
await guest.waitForFunction(() => /Host/.test(document.querySelector('#card').textContent), null, { timeout: 10000 });
check(true, 'guest sees the host and its settings');
await host.click('#card [data-v="start"]');

async function playUntilFinal(pages, ms) {
  const t0 = Date.now();
  const finals = new Map();
  while (Date.now() - t0 < ms) {
    for (const p of pages) {
      if (p.isClosed() || finals.has(p)) continue;
      const st = await p.evaluate(() => {
        const L = window.__lsu, fin = L.DBG.filter(e => e.type === 'final').pop();
        if (fin) return { fin };
        // cards with no primary button (Tanong ni Lola) get their first answer, as in play.mjs
        const card = document.querySelector('#card [data-primary]') || document.querySelector('#card .row button');
        if (!document.querySelector('#modal').hidden && card) { card.click(); return {}; }
        const a = document.querySelector('#actionBtn');
        if (!a.hidden) a.click();
        return {};
      });
      if (st.fin) finals.set(p, st.fin);
    }
    if (pages.every(p => p.isClosed() || finals.has(p))) break;
    await pages[0].waitForTimeout(120);
  }
  return finals;
}

let finals = await playUntilFinal([host, guest], 420000);
const fh = finals.get(host), fg = finals.get(guest);
check(!!fh && !!fg, 'both devices reach the end of a 3-round online Party match');
if (fh && fg) {
  const sig = f => f.players.map(p => p.korona + '/' + p.piso).join(' ');
  check(sig(fh) === sig(fg), 'both devices agree on every korona and piso', 'host ' + sig(fh) + ' | guest ' + sig(fg));
  check(fh.order.join() === fg.order.join(), 'both devices agree on the turn order', fh.order.join());
}

// rematch, then the guest leaves mid-game: the host must carry on with a bot in that seat
await host.evaluate(() => { window.__lsu.DBG.length = 0; });
await guest.evaluate(() => { window.__lsu.DBG.length = 0; });
await host.waitForSelector('#card [data-v="again"]', { timeout: 20000 });
await host.click('#card [data-v="again"]');
await guest.waitForFunction(() => window.__lsu.screen === 'game' && !window.__lsu.state.ended, null, { timeout: 15000 });
check(true, 'guest follows the host into the rematch');
await guest.waitForTimeout(4000);
await guest.close();
finals = await playUntilFinal([host], 420000);
const f2 = finals.get(host);
check(!!f2, 'host finishes the rematch after the guest leaves');
if (f2) check(f2.players[1].ctrl === 'bot', 'the departed guest (seat 2) is played by a bot', 'seat 2 ctrl ' + f2.players[1].ctrl);

check(hostErrs.length + guestErrs.length === 0, 'no script errors on either device', [...hostErrs, ...guestErrs].slice(0, 3).join(' | '));
await browser.close(); srv.close(); done();
