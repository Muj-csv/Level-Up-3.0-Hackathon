/* Taympers offline copy (F10). After one visit online, the game opens and plays on one device with no internet:
   this worker keeps every game file in the browser's cache.
   - Install: every file in FILES is saved.
   - The game's own files: the network first, so a new deploy arrives as soon as the device is online; the saved copy
     when offline, or when the network has not answered in 4 s (slow venue Wi-Fi).
   - vendor/: the saved copy first (each file name carries its version).
   - Each visit online also checks every saved file in the background (a small request each when nothing changed),
     so an island not opened for a while cannot fall out of step with a newer index.html.
   Online rooms still need internet (Supabase). tests/offline.mjs checks that FILES lists every game file.
   Change VERSION when FILES changes; the old copy is then dropped. */
const VERSION = '2026-10-25';
const CACHE = 'taympers-' + VERSION;
const FILES = [
  'index.html',
  'content/fil.json', 'content/terms.json',
  'kids/hero.js', 'kids/kidgeo.js', 'kids/kids.js', 'kids/sprites.json', 'kids/sprites.png',
  'maps/boards.js', 'maps/life.js', 'maps/living.js', 'maps/polish.js', 'maps/title.js',
  'maps/islands/aplaya.js', 'maps/islands/palayan.js', 'maps/islands/palengke.js', 'maps/islands/plaza.js',
  'maps/world/aplaya.jpg', 'maps/world/palayan.jpg', 'maps/world/palengke.jpg', 'maps/world/plaza.jpg',
  'maps/world/title.jpg', 'maps/world/title-tall.jpg', 'maps/world/world.jpg',
  'vendor/fonts/bagel-fat-one-latin-400.woff2', 'vendor/fonts/nunito-latin-700-900.woff2',
  'vendor/qrcode-1.4.4.js', 'vendor/supabase-2.118.0.js',
  'vendor/three-r184/three.core.min.js', 'vendor/three-r184/three.module.min.js'
];
const BASE = new URL('./', self.location).href;   // the game's folder (the site root on Vercel, /Level-Up-3.0-Hackathon/ on GitHub Pages)
const INDEX = BASE + 'index.html';
const WAIT_MS = 4000;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(BASE + f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('taympers-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

// the cache key: the page itself (with or without ?debug, #CODE or a trailing /) is index.html; anything else, its path
function keyOf(req) {
  const u = new URL(req.url);
  if (req.mode === 'navigate' && (u.href.split(/[?#]/)[0] === BASE || u.pathname.endsWith('/index.html'))) return INDEX;
  return u.origin + u.pathname;
}
function save(key, res) { if (res && res.ok && res.type === 'basic') { const c = res.clone(); caches.open(CACHE).then(cc => cc.put(key, c)).catch(() => {}); } return res; }
// the network, but the saved copy if it has not answered in WAIT_MS (or fails)
function fresh(req, key) {
  return new Promise((done, fail) => {
    let settled = false;
    const useCopy = () => caches.match(key).then(r => { if (r && !settled) { settled = true; done(r); } return r; });
    const t = setTimeout(useCopy, WAIT_MS);
    fetch(req).then(r => { clearTimeout(t); save(key, r); if (!settled) { settled = true; done(r); } },
      err => { clearTimeout(t); useCopy().then(r => { if (!r && !settled) { settled = true; fail(err); } }); });
  });
}
self.addEventListener('fetch', e => {
  const req = e.request, u = new URL(req.url);
  if (req.method !== 'GET' || u.origin !== self.location.origin || !u.href.startsWith(BASE)) return;   // Supabase and anything outside the game: untouched
  const key = keyOf(req);
  if (u.pathname.includes('/vendor/')) e.respondWith(caches.match(key).then(r => r || fetch(req).then(n => save(key, n))));
  else e.respondWith(fresh(req, key));
});

// the page asks for this after it has loaded: check every saved file against the server, a few at a time
let checking = null;
async function checkAll() {
  const c = await caches.open(CACHE), list = FILES.filter(f => !f.startsWith('vendor/')).map(f => BASE + f);
  const next = async () => { const url = list.shift(); if (!url) return; try { const r = await fetch(url, { cache: 'no-cache' }); if (r.ok) await c.put(url, r); } catch (e) {} return next(); };
  await Promise.all([next(), next(), next()]);
}
self.addEventListener('message', e => {
  if (e.data === 'check' && !checking) { checking = checkAll().finally(() => { checking = null; }); e.waitUntil && e.waitUntil(checking); }
});
