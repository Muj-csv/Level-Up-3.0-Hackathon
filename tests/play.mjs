// Main play-test: screens and sizes, every title button, full matches in each mode with score bookkeeping
// checks, bots per difficulty, save/resume, restarts, resizing, reduced motion, downloads, name input.
// Run: node tests/play.mjs        (see tests/README.md)
import { chromium, serve, watchErrors, check, done, renderer } from './lib.mjs';

const srv = await serve();
const browser = await chromium();
const allErrs = [];

async function newPage(opts = {}, query = '?debug') {
  const ctx = await browser.newContext(Object.assign({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, acceptDownloads: true }, opts));
  await renderer(ctx, '2d');
  const page = await ctx.newPage();
  allErrs.push(watchErrors(page, JSON.stringify(opts.viewport || '')));
  await page.goto(srv.url + query);
  await page.waitForFunction(() => window.__lsu && window.__lsu.screen === 'title', null, { timeout: 15000 });
  return page;
}
const lsu = (page, fn, arg) => page.evaluate(fn, arg);

// plays whatever is on screen: primary button of any card, the roll/action button, until the final standings
async function playToEnd(page, { ms = 300000, human = true } = {}) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const fin = await page.evaluate(h => {
      const L = window.__lsu, f = L.DBG.filter(e => e.type === 'final').pop();
      if (f) return f;
      if (L.screen !== 'game') return { notGame: L.screen };
      if (!document.querySelector('#modal').hidden) { const b = document.querySelector('#card [data-primary]') || document.querySelector('#card .row button'); if (b) b.click(); return null; }
      const a = document.querySelector('#actionBtn'); if (h && !a.hidden) a.click();
      return null;
    }, human);
    if (fin && fin.notGame) return null;
    if (fin) return fin;
    await page.waitForTimeout(80);
  }
  return null;
}

// ---------- 1. launch at four sizes, layout fits ----------
for (const [label, w, h] of [['phone 360x740', 360, 740], ['phone landscape 740x360', 740, 360], ['tablet 820x1180', 820, 1180], ['desktop 1440x900', 1440, 900]]) {
  const page = await newPage({ viewport: { width: w, height: h }, isMobile: w < 900, hasTouch: w < 900 });
  const lay = await page.evaluate(() => { const r = s => document.querySelector(s).getBoundingClientRect(), b = r('#scrTitle .brand'), m = r('#scrTitle .menu'), s = r('#soundBtn');
    const apart = (p, q) => p.right <= q.left || q.right <= p.left || p.bottom <= q.top || q.bottom <= p.top;
    return { top: Math.min(b.top, m.top), bottom: Math.max(b.bottom, m.bottom), left: Math.min(b.left, m.left), right: Math.max(b.right, m.right), apart: apart(b, m) && apart(m, s), vh: innerHeight, sw: document.documentElement.scrollWidth, vw: innerWidth }; });
  check(lay.top >= 0 && lay.bottom <= lay.vh + 1 && lay.left >= 0 && lay.right <= lay.vw + 1, `${label}: title logo and menu fit on screen`, `${Math.round(lay.top)}..${Math.round(lay.bottom)} of ${lay.vh}`);
  check(lay.apart, `${label}: title logo, menu and sound button do not overlap`);
  check(lay.sw <= lay.vw, `${label}: no sideways page scroll`);
  await lsu(page, () => window.__lsu.startLocal({ n: 1, names: ['Ian'], cfg: { mode: 'party', rounds: 3, diff: 1 } }));
  await page.waitForTimeout(2500);
  const hud = await page.evaluate(() => { const t = document.querySelector('#hudTop').getBoundingClientRect(), b = document.querySelector('#hudBottom').getBoundingClientRect(); return { free: b.top - t.bottom, vh: innerHeight }; });
  check(hud.free > hud.vh * 0.35, `${label}: HUD leaves at least a third of the screen for the board`, `${Math.round(hud.free)} px of ${hud.vh}`);
  await page.context().close();
}

