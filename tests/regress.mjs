// Regression tests for the playtest bug reports of Oct 25, 2026:
//  1. online HUD portraits: redrawn in 3D once the island is ready (each phone used to keep whatever it drew first)
//  2. the island camera never aims past the island's edge, and the roll preview stays on the kid
//  3. Torneo shows an island like Party (it used the old cloud board), including an older Torneo save; Hamon ng Araw
//     (no board) starts at once with only the sky behind its cards in 3D
//  4. the island loading bar keeps moving (a CSS sweep) while the island's shaders are compiled behind it
//  5. Pasaporte: a double tap on a gold stamp's button doesn't take the gold back; removing it asks first
// Run: node tests/regress.mjs
import { chromium, serve, watchErrors, check, done, renderer } from './lib.mjs';

const srv = await serve();
const browser = await chromium();
const allErrs = [];
async function newPage(mode = '2d', query = '?debug', opts = {}) {
  const ctx = await browser.newContext(Object.assign({ viewport: { width: 390, height: 844 } }, opts));
  await renderer(ctx, mode);
  const page = await ctx.newPage();
  allErrs.push(watchErrors(page, mode + query));
  await page.goto(srv.url + query);
  await page.waitForFunction(() => window.__lsu && window.__lsu.screen === 'title', null, { timeout: 30000 });
  return page;
}
// presses whatever the game waits for (cards, the roll button, a minigame's action) until fn says stop
async function playUntil(page, fn, ms) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const stop = await page.evaluate(src => { const L = window.__lsu; if (eval(src)(L)) return true;
      if (!document.querySelector('#modal').hidden) { const b = document.querySelector('#card [data-primary]') || document.querySelector('#card .row button'); if (b) b.click(); }
      else { const a = document.querySelector('#actionBtn'); if (L.state.reach && (window.__look = (window.__look || 0) + 1) < 4) return false; window.__look = 0; if (!a.hidden) a.click(); }   // look at the roll preview for a moment, like a person
      const sc = L.scene; if (sc && sc.action && Math.random() < .3) sc.action(); return false; }, fn.toString());
    if (stop) return true;
    await page.waitForTimeout(150);
  }
  return false;
}

// ---------- 2. the island camera (2D, so the game runs fast; the camera targets are the same in 3D) ----------
{
  const page = await newPage('2d', '?debug&speed=3');
  await page.evaluate(() => { const L = window.__lsu; window.__bad = []; window.__reach = [];
    L.startLocal({ n: 1, names: ['Ian'], cfg: { mode: 'party', rounds: 3, diff: 1, map: 'plaza' } });
    const tick = () => { const c = L.cam, b = L.board.bounds, a = L.state.active;
      if (L.screen === 'game' && !L.scene && b && !L.state.overview) {
        if (c.tx < b.x0 - 1 || c.tx > b.x1 + 1 || c.ty < b.y0 - 1 || c.ty > b.y1 + 1) window.__bad.push([Math.round(c.tx), Math.round(c.ty)]);
        if (L.state.reach && a) window.__reach.push(Math.round(Math.hypot(c.tx - a.x, c.ty - (a.y - 30)))); }
      if (!window.__stopCam) requestAnimationFrame(tick); };
    requestAnimationFrame(tick); });
  const fin = await playUntil(page, L => L.DBG.some(e => e.type === 'final'), 300000);
  const r = await page.evaluate(() => { window.__stopCam = true; return { bad: window.__bad.slice(0, 5), n: window.__bad.length, reach: window.__reach.length, far: window.__reach.filter(d => d > 40).length }; });
  check(fin, 'island Party (1 human + 3 bots, 3 rounds) plays to the end');
  check(r.n === 0, 'the board camera never aims past the island\'s edge (after a minigame, between turns)', JSON.stringify(r.bad));
  check(r.reach > 0 && r.far === 0, 'while a roll is previewed, the camera stays on the kid instead of swinging to the side', r.far + ' of ' + r.reach + ' frames off the kid');
  await page.context().close();
}

