// Offline play (F10): sw.js keeps a copy of the game, so after one visit online it opens and plays with no network.
// Checks that sw.js lists every game file that is deployed, the Vercel header for sw.js, that the other tests' ?debug
// pages get no worker, and then the real thing: load once online, go offline, reload, and play on an island that was
// never opened, in 3D (Three.js and the island's code have to come from the saved copy).
// Run: node tests/offline.mjs
import fs from 'fs';
import path from 'path';
import { chromium, serve, watchErrors, check, done, ROOT } from './lib.mjs';

// ---------- 1. the file list and the Vercel settings ----------
const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
const listed = [...sw.match(/const FILES = \[([\s\S]*?)\];/)[1].matchAll(/'([^']+)'/g)].map(m => m[1]).sort();
const walk = d => fs.readdirSync(path.join(ROOT, d), { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(d + '/' + e.name) : [d + '/' + e.name]);
const deployed = ['index.html', ...['content', 'kids', 'maps', 'vendor'].flatMap(walk)].filter(f => !/\.(md|txt)$/.test(f)).sort();
const missing = deployed.filter(f => !listed.includes(f)), extra = listed.filter(f => !deployed.includes(f));
check(!missing.length && !extra.length, 'sw.js lists every game file that is deployed, and nothing else', JSON.stringify({ missing, extra }));
const vj = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8')), rules = vj.headers.map(h => h.source);
const swRule = vj.headers.find(h => h.source === '/sw.js');
check(swRule && swRule.headers.some(h => h.key === 'Cache-Control' && /no-cache/.test(h.value)) && rules.indexOf('/sw.js') < rules.indexOf('/(.*)'),
  'vercel.json: sw.js is always checked for a new version (no-cache)');
check(!fs.readFileSync(path.join(ROOT, '.vercelignore'), 'utf8').split(/\r?\n/).includes('sw.js'), 'sw.js is deployed (not in .vercelignore)');

// ---------- 2. in the browser ----------
const srv = await serve();
const browser = await chromium();
{
  // the other tests open ?debug and must get no worker (they block files on purpose)
  const ctx = await browser.newContext(); const page = await ctx.newPage();
  await page.goto(srv.url + '?debug'); await page.waitForFunction(() => window.__lsu && window.__lsu.screen === 'title'); await page.waitForTimeout(1500);
  check((await page.evaluate(() => navigator.serviceWorker.getRegistrations().then(r => r.length))) === 0, '?debug alone installs no worker');
  await ctx.close();
}
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage(); const errs = watchErrors(page, 'offline');
  await page.goto(srv.url + '?debug&sw');
  let saved = 0;
  for (const t0 = Date.now(); saved < listed.length && Date.now() - t0 < 60000; await page.waitForTimeout(500))
    saved = await page.evaluate(async () => { if (!navigator.serviceWorker.controller) return 0;
      const c = (await caches.keys()).find(k => k.startsWith('taympers-')); return c ? (await (await caches.open(c)).keys()).length : 0; });
  check(saved >= listed.length, 'online: the worker takes over the page and saves every game file', `${saved} of ${listed.length}`);

  // a new deploy arrives at once: an old saved index.html is passed over for the server's, which replaces it
  await page.evaluate(async () => { const c = await caches.open((await caches.keys()).find(k => k.startsWith('taympers-')));
    await c.put(new URL('index.html', location.href).href, new Response('<p id="old">old copy</p>', { headers: { 'content-type': 'text/html' } })); });
  await page.reload(); await page.waitForFunction(() => window.__lsu && window.__lsu.screen === 'title', null, { timeout: 30000 }).catch(() => {}); await page.waitForTimeout(800);
  const upd = await page.evaluate(async () => { const c = await caches.open((await caches.keys()).find(k => k.startsWith('taympers-')));
    const r = await c.match(new URL('index.html', location.href).href); return { page: !document.getElementById('old') && !!window.__lsu, copy: r ? (await r.text()).includes('Taympers') : false }; });
  check(upd.page && upd.copy, 'online: a new deploy arrives at once (the page comes from the server, and the saved copy is replaced)', JSON.stringify(upd));

  // the browser's offline switch does not cover the worker's own requests, so the server is shut down as well
  await ctx.setOffline(true); srv.close(); await page.waitForTimeout(500);
  const net = await page.evaluate(() => fetch('tools/title-render.html').then(() => 'reached', () => 'no network'));
  check(net === 'no network', 'offline: the network really is gone for the worker too', net);
  const failed = []; page.on('requestfailed', r => { if (!/tools\//.test(r.url())) failed.push(r.url().replace(/^.*?:\d+\//, '')); });
  await page.reload();
  const t = await page.waitForFunction(() => window.__lsu && window.__lsu.screen === 'title' && window.__lsu.b3.ok, null, { timeout: 30000 }).then(() => true, () => false);
  check(t, 'offline: the game opens again, with its 3D', JSON.stringify({ failed }));
  await page.evaluate(() => window.__lsu.startLocal({ n: 1, names: ['Ian'], cfg: { mode: 'party', rounds: 3, diff: 1, map: 'palayan' } }));
  const isl = await page.waitForFunction(() => { const L = window.__lsu; if (!document.querySelector('#modal').hidden) { const b = document.querySelector('#card [data-primary]') || document.querySelector('#card .row button'); if (b) b.click(); }
    return L.b3.on && L.b3.island && L.b3.island.grp && !L.b3.loading; }, null, { timeout: 180000, polling: 500 }).then(() => true, () => false);
  check(isl, 'offline: a game starts on Palayan, never opened before, and its island is built in 3D', JSON.stringify({ failed }));
  check(!failed.length, 'offline: no game file failed to load', failed.join(', '));
  check(!errs.length, 'offline: no script errors', errs.join(' | '));
  await ctx.close();
}
await browser.close();
done();
