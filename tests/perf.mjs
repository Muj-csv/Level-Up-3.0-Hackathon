// F10 benchmark: the same scenes at the same screen size for each graphics quality, through the game's ?perf readout.
// Scenes: the title (frame gaps only: its kids have their own renderer, kids/hero.js), all four islands one after another (also shows whether switching islands leaks GPU
// memory), every minigame, five minigames in a row (the same leak check), and the 2D fallback.
// Software WebGL (SwiftShader) draws on the CPU, so the numbers compare settings with each other; they are
// not phone frame rates. Run: node tests/perf.mjs [label] [qualities, e.g. low,mid,high] [--phone]
// --phone makes Chromium report a touch screen (as phones do). Results: test-results/perf-<label>.json
// --ab compares settings inside one page instead: the same still frame drawn and waited for (the GPU must finish it),
// the settings taking turns over several rounds, so a computer that speeds up or slows down affects them all alike.
// Use --ab to choose between settings; the plain run's frame rates drift by 2x and more between runs on a busy PC
import fs from 'fs';
import path from 'path';
import { chromium, serve, renderer, ROOT } from './lib.mjs';

const args = process.argv.slice(2), phone = args.includes('--phone'), pos = args.filter(a => !a.startsWith('--'));
const label = pos[0] || 'run', QS = (pos[1] || 'default').split(','), ISLANDS = ['plaza', 'palengke', 'aplaya', 'palayan'];
const VIEW = { viewport: { width: 360, height: 640 }, deviceScaleFactor: 2, isMobile: phone, hasTouch: phone };
const srv = await serve(), browser = await chromium(), out = [];
const log = (scene, q, s) => { const r = Object.assign({ scene, q }, s); out.push(r); console.log([scene.padEnd(18), String(q).padEnd(7), String(s.fps).padStart(5) + ' fps', 'p50 ' + s.p50, 'p95 ' + s.p95, 'pr ' + s.pr, 'calls ' + s.calls, 'tris ' + s.tris, 'geo ' + s.geo, 'tex ' + s.tex, 'shadow ' + s.shadow, 'frames ' + s.n].join('  ')); };

async function page(q, mode = '3d') {
  const ctx = await browser.newContext(VIEW); await renderer(ctx, mode);
  if (q !== 'default') await ctx.addInitScript(g => { try { localStorage.setItem('lsu-prefs', JSON.stringify({ gq: g })); } catch (e) {} }, q);
  const p = await ctx.newPage(); p.on('pageerror', e => console.log('  pageerror:', e.message));
  await p.goto(srv.url + '?debug&perf');
  await p.waitForFunction(() => window.__lsu && window.__lsu.screen === 'title', null, { timeout: 30000 });
  if (mode === '3d') await p.waitForFunction(() => window.__lsu.b3.ok, null, { timeout: 30000 });
  return p;
}
// frame stats over a window: at least minMs and 8 frames (software WebGL draws an island at about 1 frame a second)
async function sample(p, minMs = 5000, maxMs = 30000) {
  await p.evaluate(() => window.__lsu.perfReset()); const t0 = Date.now();
  for (;;) { await p.waitForTimeout(1000); const s = await p.evaluate(() => window.__lsu.perf()); const el = Date.now() - t0;
    if ((el >= minMs && s.n >= 8) || el >= maxMs) return Object.assign(s, { heap: await p.evaluate(() => performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null) }); }
}
async function island(p, id) {
  await p.evaluate(m => { const L = window.__lsu; L.toTitle(); L.startLocal({ n: 1, names: ['Ian'], cfg: { mode: 'party', rounds: 8, diff: 1, map: m } }); }, id);
  await p.waitForFunction(m => { const b = window.__lsu.b3; return b.island && b.island.id === m && b.on && !b.loading; }, id, { timeout: 300000, polling: 500 });
  await p.waitForTimeout(1500);
}
async function minigame(p, kind) {
  await p.evaluate(() => window.__lsu.toTitle()); await p.waitForTimeout(300);
  await p.click('#mHamon'); await p.click('#card [data-v="practice"]'); await p.click(`#card [data-v="${kind}"]`);
  await p.waitForSelector('#card [data-v="go"]'); await p.click('#card [data-v="go"]');
  await p.waitForFunction(() => window.__lsu.scene && !(window.__lsu.scene.cd > 0) && window.__lsu.b3.mg, null, { timeout: 60000 });
}

