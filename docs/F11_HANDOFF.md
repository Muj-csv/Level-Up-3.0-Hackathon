# F11 release readiness: stages C, D, E

Stages A and B were merged as #30 and #32, and the work started for C, D and E as #31 (work in progress).
Branch `Taympers/f11-stage-c-e` finishes C, D and E: it measures what #31 left open, fixes what the
measurements found, and fixes the splash screen. Real-device frame rates are the one item left for the team
(see the end).

## C. Graphics presets, performance, map readability

Built in #31 (unchanged here): Kalidad only (the 2D/3D choice is gone; an old `g3d:false` becomes Mababa),
the `maps/living.js` grass and water fix, palms kept off the board on Aplaya and Palayan, kids sharing a space
spread apart, map kids at scale 1.3, the dice above the kid's head, the landscape tip box at the lower left, and
`B3.census()` (debug only).

**Draw-call census after the changes** (`B3.census()` on each island's board at the start of a game, 390×844 at
2×, software WebGL; the counts do not depend on the GPU). #31 measured Mataas on the Plaza at 780 → 429 calls and
475k → 299k triangles at its own view, so those are not directly comparable with the start-of-game view here.

| Island | Mababa: calls / triangles | Katamtaman | Mataas | Shadow casters (Mababa / Katamtaman / Mataas) |
|---|---|---|---|---|
| Plaza | 343 / 388k | 353 / 491k | 359 / 508k | 413 / 413 / 819 |
| Palengke | 581 / 354k | 576 / 455k | 697 / 481k | 405 / 405 / 1108 |
| Aplaya | 387 / 307k | 413 / 410k | 411 / 413k | 410 / 410 / 857 |
| Palayan | 382 / 374k | 379 / 487k | 411 / 560k | 444 / 444 / 921 |

Palengke draws the most (its market stalls), and Mataas about doubles the shadow casters (the island's buildings
and trees cast shadows only there). The census's "without the shadow pass" figure came out the same as with it,
so `renderer.info` does not count that pass there; it is left out.

**Menu sweep** at 360×740, 390×844, 844×390 and 1440×900 (title, setup, map screen, online, Hamon and
Pagsasanay, guide, Pasaporte, gallery, the board before and after a roll, the pause menu), on the flat board:
sideways scroll, buttons off screen or under 44 px, clipped text, overlapping HUD pieces, plus a screenshot of
each. The same sweep on the 3D board was not run.

- **Fixed: the pause menu ran past the screen on phones.** Its overlay is `class="modal top"`, and the HUD's
  `.top` rule (a centred column) also applied to it, so the card did not shrink: 400 px on a 390 px phone, which
  zooms the whole page out and lets it scroll sideways. On every phone width since the Oct 22 prototype;
  `.modal.top` now keeps the overlay's own layout.
