// Renders kids/sprites.png and kids/sprites.json: pictures of the 3D kids (kids/kids.js) in the poses the 2D board
// and minigames use. The game draws them only on devices that cannot show 3D (no WebGL), so even that fallback shows
// the current kids. Uses headless Chromium with software WebGL, like the tests (see tests/README.md).
// Run after changing a kid in kids/kids.js:  node tools/kid-sprites.mjs
import fs from 'fs';
import path from 'path';
import { chromium, serve, ROOT } from '../tests/lib.mjs';

const srv = await serve(); const br = await chromium();
const page = await br.newPage({ viewport: { width: 400, height: 400 } }), msgs = [];
page.on('pageerror', e => msgs.push(e.message)); page.on('console', m => { if (m.type() === 'error') msgs.push(m.text().slice(0, 160)); });
await page.goto(srv.url.replace('index.html', 'tools/kid-sprites.html'));
await page.waitForFunction(() => window.__done, null, { timeout: 600000, polling: 500 });
const { out, err, meta } = await page.evaluate(() => ({ out: window.__out, err: window.__err, meta: window.__meta }));
if (err) { console.error(err); process.exitCode = 1; }
else {
  const b = Buffer.from(out.split(',')[1], 'base64');
  const file = path.join(ROOT, 'kids', 'sprites.png'); fs.writeFileSync(file, b);
  // 256-colour palette (with alpha) keeps the file small; needs Python 3 with Pillow, otherwise the full-colour PNG stays
  try { (await import('child_process')).execFileSync('python3', ['-I', '-c', 'import sys;from PIL import Image;im=Image.open(sys.argv[1]).convert("RGBA");im.quantize(256,method=Image.Quantize.FASTOCTREE,dither=Image.Dither.NONE).save(sys.argv[1],optimize=True)', file]); } catch (e) { console.warn('no palette step (Pillow missing?): kept the full-colour PNG'); }
  fs.writeFileSync(path.join(ROOT, 'kids', 'sprites.json'), JSON.stringify(meta, null, 1) + '\n');
  console.log('kids/sprites.png', fs.statSync(path.join(ROOT, 'kids', 'sprites.png')).size, 'bytes;', meta.kids.length, 'kids x', meta.poses.length, 'poses', msgs.length ? '; errors: ' + msgs.slice(0, 3).join(' | ') : '');
}
await br.close(); srv.close();
