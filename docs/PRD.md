# Taympers — Product Requirements (Finals build)

| | |
|---|---|
| Owner | Ian Patrick A. Flores (team lead, frontend) |
| Status | Draft for team review |
| Date | 23 Oct 2026 |
| Covers | The work from the contest entry (Oct 25) to the finals (Nov 26–27, General Santos) |
| Related | [`BUILD_PLAN.md`](BUILD_PLAN.md) (long-term plan after the finals), [`../README.md`](../README.md) |

## 1. Summary

Taympers is a 3D party board game for phones and tablets where every minigame is a
Filipino street game. The prototype works end to end: 4 islands, 5 minigames, bots,
one-device play for up to 4, and a learning layer (Tanong ni Lola, Subukan sa labas,
Pasaporte). Playtest notes say it feels rushed, starts abruptly, and looks like a
prototype. This PRD covers what the team builds for the finals: better pacing, a real
first impression (splash, menu, pre-game visuals), a bigger world of at least 5 islands
that each show a distinct part of Filipino life, an art upgrade, and online play that
works outside Claude.

## 2. Goals and non-goals

### Goals (by the finals)

1. A first-time player understands what is happening on every turn; nothing important
   flashes by faster than they can read it.
2. The first 30 seconds (splash, menu, pre-game) look finished and make the judges want
   to play.
3. The board has at least 5 islands, each recognisably a different Filipino place, built
   with original art.
4. Korona, characters, islands, UI and effects look like one designed game, not
   placeholder shapes.
5. Four phones on the venue network can play one online game, without the Claude room
   service.
6. It runs smoothly on the slowest device the team will demo on, and works without
   internet once loaded.

### Non-goals (before the finals)

- The React/TypeScript rewrite, accounts, parent and teacher tools (see `BUILD_PLAN.md`,
  after the finals).
- New minigames (Piko, Agawan Base, Sungka, Holen stay "SOON" in the Pasaporte).
- App store releases.

## 3. Users and setting

| User | What they need |
|---|---|
| Kids 7–12 (main players) | Big clear buttons, time to read, fun right away, Filipino language |
| Teachers and parents | Proof that the game teaches real street games and leads to outdoor play |
| Contest judges (finals) | A polished 5–10 minute demo, clear originality, working multiplayer |

Demo setting: phones and tablets in a venue with unreliable Wi-Fi, short attention,
noise. Assume someone plays for the first time with no instructions.

## 4. Team and roles

Five people: one frontend developer (also team lead), two backend developers, two
design artists. Ian is the only frontend developer, so everything that is not screen
code is moved to the others.

| Role | Member | Owns |
|---|---|---|
| Team lead + frontend / game dev | Ian Patrick A. Flores | Schedule, scope calls, contest forms; all in-game code: pacing (F1), splash (F2), menu (F3), pre-game visuals (F4), putting islands and art into the game (F5, F6), nickname picker UI (F8), Vercel deploys |
| Backend 1 — Online and multiplayer | _assign_ | Online rooms on our own backend (F7): room service, QR join, reconnect, testing on real phones and the venue network; later the multiplayer server (Build Plan Phase 4) |
| Backend 2 — Data, content and quality | _assign_ | Content files (trivia, island facts, Subukan sa labas) and their expert review (F9); online Hamon ng Araw scores (F9); device and performance testing (F10); the automated tests in `tests/`; later Supabase and game-core (Build Plan Phases 1 and 3) |
| Artist 1 — Characters and effects | _assign_ | The 4 players, 4 Kasama friends and crowd kids; korona; dice; effects (coins, korona buy, landing, confetti); character poses (F6) |
| Artist 2 — World and UI | _assign_ | The islands (F5): landmarks, props, palettes, textures; splash, logo and menu art (F2, F3); pre-game visuals storyboard (F4); space icons; promo images and trailer for the finals |

Shared:

- **Cultural research for each island:** both artists, with Backend 2 for written content.
- **Playtests:** everyone. Ian schedules them; Backend 2 writes the test plan and collects
  notes.

How the team works:

- Every task is a GitHub issue labelled with its feature ID (F1–F10) and owner.
- One weekly build on Vercel (Sunday) that everyone plays on their own phone.
- Artists hand off in `art/` (see section 7); Ian integrates. Backend work lands as pull
  requests that Ian reviews.

