// Play-test for the post-bug-fix UX changes:
//  - Pasaporte holds the Album ng Laro: one card per game (picture, name, one line, stamp) with its details behind
//    "Ipakita ang detalye"; Paano maglaro no longer has its own Album page
//  - the first-game guide: six steps over the board at the start of a first local Party game, Balik / Susunod /
//    Laktawan, seen once, shown again from Paano maglaro; not in Torneo or for a returning player
//  - Kalidad (graphics quality): a new setting rebuilds the island in the background (the old one stays, no 2D board
//    in between), the new island has the new quality, and the setting is kept
// The guide is skipped under ?debug (like the splash), so the other suites are not stopped by it; ?debug&tour shows it.
// Run: node tests/ux.mjs [pass|tour|quality]
import { chromium, serve, watchErrors, check, done, renderer } from './lib.mjs';

const srv = await serve();
const browser = await chromium();
const allErrs = [];
const only = process.argv[2];
async function newPage(mode = '2d', query = '?debug', opts = {}, init) {
  const ctx = await browser.newContext(Object.assign({ viewport: { width: 390, height: 844 } }, opts));
  await renderer(ctx, mode);
  const page = await ctx.newPage();
  allErrs.push(watchErrors(page, mode + query));
  if (init) await page.addInitScript(init);
  await page.goto(srv.url + query);
  await page.waitForFunction(() => window.__lsu && window.__lsu.screen === 'title', null, { timeout: 30000 });
  return page;
}
const text = (page, sel) => page.evaluate(s => (document.querySelector(s) || {}).textContent || '', sel);

