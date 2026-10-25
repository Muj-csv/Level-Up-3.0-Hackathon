# Taympers

*Ang mga laro sa kalye, nasa ulap na.*

"Taym pers!" is what kids shout to pause a game on the street. In Taympers, the street
games themselves are the game.

A party board game for 1 to 4 players built on Filipino street games, made for the
**Level Up 3.0 Esports Game Dev Challenge** (Student Category). It covers two official
themes: **Philippine Games and Sports**, and **Board Games / Brain Games**.

Four barrio kids pick one of four island maps (**Plaza, Palengke, Aplaya, Palayan**),
race around its board, collect piso, buy korona (crowns), and play a street-game minigame
after every round: Tumbang Preso, Patintero, Sipa, Palosebo, Luksong Tinik, Pukpok Palayok, Taguan and Piko.

The game is **3D**: the island, the kids and every minigame arena are drawn with
Three.js. When WebGL or Three.js is not available, it falls back to a 2D canvas board,
and players can pick 2D in the menu (see Controls and settings).

## Play it

The game is `index.html`, the island maps in `maps/`, the text in `content/`, and two
libraries in `vendor/` (Three.js and a QR code generator). There is no build step and
nothing to install.

- **Online:** the live game on Vercel and a backup on GitHub Pages, both built from the
  `main` branch. All project links are in [`docs/LINKS.md`](docs/LINKS.md).
- **Local server** (needed for 3D: Three.js and the islands are JavaScript modules, which
  browsers do not load from a `file://` page; opened as a file, the game plays in 2D):
  ```bash
  python3 -m http.server 8000
  # then open http://localhost:8000
  ```
- **GitHub Pages:** every push to `main` republishes the site (Settings → Pages →
  Deploy from a branch → `main` / root). `.nojekyll` makes Pages serve the files as-is.
- **itch.io:** zip `index.html` with the `vendor/`, `maps/` and `content/` folders and mark
  it "This file will be played in the browser".

The only thing loaded from the internet is Google Fonts (Bagel Fat One, Nunito). Without
a connection the game uses fallback fonts.

### Deploy on Vercel

The repo is ready to import as is:

1. On vercel.com, **Add New → Project**, and import `Muj-csv/Level-Up-3.0-Hackathon`.
2. Leave every setting as Vercel shows it (`vercel.json` sets them: no framework, no
   install, no build, output is the repo root) and press **Deploy**.
3. Every push to `main` then redeploys; pushes to other branches get preview links.

What gets deployed: `index.html`, `vendor/`, `maps/`, `kids/` and `content/` (`.vercelignore`
leaves out the tests, docs, tools and `package.json`, so Vercel never installs the test
tools). `vercel.json`
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

## Splash screen

