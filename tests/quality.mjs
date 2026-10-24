// F10 graphics quality (Kalidad: Mababa / Katamtaman / Mataas) in the pause menu.
// Checks: the setting is saved next to the other settings and never changes them or the 3D/2D choice; old and broken
// saved settings load safely; each quality reaches the renderer on the title, the board and a minigame; changing it
// mid-game keeps the game as it was; an island built for another quality is built again; minigames played one after
// another do not pile up GPU memory; the kids keep their outlines on Mababa. Run: node tests/quality.mjs
import { chromium, serve, watchErrors, check, done, renderer } from './lib.mjs';

const srv = await serve();
const browser = await chromium();
const allErrs = [];
// a phone-sized screen at twice the pixel density, so each quality's pixel-ratio cap shows
async function newPage(prefs, opts = {}) {
  const ctx = await browser.newContext(Object.assign({ viewport: { width: 390, height: 700 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, opts));
  await renderer(ctx, '3d');
  if (prefs !== undefined) await ctx.addInitScript(p => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('lsu-prefs', p); sessionStorage.setItem('seeded', '1'); } }, prefs);
  const page = await ctx.newPage(); allErrs.push(watchErrors(page, 'quality'));
  await page.goto(srv.url + '?debug');
  await page.waitForFunction(() => window.__lsu && window.__lsu.screen === 'title' && window.__lsu.b3.ok, null, { timeout: 30000 });
  await page.waitForTimeout(600);
  return page;
}
const info = page => page.evaluate(() => { const s = window.__lsu.perf(), K = [...window.__lsu.b3.kids.values()][0]; return { pr: s.pr, shadow: s.shadow, q: s.q, blob: K && K.blob ? K.blob.material.visible : null, geo: s.geo, tex: s.tex }; });
const prefs = page => page.evaluate(() => JSON.parse(localStorage.getItem('lsu-prefs') || '{}'));
// picks a quality in the pause menu; the game state is read while the menu has the game paused, before and after
// (and after wait(), e.g. an island rebuild), so a bot's turn cannot change it in between
async function pick(page, q, wait) {
  await page.click('#menuBtn'); const before = await game(page);
  await page.click(`#menuCard button[data-k="gq"][data-val="${q}"]`); await page.waitForTimeout(300);
  const pressed = await page.evaluate(() => [...document.querySelectorAll('#menuCard button[data-k="gq"]')].filter(b => b.getAttribute('aria-pressed') === 'true').map(b => b.dataset.val));
  const waited = wait ? await wait() : null, after = await game(page);
  await page.click('#menuCard [data-v="close"]'); await page.waitForTimeout(600);
  return { pressed, same: before === after, waited };
}
const game = page => page.evaluate(() => { const L = window.__lsu, s = L.state; return JSON.stringify({ round: s.round, turn: s.turn, order: s.order, korona: L.korona.spots, players: s.players.map(p => [p.pos, p.piso, p.korona, p.item]) }); });
const WANT = { low: { pr: 1, shadow: 0, blob: true }, mid: { pr: 1.5, shadow: 1024, blob: false }, high: { pr: 2, shadow: 2048, blob: false } };
const matches = (i, q) => i.pr === WANT[q].pr && i.shadow === WANT[q].shadow && i.q === q;

// ---------- 1. saved settings: old saves, broken values, and the new one next to the others ----------
{
  const page = await newPage(JSON.stringify({ music: false, sfx: true, vib: false, g3d: true }));
  check((await info(page)).q === 'mid', 'a save from before Kalidad loads with Katamtaman (the default)');
  await page.evaluate(() => window.__lsu.startLocal({ n: 1, names: ['Ian'], cfg: { mode: 'party', rounds: 3, diff: 1, map: 'ulap' } }));
  await page.waitForTimeout(1200);
  await page.click('#menuBtn');
  const row = await page.evaluate(() => [...document.querySelectorAll('#menuCard button[data-k="gq"]')].map(b => b.textContent + ':' + b.getAttribute('aria-pressed')));
  check(row.join() === 'Mababa:false,Katamtaman:true,Mataas:false', 'pause menu has Kalidad with three choices, Katamtaman picked', row.join());
  await page.click('#menuCard [data-v="close"]'); await page.waitForTimeout(300);
  const r = await pick(page, 'low'), pressed = r.pressed;
  const p = await prefs(page);
  check(pressed.join() === 'low' && p.gq === 'low', 'picking Mababa marks it and saves it', JSON.stringify(p));
  check(p.music === false && p.sfx === true && p.vib === false && p.g3d === true, 'the other settings and the 3D/2D choice stay as they were', JSON.stringify(p));
  check(await page.evaluate(() => window.__lsu.b3.on), 'Mababa keeps the game in 3D (it is not the 2D setting)');
  check(r.same, 'changing the quality mid-game keeps the round, turn, korona, piso and items');
  check(await page.evaluate(() => !!localStorage.getItem('lsu-save')), 'the saved game is still there');
  await page.reload(); await page.waitForFunction(() => window.__lsu && window.__lsu.b3 && window.__lsu.b3.ok, null, { timeout: 30000 }); await page.waitForTimeout(600);
  check((await info(page)).q === 'low', 'Mababa is still picked after a reload');
  await page.evaluate(() => localStorage.setItem('lsu-prefs', JSON.stringify({ music: 'yes', gq: 'ultra' })));
  await page.reload(); await page.waitForFunction(() => window.__lsu && window.__lsu.b3 && window.__lsu.b3.ok, null, { timeout: 30000 }); await page.waitForTimeout(600);
  const bad = await page.evaluate(() => { const L = window.__lsu; return L.perf().q; });
  check(bad === 'mid', 'a broken saved quality falls back to Katamtaman', bad);
  await page.context().close();
}

