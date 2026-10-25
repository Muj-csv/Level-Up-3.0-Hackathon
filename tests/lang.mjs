// The Filipino / English switch (Simpler Filipino and English PRD, Phase 2): Filipino by default; the title's Wika
// button and the menu's Wika row switch the cards (minigame rules, Tanong ni Lola, soon games) and save "lang" next to
// the other settings without changing them; the choice survives a reload; ?lang=en opens English without saving it;
// <html lang> follows; a missing English entry, or a missing en.json, falls back to Filipino, never to a blank card.
// Run: node tests/lang.mjs
import fs from 'fs';
import path from 'path';
import { chromium, serve, watchErrors, check, done, renderer, ROOT } from './lib.mjs';

const srv = await serve();
const browser = await chromium();
const allErrs = [];
async function newPage(query = '', opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await renderer(ctx, '2d');
  if (opts.prefs) await ctx.addInitScript(p => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('lsu-prefs', p); sessionStorage.setItem('seeded', '1'); } }, opts.prefs);
  if (opts.en) await ctx.route('**/content/en.json', opts.en);
  const page = await ctx.newPage(); allErrs.push(watchErrors(page, 'lang'));
  await page.goto(srv.url + '?debug' + query);
  await page.waitForFunction(() => window.__lsu && window.__lsu.screen === 'title', null, { timeout: 30000 });
  await page.waitForTimeout(800);   // the content files load after the title shows
  return page;
}
const cards = page => page.evaluate(() => { const L = window.__lsu; return { lang: L.lang(), html: document.documentElement.lang, rule: L.MG.tumbang.rules[0], real: L.MG.sipa.real, q: L.TANONG[0].q, f: L.TANONG[0].f, n: L.TANONG.length, soon: L.SOON[0].d, btn: document.querySelector('#langBtn').textContent }; });
const prefs = page => page.evaluate(() => JSON.parse(localStorage.getItem('lsu-prefs') || '{}'));
const FIL = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/fil.json'), 'utf8')), EN = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/en.json'), 'utf8'));

// ---------- 1. default, the title button, saving, reload ----------
{
  const page = await newPage('', { prefs: JSON.stringify({ music: false, sfx: true, vib: false, g3d: true, gq: 'low' }) });
  const a = await cards(page);
  check(a.lang === 'fil' && a.html === 'fil' && a.btn === 'FIL' && a.rule === FIL.minigames.tumbang.rules[0] && a.q === FIL.trivia[0].q, 'Filipino by default: cards, <html lang> and the title button', JSON.stringify(a).slice(0, 160));
  await page.click('#langBtn'); await page.waitForTimeout(600);
  const b = await cards(page), p = await prefs(page);
  check(b.lang === 'en' && b.html === 'en' && b.btn === 'EN', 'the title button switches to English', JSON.stringify({ lang: b.lang, html: b.html, btn: b.btn }));
  check(b.rule === EN.minigames.tumbang.rules[0] && b.q === EN.trivia[0].q && b.soon === EN.soon[0].d && b.real === EN.minigames.sipa.real, 'rules, Tanong ni Lola, Sa totoong kalye and soon games are in English', b.rule);
  check(b.n === a.n, 'English keeps the same number of questions (same list on every phone online)', a.n + ' / ' + b.n);
  check(p.lang === 'en' && p.music === false && p.sfx === true && p.vib === false && p.g3d === true && p.gq === 'low', 'saved as lang next to the other settings, which stay as they were', JSON.stringify(p));
  await page.reload(); await page.waitForFunction(() => window.__lsu && window.__lsu.screen === 'title'); await page.waitForTimeout(800);
  const c = await cards(page);
  check(c.lang === 'en' && c.btn === 'EN' && c.rule === EN.minigames.tumbang.rules[0], 'English is still picked after a reload');
  // the rules card before a minigame shows the English rules
  await page.click('#mHamon'); await page.click('#card [data-v="practice"]'); await page.click('#card [data-v="tumbang"]');
  await page.waitForSelector('#card [data-v="go"]');
  const shown = await page.evaluate(() => document.querySelector('#card').textContent);
  check(shown.includes(EN.minigames.tumbang.rules[0]) && shown.includes(EN.minigames.tumbang.chip), 'the minigame card shows the English rules', shown.slice(0, 120));
  await page.context().close();
}

// ---------- 2. the menu's Wika row, its note, and switching back ----------
{
  const page = await newPage('', { prefs: JSON.stringify({ lang: 'en' }) });
  await page.evaluate(() => window.__lsu.startLocal({ n: 1, names: ['Ian'], cfg: { mode: 'party', rounds: 3, diff: 1, map: 'ulap' } }));
  await page.waitForTimeout(1200);
  check(await page.evaluate(() => document.querySelector('#langBtn').hidden), 'the title Wika button hides during a game');
  await page.click('#menuBtn');
  const row = await page.evaluate(() => ({ b: [...document.querySelectorAll('#menuCard button[data-k="lang"]')].map(x => x.textContent + ':' + x.getAttribute('aria-pressed')).join(), note: !document.querySelector('#langNote').hidden }));
  check(row.b === 'Filipino:false,English:true' && row.note, 'the menu has Wika (Filipino / English) and says English covers rules and trivia only for now', JSON.stringify(row));
  await page.click('#menuCard button[data-k="lang"][data-val="fil"]'); await page.waitForTimeout(500);
  const d = await cards(page), p = await prefs(page), note = await page.evaluate(() => document.querySelector('#langNote').hidden);
  check(d.lang === 'fil' && d.rule === FIL.minigames.tumbang.rules[0] && p.lang === 'fil' && note, 'switching back to Filipino in the menu changes the cards, saves it and hides the note');
  await page.context().close();
}

// ---------- 3. ?lang=en for testers: English for this visit, nothing saved ----------
{
  const page = await newPage('&lang=en', { prefs: JSON.stringify({ lang: 'fil', music: true }) });
  const e = await cards(page), p = await prefs(page);
  check(e.lang === 'en' && e.q === EN.trivia[0].q && p.lang === 'fil', '?lang=en opens English without saving it', JSON.stringify({ lang: e.lang, saved: p.lang }));
  await page.context().close();
}

// ---------- 4. fallbacks: a missing English entry, and no en.json at all ----------
{
  const gap = JSON.parse(JSON.stringify(EN)); delete gap.trivia[0].f; gap.minigames.sipa.real = ''; gap.minigames.tumbang.rules = [];
  const page = await newPage('&lang=en', { en: r => r.fulfill({ contentType: 'application/json', body: JSON.stringify(gap) }) });
  const g = await cards(page);
  check(g.q === EN.trivia[0].q && g.f === FIL.trivia[0].f, 'a missing English fact shows the Filipino one, the question stays English', g.f);
  check(g.real === FIL.minigames.sipa.real && g.rule === FIL.minigames.tumbang.rules[0], 'a blank English entry falls back to Filipino, never to a blank card');
  await page.context().close();
  const none = await newPage('&lang=en', { en: r => r.abort() });
  const h = await cards(none);
  check(h.q === FIL.trivia[0].q && h.rule === FIL.minigames.tumbang.rules[0] && h.n === FIL.trivia.length, 'without en.json the cards stay Filipino', h.q);
  await none.context().close();
}

const errs = allErrs.flat().filter(e => !/content\/en\.json/.test(e));
check(errs.length === 0, 'no script errors', errs.slice(0, 3).join(' | '));
await browser.close(); srv.close(); done();
