// Shared helpers for the play-tests: a tiny static server for the repo and a Playwright loader.
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export async function chromium() {
  let pw;
  try { pw = await import('playwright'); }
  catch (e) {
    const alt = process.env.PLAYWRIGHT_MODULE; // e.g. a global install: /usr/lib/node_modules/playwright
    if (!alt) throw new Error('Playwright not found. Run "npm install" in the repo (see tests/README.md).');
    pw = createRequire(import.meta.url)(alt);
  }
  // SwiftShader gives headless Chromium a software WebGL, so the 3D board can be tested without a GPU
  return (pw.chromium || pw.default.chromium).launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
}

// The game loads Three.js from jsDelivr. Each suite picks the renderer it tests: '3d' serves Three.js from
// node_modules (npm install), '2d' blocks it so the game falls back to the 2D canvas, as it does without WebGL.
export const THREE_FILE = path.join(ROOT, 'node_modules', 'three', 'build', 'three.min.js');
export async function renderer(target, mode) {
  if (mode === '3d' && !fs.existsSync(THREE_FILE)) throw new Error('three.js not found at ' + THREE_FILE + '. Run "npm install" in the repo.');
  await target.route('**/npm/three@*/build/three.min.js', r => mode === '3d' ? r.fulfill({ path: THREE_FILE, contentType: 'text/javascript' }) : r.abort());
}

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.md': 'text/plain; charset=utf-8' };
export function serve() {
  return new Promise(res => {
    const srv = http.createServer((req, rsp) => {
      const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
      if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { rsp.writeHead(404); rsp.end(); return; }
      rsp.writeHead(200, { 'content-type': TYPES[path.extname(p)] || 'application/octet-stream' });
      fs.createReadStream(p).pipe(rsp);
    });
    srv.listen(0, '127.0.0.1', () => res({ url: `http://127.0.0.1:${srv.address().port}/index.html`, close: () => srv.close() }));
  });
}

// Watch a page for script errors; the CDN font/QR/Three.js requests may fail offline, which is not a game error.
export function watchErrors(page, tag) {
  const errs = [];
  page.on('pageerror', e => errs.push(`${tag} pageerror: ${e.message}`));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(`${tag} console: ${m.text()}`); });
  return errs;
}

let failures = 0;
export function check(ok, label, detail) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? '  (' + detail + ')' : ''}`);
  if (!ok) failures++;
  return ok;
}
export function done() {
  console.log(failures ? `\n${failures} check(s) failed` : '\nAll checks passed');
  process.exitCode = failures ? 1 : 0;
}