// ---------- 3. Torneo and Hamon on an island; an older Torneo save resumes on the island ----------
{
  const page = await newPage('2d', '?debug&speed=3');
  await page.evaluate(() => window.__lsu.startLocal({ n: 1, names: ['Ian'], cfg: { mode: 'torneo', rounds: 3, diff: 1 } }));
  await page.waitForFunction(() => window.__lsu.screen === 'game', null, { timeout: 15000 });
  const tb = await page.evaluate(() => window.__lsu.board.id);
  check(tb === 'plaza', 'Torneo shows an island (Plaza), not the old cloud board', tb);
  // a Torneo save from before boards were recorded: no board, made on the cloud board
  await playUntil(page, () => !!localStorage.getItem('lsu-save'), 60000);
  const legacy = await page.evaluate(() => { const o = JSON.parse(localStorage.getItem('lsu-save')); delete o.cp.board; return o; });
  await page.evaluate(() => window.__lsu.toTitle());
  const ulapN = await page.evaluate(() => window.__lsu.N);   // the title shows the cloud board
  legacy.n = ulapN; legacy.cp.players.forEach(p => { p.pos = 7; });
  await page.evaluate(o => localStorage.setItem('lsu-save', JSON.stringify(o)), legacy);
  await page.reload(); await page.waitForFunction(() => window.__lsu && window.__lsu.screen === 'title');
  const shown = await page.evaluate(() => !document.querySelector('#mResume').hidden);
  check(shown, 'an older Torneo save still offers "Ituloy ang laro"');
  if (shown) {
    await page.evaluate(() => document.querySelector('#mResume').click());
    await page.waitForFunction(() => window.__lsu.screen === 'game', null, { timeout: 15000 });
    const r = await page.evaluate(() => ({ id: window.__lsu.board.id, start: window.__lsu.state.players.every(p => p.pos === window.__lsu.board.start) }));
    check(r.id === 'plaza' && r.start, 'it resumes on the island with every kid at the start (nobody moves in Torneo)', JSON.stringify(r));
  }
  await page.evaluate(() => window.__lsu.toTitle());
  await page.evaluate(() => { document.querySelector('#mHamon').click(); });
  await page.waitForSelector('#card [data-primary]');
  await page.evaluate(() => document.querySelector('#card [data-primary]').click());
  await page.waitForFunction(() => window.__lsu.screen === 'game', null, { timeout: 15000 });
  const hb = await page.evaluate(() => ({ id: window.__lsu.board.id, loading: !document.querySelector('#loadIsl').hidden }));
  check(!hb.loading, 'Hamon ng Araw starts at once (no island to load: it has no board)', JSON.stringify(hb));
  await page.context().close();
}

// ---------- 5. Pasaporte: a double tap keeps the gold; removing it asks first and keeps the card's place ----------
{
  const page = await newPage('2d', '?debug', { hasTouch: true, isMobile: true });
  await page.evaluate(() => { const K = Object.keys(window.__lsu.MG); localStorage.setItem('lsu-pass', JSON.stringify({ played: Object.fromEntries(K.map(k => [k, 1])), labas: { tumbang: 1, palosebo: 1 } })); });
  await page.evaluate(() => document.querySelector('#mPass').click());
  await page.waitForSelector('#card [data-det="palosebo"]');
  await page.evaluate(() => document.querySelector('#card [data-det="palosebo"]').click());   // the gold button is in the game's details
  await page.waitForSelector('#card [data-v="labas:palosebo"]');
  await page.evaluate(() => document.querySelector('#card [data-v="labas:palosebo"]').scrollIntoView({ block: 'center' })); await page.waitForTimeout(300);
  const top0 = await page.evaluate(() => document.querySelector('#card').scrollTop);
  const bb = await (await page.$('#card [data-v="labas:palosebo"]')).boundingBox();
  await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await page.waitForTimeout(80); await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await page.waitForTimeout(500);
  const gold = () => page.evaluate(() => !!JSON.parse(localStorage.getItem('lsu-pass')).labas.palosebo);
  const asked = await page.evaluate(() => /Alisin ang ginto/.test(document.querySelector('#card h2').textContent));
  check(await gold() && asked, 'Pasaporte: a double tap on a gold stamp keeps it and asks before taking it back');
  await page.evaluate(() => document.querySelector('#card [data-v="no"]').click()); await page.waitForTimeout(300);
  const top1 = await page.evaluate(() => document.querySelector('#card').scrollTop);
  check(await gold() && top0 > 0 && Math.abs(top1 - top0) < 4, 'Pasaporte: "Huwag" keeps the gold and the card reopens where it was', top0 + ' → ' + top1);
  await page.evaluate(() => document.querySelector('#card [data-v="labas:palosebo"]').click()); await page.waitForTimeout(200);
  await page.evaluate(() => document.querySelector('#card [data-v="yes"]').click()); await page.waitForTimeout(300);
  const after = await page.evaluate(() => JSON.parse(localStorage.getItem('lsu-pass')));
  check(!after.labas.palosebo && after.labas.tumbang && after.played.palosebo, 'Pasaporte: "Alisin" takes back only that gold; its red stamp and the other stamps stay');
  await page.context().close();
}

