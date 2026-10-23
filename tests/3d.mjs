// 3D play-test: the board and minigames drawn with Three.js (WebGL through SwiftShader, so no GPU is needed).
// Checks the 3D title and board, reach rings, screen-to-board mapping, the 3D/2D setting, save and resume
// with Kasama allies, every minigame's 3D arena, and the 2D fallback when Three.js cannot load.
// Screenshots go to test-results/3d-*.png. Run: node tests/3d.mjs
import fs from 'fs';
import path from 'path';
import { chromium, serve, watchErrors, check, done, renderer, ROOT } from './lib.mjs';

const srv = await serve();
const browser = await chromium();
const OUT = path.join(ROOT, 'test-results'); fs.mkdirSync(OUT, { recursive: true });
const allErrs = [];
async function newPage(mode = '3d', query = '?debug', opts = {}) {
  const ctx = await browser.newContext(Object.assign({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true }, opts));
  await renderer(ctx, mode);
  const page = await ctx.newPage();
  allErrs.push(watchErrors(page, mode));
  await page.goto(srv.url + query);
  await page.waitForFunction(() => window.__lsu && window.__lsu.screen === 'title', null, { timeout: 20000 });
  await page.waitForTimeout(800);
  return page;
}
const shot = (page, name) => page.screenshot({ path: path.join(OUT, `3d-${name}.png`) });
// clicks through cards (primary button, else the first answer) and presses the roll button
const step = page => page.evaluate(() => {
  if (!document.querySelector('#modal').hidden) { const b = document.querySelector('#card [data-primary]') || document.querySelector('#card .row button'); if (b) b.click(); return 'card'; }
  const a = document.querySelector('#actionBtn'); if (!a.hidden) { a.click(); return 'roll'; }
  return null;
});

