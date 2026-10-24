// Renders the main menu's still pictures: maps/world/title.jpg (wide screens) and title-tall.jpg (portrait phones).
// The menu shows them while its 3D scene (maps/title.js) is being built, and instead of it without WebGL or in 2D.
// Uses headless Chromium with software WebGL, like the tests (see tests/README.md).
// Run after changing the title scene or the Plaza island:  node tools/title-render.mjs
import fs from 'fs';
import path from 'path';
import { chromium, serve, ROOT } from '../tests/lib.mjs';

// the portrait picture's kids stand where the menu's portrait layout leaves room (see titleFocus in index.html)
const SHOTS = [['title.jpg', 'w=1920&h=1080'], ['title-tall.jpg', 'w=1080&h=1920&fx=.5&fy=.38']];
const srv = await serve(); const br = await chromium();
for (const [name, q] of SHOTS) {
  const t0 = Date.now(), page = await br.newPage({ viewport: { width: 400, height: 400 } }), msgs = [];
  page.on('pageerror', e => msgs.push(e.message)); page.on('console', m => { if (m.type() === 'error') msgs.push(m.text().slice(0, 160)); });
  await page.goto(srv.url.replace('index.html', 'tools/title-render.html') + '?' + q);
  await page.waitForFunction(() => window.__done, null, { timeout: 900000, polling: 1000 });
  const { out, err } = await page.evaluate(() => ({ out: window.__out, err: window.__err }));
  if (err) { console.error(name, err); process.exitCode = 1; await page.close(); continue; }
  const b = Buffer.from(out.split(',')[1], 'base64'); fs.writeFileSync(path.join(ROOT, 'maps', 'world', name), b);
  console.log(name, b.length, 'bytes, took', ((Date.now() - t0) / 1000).toFixed(0), 's', msgs.length ? '; errors: ' + msgs.slice(0, 3).join(' | ') : '');
  await page.close();
}
await br.close(); srv.close();