// ---------- 1b. Taguan: four people on one 360 px phone each get a readable strip of the yard ----------
{
  const page = await newPage({ viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true }, '?debug&mg=taguan');
  await lsu(page, () => window.__lsu.startLocal({ n: 4, names: ['Ana', 'Ben', 'Cel', 'Dan'], cfg: { mode: 'torneo', rounds: 3, diff: 1 } }));
  await page.waitForSelector('#card [data-v="go"]', { timeout: 15000 }); await page.click('#card [data-v="go"]');
  await page.waitForFunction(() => window.__lsu.scene && window.__lsu.scene.kind === 'taguan' && !(window.__lsu.scene.cd > 0), null, { timeout: 15000 });
  const L = await page.evaluate(() => ({ strips: window.__lsu.scene.layout(), vh: innerHeight, vw: innerWidth, sw: document.documentElement.scrollWidth }));
  const s = L.strips, apart = s.every((a, i) => i === 0 || a.y >= s[i - 1].y + s[i - 1].h - 0.5);
  check(s.length === 4 && s.every(a => a.h >= 100 && a.scale >= 0.5 && a.y >= 0 && a.y + a.h <= L.vh && a.w <= L.vw) && apart && L.sw <= L.vw,
    'Taguan: four stacked strips stay readable on a 360 px wide phone (each at least 100 px tall, yard at half size or more, no overlap)', s.map(a => Math.round(a.h) + 'px x' + a.scale.toFixed(2)).join(', '));
  await page.screenshot({ path: 'test-results/play-taguan-4-strips.png' }).catch(() => {});
  await page.context().close();
}