// ---------- 1. title and board in 3D ----------
{
  const page = await newPage('3d');
  const t = await page.evaluate(() => ({ ok: window.__lsu.b3.ok, on: window.__lsu.b3.on, cv3: !document.getElementById('stage3d').hidden, kids: document.getElementById('kidsCv').hidden }));
  check(t.ok && t.on && t.cv3, '3D title: Three.js loads and the 3D canvas is shown', JSON.stringify(t));
  check(t.kids, '3D title: the 2D title kids are hidden (the 3D kids stand on the board instead)');
  await shot(page, 'title');

  await page.click('#mLocal'); await page.click('#card [data-v="go"]');
  // wait for the human's roll: the roll button shows and the reachable spaces get rings
  let reach = null;
  for (let i = 0; i < 400 && !reach; i++) {
    reach = await page.evaluate(() => { const L = window.__lsu, rc = L.state.reach; if (!rc || document.querySelector('#actionBtn').hidden || !document.querySelector('#modal').hidden) return null;
      return { min: rc.min, max: rc.max, rings: L.b3.reach.filter(m => m.visible).length }; });
    if (!reach) { const m = await page.evaluate(() => !document.querySelector('#modal').hidden); if (m) await step(page); await page.waitForTimeout(150); }
  }
  // the rings are placed by the next 3D frame, so give the renderer a moment before counting them
  if (reach) reach = await page.waitForFunction(() => { const L = window.__lsu, rc = L.state.reach, n = L.b3.reach.filter(m => m.visible).length;
    return rc && n ? { min: rc.min, max: rc.max, rings: n } : null; }, null, { timeout: 5000 }).then(h => h.jsonValue(), () => reach);
  check(reach && reach.rings === reach.max - reach.min + 1, '3D board: every space the roll can reach has a ring', JSON.stringify(reach));
  await page.waitForTimeout(400); await shot(page, 'board-reach');

  // screen <-> board mapping: a space projected to the screen and back lands where it started
  const err = await page.evaluate(() => { const L = window.__lsu; let worst = 0; for (const i of [0, 5, 12, 20, 30]) { const p = L.spacePos(i), s = L.toScreen(p.x, p.y), w = L.toWorld(s.x, s.y); worst = Math.max(worst, Math.hypot(w.x - p.x, w.y - p.y)); } return worst; });
  check(err < 1, '3D board: screen taps map back to the right board point', err.toFixed(3) + ' px');

  const ms = await page.evaluate(() => window.__lsu.bench(10));
  console.log(`      (board frame in software WebGL: ${ms.toFixed(1)} ms; a phone GPU is much faster)`);

  // the 3D/2D setting in the pause menu
  await page.click('#menuBtn');
  const row = await page.$('#menuCard button[data-k="g3d"][data-val="0"]');
  check(!!row, 'pause menu has the Grapiko 3D/2D setting');
  if (row) {
    await row.click(); await page.waitForTimeout(400);
    const two = await page.evaluate(() => ({ on: window.__lsu.b3.on, cv3: document.getElementById('stage3d').hidden, saved: JSON.parse(localStorage.getItem('lsu-prefs')).g3d }));
    check(!two.on && two.cv3 && two.saved === false, 'switching to 2D hides the 3D canvas and is saved', JSON.stringify(two));
    await page.click('#menuCard [data-v="close"]'); await page.waitForTimeout(500); await shot(page, 'board-2d');
    await page.click('#menuBtn'); await page.click('#menuCard button[data-k="g3d"][data-val="1"]'); await page.waitForTimeout(400);
    const three = await page.evaluate(() => window.__lsu.b3.on && !document.getElementById('stage3d').hidden);
    check(three, 'switching back to 3D shows the 3D board again');
    await page.click('#menuCard [data-v="close"]');
  }

  // save and resume keep the Kasama allies (given here to a bot, then saved at the next turn)
  await page.evaluate(() => { window.__lsu.state.players[1].allies.push({ n: 'Lito', look: 0, x: 0, y: 0 }); });
  let saved = false;
  for (let i = 0; i < 300 && !saved; i++) {
    saved = await page.evaluate(() => /"allies":\[\{"n":"Lito"/.test(localStorage.getItem('lsu-save') || ''));
    if (!saved) { await step(page); await page.waitForTimeout(150); }
  }
  check(saved, 'the save at the start of a turn includes Kasama allies');
  await page.goto(srv.url + '?debug'); await page.waitForFunction(() => window.__lsu && window.__lsu.screen === 'title');
  await page.click('#mResume'); await page.waitForTimeout(1500);
  // meshes should equal the total ally count across every player, not a hardcoded 1 --
  // the step() loop above rolls real dice to force a save, so it can legitimately land
  // player[1] on a second Kasama space and recruit another ally before saving.
  const res = await page.evaluate(() => {
    const L = window.__lsu;
    const totalAllies = L.state.players.reduce((n, p) => n + p.allies.length, 0);
    return { allies: L.state.players[1].allies.map(a => a.n), meshes: L.b3.allies.size, totalAllies };
  });
  check(res.allies.includes('Lito') && res.meshes === res.totalAllies, 'resumed game restores the ally(ies) and draws one 3D mesh per ally', JSON.stringify(res));
  await shot(page, 'board-ally');
  await page.context().close();
}

// ---------- 2. every minigame builds its 3D arena and plays to the end ----------
const MASH = {
  tumbang: `sc => { const L = sc.peek()[0]; if (L.ready) sc.action(); }`,
  sipa: `sc => { const s = sc.peek()[0]; if (s.kickable) sc.action(); }`,
  palosebo: `sc => { if (Math.random() < 0.3) sc.action(); }`,
  patintero: `sc => { const v = sc.peek(); const up = v.run.dir < 0; sc.key({ code: 'ArrowUp', preventDefault() {} }, up); sc.key({ code: 'ArrowDown', preventDefault() {} }, !up); }`,
  luksong: `sc => { const L = sc.peek()[0]; if (L.st === 'run' && L.inZone) sc.action(); }`
};
for (const kind of Object.keys(MASH)) {
  const page = await newPage('3d', '?debug&speed=3');
  const errs = allErrs[allErrs.length - 1];
  await page.click('#mHamon'); await page.click('#card [data-v="practice"]'); await page.click(`#card [data-v="${kind}"]`);
  await page.waitForSelector('#card [data-v="go"]'); await page.click('#card [data-v="go"]');
  await page.waitForFunction(() => window.__lsu.scene && window.__lsu.scene.peek, null, { timeout: 15000 });
  await page.evaluate(src => { const fn = eval(src); const tick = () => { const sc = window.__lsu.scene; if (sc && sc.peek && !sc.ended && !(sc.cd > .6)) { try { fn(sc); } catch (e) { console.error(e); } } if (!window.__stop) requestAnimationFrame(tick); }; requestAnimationFrame(tick); }, MASH[kind]);
  await page.waitForFunction(() => !(window.__lsu.scene.cd > 0), null, { timeout: 60000 });
  const built = await page.evaluate(() => { const b = window.__lsu.b3; return !!(b.on && b.mg && b.curMg && b.curMg.kind); });
  await page.waitForTimeout(1500); await shot(page, 'mg-' + kind);
  const ended = await page.waitForSelector('#card [data-v="again"]', { timeout: 240000 }).then(() => true, () => false);
  check(built && ended, `${kind}: 3D arena builds and the game plays to its result`);
  check(errs.length === 0, `${kind}: no script errors in 3D`, errs.slice(0, 2).join(' | '));
  await page.context().close();
}

// ---------- 3. without Three.js (blocked CDN or no WebGL) the game falls back to 2D ----------
{
  const page = await newPage('2d');
  const f = await page.evaluate(() => ({ ok: window.__lsu.b3.ok, cv3: document.getElementById('stage3d').hidden, kids: document.getElementById('kidsCv').hidden }));
  check(!f.ok && f.cv3 && !f.kids, 'no Three.js: the 2D board and title kids are used', JSON.stringify(f));
  await page.click('#mLocal'); await page.click('#card [data-v="go"]'); await page.waitForTimeout(1500);
  await page.click('#menuBtn');
  check(!(await page.$('#menuCard button[data-k="g3d"]')), 'no Three.js: the menu does not offer a 3D setting');
  await page.context().close();
}

check(allErrs.flat().length === 0, 'no script errors across all 3D runs', allErrs.flat().slice(0, 3).join(' | '));
await browser.close(); srv.close(); done();
