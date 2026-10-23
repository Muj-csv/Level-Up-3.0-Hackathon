# Bundled libraries

Served with the game so it runs on Vercel, GitHub Pages or a local file without a CDN.
Both are the unmodified files from npm.

| File | Package | Licence |
|---|---|---|
| `three-r149.min.js` | `three@0.149.0`, `build/three.min.js` | MIT, `three.LICENSE.txt` |
| `qrcode-1.4.4.js` | `qrcode-generator@1.4.4`, `qrcode.js` | MIT, `qrcode-generator.LICENSE.txt` |
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
