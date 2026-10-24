# Bundled libraries

Served with the game so it runs on Vercel or GitHub Pages without a CDN.
Both are the unmodified files from npm.

| File | Package | Licence |
|---|---|---|
| `three-r184/three.module.min.js`, `three-r184/three.core.min.js` | `three@0.184.0`, `build/` (ES modules; `index.html` loads them with `import()`, so 3D needs an http server, not `file://`) | MIT, `three-r184/LICENSE.txt` |
| `qrcode-1.4.4.js` | `qrcode-generator@1.4.4`, `qrcode.js` | MIT, `qrcode-generator.LICENSE.txt` |

The version is in each file name, so the files can be cached for a year (`vercel.json`).
To update one, add the new file under a new name, point `index.html` at it, and delete
the old one.