- Everything else passed (the 44 px check waits for the cards' opening animation, as `tests/play.mjs` does).
- Seen, not changed: on the flat board (the fallback without 3D) in landscape, the tip box covers the start
  space where the kids stand until the first roll. The 3D board frames it differently.

**Map-screen pictures** re-rendered (`node tools/world-render.mjs`): `world.jpg`, `aplaya.jpg` and `palayan.jpg`
(where the palms moved), and the island boxes in `WORLD`, which moved by at most 0.0005. The Plaza and Palengke
close-ups did not change.

**Fixed: GPU textures piled up over repeated minigames** (`tests/quality.mjs` failed on `main`: textures
57 → 61 → 69 → 73 over four minigames). Each 3D barrio kid built for a minigame or a Kasama has a skeleton, and
a skeleton holds a bone texture that only `skeleton.dispose()` frees; `freeTree` now disposes them (not the
players' kids, which are kept and reused). Now 57 → 53 → 57 → 53.

**Main menu frame times** (Katamtaman, the default; Chrome on an NVIDIA RTX 3050 desktop, 390×844 at 2×, the first
2.5 s after the splash): a median of 10 ms with the CPU at full speed, and 30 ms (p95 80 ms) with the CPU slowed 4×,
which stands in roughly for a phone's CPU. The menu's own cost per frame, not the splash: on a slow phone it is
the screen most likely to drop below 30 fps, so measure it first there. Per-Kalidad menu numbers were not taken.

## D. Economy

Built in #31 (unchanged here): rides that can be taken when stopping on or passing the stop, korona placed in reach
of Simula and past the ride, fewer free piso spaces, `maps/boards.js` written by `tools/boards-export.mjs`
(`--check` passes), and `startLocal({ seed })` for bot simulations (debug only).

**30 seeded bot games per island** (4 Sakto bots, 5 rounds, the game's own rules on the flat board; the same seed
gives the same game):

| Island | Korona bought per game | Bonus share of all korona | Rides per game | Landings on piso spaces |
|---|---|---|---|---|
| Plaza | 4.5 (3–7) | 44% | 1.2 (0–2) | 25% |
| Palengke | 4.9 (3–7) | 40% | 0.3 (0–2) | 35% |
| Aplaya | 5.9 (3–8) | 36% | 1.0 (0–3) | 29% |
| Palayan | 5.0 (3–7) | 42% | 1.3 (0–3) | 29% |
| Before #31 | 2.0–3.0 | 53–63% | about 0 | 44–61% |

All 120 games finished, every korona was accounted for (bought + bonus), and every game had at least 3 bought. 96 of the
115 rides were taken while passing the stop.

**For the team: Palengke's ride is rarely worth it.** Its stop (M15) is 2 steps before a korona spot (M17) and 5
before the fork into the middle aisle (M20 → M60), which already holds two korona spots, so the ride to M65 seldom
brings a kid 3 or more steps nearer a korona, which is what a bot waits for. Moving the stop earlier (or the far
stop) would change that; it is a board change (the island file, then `node tools/boards-export.mjs`), so it is
left for the team to decide.

## E. Docs

README (splash), `tests/README.md` (the new splash checks), `docs/F10_PERFORMANCE.md` (census) and this file.

## Splash screen

The splash stuttered and its art did not finish. Measured with `?debug&splash` in Chrome on this PC: before the
first tap the page drew 56 frames in 11 s, with freezes of up to 2.9 s. The main menu's Plaza was built in blocks
of 1–2 s while the kids were due to hop in, and their entrance runs on the clock, so they appeared already
standing; the board's 3D was set up during the logo; and the menu's scene was drawn every frame under the splash,
where its frame pump also lowered its resolution.

Now, in order:

1. The logo and tagline come in while fonts and Three.js load.
2. The four kids are built and their shaders compiled (`prepare()` in `kids/hero.js`).
3. **The entrance plays on its own:** the kids hop onto their tiles, Neneng waves, the path, piko and sipa draw
   in (about 4.7 s). Only the menu's files are fetched meanwhile.
4. The board's 3D, the sound device and the Plaza are built while the kids idle. A stall now pauses the kids'
   animation instead of skipping it.
5. The menu's scene is laid out and its first frame drawn, but it only starts at the tap, so the menu opens on
   that frame at full resolution, with no work left at the tap.

| Chrome, RTX 3050 | Before | After |
|---|---|---|
| Frames before "Pindutin", CPU 1× | 56 in 11.1 s | 523 in 12.9 s |
| The entrance (kids, wave, art), CPU 1× | frozen; the hop skipped | 476 frames, worst 70 ms |
| The first 2.5 s after the tap, CPU 1× | a 190 ms hitch | worst frame 20 ms |
| "Pindutin" shows, CPU 4× | 15.3 s | 20.9 s |

The splash takes about 2 s longer (about 5 s with the CPU slowed 4×), because the entrance no longer shares its
time with the loading. These were measured just before the last change (the kids' build now also waits until the
logo and tagline are in, at most 0.6 s later on a fast machine and no later on a slow one). `tests/3d.mjs` checks that nothing heavy is built during the entrance and that the art has
drawn in fully when "Pindutin" shows.

## Tests

`tests/3d.mjs` "the save at the start of a turn includes Kasama allies" (listed in #31 as failing sometimes): it
passed in every run here (on `main`, on this branch alone and with `tests/quality.mjs` running next to it), so the
failure did not come back. The wait was 300 clicks of 150 ms; under software WebGL the game's time slows with the
frame rate, and a minigame before the next turn can take longer than that. It now waits up to 4 minutes, and a
miss says where the game was (round, turn, minigame, card).

**Full suite on `main` before this branch** (one suite at a time): `play` 93/93, `minigames` 61/61, `online` 11/11,
`online-mg` 22/22, `3d` 42/42, `hamon-online` 6/6, `quality` 29/30 (the texture check above), `rejoin` 10/10.

**On this branch:** `play` 93/93, `online` 11/11, `online-mg` 22/22, `hamon-online` 6/6, `quality` 30/30; `3d`
44/44 and `quality` 30/30 again with the two running side by side. The results of `minigames`, `rejoin` and a
second `3d` run are in the pull request. Running all eight suites at once on one PC (12 threads) overloads software WebGL and makes them
time out, so run at most about three at a time, with one 3D suite (`3d` or `quality`) among them.

## Left for the team

- **Frame rates on real phones and tablets** (`docs/DEVICES.md`): never measured. Open `?perf` on each demo device,
  on each Kalidad. The CPU-slowed numbers above suggest the main menu is the place to look first.
- Palengke's ride stop (above).
