# F10 performance and offline findings (Oct 23, 2026)

Headless checks run against `main` ahead of real device specs being available (see
`docs/DEVICES.md`). These catch regressions early and point at concrete gaps, but they
are not a substitute for F10's acceptance test — a real 5-round game with no frame-rate
drop on the actual slowest demo device. Treat "PASS" below as "passes the proxy check,"
not "meets the finals bar."

## F10.2 — total download and first load

| Check | Target | Result |
|---|---|---|
| Total download (`index.html` + `vendor/` + `content/`) | Under 15 MB | **961 KB** — comfortable margin |
| First load, simulated Fast 4G (Playwright CDP: 4 Mbps down / 3 Mbps up / 20 ms latency) | Under 8 s | **~2.2 s** window `load` event, **~3.0 s** to the title menu being interactive |

No action needed here right now. Re-check after the art pass (F6) — new textures and
any `.glb` models (decision D1) will grow the bundle, and this budget should be
re-measured once the first island art lands.

## F10.3 — offline after the first load

**Before this pass:** completely broken. Two separate problems:

1. The fonts (`Bagel Fat One`, `Nunito`) loaded from `fonts.googleapis.com` /
   `fonts.gstatic.com` — an external dependency the splash screen can't reach offline,
   even though `vendor/` already self-hosts Three.js and the QR library for the same
   reason.
2. No service worker or cache of any kind. A Playwright test that loads the page once,
   then sets the browser context offline and reloads, fails outright:
   `net::ERR_INTERNET_DISCONNECTED`. There's nothing cached to fall back to — not even
   `index.html` itself.

**Fixed in this pass:** (1) — the fonts are now self-hosted at `vendor/fonts/` (Latin
subset only, covers Filipino and English text; see `vendor/README.md` for the licence).
Confirmed with a Playwright run that records every request the page makes: zero
requests leave the origin on load, where before there were two (the Google Fonts CSS
and its woff2 file).

**Fixed Oct 25:** (2) — `sw.js`, a service worker, keeps a copy of every game file
(30 files, 3.6 MB), so after one visit online the game opens and plays on one device with
no internet: Party, Torneo, Hamon ng Araw (scores on the device) and Pagsasanay, in 3D.
Online rooms still need internet (Supabase).

- The game's own files come from the network first, so a new deploy arrives as soon as
  the device is online; the saved copy is used offline, or when the network has not
  answered in 4 s (slow venue Wi-Fi). `vendor/` (versioned file names) comes from the copy.
- 10 s after each load online, the worker checks every saved file against the server
  (cheap when nothing changed), so an island not opened for a while stays in step with
  a newer `index.html`.
- It runs on https (Vercel, GitHub Pages) and localhost; not inside the Claude artifact,
  not from a `file://` copy, and under `?debug` only with `&sw`. `vercel.json` serves
  `sw.js` with `no-cache`.
- `tests/offline.mjs` loads the game once, shuts the server down, reloads, and plays on
  an island never opened before, in 3D; it also checks that `sw.js` lists every deployed
  game file (a new file must be added to `FILES` there, with a new `VERSION`).
- iPhones and iPads can clear a site's saved data after a few weeks without a visit: open
  the game on every demo device in the days before the finals (see `docs/ONLINE.md`).

## F10.4 — quality setting (shadows, pixel ratio)

*Oct 24, 2026 (Jace, branch `jace/f10-quality`). Built ahead of the device measurement on
purpose, so the team has the knob ready when the slowest demo phone is named; the values
below should be checked on that phone.*

**What was there before:** one hidden rule (`LOW3`: a touch screen or a screen under
700 px) gave phones lighter islands (pixel ratio 1.5 on the island board, no island
shadows, 1024 shadow map, 800 leaf cards, 3 grass layers). Title and minigames still drew
at pixel ratio 2 with a 2048 shadow map on every device.