## 5. Milestones (proposed; adjust to class schedules)

| Date | Milestone | Done when |
|---|---|---|
| Sun Oct 25 | **Contest entry** | Current build submitted. Only low-risk changes (F1 defaults, if tested) |
| Sun Nov 1 | **Direction locked** | Island list and landmarks approved (F5); character and korona sketches (F6); splash and menu mockups (F2, F3); online room spike works on 2 phones (F7) |
| Sun Nov 8 | **Playtest build 1** | F1, F2, F3 in the game; F4 first version; first kid playtest (5–8 kids) |
| Sun Nov 15 | **World build** | 5 islands playable with blockout art (F5); korona and characters art v1 (F6); online rooms on our backend (F7) |
| Fri Nov 20 | **Content and art complete** | Final art in the game; trivia reviewed (F9); performance pass on the demo devices (F10); playtest 2 |
| Mon Nov 23 | **Finals build freeze** | Bug fixes only; final Vercel deploy; offline copy installed on every demo device |
| Nov 26–27 | **Finals, General Santos** | |

## 6. Features

Priorities: **P0** must ship for the finals, **P1** should ship, **P2** if time allows.

### F1. Pacing: "gameplay is too fast" (P0) — Ian

**Today:** each hop takes 0.27 s; bot turns run 1.35× faster than human turns (2.6× after
a tap); event toasts show for about 1.3 s; a full bot turn can pass before a new player
has read what happened.

**Requirements**

- F1.1 A **Bilis ng laro** setting on the menu (and on the in-game menu): Mabagal, Tama
  (default), Mabilis. Saved on the device.
- F1.2 Tama becomes slower than today: bots move at human speed (1.0×, not 1.35×); hops
  about 0.35 s; Mabagal is about 0.75× of Tama; Mabilis keeps today's speed.
- F1.3 Every event a player must understand (space effect, korona bought, item used,
  Kasama joined, Jack en Poy result) stays on screen for at least 2 s on Tama, or until
  tapped.
- F1.4 A short "landing beat": the camera settles on the space for about 0.4 s before the
  space event starts.
- F1.5 Tap-to-speed-up on bot turns stays, but only after the player has seen the roll.
- F1.6 In the playtest, check whether the minigames also feel too fast (Sipa, Luksong
  Tinik speed curves). Change them only if 3 or more kids struggle with the same game.

**Acceptance**

- On Tama, a bot turn with no shop or minigame takes 5–8 s; a human turn waits for the
  player.
- In playtest 1, at least 8 of 10 kids can say what happened on the last turn when asked.
- The automated tests still pass (they use the debug speed-up, not the setting).

### F2. Splash screen (P0) — Ian (code), Artist 2 (art)

**Requirements**

- F2.1 Shows the Taympers logo and a short line ("Board party ng larong kalye") while the
  game loads: fonts, Three.js, the 3D board.
- F2.2 A loading bar that reflects real progress; never a fake timer.
- F2.3 Ends with **Pindutin para magsimula**. The tap starts the music (browsers block
  audio until the first tap) and opens the menu.
- F2.4 Under 3 s to the tap prompt on a repeat visit; under 8 s on a first visit over 4G.
- F2.5 Team credit line; contest or school logos only if the contest rules allow them.
- F2.6 Respects reduced motion; the logo animation is skipped.

**Acceptance:** cold load on the slowest demo device shows the splash within 1 s and the
tap prompt within 8 s; no blank or white screen at any point.

### F3. Main menu (P0) — Ian (code), Artist 2 (art)

**Today:** title, five buttons, a sound toggle; settings exist only inside a game.

**Requirements**

- F3.1 Clear order: **Ituloy** (only when a save exists), **Maglaro** (biggest), Maglaro
  online, Hamon ng Araw; then Pasaporte, Paano maglaro, Mga karakter, **Settings**.
- F3.2 A Settings screen reachable from the menu: Musika, Tunog, Vibrate, Grapiko 3D/2D,
  Bilis ng laro (F1).
- F3.3 The 3D kids on the plaza behind the menu react: wave when the menu opens, cheer when
  Maglaro is pressed.
