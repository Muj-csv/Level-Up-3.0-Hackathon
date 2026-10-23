# Taympers

*Ang mga laro sa kalye, nasa ulap na.*

"Taym pers!" is what kids shout to pause a game on the street. In Taympers, the street
games themselves are the game.

A party board game for 1 to 4 players built on Filipino street games, made for the
**Level Up 3.0 Esports Game Dev Challenge** (Student Category). It covers two official
themes: **Philippine Games and Sports**, and **Board Games / Brain Games**.

Four barrio kids race across four floating islands (Plaza, Palengke, Aplaya, Bukid),
collect piso, buy korona (crowns), and play a street-game minigame after every round:
Tumbang Preso, Patintero, Sipa, Palosebo and Luksong Tinik.

The game is now **3D**: the board, the kids and every minigame arena are drawn with
Three.js. When WebGL or Three.js is not available, it falls back to the original 2D
canvas board, and players can pick 2D in the menu (see Controls and settings).

## Play it

The game is `index.html` plus two libraries in `vendor/` (Three.js and a QR code
generator). There is no build step and nothing to install.

- **Online:** https://muj-csv.github.io/Level-Up-3.0-Hackathon/ (GitHub Pages, built from
  the `main` branch), or the team's Vercel address once it is set up (below).
- **Quickest:** open `index.html` in a phone or computer browser.
- **Local server** (needed on some browsers for clipboard and sharing):
  ```bash
  python3 -m http.server 8000
  # then open http://localhost:8000
  ```
- **GitHub Pages:** every push to `main` republishes the site (Settings → Pages →
  Deploy from a branch → `main` / root). `.nojekyll` makes Pages serve the files as-is.
- **itch.io:** zip `index.html` with the `vendor/` folder and mark it "This file will be
  played in the browser".

The only thing loaded from the internet is Google Fonts (Bagel Fat One, Nunito). Without
a connection the game uses fallback fonts.

### Deploy on Vercel

The repo is ready to import as is:

1. On vercel.com, **Add New → Project**, and import `Muj-csv/Level-Up-3.0-Hackathon`.
2. Leave every setting as Vercel shows it (`vercel.json` sets them: no framework, no
   install, no build, output is the repo root) and press **Deploy**.
3. Every push to `main` then redeploys; pushes to other branches get preview links.

What gets deployed: only `index.html` and `vendor/` (`.vercelignore` leaves out the
tests, docs and `package.json`, so Vercel never installs the test tools). `vercel.json`
caches `vendor/` for a year (the version is in each file name) and adds basic security
headers. The settings were checked with `vercel build` (Vercel CLI 65).

## Modes

| Mode | What it is |
|---|---|
| **Maglaro: Party** | The full board game: dice, piso, items, korona, a minigame every round. 3, 5 or 8 rounds. |
| **Maglaro: Torneo** | No dice. Minigames only; every win is a korona. Skill decides. |
| **Hamon ng Araw** | Solo daily challenge against hard bots: the same game and bots for everyone that day. Scores are kept on this device. **Pagsasanay** lets you practise any minigame. |
| **One device** | Up to 4 people share one phone or computer; bots fill empty seats. |
| **Maglaro online** | Host makes a room; friends join by QR code or a 4-letter code. See the limitation below. |

Bots come in three levels. **Madali** bots use items at once and play minigames loosely.
**Sakto** and **Mahirap** bots save items for a korona they can afford, keep 10 piso in
reserve when shopping, and pick their Jack en Poy rivals (Mahirap goes after the leader).

## Rules in short

- **Goal:** most korona at the end; piso break ties. Turn order is drawn at the start.
- **Your turn:** roll 1 to 10. Spaces you can reach get a ring, and each korona shows how
  many steps away it is. Pass a korona with 10 piso to buy it; it then moves.
- **Spaces:** Piso +3, Utang −3, Swerte (bonus piso or a free item), Tikbalang (back 3),
  Sari-sari (shop; you may also shop when you walk past with empty hands), Jack en Poy
  (pick any rival, winner takes up to 5 piso), **Kasama** (a friend joins you and adds 1 or
  2 steps to every roll; up to 2), **Tanong ni Lola** (a question about Filipino games,
  +5 piso if right).