The game opens on a splash: the Taympers logo, the four 3D kids hopping onto their tiles,
and a loading bar that follows the real loading (fonts, Three.js, the kids, the game text
and the main menu's Plaza scene). When it is full, **Pindutin para magsimula** starts the
sound (browsers need a first tap for it) and the splash fades into the main menu, already
live, as its kids cheer. On devices without 3D the kids are drawn in 2D and the menu shows
its picture. The tests skip the splash (`?debug`); add `&splash` to see it with the test
hook on.

## Maps

The **title screen** is the Plaza at golden hour (`maps/title.js`, from the team's title
screen design): the four 3D kids play on the plaza's entrance path, Bunso keeping the sipa
up, Neneng cheering, Totoy waving Jun over to his patintero line, on a 12-second loop, and
they all cheer when **Maglaro** is pressed. The logo sits top left and the buttons in a
column on the right; portrait phones stack them with the kids in between. A still picture of
the scene shows while it is built and stands in on devices without 3D. With reduced motion
on, the scene stays still.

**Maglaro → Simulan** opens the map screen: a picture of all four islands that zooms in
to the island being picked (tap an island, use its button, or the arrow keys), then
**Laro na!** builds that island in 3D (a loading card shows for a few seconds) and the
game starts on it. Online, the host picks the map in the lobby.

| Map | Board | Shortcut |
|---|---|---|
| **Plaza** | Kiosko, simbahan, munisipyo, bantayog; a side path past the church | Kalesa, 6 piso |
| **Palengke** | Wet and dry market, timbangan, a middle aisle through the stalls | Padyak, 6 piso |
| **Aplaya** | Lagoon, pantalan, a boardwalk over the water | Bangka, 6 piso |
| **Palayan** | Rice terraces and a waterfall; a trail up the terraces | Kariton ng kalabaw, 6 piso |

Each map is an 80-space loop with a side path that forks off and joins it again (about
100 spaces in all), and 10 places where korona can sit; **4 korona** are on the board at
once. At the fork the player picks the path (each button says how far the nearest korona
is that way). Landing on the shortcut space offers a paid ride to the far side of the
map. The 3D islands come from the team's Taympers Maps package (`maps/`, see Credits).

## Rules in short

- **Goal:** most korona at the end; piso break ties. Turn order is drawn at the start.
- **Your turn:** roll 1 to 10. Spaces you can reach get a ring, and each korona shows how
  many steps away it is. Pass a korona with 10 piso to buy it; it then moves.
- **Spaces:** Piso +3, Utang −3, Swerte (bonus piso or a free item), Tikbalang (back 3),
  Sari-sari (shop; you may also shop when you walk past with empty hands), Jack en Poy
  (pick any rival, winner takes up to 5 piso), **Kasama** (a friend joins you and adds 1 or
  2 steps to every roll; up to 2), **Tanong ni Lola** (a question about Filipino games,
  +5 piso if right).
- **Island spaces** (one set per map): Plaza: Banda (forward 3), Kampana (+5),
  Munisipyo (a free Kendi or Agimat, or +3), Rizal (a Tanong ni Lola question).
  Palengke: Tawad (+3), Timbangan (+2), Suki (free item or +3), Basa (slip back 2),
  Ulan (buy an umbrella, −2). Aplaya: Alon (forward 2), Huli (+4), Buko (free item or
  +3), Taog (back 2), Araw (buy water, −2). Palayan: Tanim (+2), Ani (+5), Bayanihan
  (+2 for every player), Balang (−4), Ulan (the rice is watered, +3). Agimat blocks the
  losses.
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

The 3D islands have been tested in headless Chromium with software WebGL (SwiftShader),
not yet on real phones. Each island is about 230,000 to 330,000 triangles; phones and
tablets get a lighter version (fewer leaves and grass layers, no island shadows, at most
1.5× pixel density), and building the island takes a few seconds when the game starts.
Before the event, try every map on the slowest phone the team expects; if one stutters,
switch **Grapiko** to 2D in the menu.

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
| three.js r184 (0.184.0) by the three.js authors (`vendor/three-r184/`) | Draws the 3D islands, kids and minigame arenas | MIT |
| Mga Bata: the four playable kids in 3D (`kids/`) | Jun, Neneng, Totoy and Bunso on the board, title, HUD and minigames, with their animations and faces | Made by the team: Ian Patrick A. Flores (idea), using Claude (AI) to build them; see AI use |
| Taympers Maps: the four 3D islands, their boards and their life (`maps/`) | The Plaza, Palengke, Aplaya and Palayan maps and the map-screen and menu pictures (`maps/world/`, rendered from them with `tools/world-render.mjs` and `tools/title-render.mjs`) | Made by the team: Ian Patrick A. Flores (idea), using Claude (AI) to build them; see AI use |
| Playwright (development only, not part of the game) | Automated play-tests | Apache-2.0 |

All art is drawn in code: 2D on an HTML canvas, 3D as Three.js shapes built in code (no
model files). The map-screen pictures are renders of those islands. All music and sound effects are synthesized in code with the Web Audio API.
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
