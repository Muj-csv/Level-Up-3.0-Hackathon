# Laro sa Ulap

*Ang mga laro sa kalye, nasa ulap na.*

A party board game for 1 to 4 players built on Filipino street games, made for the
**Level Up 3.0 Esports Game Dev Challenge** (Student Category). It covers two official
themes: **Philippine Games and Sports**, and **Board Games / Brain Games**.

Four barrio kids race across four floating islands (Plaza, Palengke, Aplaya, Bukid),
collect coins, buy crowns, and play a street-game minigame after every round:
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
| **Party** | The full board game: dice, coins, items, crowns, a minigame every round. |
| **Torneo** | No dice. Minigames only; every win is a crown. Skill decides. |
| **Hamon ng Araw** | Solo daily challenge against hard bots. Same challenge for everyone that day; best score is kept on your device. |
| **Isang phone** | Up to 4 people share one phone or computer; bots fill empty seats. |
| **Online room** | Host makes a room; friends join by QR code or a 4-letter code. See the limitation below. |

### Known limitation: online rooms

Online rooms use the room service of the Claude artifact the prototype was built in
(`window.claude.use('room')`). They work only when the game is opened as that Claude
artifact by signed-in, invited users. On any other host (GitHub Pages, itch.io, a local
file), the online buttons explain that online play is unavailable; every other mode works.
Moving rooms to a free service the team controls (for example Supabase Realtime or PeerJS)
is on the to-do list before finals.

## Credits and licences

| Item | Use | Licence |
|---|---|---|
| Bagel Fat One, Nunito (Google Fonts) | Title and UI type | SIL Open Font License 1.1 |
| qrcode-generator 1.4.4 by Kazuhiko Arase (jsDelivr) | Draws the room QR code | MIT |

All art is drawn in code on an HTML canvas. All music and sound effects are synthesized in
code with the Web Audio API. No outside images, audio or game code are used.

## AI use

This prototype was written almost entirely by Claude (Anthropic), from the team's
direction: concept, choice of games, setting and style. Commits authored by **Claude** are
AI-written; team members commit their own work under their own GitHub accounts. The full
record is in [`DEVLOG.md`](DEVLOG.md) and is disclosed on Form 03 of the submission.
