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
| `play.mjs` | Loads at phone, landscape phone, tablet and desktop sizes; every title button; the map screen (four islands, arrow keys, zoom and close-up, Balik, starting on the picked island); a full Party match (every korona accounted for, winner and tie-break, 4 turns per round, save cleared); a Torneo match (korona = minigame wins); the daily challenge record; bot decisions per difficulty; save, reload and resume; three quick quit-and-restarts; five resizes mid-game with reduced motion; downloads; HTML in names. |
| `minigames.mjs` | Starts each street game from Pagsasanay and plays it with a scripted player that reacts within one frame, plus button-mashers and a runner that ignores the guards. Timing must beat mashing, and dodging must beat running straight. |
| `3d.mjs` | The 3D build through software WebGL: title and the cloud board in 3D, reach rings, an island map picked on the map screen (loading card, island drawn in 3D, a ring on every reachable space on both paths of a fork, four korona), screen-to-board mapping, the Grapiko 3D/2D setting, save and resume with Kasama allies, every minigame's 3D arena played to its result, the 2D fallback when Three.js cannot load, the 3D Mga Bata gallery (built and freed), the result picture drawn with the 3D kids, and a slow `kids/kids.js` (the board waits on the 2D board with the kids' pictures, then switches to 3D). Screenshots go to `test-results/3d-*.png`. |
| `online.mjs` | A host and a guest play a full online match through `mock-room.js`, must agree on every korona and piso, follow each other into a rematch, and the host must finish with a bot in the guest's seat after the guest leaves. |
| `quality.mjs` | The graphics quality (Kalidad: Mababa / Katamtaman / Mataas) in the pause menu: saved next to the other settings without changing them or the 3D/2D choice, old and broken saved settings, each quality's pixel ratio and shadows on the title, board and a minigame, changing it mid-game, an island built again for a new quality, and no GPU memory piling up over repeated minigames. |
| `perf.mjs` | Not part of `npm test` (it takes about 15 minutes per quality). Benchmarks the title, the four islands, every minigame and the 2D board at one screen size through the game's `?perf` readout: `npm run perf -- <label> low,mid,high`. Results in `test-results/perf-<label>.json`. Software WebGL draws on the CPU, so it compares settings with each other, not phone frame rates. |

## 2D and 3D

The game loads its bundled Three.js from `vendor/three-r184/`. `play.mjs`, `minigames.mjs` and
`online.mjs` block those files, so they always test the 2D board (the game logic is the
same in both); `3d.mjs` lets it load. Chromium is started with SwiftShader so WebGL works without
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