- F3.4 The Pasaporte button shows progress (for example "4/10").
- F3.5 Online shows a plain message when rooms are unavailable, before the player taps
  into it.
- F3.6 Fits from 360 px wide phones to desktop, portrait and landscape; every button at
  least 48 px tall; full keyboard path.

**Acceptance:** in playtest, 9 of 10 kids start a game without help; the layout test in
`tests/play.mjs` passes at all four screen sizes.

### F4. Visuals before the game starts (P0) — Ian (code), Artist 2 (storyboard), Artist 1 (poses)

**Today:** after setup, the game jumps straight to the board with a text announcement of
the turn order.

**Requirements**

- F4.1 **Character select:** each human player picks one of the 4 kids, shown in 3D with an
  idle and a cheer pose. Bots take the rest.
- F4.2 **Board flyover:** the camera visits each island with its name banner (about 1.5 s
  per island, 8–10 s total). Skippable with a tap. Shows only on the first game of a
  session and when "Ipakita ang intro" is on.
- F4.3 **Bunutan:** the turn order is drawn on screen with a short animation (for example
  the kids drawing sticks), instead of a text toast.
- F4.4 **Layunin card:** one illustrated card: "Most korona wins. Pass a korona with 10
  piso to buy it."
- F4.5 The sequence never blocks online games longer than the slowest player's tap.

**Acceptance:** from pressing Maglaro to the first roll is at most 25 s with the intro
and at most 5 s with it skipped; every step can be skipped.

### F5. At least 5 islands, each a distinct Filipino place (P0) — Artist 2 (design), Ian (code), Backend 2 (content)

**Today:** 4 islands (Plaza, Palengke, Aplaya, Bukid), 37 spaces, 4 bridges. The code
assumes 4 islands in several places (board path, bridges, trail ribbons), so a fifth
island needs that generalised first.

**Proposed islands** (Artist 2 confirms the final list by Nov 1):

| Island | Shows | Landmark | Props and details |
|---|---|---|---|
| **Kanto** (new) | The street corner: jeepneys and the sari-sari store | Jeepney terminal with a barker's stand | Jeeps with route signs, tricycle, sari-sari store with a hanging tingi rack, a basketball ring on a post |
| **Plaza** | The town centre during fiesta | Kiosko (bandstand) | Banderitas, munisipyo, perya stalls, lechon stand |
| **Palengke** | The wet and dry market | The market hall roof | Fish, fruit and vegetable stalls, weighing scales, baskets |
| **Aplaya** | The coast and fishing life | Bangka and vinta sails | Fish drying racks, nipa huts on stilts, coconut trees |
| **Palayan** | The rice farm | Rice terraces or paddies with a kalabaw | Bahay kubo, scarecrow, sacks of rice, irrigation canal |
| _Optional 6th:_ **Kalye ng Pamana** | Old heritage streets | Bahay na bato | Kalesa, capiz windows, cobblestone path |

**Requirements**

- F5.1 At least 5 islands joined by bridges in one loop. Board length goal: a 5-round
  game still ends in 20–30 minutes on Tama (F1).
- F5.2 Each island has a name banner, one landmark readable from the overview camera, its
  own ground texture and colour palette, and 3 or more themed props.
- F5.3 Space types are spread so every island has at least one good space (Piso, Swerte,
  Kasama or Tanong) and korona can sit on every island.
- F5.4 Each island adds 2 Tanong ni Lola questions about its place (written by Backend 2,
  reviewed under F9).
- F5.5 P2: one island-themed space per island (for example, at Kanto: "Sumakay ng jeep",
  pay 2 piso to ride to the next island). Only after F5.1–F5.4 are done and balanced in the
  bot simulations.
- F5.6 The 2D fallback still works; it may use simpler art for the new islands.
- F5.7 Cultural accuracy: each island is checked against at least 2 references, and by a
  teacher or someone from that region where possible. No sacred or ceremonial items used
  as decoration. No regional or ethnic stereotypes.

**Acceptance:** all islands are visible in the map view on a 360 px phone; the bot
simulation (30 games) shows no island where korona never appear; average game length
stays within F5.1.

### F6. Art upgrade: korona, characters, maps, graphics, effects (P0) — Artist 1, Artist 2, Ian

**Today:** all art is drawn in code (Three.js shapes, canvas textures) in a toon style with
dark outlines.