// ---------- Pasaporte and the Album ng Laro ----------
if (!only || only === 'pass') {
  for (const [label, vp] of [['phone', { width: 390, height: 844 }], ['desktop', { width: 1280, height: 800 }]]) {
    const page = await newPage('2d', '?debug', { viewport: vp }, () => localStorage.setItem('lsu-pass', JSON.stringify({ played: { tumbang: 1, sipa: 2, palayok: 1 }, labas: { sipa: 1 } })));
    await page.evaluate(() => document.querySelector('#mPass').click());
    await page.waitForSelector('#card .gcard');
    const r = await page.evaluate(() => { const L = window.__lsu, keys = Object.keys(L.MG).filter(k => !L.MG[k].off), c = document.querySelector('#card');
      const cards = [...c.querySelectorAll('.gcard[data-g]')];
      const blank = cv => { const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++; return n < 50; };
      return { head: c.querySelector('h2').textContent, album: !!c.querySelector('h3.album'), order: cards.map(x => x.dataset.g).join(), keys: keys.join(),
        titles: cards.every(x => x.querySelector('.ghead b').textContent === L.MG[x.dataset.g].title), shorts: cards.every(x => x.querySelector('.gshort').textContent.length > 10 && x.querySelector('.gshort').textContent === L.MG[x.dataset.g].short),
        art: cards.every(x => !blank(x.querySelector('canvas.gart'))), closed: cards.every(x => x.querySelector('.gdet').hidden),
        seals: Object.fromEntries(cards.map(x => [x.dataset.g, x.querySelector('.seal').textContent])), soon: c.querySelectorAll('.gcard.lock').length,
        wide: c.scrollWidth <= c.clientWidth + 1, longText: [...c.querySelectorAll('.gcard[data-g] .gmain')].every(m => m.textContent.length < 160) }; });
    check(r.album && /^4 sa 16 na tatak$/.test(r.head), `${label} Pasaporte: opens with the stamp count and the Album ng Laro in it`, r.head);
    check(r.order === r.keys && r.titles && r.shorts, `${label} Pasaporte: one card per game, in order, each with its own name and one-line description`);
    check(r.art, `${label} Pasaporte: every game card has its picture drawn`);
    check(r.closed && r.longText, `${label} Pasaporte: the details start closed, so each card shows only a few words`);
    check(r.seals.sipa === 'GINTO' && r.seals.tumbang === 'TATAK' && r.seals.palayok === 'TATAK' && r.seals.piko === '?' && r.soon >= 1, `${label} Pasaporte: stamps show as before (ginto, tatak, not yet) and the coming games are listed`, JSON.stringify(r.seals));
    check(r.wide, `${label} Pasaporte: no sideways scroll in the card`);
    // Ipakita / Itago ang detalye opens the right game's details
    const d1 = await page.evaluate(() => { const b = document.querySelector('#card [data-det="palayok"]'); b.click(); const det = document.querySelector('#gd-palayok'), L = window.__lsu;
      return { open: !det.hidden, others: [...document.querySelectorAll('#card .gdet')].filter(x => !x.hidden).length, label: b.textContent, exp: b.getAttribute('aria-expanded'),
        real: det.textContent.includes(L.MG.palayok.real), labas: det.textContent.includes(L.MG.palayok.labas), rules: L.MG.palayok.rules.every(x => det.textContent.includes(x)), gold: !!det.querySelector('[data-v="labas:palayok"]') }; });
    check(d1.open && d1.others === 1 && d1.label === 'Itago ang detalye' && d1.exp === 'true', `${label} Pasaporte: "Ipakita ang detalye" opens only that game's details and becomes "Itago ang detalye"`, JSON.stringify(d1));
    check(d1.real && d1.labas && d1.rules && d1.gold, `${label} Pasaporte: the details hold the real-street game, Subukan sa labas, the rules and the gold-stamp button`);
    const d2 = await page.evaluate(() => { const b = document.querySelector('#card [data-det="palayok"]'); b.click(); return { closed: document.querySelector('#gd-palayok').hidden, label: b.textContent, exp: b.getAttribute('aria-expanded') }; });
    check(d2.closed && d2.label === 'Ipakita ang detalye' && d2.exp === 'false', `${label} Pasaporte: "Itago ang detalye" closes them again`);
    // the gold stamp from inside the details, with the details staying open after the card is redrawn
    await page.evaluate(() => { document.querySelector('#card [data-det="tumbang"]').click(); document.querySelector('#card [data-v="labas:tumbang"]').click(); });
    await page.waitForTimeout(400);
    const g = await page.evaluate(() => ({ store: JSON.parse(localStorage.getItem('lsu-pass')).labas.tumbang, seal: document.querySelector('#card .gcard[data-g="tumbang"] .seal').textContent, open: !document.querySelector('#gd-tumbang').hidden, head: document.querySelector('#card h2').textContent }));
    check(g.store === 1 && g.seal === 'GINTO' && g.open && g.head === '5 sa 16 na tatak', `${label} Pasaporte: "Nalaro ko na ito sa labas" gives the gold stamp and the details stay open`, JSON.stringify(g));
    await page.evaluate(() => document.querySelector('#card [data-v="close"]').click());
    check(await page.evaluate(() => document.querySelector('#modal').hidden && /5\/16/.test(document.querySelector('#mPassSub').textContent)), `${label} Pasaporte: Isara closes it and the menu shows the new count`);
    await page.context().close();
  }
  // Paano maglaro: no Album page any more; it points to the Pasaporte and keeps the tips button
  const page = await newPage('2d');
  await page.evaluate(() => document.querySelector('#mGuide').click());
  const pages = [];
  for (let i = 0; i < 12; i++) { const t = await text(page, '#card h2'); if (!t) break; pages.push(t); const last = await page.evaluate(() => /Tapos/.test(document.querySelector('#card [data-v="next"]').textContent)); if (last) { pages.push('|' + (await text(page, '#card'))); break; } await page.evaluate(() => document.querySelector('#card [data-v="next"]').click()); await page.waitForTimeout(80); }
  const lastText = pages.pop();
  check(!pages.includes('Album ng Laro'), 'Paano maglaro: no separate Album ng Laro page any more', pages.join(' / '));
  check(/Pasaporte/.test(lastText) && /Album ng Laro/.test(lastText) && /Ipakita ulit ang gabay at mga tip/.test(lastText), 'Paano maglaro: its last page points to the Album in the Pasaporte and keeps the tips button');
  await page.context().close();
}

