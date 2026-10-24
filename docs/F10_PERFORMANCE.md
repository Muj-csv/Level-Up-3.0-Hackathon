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

**Still open:** (2) — there's still no way to play with no internet after the first
load. That needs an actual caching strategy (a service worker with an install/cache
step, or `vite-plugin-pwa`-equivalent for a single-file app — whatever Ian picks for
F2's loading bar should account for this, since F2.2 already needs to track real asset
load progress). This is a bigger decision than a content/test fix, so flagging it here
rather than building it: **F10.3's offline-after-first-load requirement is not met
yet.** Recommend Ian scope it alongside F2 (splash/loading), since both need to agree on
what "loaded" means and what gets cached.

## F10.4 — quality setting (shadows, pixel ratio)

*Oct 24, 2026 (Jace, branch `jace/f10-quality`). Built ahead of the device measurement on
purpose, so the team has the knob ready when the slowest demo phone is named; the values
below should be checked on that phone.*

**What was there before:** one hidden rule (`LOW3`: a touch screen or a screen under
700 px) gave phones lighter islands (pixel ratio 1.5 on the island board, no island
shadows, 1024 shadow map, 800 leaf cards, 3 grass layers). Title and minigames still drew
at pixel ratio 2 with a 2048 shadow map on every device.

**What is there now:** **Kalidad** in the pause menu (Mababa / Katamtaman / Mataas), saved
in `lsu-prefs` as `gq`, separate from Grapiko 3D/2D. One table (`GQ` in `index.html`) sets
every 3D screen: title, board, islands and minigames. Katamtaman is the default for every
device (no touch-screen guess any more). The title's 3D kids (`kids/hero.js`, own renderer) take the
quality's pixel ratio when they are made at start-up, and the players' 3D kids (`kids/`) are
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
background while the 2D board shows, and the game is not touched.

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