// ---------- 2. every title button does something ----------
{
  const page = await newPage();
  const opens = async (sel, test, label) => { await page.click(sel); await page.waitForTimeout(250); const ok = await page.evaluate(test); check(ok, label); };
  await opens('#mLocal', () => /Maglaro/.test(document.querySelector('#card h2').textContent), 'Maglaro opens the game setup');
  await page.click('#card [data-v="back"]');
  await opens('#mOnline', () => /online/i.test(document.querySelector('#card').textContent), 'Maglaro online opens the online card (says plainly if rooms are unavailable)');
  await page.click('#card [data-v="back"]');
  await opens('#mHamon', () => /Hamon ng Araw/.test(document.querySelector('#card').textContent), 'Hamon ng Araw opens today\'s challenge');
  await page.click('#card [data-v="back"]');
  await opens('#mGuide', () => /Paano maglaro · 1\//.test(document.querySelector('#card').textContent), 'Paano maglaro opens the guide');
  for (let i = 0; i < 7; i++) await page.click('#card [data-v="next"]');
  await page.click('#card [data-v="next"]');
  check(await page.evaluate(() => document.querySelector('#modal').hidden), 'guide pages through to the end and closes');
  await opens('#mSprites', () => window.__lsu.screen === 'gallery', 'Mga karakter opens the character gallery');
  await page.click('#animChips button:nth-child(5)'); await page.click('#faceChips button:nth-child(3)');
  check(await page.getAttribute('#animChips button:nth-child(5)', 'aria-pressed') === 'true' && await page.getAttribute('#faceChips button:nth-child(3)', 'aria-pressed') === 'true', 'gallery: the move and facing chips select');
  const gal = await page.evaluate(() => ({ names: [...document.querySelectorAll('#galNames span')].map(s => s.textContent).join(), dl: !!document.querySelector('#galDl'), moves: document.querySelectorAll('#animChips button').length }));
  check(gal.names === 'Bunso,Neneng,Totoy,Jun' && gal.moves === 9, 'gallery: the four kids with their names, nine moves to pick', JSON.stringify(gal));
  check(!gal.dl, 'gallery: the old sprite-sheet download is gone');
  await page.click('#galBack');
  const before = await page.getAttribute('#soundBtn', 'aria-pressed');
  await page.click('#soundBtn');
  const after = await page.getAttribute('#soundBtn', 'aria-pressed');
  const prefs = await page.evaluate(() => JSON.parse(localStorage.getItem('lsu-prefs')));
  check(before !== after && prefs.music === (after === 'true') && prefs.sfx === (after === 'true'), 'speaker button toggles and its state matches the saved settings', `${before} -> ${after}`);
  await page.context().close();
}

// ---------- 2b. map screen: the world picture, picking an island, starting on it ----------
for (const [label, w, h] of [['phone', 390, 844], ['desktop', 1440, 900]]) {
  const page = await newPage({ viewport: { width: w, height: h }, isMobile: w < 900, hasTouch: w < 900 });
  await page.click('#mLocal'); await page.click('#card [data-v="go"]');
  await page.waitForFunction(() => window.__lsu.screen === 'maps');
  const m = await page.evaluate(() => { const b = [...document.querySelectorAll('#mapBtns [role="radio"]')], p = document.querySelector('#mapPanel').getBoundingClientRect();
    return { n: b.length, on: b.filter(x => x.getAttribute('aria-checked') === 'true').map(x => x.dataset.k), fits: p.top >= 0 && p.bottom <= innerHeight + 1 && p.left >= 0 && p.right <= innerWidth + 1, small: b.filter(x => x.getBoundingClientRect().height < 44).length }; });
  check(m.n === 4 && m.on.join() === 'plaza', `${label} map screen: four islands to pick, Plaza first`, JSON.stringify(m));
  check(m.fits && m.small === 0, `${label} map screen: the panel fits and every island button is at least 44 px tall`);
  await page.waitForFunction(() => { const i = document.querySelector('#mapImg'); return i.complete && i.naturalWidth > 0; }, null, { timeout: 10000 }).catch(() => {});
  check(await page.evaluate(() => document.querySelector('#mapImg').naturalWidth > 0), `${label} map screen: the world picture loads`);
  await page.keyboard.press('ArrowRight');
  check(await page.evaluate(() => document.querySelector('#mapTitle').textContent === 'Palengke' && document.activeElement.dataset.k === 'palengke'), `${label} map screen: arrow keys move the pick and the focus`);
  await page.waitForTimeout(1600);
  const z = await page.evaluate(() => ({ close: document.querySelector('.mapclose[data-k="palengke"]').classList.contains('on'), t: getComputedStyle(document.querySelector('#mapWorld')).transform }));
  check(z.close && z.t !== 'none', `${label} map screen: the view zooms to the island and shows its close-up`);
  await page.click('#mapBack');
  check(await page.evaluate(() => window.__lsu.screen === 'title' && /Maglaro/.test(document.querySelector('#card h2').textContent)), `${label} map screen: Balik goes back to the game setup`);
  await page.click('#card [data-v="go"]'); await page.waitForFunction(() => window.__lsu.screen === 'maps');
  await page.click('#mapBtns [data-k="palayan"]'); await page.click('#mapGo'); await page.waitForTimeout(1200);
  const g = await page.evaluate(() => { const L = window.__lsu; return { screen: L.screen, board: L.board.id, N: L.N, at: L.state.players.map(p => L.SP[p.pos].type) }; });
  check(g.screen === 'game' && g.board === 'palayan' && g.N === 104 && g.at.every(t => t === 'start'), `${label} map screen: Laro na! starts on the picked island, everyone on Simula`, JSON.stringify(g));
  await page.context().close();
}

// ---------- 2c. splash: logo, a bar that follows the real loading, then the tap (2D kids here: Three.js is blocked) ----------
for (const [label, w, h] of [['phone', 390, 844], ['landscape phone', 844, 390]]) {
  const page = await newPage({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true }, '?debug&splash');
  const s0 = await page.evaluate(() => ({ on: !!document.querySelector('#splash'), logo: document.querySelector('#spLogo').textContent, bar: !document.querySelector('#spBar').hidden }));
  check(s0.on && s0.logo === 'Taympers' && s0.bar, `${label} splash: the logo and a loading bar show first`, JSON.stringify(s0));
  await page.waitForFunction(() => !document.querySelector('#spGo').hidden, null, { timeout: 30000 }).catch(() => {});
  const s1 = await page.evaluate(() => { const b = document.querySelector('#spGo').getBoundingClientRect(); return { ready: !document.querySelector('#spGo').hidden, pct: document.querySelector('#spBar').getAttribute('aria-valuenow'), h: Math.round(b.height), fits: b.top >= 0 && b.bottom <= innerHeight, flat: document.querySelector('#spRow').classList.contains('flat'), focus: document.activeElement && document.activeElement.id }; });
  check(s1.ready && s1.pct === '100' && s1.focus === 'spGo', `${label} splash: the bar fills, then "Pindutin para magsimula" shows with the focus`, JSON.stringify(s1));
  check(s1.h >= 44 && s1.fits, `${label} splash: the start button is at least 44 px tall and on screen`);
  check(s1.flat, `${label} splash: without 3D the four kids are drawn in 2D`);
  await page.keyboard.press('Enter'); await page.waitForTimeout(800);
  const s2 = await page.evaluate(() => ({ gone: !document.querySelector('#splash'), screen: window.__lsu.screen, focus: document.activeElement && document.activeElement.id, still: !document.querySelector('#titleBg').hidden }));
  check(s2.gone && s2.screen === 'title' && s2.focus === 'mLocal' && s2.still, `${label} splash: Enter opens the main menu (Plaza picture) with the focus on Maglaro`, JSON.stringify(s2));
  await page.context().close();
}

// ---------- 2d. labels, touch targets, contrast and the keyboard path ----------
{
  // every visible button on screen is at least 44 px tall (the project's touch-target floor)
  // (measured once the cards have finished their opening animation, which scales them to 94%)
  const small = async page => (await page.waitForFunction(() => document.getAnimations().every(a => a.playState !== 'running' || a.effect.getComputedTiming().iterations === Infinity), null, { timeout: 3000 }).catch(() => {}), page.evaluate(() => [...document.querySelectorAll('button')].filter(b => { const r = b.getBoundingClientRect(), s = getComputedStyle(b); return r.width && r.height && !b.closest('[hidden]') && s.visibility !== 'hidden' && r.height < 44; }).map(b => (b.id || b.dataset.v || b.dataset.k || b.textContent.trim()).slice(0, 20) + ' ' + Math.round(b.getBoundingClientRect().height))));
  const lum = c => { const v = c.match(/[\d.]+/g).slice(0, 3).map(Number).map(x => { x /= 255; return x <= .03928 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4; }); return .2126 * v[0] + .7152 * v[1] + .0722 * v[2]; };
  const page = await newPage({ viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true });
  await page.click('#mSprites'); await page.click('#galBack');
  await page.focus('#mGuide'); await page.keyboard.press('Tab'); await page.keyboard.press('Tab'); await page.keyboard.press('Tab');
  check(await page.evaluate(() => document.activeElement.id) === 'soundBtn', 'keyboard: after the menu buttons Tab goes to the sound button under them', await page.evaluate(() => document.activeElement.id || document.activeElement.tagName));
  await page.click('#mLocal');
  check((await small(page)).length === 0, 'game setup: every button is at least 44 px tall', (await small(page)).join(', '));
  await page.click('#card [data-v="go"]'); await page.waitForFunction(() => window.__lsu.screen === 'maps');
  for (const k of ['plaza', 'palengke', 'aplaya', 'palayan']) {
    await page.click(`#mapBtns [data-k="${k}"]`);
    const bg = await page.evaluate(k => getComputedStyle(document.querySelector(`#mapBtns [data-k="${k}"]`)).backgroundColor, k);
    const ratio = 1.05 / (lum(bg) + .05);
    check(ratio >= 4.5, `map screen: the picked island (${k}) shows its white name at 4.5:1 or more`, ratio.toFixed(2) + ' on ' + bg);
  }
  await page.click('#mapBack'); await page.click('#card [data-v="back"]');
  await page.click('#mGuide'); await page.click('#card [data-v="next"]'); await page.click('#card [data-v="next"]');
  const lap = await page.evaluate(() => [...document.querySelectorAll('#card .legend li')].filter(li => { const b = li.querySelector('b'), d = li.lastElementChild; if (!b || !d || b === d) return false; const r1 = b.getBoundingClientRect(), r2 = d.getBoundingClientRect(); return r1.right > r2.left + 1 && r1.bottom > r2.top && r2.bottom > r1.top; }).map(li => li.textContent.slice(0, 20)));
  check(/Mga espasyo/.test(await page.textContent('#card h2')) && lap.length === 0, 'guide page 3: no space name runs into its description at 360 px', lap.join(' | '));
  await page.keyboard.press('Escape'); if (await page.isVisible('#card [data-v="back"]')) await page.click('#card [data-v="back"]');
  if (!(await page.evaluate(() => document.querySelector('#modal').hidden))) { const b = await page.$('#card [data-v="close"],#card [data-v="next"]'); if (b) await b.click(); }
  await page.evaluate(() => window.__lsu.startLocal({ n: 1, names: ['Ian'], cfg: { mode: 'party', rounds: 3, diff: 1 } }));
  await page.waitForTimeout(800); await page.click('#menuBtn');
  check((await small(page)).length === 0, 'pause menu: every button is at least 44 px tall', (await small(page)).join(', '));
  await page.context().close();
  // a landscape phone: Pagsasanay's five games all sit above its closing buttons, none hidden behind them
  const land = await newPage({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true });
  await land.click('#mHamon'); await land.click('#card [data-v="practice"]');
  const cover = await land.evaluate(() => { const row = document.querySelector('#card > .row:last-child').getBoundingClientRect(), card = document.querySelector('#card').getBoundingClientRect();
    return [...document.querySelectorAll('#card .pgrid .btn')].filter(b => { const r = b.getBoundingClientRect(); return r.bottom > row.top + 1 || r.bottom > card.bottom; }).map(b => b.dataset.v); });
  check(cover.length === 0, 'landscape phone: all five Pagsasanay games are fully visible above Balik', cover.join(','));
  await land.click('#card [data-v="patintero"]'); await land.click('#card [data-v="go"]');
  await land.waitForFunction(() => window.__lsu.scene && window.__lsu.scene.peek, null, { timeout: 10000 });
  check(await land.textContent('#roundPill') === 'Pagsasanay', 'Pagsasanay shows "Pagsasanay" in the top bar, not "Hamon"', await land.textContent('#roundPill'));
  await land.context().close();
}

// ---------- 3. full Party match: bookkeeping ----------
{
  const page = await newPage({}, '?debug&speed=4');
  await lsu(page, () => window.__lsu.startLocal({ n: 1, names: ['Ian'], cfg: { mode: 'party', rounds: 3, diff: 1 } }));
  const fin = await playToEnd(page);
  check(!!fin, 'Party (1 human + 3 bots, 3 rounds) plays to the end');
  if (fin) {
    const log = await page.evaluate(() => window.__lsu.DBG.slice());
    const bought = [0, 0, 0, 0], bonus = [0, 0, 0, 0];
    log.filter(e => e.type === 'korona').forEach(e => bought[e.p]++);
    (log.find(e => e.type === 'bonus') || { list: [] }).list.forEach(b => b.w.forEach(i => bonus[i]++));
    const ok = fin.players.every(p => p.korona === bought[p.id] + bonus[p.id]);
    check(ok, 'every korona is accounted for (bought + bonus)', fin.players.map(p => `${p.korona}=${bought[p.id]}+${bonus[p.id]}`).join(' '));
    check(fin.players.every(p => p.piso >= 0), 'no player ends with negative piso');
    const best = [...fin.players].sort((a, b) => b.korona - a.korona || b.piso - a.piso)[0];
    check(fin.winners.includes(best.id) && fin.winners.every(id => { const p = fin.players[id]; return p.korona === best.korona && p.piso === best.piso; }), 'winner has the most korona, piso breaks ties');
    check(log.filter(e => e.type === 'roll').length === 12, 'exactly 4 turns per round over 3 rounds', log.filter(e => e.type === 'roll').length + ' rolls');
    check(log.filter(e => e.type === 'mg').length === 3, 'one minigame per round');
    check(!(await page.evaluate(() => localStorage.getItem('lsu-save'))), 'finished game clears its save');
    const head = await page.textContent('#card h2');
    check(/Bida ng Isla!$|^Tabla!$/.test(head), 'the winner is named "Bida ng Isla"', head);
    await page.waitForFunction(() => document.getAnimations().every(a => a.playState !== 'running' || a.effect.getComputedTiming().iterations === Infinity), null, { timeout: 3000 }).catch(() => {});
    check(await page.evaluate(() => document.querySelector('#saveRes').getBoundingClientRect().height >= 44), '"I-save ang larawan" is at least 44 px tall', String(await page.evaluate(() => document.querySelector('#saveRes').getBoundingClientRect().height)));
    const [img] = await Promise.all([page.waitForEvent('download', { timeout: 10000 }), page.click('#saveRes')]);
    check(img.suggestedFilename() === 'taympers-resulta.png', 'result picture downloads');
  }
  await page.context().close();
}

// ---------- 4. Torneo: one korona per minigame win ----------
{
  const page = await newPage({}, '?debug&speed=6');
  await lsu(page, () => window.__lsu.startLocal({ n: 0, names: [], cfg: { mode: 'torneo', rounds: 3, diff: 2 } }));
  const fin = await playToEnd(page, { human: false });
  check(!!fin, 'Torneo (4 bots, 3 games) plays to the end');
  if (fin) {
    const log = await page.evaluate(() => window.__lsu.DBG.slice());
    const wins = [0, 0, 0, 0];
    log.filter(e => e.type === 'mg').forEach(e => { const m = Math.max(...e.scores); e.scores.forEach((s, i) => { if (s === m) wins[i]++; }); });
    check(fin.players.every(p => p.korona === wins[p.id]), 'Torneo korona equal minigame wins (ties share)', fin.players.map(p => p.korona + '/' + wins[p.id]).join(' '));
    check(log.filter(e => e.type === 'roll').length === 0, 'Torneo has no dice rolls');
  }
  await page.context().close();
}

// ---------- 5. Hamon ng Araw records today's score on this device ----------
{
  const page = await newPage({}, '?debug&speed=3');
  await page.click('#mHamon');
  await page.fill('#nmMe', 'Tester');
  await page.click('#card [data-v="go"]');
  await page.waitForSelector('#card [data-v="go"]');
  await page.click('#card [data-v="go"]');
  await page.waitForFunction(() => window.__lsu.scene && window.__lsu.scene.peek, null, { timeout: 10000 }).catch(() => {});
  check(await page.textContent('#roundPill') === 'Hamon', 'Hamon ng Araw keeps "Hamon" in the top bar', await page.textContent('#roundPill'));
  for (let i = 0; i < 600 && !(await page.isVisible('#card [data-v="again"]')); i++) { await page.evaluate(() => { const a = document.querySelector('#actionBtn'); if (!a.hidden) a.click(); }); await page.waitForTimeout(100); }
  const lb = await page.evaluate(() => JSON.parse(localStorage.getItem('lsu-lb') || '{}'));
  const today = Object.values(lb).flat().filter(e => e.daily && e.n === 'Tester');
  check(today.length === 1, 'daily challenge result is kept in the device record', JSON.stringify(today[0] || {}));
  check(/Talaan ngayong araw/.test(await page.textContent('#card')), 'result card shows today\'s record');
  await page.context().close();
}

// ---------- 6. bots by difficulty ----------
{
  const page = await newPage();
  const r = await page.evaluate(() => {
    const L = window.__lsu; L.startLocal({ n: 0, names: [], cfg: { mode: 'party', rounds: 5, diff: 1 } });
    const S = L.state, p = S.players[1], N = L.N, out = {};
    S.round = 2; p.pos = 0; p.piso = 20; p.item = 'doble';
    const at = d => { L.korona.spots = [(p.pos + d) % N, (p.pos + d + 18) % N]; };
    for (const diff of [0, 1, 2]) { S.cfg.diff = diff; at(3); out['d' + diff + '_near'] = L.bot.usesItem(p); at(12); out['d' + diff + '_mid'] = L.bot.usesItem(p); at(15); out['d' + diff + '_far'] = L.bot.usesItem(p); }
    S.cfg.diff = 1; p.piso = 6; at(12); out.broke = L.bot.usesItem(p);
    p.piso = 20; S.round = 5; at(3); out.lastRound = L.bot.usesItem(p);
    S.round = 2; p.item = null; p.piso = 30; at(6); S.cfg.diff = 1; out.shopRich = L.bot.shop(p);
    p.piso = 12; out.shopTight = L.bot.shop(p);
    S.cfg.diff = 0; p.piso = 9; out.shopEasy = L.bot.shop(p);
    p.piso = 20; at(7); S.cfg.diff = 1; out.gintoPick = L.bot.ginto(p);
    const others = S.players.filter(q => q !== p);
    others.forEach((q, i) => { q.piso = [5, 25, 9][i]; q.korona = [3, 0, 1][i]; q.item = null; });
    S.cfg.diff = 1; out.rivalSakto = L.bot.rival(p, others); S.cfg.diff = 2; out.rivalMahirap = L.bot.rival(p, others);
    out.richId = others[1].id; out.leadId = others[0].id;
    L.toTitle(); return out;
  });
  check(r.d0_near && r.d0_far, 'Madali bots use items at once', JSON.stringify([r.d0_near, r.d0_far]));
  check(!r.d1_near && r.d1_mid && !r.d1_far, 'Sakto bots use Dobleng dice only when it clearly helps reach a korona', JSON.stringify([r.d1_near, r.d1_mid, r.d1_far]));
  check(r.d2_near && r.d2_mid && r.d2_far, 'Mahirap bots take smaller edges', JSON.stringify([r.d2_near, r.d2_mid, r.d2_far]));
  check(!r.broke, 'bots without 10 piso keep their item');
  check(r.lastRound, 'bots use items in the last round');
  check(r.shopRich === 'ginto' && r.shopTight === 'none' && r.shopEasy === 'doble', 'shop choices: Sakto keeps 10 piso for a korona, Madali spends', `${r.shopRich}/${r.shopTight}/${r.shopEasy}`);
  check(r.gintoPick === 7, 'Gintong dice: bots pick the exact korona distance', r.gintoPick);
  check(r.rivalSakto === r.richId && r.rivalMahirap === r.leadId, 'Jack en Poy: Sakto challenges the richest, Mahirap the leader', `${r.rivalSakto}/${r.rivalMahirap}`);
  await page.context().close();
}

// ---------- 7. save, reload, resume ----------
{
  const page = await newPage({}, '?debug&speed=4');
  await lsu(page, () => window.__lsu.startLocal({ n: 1, names: ['Ian'], cfg: { mode: 'party', rounds: 3, diff: 1 } }));
  for (let i = 0; i < 2000 && (await page.evaluate(() => window.__lsu.state.round)) < 2; i++) {
    await page.evaluate(() => { if (!document.querySelector('#modal').hidden) { const b = document.querySelector('#card [data-primary]') || document.querySelector('#card .row button'); if (b) b.click(); } else { const a = document.querySelector('#actionBtn'); if (!a.hidden) a.click(); } });
    await page.waitForTimeout(80);
  }
  const savedRound = await page.evaluate(() => (JSON.parse(localStorage.getItem('lsu-save')) || {}).cp?.round);
  await page.reload();
  await page.waitForFunction(() => window.__lsu && window.__lsu.screen === 'title');
  check(await page.isVisible('#mResume'), 'after a reload the title offers "Ituloy ang laro"', await page.textContent('#mResumeSub'));
  await page.click('#mResume');
  await page.waitForTimeout(500);
  check((await page.evaluate(() => window.__lsu.state.round)) === savedRound, 'resume continues at the saved round', 'round ' + savedRound);
  const fin = await playToEnd(page);
  check(!!fin, 'resumed game plays to the end');
  await page.context().close();
}

// ---------- 8. quick restarts leave exactly one game running ----------
{
  const page = await newPage({}, '?debug&speed=6');
  for (let i = 0; i < 3; i++) {
    await lsu(page, () => window.__lsu.startLocal({ n: 0, names: [], cfg: { mode: 'party', rounds: 3, diff: 0 } }));
    await page.waitForTimeout(700);
    await page.click('#menuBtn'); await page.click('#menuCard [data-v="quit"]'); await page.click('#menuCard [data-v="leave"]');
  }
  await lsu(page, () => { window.__lsu.DBG.length = 0; window.__lsu.startLocal({ n: 0, names: [], cfg: { mode: 'party', rounds: 3, diff: 0 } }); });
  const fin = await playToEnd(page, { human: false });
  const rolls = await page.evaluate(() => window.__lsu.DBG.filter(e => e.type === 'roll').length);
  check(!!fin && rolls === 12, 'after three quit-and-restarts only one game runs', rolls + ' rolls in a 3-round game');
  await page.context().close();
}

// ---------- 9. resize and rotate mid-game, reduced motion ----------
{
  const page = await newPage({ reducedMotion: 'reduce', isMobile: true, hasTouch: true, viewport: { width: 390, height: 844 } }, '?debug&speed=4');
  await lsu(page, () => window.__lsu.startLocal({ n: 1, names: ['Ian'], cfg: { mode: 'party', rounds: 3, diff: 1 } }));
  const sizes = [[844, 390], [390, 844], [768, 1024], [1280, 720], [360, 640]];
  let k = 0;
  const t0 = Date.now(); let fin = null;
  while (!fin && Date.now() - t0 < 300000) {
    if (k < sizes.length && Date.now() - t0 > 4000 * (k + 1)) { await page.setViewportSize({ width: sizes[k][0], height: sizes[k][1] }); k++; }
    fin = await page.evaluate(() => { const L = window.__lsu, f = L.DBG.filter(e => e.type === 'final').pop(); if (f) return f; if (!document.querySelector('#modal').hidden) { const b = document.querySelector('#card [data-primary]') || document.querySelector('#card .row button'); if (b) b.click(); } else { const a = document.querySelector('#actionBtn'); if (!a.hidden) a.click(); } return null; });
    await page.waitForTimeout(80);
  }
  check(!!fin && k === sizes.length, 'a game survives five resizes/rotations with reduced motion on and finishes');
  const cv = await page.evaluate(() => { const c = document.querySelector('#stage'); return { cw: c.width, w: innerWidth }; });
  check(cv.cw >= cv.w, 'canvas follows the final window size', JSON.stringify(cv));
  await page.context().close();
}

// ---------- 10. names are plain text ----------
{
  const page = await newPage();
  await page.click('#mLocal');
  await page.fill('#nm0', '<img src=x onerror=alert(1)>');
  await page.click('#card [data-v="go"]'); await page.click('#mapGo');
  await page.waitForTimeout(1500);
  const hud = await page.evaluate(() => ({ imgs: document.querySelectorAll('#players img').length, name: document.querySelector('#players .pcard .nmt').textContent }));
  check(hud.imgs === 0, 'a name with HTML in it shows as text, not markup', JSON.stringify(hud.name));
  await page.context().close();
}

const errs = allErrs.flat();
check(errs.length === 0, 'no script errors across all runs', errs.slice(0, 3).join(' | '));
await browser.close(); srv.close(); done();