**Scope by asset**

| Asset | Owner | P0 | P1 |
|---|---|---|---|
| Korona | Artist 1 | New design with gems and a clear silhouette; buy and fly animation | Korona variants for the bonus korona |
| Player kids (Jun, Neneng, Totoy, Bunso) | Artist 1 | Turnarounds (front, side, back), outfits that read as distinct at small size, faces with 4 expressions | Unique idle and victory poses |
| Kasama friends (Lito, Mayumi, Boyet, Dodong) and crowd kids | Artist 1 | Same style as the players, visibly smaller | — |
| Dice block, coins, items (Dobleng dice, Kendi, Gintong dice, Agimat) | Artist 1 | Icons and 3D look | — |
| Effects | Artist 1 | Coin burst, korona buy, landing dust, Swerte sparkle, Utang loss, confetti | Island ambience (birds, waves, smoke) |
| Islands and bridges | Artist 2 | Per F5 | Water and cloud pass |
| Space tiles | Artist 2 | 9 icons readable at 24 px; distinct by shape as well as colour | — |
| UI | Artist 2 | Logo, splash, menu, buttons, cards, HUD icons in the existing paper-and-outline style | Animated logo |

**Requirements**

- F6.1 Follow the art direction in section 7. All art is original; record every asset in
  the asset log (section 7.4).
- F6.2 No performance regression (F10).
- F6.3 Decision D1 (section 10) picks how 3D art gets into the game.

**Acceptance:** a side-by-side of before and after for every row above, approved by the
team; F10 targets still met.

### F7. Online rooms on our own backend (P0 if online is demoed, else P1) — Backend 1

**Today:** online rooms only work inside the Claude artifact. On Vercel, "Maglaro online"
says it is unavailable.

**Requirements**

- F7.1 A room service the team controls. Recommended: Supabase Realtime broadcast and
  presence (free tier). The game already needs only one object with `join`, `peers`,
  `onPeers`, `presence` and `leave` (see `tests/mock-room.js`), so the game logic does not
  change.
- F7.2 Host creates a room; others join by QR or 4-letter code; up to 4 players; bots fill
  empty seats.
- F7.3 A player who drops can rejoin within 60 s; after that a bot takes the seat (bot
  takeover already works).
- F7.4 Only the public anon key in the client; no secrets in the repo.
- F7.5 Nicknames only (F8); no chat.

**Acceptance:** 4 phones on different networks (mobile data and Wi-Fi) finish a 5-round
game with one forced disconnect and rejoin; `tests/online.mjs` passes with a stand-in for
the new service.

### F8. Nickname picker and privacy (P0) — Ian (UI), Backend 2 (word lists)

**Today:** players type a name. The build plan's privacy rule says kids never type free
text.

**Requirements**

- F8.1 Replace the name field with a picker: an adjective + a noun in Filipino (for
  example "Masipag na Kalabaw"), rerollable, from reviewed word lists.
- F8.2 The same picker for online rooms.
- F8.3 Nothing personal is stored; everything stays on the device unless F9 is on.

**Acceptance:** there is no text input for names anywhere; the word lists are reviewed by
2 team members for words that could offend.

### F9. Content and online daily scores (P1) — Backend 2

- F9.1 Move trivia, real-street rules, Subukan sa labas and island facts into one content
  file per language (Filipino now, English P2), so writers do not edit game code.
- F9.2 Every fact is reviewed by a PE teacher or cultural expert; keep the reviewer's name
  and date in the file.
- F9.3 P1: Hamon ng Araw scores online (nickname + score only), on Supabase with Row Level
  Security.

**Acceptance:** content changes ship without touching `index.html` logic; review log
complete for all content before the build freeze.

### F10. Performance, offline and demo readiness (P0) — Backend 2 (testing), Ian (fixes)

- F10.1 Name the demo devices by Nov 1, including the slowest one. Target: 30 fps or better
  on the slowest, 60 fps on a recent phone or iPad.
- F10.2 Total download under 15 MB; first load under 8 s on 4G.
- F10.3 Works with no internet after the first load: self-host the fonts and cache the game
  (offline mode, P0 for the demo).
- F10.4 A quality setting (shadows, pixel ratio) if the slowest device misses 30 fps; the
  2D graphics option stays as the last fallback.