// ---------- 1 and 4. 3D: the loading bar sweeps while the island is prepared; HUD portraits redrawn in 3D once it is ready ----------
{
  const page = await newPage('3d');
  await page.waitForFunction(() => window.__lsu.b3.ok, null, { timeout: 60000 });
  await page.evaluate(() => window.__lsu.startLocal({ n: 1, names: ['Ian'], cfg: { mode: 'party', rounds: 3, diff: 1, map: 'plaza' } }));
  await page.waitForFunction(() => !document.querySelector('#loadIsl').hidden, null, { timeout: 15000 });
  const sweep = await page.evaluate(() => getComputedStyle(document.querySelector('#loadF'), '::after').animationName);
  const before = await page.evaluate(() => document.querySelector('#hudTop canvas').toDataURL());
  await page.waitForFunction(() => document.querySelector('#loadIsl').hidden && window.__lsu.b3.island, null, { timeout: 180000, polling: 500 });
  await page.waitForTimeout(3000);
  const after = await page.evaluate(() => ({ url: document.querySelector('#hudTop canvas').toDataURL(), u3: window.__lsu.b3.u3 }));
  check(sweep === 'lbarSweep', 'the island loading bar has a moving sweep while the island is prepared', sweep);
  check(after.u3 === true && after.url !== before, 'HUD portraits are redrawn in 3D once the island is ready (the same on every phone)');
  // Hamon ng Araw: behind its cards only the sky, not the old cloud board; back on a board the korona show again
  await page.evaluate(() => window.__lsu.toTitle()); await page.waitForTimeout(500);
  await page.evaluate(() => document.querySelector('#mHamon').click()); await page.waitForSelector('#card [data-primary]');
  await page.evaluate(() => document.querySelector('#card [data-primary]').click());
  await page.waitForFunction(() => window.__lsu.screen === 'game' && !document.querySelector('#modal').hidden, null, { timeout: 30000 });
  await page.waitForTimeout(3000);
  const h = await page.evaluate(() => { const B = window.__lsu.b3; return { env: B.envKey, kids: [...B.kids.values()].filter(K => K.g.visible).length, crowns: B.crowns.filter(c => c.visible).length, bare: B.bare }; });
  check(h.env === 'mg' && h.kids === 0 && h.crowns === 0 && h.bare, 'Hamon ng Araw: only the sky behind its cards in 3D, no old cloud board, kids or korona', JSON.stringify(h));
  await page.evaluate(() => window.__lsu.toTitle());
  await page.evaluate(() => window.__lsu.startLocal({ n: 1, names: ['Ian'], cfg: { mode: 'party', rounds: 3, diff: 1, map: 'plaza' } }));
  await page.waitForFunction(() => document.querySelector('#loadIsl').hidden && window.__lsu.b3.island && window.__lsu.screen === 'game', null, { timeout: 180000, polling: 500 });
  await page.waitForTimeout(3000);
  const back = await page.evaluate(() => { const B = window.__lsu.b3; return { crowns: B.crowns.filter(c => c.visible).length, kids: [...B.kids.values()].filter(K => K.g.visible).length }; });
  check(back.crowns > 0 && back.kids === 4, 'after Hamon, a Party game shows its korona and kids again', JSON.stringify(back));
  await page.context().close();
  const rm = await newPage('2d', '?debug', { reducedMotion: 'reduce' });
  const off = await rm.evaluate(() => { const el = document.querySelector('#loadIsl'); el.hidden = false; const a = getComputedStyle(document.querySelector('#loadF'), '::after'); const r = [a.animationName, a.display]; el.hidden = true; return r; });
  check(off[0] === 'none' || off[1] === 'none', 'with reduced motion the loading bar does not sweep', off.join(' '));
  await rm.context().close();
}

check(allErrs.flat().length === 0, 'no script errors', allErrs.flat().slice(0, 3).join(' | '));
await browser.close(); srv.close(); done();
