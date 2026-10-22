# Laro sa Ulap

*Ang mga laro sa kalye, nasa ulap na.*

A party board game for 1 to 4 players built on Filipino street games, made for the
**Level Up 3.0 Esports Game Dev Challenge** (Student Category). It covers two official
themes: **Philippine Games and Sports**, and **Board Games / Brain Games**.

Four barrio kids race across four floating islands (Plaza, Palengke, Aplaya, Bukid),
collect piso, buy korona (crowns), and play a street-game minigame after every round:
Tumbang Preso, Patintero, Sipa and Palosebo.

## Play it

The whole game is one file, `index.html`. There is no build step and nothing to install.

- **Quickest:** open `index.html` in a phone or computer browser.
- **Local server** (needed on some browsers for clipboard and sharing):
  ```bash
  python3 -m http.server 8000
  # then open http://localhost:8000
  ```
- **GitHub Pages / itch.io:** upload `index.html` as-is (itch.io: zip it and mark it
  "This file will be played in the browser").

The game loads two things from the internet: Google Fonts (Bagel Fat One, Nunito) and the
`qrcode-generator` library from jsDelivr. Without a connection it still runs with fallback
fonts and no QR image (the room code still shows).

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
  (pick any rival, winner takes up to 5 piso).
- **Items** (carry one): Dobleng dice 5 (two dice), Kendi 3 (+3 steps), Gintong dice 8
  (pick your number), Agimat 4 (blocks the next Utang, Tikbalang or Jack en Poy loss).
- **Minigames:** +10 / +5 / +3 piso for 1st / 2nd / 3rd. Last round (**Huling Hirit**):
  double prizes and help for the player in last place.
- **Bonus korona at the end:** Hari ng Laro (most minigame wins), Mayaman (most piso),
  Malas sa Dice (lowest average roll).

## Controls and settings

- Touch: tap the big button (or the board) to roll; minigames say their controls before
  they start. Several people on one device each get a lane and a key (A, F, J, L).
- Keyboard: Space or Enter to act, M for the map, Esc for the menu, arrows/WASD in
  Patintero. Tab moves between buttons; dialogs keep focus inside and close with Esc.
- The **menu** (pause button) pauses local games and holds Musika, Tunog and Vibrate
  switches (kept on the device), How to Play, and Umalis sa laro.
- Local games save at the start of every turn. If the page closes, **Ituloy ang laro**
  on the title screen picks up where you were.
- Reduced-motion settings are respected (no screen shake, sway or long wipes).

### Known limitation: online rooms

Online rooms use the room service of the Claude artifact the prototype was built in
(`window.claude.use('room')`). They work only when the game is opened as that Claude
artifact by signed-in, invited users. On any other host (GitHub Pages, itch.io, a local
file), **Maglaro online** says that online play is unavailable here and offers a game on
one device instead. Moving rooms to a free service the team controls (for example
Supabase Realtime or PeerJS) is on the to-do list before finals; the game only needs an
object with the same `join / peers / onPeers / presence / leave` shape
(see `tests/mock-room.js`).

## Tests

`npm install && npx playwright install chromium && npm test` plays the game in headless
Chromium: screen sizes, every button, full matches with score bookkeeping checks, bots per
difficulty, save/resume, minigames against scripted players, and a two-device online match.
Details in [`tests/README.md`](tests/README.md).

## Credits and licences

| Item | Use | Licence |
|---|---|---|
| Bagel Fat One, Nunito (Google Fonts) | Title and UI type | SIL Open Font License 1.1 |
| qrcode-generator 1.4.4 by Kazuhiko Arase (jsDelivr) | Draws the room QR code | MIT |
| Playwright (development only, not part of the game) | Automated play-tests | Apache-2.0 |

All art is drawn in code on an HTML canvas. All music and sound effects are synthesized in
code with the Web Audio API. No outside images, audio or game code are used.

## AI use

This game was written almost entirely by Claude (Anthropic), from the team's direction:
concept, choice of games, setting and style. Commits authored by **Claude** are
AI-written; team members commit their own work under their own GitHub accounts. The full
record is in [`DEVLOG.md`](DEVLOG.md) and is disclosed on Form 03 of the submission.
