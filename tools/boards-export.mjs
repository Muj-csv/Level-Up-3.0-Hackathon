// Writes maps/boards.js from the islands themselves (maps/islands/*.js publish their board graph when built), so the
// game's board logic and the spaces drawn on the 3D islands always match. Run after changing an island's spaces,
// rides or korona spots:  node tools/boards-export.mjs        (--check: only report whether boards.js is up to date)
import fs from 'fs';
import path from 'path';
import { chromium, serve, ROOT } from '../tests/lib.mjs';

const check = process.argv.includes('--check');
const srv = await serve(); const br = await chromium();
const page = await br.newPage(), msgs = [];
page.on('pageerror', e => msgs.push(e.message)); page.on('console', m => { if (m.type() === 'error') msgs.push(m.text().slice(0, 160)); });
await page.goto(srv.url.replace('index.html', 'tools/boards-export.html'));
await page.waitForFunction(() => window.__done, null, { timeout: 600000, polling: 500 });
const { out, err } = await page.evaluate(() => ({ out: window.__out, err: window.__err }));
await br.close(); srv.close();
if (err) { console.error(err); process.exit(1); }
const file = path.join(ROOT, 'maps', 'boards.js');
const text = '/* Board graphs of the four island maps, exported from the islands (maps/islands/*.js) by tools/boards-export.mjs. */\nwindow.TAYMPERS_BOARDS=' + JSON.stringify(out) + ';\n';
const old = fs.readFileSync(file, 'utf8');
const same = JSON.stringify(JSON.parse(old.slice(old.indexOf('=') + 1).trim().replace(/;\s*$/, ''))) === JSON.stringify(out);
if (check) { console.log(same ? 'maps/boards.js matches the islands' : 'maps/boards.js is OUT OF DATE: run node tools/boards-export.mjs'); process.exitCode = same ? 0 : 1; }
else { fs.writeFileSync(file, text); console.log('maps/boards.js written', Object.entries(out).map(([k, b]) => k + ' ' + b.nodes.length + ' spaces').join(', '), same ? '(no change in the graphs)' : '(graphs changed)', msgs.length ? '; errors: ' + msgs.slice(0, 3).join(' | ') : ''); }
