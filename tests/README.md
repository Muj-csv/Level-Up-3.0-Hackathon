# Play-tests

Automated tests that open the real `index.html` in headless Chromium and play it.
They need Node 18+ and Playwright:

```bash
npm install
npx playwright install chromium
npm test
```

| File | What it checks |
|---|---|
| `play.mjs` | Loads at phone, landscape phone, tablet and desktop sizes; every title button; the map screen (four islands, arrow keys, zoom and close-up, Balik, starting on the picked island); a full Party match (every korona accounted for, winner and tie-break, 4 turns per round, save cleared); a Torneo match (korona = minigame wins); the daily challenge record; bot decisions per difficulty; save, reload and resume; three quick quit-and-restarts; five resizes mid-game with reduced motion; downloads; HTML in names; four Taguan strips on a 360 px phone (each tall enough to read, none overlapping). |
| `minigames.mjs` | Starts each street game from Pagsasanay and plays it with a scripted player that reacts within one frame, plus button-mashers and a runner that ignores the guards. Timing must beat mashing, and dodging must beat running straight. Pukpok Palayok: a player that counts the steps averages 20 points or more over three games, swinging at once or never swinging scores 0, and the bots stay inside their level's range. Taguan: a player that taps only on a kid's clue finds 8 or more of 10 and beats tapping every spot, and the bots stay inside their level's range. Piko: a player that reads the court and presses or holds the button scores at least twice a random presser, the bots stay inside their level's range, and the hold input lets go of a held key when the window loses focus or the tab is hidden, tracks each finger on its own, and presses and releases on the action button. |
| `3d.mjs` | The 3D build through software WebGL: title and the cloud board in 3D, reach rings, an island map picked on the map screen (loading card, island drawn in 3D, a ring on every reachable space on both paths of a fork, four korona), screen-to-board mapping, the Kalidad setting (three choices, 3D on every one, an old 2D choice read as Mababa), the 3D Mga Bata gallery and the result picture, slow-loading kids (flat board and drawn portraits first, then 3D), the splash (the kids' entrance and the art play with nothing heavy built next to them, the art has drawn in fully when "Pindutin" shows, and the tap opens the live menu), save and resume with Kasama allies (it waits up to 4 minutes for the next save and says where the game was if none comes), every minigame's 3D arena played to its result, and the flat-board fallback when Three.js cannot load (no graphics settings shown). Screenshots go to `test-results/3d-*.png`. |
| `online.mjs` | A host and a guest play a full online match through `mock-room.js`, must agree on every korona and piso, follow each other into a rematch, and the host must finish with a bot in the guest's seat after the guest leaves. `npm test` runs it as `online.mjs en`: the guest reads English (`?lang=en`) and the host Filipino, and both must still agree. |
| `online-mg.mjs` | The new minigames online (new-minigames PRD, D3), through `mock-room.js`: a phone on another build is told to reload and is never seated, a phone on the same build joins; then for each new minigame two phones play a 3-game Torneo of it (`?debug&mg=<key>`) with scripted players and must log the same scores and show the same total in every lane. `node tests/online-mg.mjs live [game]` runs the same checks against the real Supabase project instead of the mock room (needs internet) — the D3 "real-phone Supabase check" from a laptop; it still does not replace an actual multi-phone test on the venue network. |
| `regress.mjs` | The playtest bug reports of Oct 25, 2026: the island camera never aims past the island's edge and stays on the kid while a roll is previewed; Torneo and Hamon ng Araw show an island, and an older Torneo save resumes on it; the loading bar sweeps while the island is prepared (not with reduced motion) and the HUD portraits are redrawn in 3D once it is ready; in the Pasaporte a double tap keeps a gold stamp and removing it asks first. |
| `quality.mjs` | The graphics quality (Kalidad: Mababa / Katamtaman / Mataas) in the pause menu: saved next to the other settings without changing them, old and broken saved settings (an old `g3d:false` becomes Mababa unless a quality was saved), each quality's pixel ratio and shadows on the title, board and a minigame, changing it mid-game, an island built again for a new quality, and no GPU memory piling up over repeated minigames. |
| `content.mjs` | No browser. `content/en.json` has every id and key of `content/fil.json` and nothing else, in the same order; same number of answers and 3 rules per game; every protected term (`content/terms.json`) in a Filipino entry is in its English twin, spelled the same. |
| `lang.mjs` | The Filipino / English switch: Filipino by default; the title's Wika button and the menu's Wika row change the cards and save `lang` without touching the other settings; reload keeps it; `?lang=en` opens English without saving; `<html lang>` follows; a missing English entry or a missing `en.json` falls back to Filipino. |
| `offline.mjs` | Offline play (F10): `sw.js` lists every deployed game file and `vercel.json` serves it with `no-cache`; plain `?debug` pages get no worker (the other tests block files on purpose); then, with `?debug&sw`, the worker saves all the game files, a stale saved `index.html` is replaced by the server's at once, and with the server shut down the game reloads and starts on an island never opened before, in 3D, with no failed file. |
| `perf.mjs` | Not part of `npm test` (it takes about 15 minutes per quality). Benchmarks the title, the four islands, every minigame and the flat board at one screen size through the game's `?perf` readout: `npm run perf -- <label> low,mid,high`. Results in `test-results/perf-<label>.json`. Software WebGL draws on the CPU, so it compares settings with each other, not phone frame rates. |

## Flat board and 3D

The game loads its bundled Three.js from `vendor/three-r184/`. `play.mjs`, `minigames.mjs` and
`online.mjs` block those files, so they always test the flat fallback board (the game logic
is the same in both); `3d.mjs` lets it load. Chromium is started with SwiftShader so WebGL works without
a GPU; software WebGL is slow, so `3d.mjs` takes a few minutes and its frame times say
nothing about real phones.

## How the tests reach inside the game

Opening the game with `?debug` turns on a small test hook (`window.__lsu`): an event
log (rolls, landings, purchases, minigame scores, final standings), a speed-up
(`&speed=N` runs N simulation steps per frame), and read-only views of each
minigame. Without `?debug` the hook does nothing.

## About the online test

`mock-room.js` stands in for the Claude artifact room service with the same
interface the game uses (join, peers, presence, leave), passing messages between
browser tabs. It proves the game's own sync logic, not the real service: it has
no network latency, rate limits or sign-in. Online play still has to be tried on
real phones inside Claude before the event.