- **Items** (carry one): Dobleng dice 5 (two dice), Kendi 3 (+3 steps), Gintong dice 8
  (pick your number), Agimat 4 (blocks the next Utang, Tikbalang or Jack en Poy loss).
- **Minigames:** +10 / +5 / +3 piso for 1st / 2nd / 3rd. Last round (**Huling Hirit**):
  double prizes and help for the player in last place.
- **Bonus korona at the end:** Hari ng Laro (most minigame wins), Mayaman (most piso),
  Malas sa Dice (lowest average roll).
- **Pasaporte ng Laro** (title screen): a stamp for each street game played in the app,
  and a gold stamp when you tick that you played it for real outside. Each result card
  says how to play the game outside ("Subukan sa labas"). Kept on the device.

## Controls and settings

- Touch: tap the big button (or the board) to roll; minigames say their controls before
  they start. Several people on one device each get a lane and a key (A, F, J, L).
- Keyboard: Space or Enter to act, M for the map, Esc for the menu, arrows/WASD in
  Patintero. Tab moves between buttons; dialogs keep focus inside and close with Esc.
- The **menu** (pause button) pauses local games and holds Musika, Tunog and Vibrate
  switches, **Grapiko 3D / 2D** (kept on the device), How to Play, and Umalis sa laro.
  Pick 2D on slow phones; the 3D option only shows when the device can draw 3D.
- Local games save at the start of every turn. If the page closes, **Ituloy ang laro**
  on the title screen picks up where you were.
- Reduced-motion settings are respected (no screen shake, sway or long wipes).

### Known limitation: 3D on real phones

The 3D board has been tested in headless Chromium with software WebGL (SwiftShader), not
yet on real phones. Before the event, try it on the slowest phone the team expects; if it
stutters, switch **Grapiko** to 2D in the menu.

### Known limitation: online rooms

Online rooms use the room service of the Claude artifact the prototype was built in
(`window.claude.use('room')`). They work only when the game is opened as that Claude
artifact by signed-in, invited users. On any other host (Vercel, GitHub Pages, itch.io, a
local file), **Maglaro online** says that online play is unavailable here and offers a
game on one device instead. Moving rooms to a free service the team controls (for example
Supabase Realtime or PeerJS) is on the to-do list before finals; the game only needs an
object with the same `join / peers / onPeers / presence / leave` shape
(see `tests/mock-room.js`).

## Tests

`npm install && npx playwright install chromium && npm test` plays the game in headless
Chromium: screen sizes, every button, full matches with score bookkeeping checks, bots per
difficulty, save/resume, minigames against scripted players, a two-device online match,
and the 3D board and minigame arenas (software WebGL).
Details in [`tests/README.md`](tests/README.md).

## Credits and licences

| Item | Use | Licence |
|---|---|---|
| Bagel Fat One, Nunito (Google Fonts) | Title and UI type | SIL Open Font License 1.1 |
| qrcode-generator 1.4.4 by Kazuhiko Arase (`vendor/`) | Draws the room QR code | MIT |
| three.js r149 (0.149.0) by the three.js authors (`vendor/`) | Draws the 3D board, kids and minigame arenas | MIT |
| Playwright (development only, not part of the game) | Automated play-tests | Apache-2.0 |

All art is drawn in code: 2D on an HTML canvas, 3D as Three.js shapes built in code (no
model files). All music and sound effects are synthesized in code with the Web Audio API.
No outside images, 3D models, audio or game code are used.

## Team

| Name | Role |
|---|---|
| Ian Patrick A. Flores | Team lead, frontend |
| Mary Princess Angel L. Dizon | Artist: characters and effects |
| Joey T. Cuison | Backend: content, data and quality |
| Mark Jemiel P. Guevarra | Artist: world and UI |
| Jace Matthew M. Catriz | Backend: online and multiplayer |

The team is two backend developers, one frontend developer and two artists; roles and
the work up to the finals are in [`docs/PRD.md`](docs/PRD.md). The longer-term plan is in
[`docs/BUILD_PLAN.md`](docs/BUILD_PLAN.md).

## AI use

This game was written almost entirely by Claude (Anthropic), from the team's direction:
concept, choice of games, setting and style. Commits authored by **Claude** are
AI-written; team members commit their own work under their own GitHub accounts. The full
record is in [`DEVLOG.md`](DEVLOG.md) and is disclosed on Form 03 of the submission.