// ---------- the first-game guide ----------
async function startParty(page, cfg) { await page.evaluate(c => window.__lsu.startLocal({ n: 1, names: ['Ian'], cfg: Object.assign({ mode: 'party', rounds: 3, diff: 1, map: 'plaza' }, c) }), cfg || {}); }
const tourStep = page => page.evaluate(() => { const c = document.querySelector('#card'), ch = c && c.querySelector('.chip'); return ch && /Unang laro/.test(ch.textContent) && !document.querySelector('#modal').hidden ? { n: ch.textContent.replace(/\D+/, '').split('/')[0] | 0, t: c.querySelector('h2').textContent } : null; });
if (!only || only === 'tour') {
  const page = await newPage('2d', '?debug&speed=3&tour');
  await startParty(page);
  await page.waitForFunction(() => /Unang laro/.test((document.querySelector('#card .chip') || {}).textContent || ''), null, { timeout: 30000 });
  const seen = [], st0 = await tourStep(page); seen.push(st0);
  const look = await page.evaluate(() => ({ ov: window.__lsu.state.overview, noDim: getComputedStyle(document.querySelector('#modal')).backgroundColor, rolled: window.__lsu.DBG.filter(e => e.type === 'roll').length }));
  for (let i = 0; i < 5; i++) { await page.evaluate(() => document.querySelector('#card [data-v="next"]').click()); await page.waitForTimeout(120); seen.push(await tourStep(page)); }
  check(seen.map(s => s && s.t).join(' / ') === 'Ang isla / Paggalaw / Piso at korona / Mga item / Mga laro / Paano manalo', 'first game: the guide shows its six steps in order', seen.map(s => s && s.t).join(' / '));
  check(look.ov && /rgba\(0, 0, 0, 0\)|transparent/.test(look.noDim) && look.rolled === 0, 'first game: the guide waits before the first roll and shows the whole board without dimming it', JSON.stringify(look));
  const hl = await page.evaluate(() => { document.querySelector('#card [data-v="prev"]').click(); return null; });
  await page.waitForTimeout(150);
  const back = await tourStep(page);
  await page.evaluate(() => { document.querySelector('#card [data-v="prev"]').click(); }); await page.waitForTimeout(150); await page.evaluate(() => { document.querySelector('#card [data-v="prev"]').click(); }); await page.waitForTimeout(150);
  const piso = await page.evaluate(() => ({ t: document.querySelector('#card h2').textContent, hl: document.querySelectorAll('.pcard.tour-hl').length, mine: !!document.querySelector('.pcard.tour-hl') && /ikaw/.test(document.querySelector('.pcard.tour-hl').textContent) }));
  check(back && back.t === 'Mga laro' && piso.t === 'Piso at korona' && piso.hl === 1 && piso.mine, 'first game: Balik goes back a step, and the piso and korona step outlines your own card', JSON.stringify([back, piso]));
  await page.evaluate(() => { document.querySelector('#card [data-v="prev"]').click(); }); await page.waitForTimeout(150);
  const reach = await page.evaluate(() => ({ t: document.querySelector('#card h2').textContent, reach: !!window.__lsu.state.reach }));
  check(reach.t === 'Paggalaw' && reach.reach, 'first game: the movement step shows the spaces a roll can reach on the real board');
  await page.evaluate(() => document.querySelector('#card [data-v="skip"]').click()); await page.waitForTimeout(300);
  const after = await page.evaluate(() => ({ seen: localStorage.getItem('lsu-tour'), tour: document.querySelector('#modal').classList.contains('tour'), hl: document.querySelectorAll('.pcard.tour-hl').length, ov: window.__lsu.state.overview, reach: !!window.__lsu.state.reach }));
  check(after.seen === '1' && !after.tour && !after.hl && !after.ov, 'first game: Laktawan ends the guide, remembers it, and leaves the board as it was', JSON.stringify(after));
  // the game goes on normally after the guide
  const t0 = Date.now(); let rolled = 0;
  while (Date.now() - t0 < 120000 && !rolled) { rolled = await page.evaluate(() => { if (!document.querySelector('#modal').hidden) { const b = document.querySelector('#card [data-primary]'); if (b) b.click(); } else { const a = document.querySelector('#actionBtn'); if (!a.hidden) a.click(); } return window.__lsu.DBG.filter(e => e.type === 'roll').length; }); await page.waitForTimeout(150); }
  check(rolled > 0, 'first game: after the guide the turns are played as usual');
  // a returning player: no guide in the next game
  await page.evaluate(() => window.__lsu.toTitle()); await startParty(page); await page.waitForTimeout(4000);
  check(!(await tourStep(page)), 'a returning player is not taken through the guide again');
  // Paano maglaro brings it back for the next game
  await page.evaluate(() => window.__lsu.toTitle());
  await page.evaluate(() => document.querySelector('#mGuide').click());
  for (let i = 0; i < 12 && !(await page.$('#card [data-v="tips"]')); i++) { await page.evaluate(() => document.querySelector('#card [data-v="next"]').click()); await page.waitForTimeout(60); }
  await page.evaluate(() => document.querySelector('#card [data-v="tips"]').click()); await page.waitForTimeout(200);
  const reset = await page.evaluate(() => ({ tour: localStorage.getItem('lsu-tour'), tips: localStorage.getItem('lsu-tips') }));
  await page.evaluate(() => { const b = document.querySelector('#card [data-v="prev"]'); if (b) b.click(); }); await page.evaluate(() => window.__lsu.toTitle());
  await startParty(page);
  const again = await page.waitForFunction(() => /Unang laro/.test((document.querySelector('#card .chip') || {}).textContent || ''), null, { timeout: 30000 }).then(() => true, () => false);
  check(!reset.tour && !reset.tips && again, '"Ipakita ulit ang gabay at mga tip" shows the guide again in the next game', JSON.stringify(reset));
  await page.context().close();
  // Torneo has no dice: no guide (its own tip explains it)
  const tp = await newPage('2d', '?debug&speed=3&tour');
  await startParty(tp, { mode: 'torneo' }); await tp.waitForTimeout(4000);
  check(!(await tourStep(tp)) && (await tp.evaluate(() => localStorage.getItem('lsu-tour'))) === null, 'Torneo does not show the board guide (nor mark it seen)');
  await tp.context().close();
}