- F10.5 Weekly test on every demo device; results in a shared sheet.

**Acceptance:** a 5-round game on each demo device with no crash and no frame-rate drops
below target in the board or any minigame.

## 7. Art direction and asset pipeline

### 7.1 Keep the current look

- Warm paper cards, thick dark-brown outlines (`#3B2316`), Bagel Fat One for titles,
  Nunito for text, banig stripes as accents.
- Toon shading with 3 light steps, outlined 3D shapes, chunky readable silhouettes.
- Daytime sky (sky blue to warm sand), one sun direction for all islands.
- Status is never shown by colour alone: icons and shapes too.

### 7.2 Hand-off format

| Asset type | Format | Size or budget |
|---|---|---|
| Concept art, turnarounds, palettes | PNG in `art/concepts/`, with hex colour codes | — |
| UI art, icons, logo | SVG (preferred) or PNG at 2× | Icons on a 48 px grid |
| Textures (ground, wood, thatch, fabric) | Tileable PNG | 256 or 512 px |
| 3D models (if D1 picks models) | `.glb`, origin at the feet, 1 unit = 1 cm | Kid ≤ 3,000 triangles; korona ≤ 1,500; island ≤ 10,000 |

File names: `island-kanto-landmark.glb`, `char-neneng-front.png`, lower case with dashes.

### 7.3 Workflow

1. Sketch → team review (Sunday build call) → final.
2. Artists commit to `art/`; Ian integrates and posts a screenshot on the issue.
3. Each asset is checked on the slowest demo device before it is called done.

### 7.4 Asset and AI-use log

Every asset gets a row in `DEVLOG.md`: who made it, the tools used, and whether AI was
used, for the contest's asset and AI usage disclosure form. Only original art or assets
with a licence that allows use; no art taken from other games.

## 8. Success metrics (finals)

| Metric | Target |
|---|---|
| Kids who finish a 3-round game without adult help | 8 of 10 |
| Kids who can explain what happened on the last turn | 8 of 10 |
| Kids who can name the real rules of 2 games after playing | 7 of 10 |
| Frame rate on the slowest demo device | 30 fps or better |
| Online game on 4 phones at the venue | Finishes with no desync |
| Crashes during a 30-minute session | 0 |

## 9. Risks

| Risk | Mitigation |
|---|---|
| One frontend developer is the bottleneck | Backend and artists own everything that is not screen code; Ian reviews instead of building content; weekly scope check |
| 5+ islands make games too long | Shorter islands or fewer spaces per island; check game length in the bot simulation |
| New art slows the game on cheap devices | Budgets in section 7.2; test every asset on the slowest device; 2D fallback |
| Venue internet fails | Offline mode (F10.3); online play over a phone hotspot as a backup |
| Cultural mistakes in island art or content | Reviews in F5.7 and F9.2 |
| The contest entry deadline (Oct 25) is too close for these changes | Submit the current build; all of this is finals work |

## 10. Open decisions

| ID | Decision | Recommendation | Decide by |
|---|---|---|---|
| D1 | How 3D art gets into the game: artists draw concepts and Ian builds them in code, or artists make `.glb` models and the game loads them | Try one `.glb` (the korona) as a test by Nov 1; if it loads fast and runs on the slowest device, use models for korona and characters; keep islands in code with painted textures | Nov 1 |
| D2 | Final island list (5 or 6) | 5 islands from the table in F5; the 6th only if F5 is on track by Nov 15 | Nov 1 |
| D3 | Online room service | Supabase Realtime (free tier, also needed later for accounts) | Nov 1 |
| D4 | Contest or school logos on the splash | Only if the contest rules allow; otherwise team name only | Nov 8 |

## 11. Current state (for reference)

- Single file `index.html` plus `vendor/` (Three.js r149, QR library); deploys on Vercel
  and GitHub Pages.
- 4 islands, 37 spaces, 9 space types, 4 items, 5 minigames, bots in 3 levels, Party,
  Torneo, Hamon ng Araw, Pagsasanay, local save and resume.
- 3D board and minigames with a 2D fallback and a 3D/2D setting.
- Automated play-tests in `tests/` (play, minigames, online stand-in, 3D).