**What is there now:** **Kalidad** in the pause menu (Mababa / Katamtaman / Mataas), saved
in `lsu-prefs` as `gq`. (The separate Grapiko 3D/2D choice was removed in F11: 3D is always used when
the device can draw it, and an old saved `g3d:false` becomes Mababa.) One table (`GQ` in `index.html`) sets
every 3D screen: title, board, islands and minigames. Katamtaman is the default for every
device (no touch-screen guess any more). The title's Plaza scene (`maps/title.js`, own renderer) takes the
quality's pixel ratio, shadows and foliage (at most the design's 2500 leaf cards and 6 grass layers) each time it is
built (at start-up, and again on the way back from a game), and the players' 3D kids (`kids/`) are
built at 0.6 detail on Mababa (as phones had) and full detail otherwise.

| | Mababa | Katamtaman (default) | Mataas |
|---|---|---|---|
| Pixel ratio cap | 1 | 1.5 | 2 |
| Sun shadow map | none (round shadow under each kid) | 1024 | 2048 |
| Island buildings and trees cast shadows | no | no | yes |
| Leaf cards / grass layers on the islands | 400 / 2 | 800 / 3 | 4000 / 8 |
| Texture anisotropy | 1 | 2 | 4 |
| Cheering crowd in minigames | no | yes | yes |

Katamtaman draws the islands exactly as phones did before, and the title and minigames
lighter than before (1.5 and 1024 instead of 2 and 2048). Changing Kalidad mid-game takes
effect at once; if the island's foliage changes, the island is built again in the
background while the old island stays on screen (a chip shows the progress), then the
two swap in one step; the game is not touched. See "Changing Kalidad" below.

**Measurements** (`node tests/perf.mjs ab --ab`: 360×640 at 2× pixel density, Chromium with
software WebGL; the same still frame drawn and waited for, settings taking turns, median
of rounds; ms per frame, lower is better):

| Scene | Mababa | Katamtaman | Mataas |
|---|---|---|---|
| Title (the old cloud-board title, before the F3 menu of Oct 24) | 73 | 176 | 303 |
| Luksong Tinik (heaviest minigame: 838 draw calls) | 49 | 82 | 107 |

| Plaza island, one setting changed at a time | ms per frame |
|---|---|
| Pixel ratio 1, no shadow | 1080 |
| Pixel ratio 1.5, shadow 1024 | 2167 |
| Pixel ratio 1.5, no shadow | 2156 |
| Pixel ratio 2, shadow 2048 | 5352 |
| Foliage 400 / 2 (at 1.5 and 1024) | 1480 |
| Foliage 800 / 3 | 1804 |
| Foliage 1600 / 4 | 2418 |
| Foliage 4000 / 8 | 3537 |
| Luksong Tinik on Mababa, crowd off / on | 118 / 139 |

What the numbers say: the pixel ratio is the biggest lever everywhere (the islands cost
about 2× per step); island foliage is next (the grass layers draw over the whole ground);
the 1024 shadow map costs almost nothing on the islands, because island buildings don't
cast shadows below Mataas; the four cheering kids cost about 15% of a minigame frame. A
first try at Katamtaman with 1600 / 4 foliage was 34% slower on the islands than what
phones had, so it went back to 800 / 3.

**Fixed along the way (GPU memory that was never freed):** each minigame's arena, the kids
of each new game, and every HUD portrait stayed in GPU memory; island maps left an
animation loop running (`maps/polish.js`). Before: GPU geometry grew from 1,276 to 3,674
over five minigames, and from 1,096 to 1,465 after visiting all four islands. After: the
same minigame played again holds 1,064 / 799 / 1,064 / 799, and Plaza after all four
islands holds 420 against 467 the first time (Mababa) or 959 against 995 (Katamtaman).

**Not done, and why:**
- *Antialiasing* stays on at every quality: it is fixed when the WebGL context is made,
  and on phone GPUs (tile-based) 4× MSAA is nearly free; switching it would mean a reload.