// ---------- --ab: settings compared in turns on the same page ----------
const ms = async (p, n = 6) => { await p.evaluate(() => window.__lsu.bench(1)); return p.evaluate(k => window.__lsu.bench(k), n); };
const med = a => { const b = [...a].sort((x, y) => x - y); return +b[Math.floor(b.length / 2)].toFixed(1); };
async function turns(p, scene, variants, rounds = 3) {
  const t = {}; for (let r = 0; r < rounds; r++) for (const [name, q, patch] of variants) {
    await p.evaluate(([q, patch]) => { const L = window.__lsu; Object.assign(L.GQ[q], patch || {}); L.setQ(q); }, [q, patch]);
    await p.evaluate(() => window.__lsu.bench(2)); (t[name] = t[name] || []).push(await ms(p)); }
  for (const [name] of variants) { const r = { scene, q: name, msPerFrame: med(t[name]), runs: t[name].map(x => +x.toFixed(1)) }; out.push(r); console.log(scene.padEnd(18), name.padEnd(26), String(r.msPerFrame).padStart(7) + ' ms/frame', JSON.stringify(r.runs)); }
}
const PRESETS = [['low', 'low'], ['mid', 'mid'], ['high', 'high']];
if (args.includes('--ab')) {
  const p = await page('mid');
  await minigame(p, 'luksong'); await turns(p, 'mg luksong', PRESETS);
  // the cheering crowd, on Mababa's other settings: each minigame is started again, crowd off / on / on / off
  for (const c of [false, true, true, false]) { await p.evaluate(c => { const L = window.__lsu; L.GQ.low.crowd = c; L.setQ('low'); }, c); await minigame(p, 'luksong'); await turns(p, 'mg luksong crowd', [['low, crowd ' + (c ? 'on' : 'off'), 'low']], 1); }
  // an island: the menu pauses the game so the view stays still; pixel ratio and shadow first (no rebuild), then foliage (rebuilds)
  await p.evaluate(() => { const L = window.__lsu; L.GQ.low.crowd = false; L.setQ('mid'); });
  await island(p, 'plaza'); await p.click('#menuBtn'); await p.waitForTimeout(1500);
  await turns(p, 'plaza pr+shadow', [['pr 1, no shadow', 'mid', { pr: 1, shadow: 0 }], ['pr 1.5, shadow 1024', 'mid', { pr: 1.5, shadow: 1024 }], ['pr 2, shadow 2048', 'mid', { pr: 2, shadow: 2048 }], ['pr 1.5, no shadow', 'mid', { pr: 1.5, shadow: 0 }]]);
  await p.evaluate(() => Object.assign(window.__lsu.GQ.mid, { pr: 1.5, shadow: 1024 }));
  for (const [leaf, grass] of [[400, 2], [800, 3], [1600, 4], [4000, 8], [4000, 8], [1600, 4], [800, 3], [400, 2]]) {
    await p.evaluate(([l, g]) => Object.assign(window.__lsu.GQ.mid, { leaf: l, grass: g }), [leaf, grass]);
    await p.waitForFunction(k => { const b = window.__lsu.b3; return b.island && b.island.q === k && !b.loading; }, `${leaf}/${grass}/false`, { timeout: 300000, polling: 500 });
    await p.waitForTimeout(1000); await turns(p, 'plaza foliage', [[`leaf ${leaf}, grass ${grass}`, 'mid']], 1);
  }
  await p.context().close();
}
else for (const q of QS) {
  const p = await page(q);
  await p.waitForTimeout(1500); log('title', q, await sample(p));
  for (const id of ISLANDS) { const t0 = Date.now(); await island(p, id); const s = await sample(p, 6000, 40000); s.loadS = +((Date.now() - t0) / 1000).toFixed(1); log('island ' + id, q, s); }
  await island(p, 'plaza'); log('plaza again', q, await sample(p, 3000, 20000));
  await p.context().close();

  const m = await page(q);
  for (const kind of ['tumbang', 'patintero', 'sipa', 'palosebo', 'luksong']) { await minigame(m, kind); log('mg ' + kind, q, await sample(m, 4000, 20000)); }
  await minigame(m, 'tumbang'); log('mg tumbang again', q, await sample(m, 3000, 15000));
  await m.context().close();
}
{ const p = await page('default', '2d');
  await p.evaluate(() => window.__lsu.startLocal({ n: 1, names: ['Ian'], cfg: { mode: 'party', rounds: 8, diff: 1, map: 'plaza' } }));
  await p.waitForTimeout(2000); log('2d plaza', '-', await sample(p)); await p.context().close(); }

const dir = path.join(ROOT, 'test-results'); fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, `perf-${label}.json`), JSON.stringify({ label, phone, view: VIEW, at: new Date().toISOString(), results: out }, null, 1));
await browser.close(); srv.close();
