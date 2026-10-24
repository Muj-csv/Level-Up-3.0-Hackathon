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

Current code already caps pixel ratio at 2 and enables soft shadows unconditionally
(`ren.setPixelRatio(Math.min(2, devicePixelRatio))`, `ren.shadowMap.type =
PCFSoftShadowMap`, around `index.html`'s `init3D()`). There's no tiered quality setting
yet (e.g. disable shadows / drop pixel ratio further on a device that misses 30 fps) —
only the coarse 3D/2D toggle (`Grapiko`), which F10.4 explicitly keeps as the last
fallback. Per the PRD, this setting is only needed "if the slowest device misses 30
fps," so it's deliberately not built yet — there's no fps data to justify it until a
real device is named and measured (see `docs/DEVICES.md`). Revisit once that
measurement exists.

## Method notes

All of the above were measured headless (Playwright + Chromium, software WebGL where
relevant), not on a phone. Headless timing numbers are a useful regression signal but
don't reflect a real phone's CPU, GPU, or real-world network RTT to a CDN — the
BUILD_PLAN's actual fps targets (60 fps iPad, 30 fps mid-range Android) can only be
confirmed on the real devices once named.