- *Merging or instancing meshes, fewer outlines:* the kids' outlines double their draw
  calls (838 in Luksong Tinik), but they are the game's look; the crowd switch was the
  cheaper cut. Revisit only if a real phone is held back by draw calls (high fps at pixel
  ratio 1 on Mababa would rule that out).
- *Custom occlusion culling, dynamic resolution:* the open floating islands give occlusion
  little to cull; Three.js already skips what is off screen. Not needed unless the phone
  test shows it.
- *Pausing the 3D in a hidden tab:* browsers already stop animation frames in hidden tabs.

**Draw-call census (F11, Oct 25):** `B3.census()` (`?debug`) on each island's board at the start of a game,
390×844 at 2×. Draw calls / triangles:

| Island | Mababa | Katamtaman | Mataas |
|---|---|---|---|
| Plaza | 343 / 388k | 353 / 491k | 359 / 508k |
| Palengke | 581 / 354k | 576 / 455k | 697 / 481k |
| Aplaya | 387 / 307k | 413 / 410k | 411 / 413k |
| Palayan | 382 / 374k | 379 / 487k | 411 / 560k |

Repeated minigames no longer leave GPU textures behind (the 3D barrio kids' skeleton textures are freed with the
minigame). Details in `docs/F11_HANDOFF.md`.

**How far these numbers go:** software WebGL draws on the CPU, so these are relative
costs between settings, not phone frame rates. They also drift: the same 2D board measured
10.8 fps in one run and 24 fps in another on the same PC, which is why only settings
measured side by side in one page are compared above. **No phone has been measured.** The
F10.1 targets (30 fps on the slowest demo device, 60 fps on a recent phone or iPad) are
still to be checked: open the game with `?perf` on each demo device, play the title, an
island (Palayan has the most triangles) and Luksong Tinik on each Kalidad, and note the
fps and p95 the corner shows.

## Method notes

All of the above were measured headless (Playwright + Chromium, software WebGL where
relevant), not on a phone. Headless timing numbers are a useful regression signal but
don't reflect a real phone's CPU, GPU, or real-world network RTT to a CDN — the
BUILD_PLAN's actual fps targets (60 fps iPad, 30 fps mid-range Android) can only be
confirmed on the real devices once named.

## Changing Kalidad (Oct 25, 2026)

Reported: the first change of Kalidad froze the screen for 5–10 s, then the map loaded.

**Cause (from the code and a timing run in headless Chromium):** every level has its own leaf
cards and grass layers, which are baked into the island's geometry, so any change rebuilds the
island. The old code dropped the island at once (the flat 2D board showed), rebuilt it, and the
first frame of the new island compiled every shader (and the new shadow setting recompiled the
old island's materials too, a second time). In the timing run (Katamtaman → Mataas) that was
2.4 s, then a 12.4 s stall on the first frame; the 2D board showed in between.

**What changed:** the old island stays on screen while the new one is built; the new shadow
setting is applied once, at the swap, so materials are compiled once; shaders are compiled with
`compileAsync` (off the main thread where the browser has `KHR_parallel_shader_compile`), their
links are waited for a few at a time with a frame in between, textures are uploaded in small
batches and one frame is drawn before the island shows, with the 3D view held on its last frame
meanwhile (the 2D overlay and the menus keep going). A build for an older setting stops when the
setting changes again. A chip shows the progress. In the same run the main thread was blocked
for one 1.3 s step (Katamtaman → Mataas) and the 2D board never showed.

**What is left:** the headless browser used for the tests has no `KHR_parallel_shader_compile`,
so there each heavy island shader still takes seconds to link (SwiftShader); that cannot be
measured away here. On a phone the cost depends on its GPU driver: check Mababa ↔ Mataas on the
demo devices (`docs/DEVICES.md`). If it is still slow there, the next step is fewer distinct
shaders per island (shared materials in `maps/`) or keeping the high-quality foliage built and
only hiding it for lower levels.
