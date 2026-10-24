# Bundled libraries

Served with the game so it runs on Vercel or GitHub Pages without a CDN (3D needs an http
server; opened as a local file, the game plays in 2D).
All of the above are the unmodified files from their source (npm or Google Fonts).

| File | Package | Licence |
|---|---|---|
| `three-r184/three.module.min.js`, `three-r184/three.core.min.js` | `three@0.184.0`, `build/` (ES modules; `index.html` loads them with `import()`, so 3D needs an http server, not `file://`) | MIT, `three-r184/LICENSE.txt` |
| `qrcode-1.4.4.js` | `qrcode-generator@1.4.4`, `qrcode.js` | MIT, `qrcode-generator.LICENSE.txt` |
| `supabase-2.118.0.js` | `@supabase/supabase-js@2.118.0`, `dist/umd/supabase.js` (loaded only when a player opens online play) | MIT, `supabase-js.LICENSE.txt` |
| `fonts/bagel-fat-one-latin-400.woff2` | Google Fonts, Bagel Fat One (latin subset) | OFL-1.1, `fonts/bagel-fat-one.LICENSE.txt` |
| `fonts/nunito-latin-700-900.woff2` | Google Fonts, Nunito (latin subset, weights 700/800/900) | OFL-1.1, `fonts/nunito.LICENSE.txt` |

The version is in each file name, so the files can be cached for a year (`vercel.json`).
To update one, add the new file under a new name, point `index.html` at it, and delete
the old one.

F10.3 (offline mode) needs the fonts self-hosted — Google Fonts' CDN is an external
dependency the game can't reach once offline. The two files above cover the Latin-1
Supplement range (plain Latin plus accented characters like ñ), which is enough for
Filipino and English text; they don't cover other scripts the original Google Fonts CSS
subsetted for (Cyrillic, Vietnamese, CJK, etc.), which this game doesn't use.