// ---------- 2. each quality reaches the renderer on the title, the board and a minigame ----------
for (const q of ['low', 'mid', 'high']) {
  const page = await newPage(JSON.stringify({ gq: q }));
  // the title's Plaza scene has its own renderer (maps/title.js), built with the quality's pixel-ratio cap and shadows;
  // its frame pump may draw below the cap while frames are slow (software WebGL), never above it
  await page.waitForFunction(() => window.__lsu.title.ctl && window.__lsu.title.on, null, { timeout: 60000 }).catch(() => {});
  const ti = await page.evaluate(() => { const t = window.__lsu.title.ctl; return t ? t.info() : null; });
  check(!!ti && ti.cap === WANT[q].pr && ti.pr <= ti.cap && ti.shadow === WANT[q].shadow, `${q}: the title scene drawn at most at its pixel ratio, with its shadows`, JSON.stringify(ti));
  await page.evaluate(() => window.__lsu.startLocal({ n: 1, names: ['Ian'], cfg: { mode: 'party', rounds: 3, diff: 1, map: 'ulap' } }));
  await page.waitForTimeout(1500);
  const b = await info(page);
  check(matches(b, q) && b.blob === WANT[q].blob, `${q}: board drawn at its pixel ratio and shadow; round kid shadows only without a shadow map`, JSON.stringify(b));
  await page.evaluate(() => window.__lsu.toTitle()); await page.waitForTimeout(300);
  await page.click('#mHamon'); await page.click('#card [data-v="practice"]'); await page.click('#card [data-v="luksong"]');
  await page.waitForSelector('#card [data-v="go"]'); await page.click('#card [data-v="go"]');
  await page.waitForFunction(() => window.__lsu.b3.mg, null, { timeout: 30000 }); await page.waitForTimeout(800);
  const m = await info(page);
  check(matches(m, q), `${q}: minigame drawn at its pixel ratio and shadow`, JSON.stringify(m));
  if (q === 'low') {
    // the seated kids in Luksong Tinik are the drawn-outline kids: Mababa must not hide those outlines
    const ol = await page.evaluate(() => { let n = 0; window.__lsu.b3.mg.root.traverse(o => { if (o.userData.ol && o.visible) n++; }); return n; });
    check(ol > 100, 'low: the minigame kids keep their dark outlines', ol + ' outline meshes');
  }
  await page.context().close();
}

// ---------- 3. minigames one after another do not pile up GPU memory ----------
{
  const page = await newPage(JSON.stringify({ gq: 'mid' }));
  const counts = [];
  for (let k = 0; k < 4; k++) {
    await page.evaluate(() => window.__lsu.toTitle()); await page.waitForTimeout(300);
    await page.click('#mHamon'); await page.click('#card [data-v="practice"]'); await page.click(`#card [data-v="${k % 2 ? 'sipa' : 'tumbang'}"]`);
    await page.waitForSelector('#card [data-v="go"]'); await page.click('#card [data-v="go"]');
    await page.waitForFunction(() => window.__lsu.b3.mg, null, { timeout: 30000 }); await page.waitForTimeout(800);
    counts.push(await info(page));
  }
  const g = counts.map(c => c.geo), t = counts.map(c => c.tex);
  check(g[2] <= g[0] + 5 && g[3] <= g[1] + 5 && t[2] <= t[0] + 2 && t[3] <= t[1] + 2, 'the same minigame played again holds the same GPU geometry and textures', 'geo ' + g.join('/') + ', tex ' + t.join('/'));
  await page.context().close();
}

// ---------- 4. an island built for one quality is built again for another, and the game goes on ----------
{
  const page = await newPage(JSON.stringify({ gq: 'low' }), { viewport: { width: 360, height: 640 }, deviceScaleFactor: 1 });
  await page.evaluate(() => window.__lsu.startLocal({ n: 1, names: ['Ian'], cfg: { mode: 'party', rounds: 3, diff: 1, map: 'plaza' } }));
  const isl = want => page.waitForFunction(w => { const b = window.__lsu.b3; return b.island && b.island.id === 'plaza' && b.island.q === w && !b.loading && b.on ? b.island.q : null; }, want, { timeout: 300000, polling: 500 }).then(h => h.jsonValue(), () => null);
  const q1 = await isl('400/2/false');
  check(q1 === '400/2/false', 'Mababa: the island is built with the light foliage and no island shadows', q1);
  const r = await pick(page, 'high', () => isl('4000/8/true')), q2 = r.waited;
  check(q2 === '4000/8/true', 'switching to Mataas builds the island again with full foliage and shadows', q2);
  check(r.same, 'the island rebuild keeps the game as it was');
  check(await page.evaluate(() => window.__lsu.screen === 'game'), 'the game is still on');
  await page.context().close();
}

check(allErrs.flat().length === 0, 'no script errors', allErrs.flat().slice(0, 3).join(' | '));
await browser.close(); srv.close(); done();
