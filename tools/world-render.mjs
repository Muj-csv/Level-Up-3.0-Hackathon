// Renders the map-select pictures: maps/world/world.jpg (all four islands) and one sharp close-up per island.
// Uses headless Chromium with software WebGL, like the tests (see tests/README.md). Takes a few minutes.
// Run after changing an island:  node tools/world-render.mjs
// It prints the island boxes; copy them into WORLD in index.html if they changed.
import fs from 'fs';
import path from 'path';
import { chromium, serve, ROOT } from '../tests/lib.mjs';

const outDir = path.join(ROOT, 'maps', 'world');
const srv = await serve(); const br = await chromium(); const page = await br.newPage({ viewport: { width: 800, height: 500 } });
const msgs = []; page.on('pageerror', e => msgs.push(e.message)); page.on('console', m => { if (m.type() === 'error') msgs.push(m.text().slice(0, 160)); });
const t0 = Date.now();
await page.goto(srv.url.replace('index.html', 'tools/world-render.html'));
await page.waitForFunction(() => window.__done, null, { timeout: 1500000, polling: 2000 });
const out = await page.evaluate(() => window.__out);
fs.mkdirSync(outDir, { recursive: true });
const save = (name, d) => { const b = Buffer.from(d.split(',')[1], 'base64'); fs.writeFileSync(path.join(outDir, name), b); console.log(name, b.length, 'bytes'); };
save('world.jpg', out.world);
const boxes = {}; for (const [k, v] of Object.entries(out.islands)) { save(k + '.jpg', v.img); boxes[k] = { x: v.x, y: v.y, w: v.w, h: v.h }; }
console.log('WORLD:', JSON.stringify({ W: out.W, H: out.H, islands: boxes }));
console.log('took', ((Date.now() - t0) / 1000).toFixed(0), 's', msgs.length ? '; errors: ' + msgs.slice(0, 3).join(' | ') : '');
await br.close(); srv.close();