// ---------- Kalidad: the island is rebuilt in the background ----------
if (!only || only === 'quality') {
  const page = await newPage('3d');
  await page.waitForFunction(() => window.__lsu.b3.ok, null, { timeout: 60000 });
  await page.evaluate(() => localStorage.setItem('lsu-tour', '1'));
  await startParty(page);
  await page.waitForFunction(() => document.querySelector('#loadIsl').hidden && window.__lsu.b3.island, null, { timeout: 240000, polling: 500 });
  for (const q of ['low', 'high', 'mid']) {
    await page.evaluate(() => { window.__off = 0; window.__n = 0; window.__grp = 0; const L = window.__lsu; const f = () => { if (window.__watch) { window.__n++; if (!L.b3.on) window.__off++; const ms = L.b3.island ? L.b3.island.grp.parent : null; if (ms) window.__grp = Math.max(window.__grp, ms.children.filter(c => /^island_/.test(c.name)).length); requestAnimationFrame(f); } }; window.__watch = 1; requestAnimationFrame(f); });
    await page.keyboard.press('Escape'); await page.waitForSelector('#menuCard button[data-k="gq"]', { timeout: 10000 });
    await page.evaluate(q => { document.querySelector(`#menuCard button[data-k="gq"][data-val="${q}"]`).click(); document.querySelector('#menuCard [data-v="close"]').click(); }, q);
    const ok = await page.waitForFunction(() => { const B = window.__lsu.b3, I = B.island; return I && !B.loading && B.hold === 0 && B.q === JSON.parse(localStorage.getItem('lsu-prefs') || '{}').gq; }, null, { timeout: 300000, polling: 500 }).then(() => true, () => false);
    await page.waitForTimeout(1500);
    const r = await page.evaluate(() => { window.__watch = 0; const B = window.__lsu.b3, I = B.island, prefs = JSON.parse(localStorage.getItem('lsu-prefs') || '{}'); return { q: I && I.q, gq: prefs.gq, off: window.__off, frames: window.__n, maxIslands: window.__grp, shadow: B.q }; });
    const want = { low: '400/2/false', mid: '800/3/false', high: '4000/8/true' }[q];
    check(ok && r.q === want && r.gq === q, `Kalidad ${q}: the island is rebuilt with the new quality and the setting is kept`, JSON.stringify(r));
    check(r.off === 0 && r.maxIslands <= 1, `Kalidad ${q}: the 3D island stays on screen the whole time (no 2D board, never two islands at once)`, JSON.stringify(r));
  }
  await page.context().close();
}

check(allErrs.flat().length === 0, 'no script errors', allErrs.flat().slice(0, 3).join(' | '));
await browser.close(); srv.close(); done();
