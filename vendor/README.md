# Bundled libraries

Served with the game so it runs on Vercel, GitHub Pages or a local file without a CDN.
Both are the unmodified files from npm.

| File | Package | Licence |
|---|---|---|
| `three-r149.min.js` | `three@0.149.0`, `build/three.min.js` | MIT, `three.LICENSE.txt` |
| `qrcode-1.4.4.js` | `qrcode-generator@1.4.4`, `qrcode.js` | MIT, `qrcode-generator.LICENSE.txt` |
| `supabase-2.118.0.js` | `@supabase/supabase-js@2.118.0`, `dist/umd/supabase.js` (loaded only when a player opens online play) | MIT, `supabase-js.LICENSE.txt` |

The version is in each file name, so the files can be cached for a year (`vercel.json`).
To update one, add the new file under a new name, point `index.html` at it, and delete
the old one.
