# Development and AI-use log

Organizers may ask for prompts, dev logs or version history to check Form 03
(Asset and AI Usage Disclosure). Add one row per work session, newest first:
date, what changed, who did it, and the evidence (a commit, a link, a file).

**Who** is either a team member's name (work they did themselves) or
"Claude, on the team's request" (AI-written). Commits authored by `Claude` in
this repo are AI-written.

The game was called *Laro sa Ulap* until Oct 23, 2026. Older rows keep that name
where it is the title of a file or artifact.

| Date | Work done | Who | Evidence |
|---|---|---|---|
| Oct 23, 2026 | Product requirements for the finals build (`docs/PRD.md`): roles for the team, milestones, and requirements for pacing, splash screen, main menu, pre-game visuals, 5+ islands, art upgrade, online rooms, nickname picker, content and performance, from the team's playtest notes | Claude drafted, from the team lead's notes; team reviews | This commit |
| Oct 23, 2026 | Renamed the game to Taympers; renamed two Kasama friends (Boyet, Dodong); Three.js and the QR library now ship in `vendor/` instead of loading from a CDN; Vercel setup (`vercel.json`, `.vercelignore`, checked with `vercel build`); build plan added as `docs/BUILD_PLAN.md`, brought up to date with the game; team list in the README | Claude, on the team's request | This commit |
| Oct 23, 2026 | Merged the 3D build into the overhauled game: Three.js board, kids and minigame arenas; Kasama and Tanong ni Lola spaces; Luksong Tinik; Pasaporte ng Laro and "Subukan sa labas" cards. Added: 3D reach rings and step tags, gold die in 3D, a Grapiko 3D/2D setting with 2D fallback, allies in saves, bot and roll-preview maths that count allies. Tests: 3D suite, Luksong Tinik scripted players | Claude, on the team's request | Commit 1899ff0; `tests/3d.mjs` |
| By Oct 23, 2026 | 3D version of the prototype (Laro sa Ulap 3D): Three.js renderer, Kasama, Tanong ni Lola, Luksong Tinik, Pasaporte | Claude, on the team's request (team to confirm) | Game prototype, 3D copy (Claude artifact; private) |
| Oct 23, 2026 | Set up the `main` branch and GitHub Pages files (`.nojekyll`, README link) | Claude, on the team's request | Commit 80face2 |
| Oct 22, 2026 | Play-test suite: screen sizes, every button, full Party and Torneo matches with score checks, bots per difficulty, save/resume, restarts, resizing, reduced motion, downloads, name input; scripted minigame players; two-device online match through a stand-in for the room service | Claude, on the team's request | `tests/`, `package.json` (commit 1f3c4d9) |
| Oct 22, 2026 | Polish: path arrows, items guide page, card buttons that stay in view, online lobby copy, gallery labels | Claude, on the team's request | Commit 1dd9e76 |
| Oct 22, 2026 | Performance: sky painted once per screen size; static props, bridges and spaces cached as sprites. Board frame draw time 48 ms to 11 ms (headless phone-size test) | Claude, on the team's request | Commits d99bc1f, 439823a |
| Oct 22, 2026 | Gameplay rework from 30-game bot simulations: board events, pass-by shopping, Gintong dice and Agimat items, pick-your-rival Jack en Poy, Mayaman bonus, seeded turn order, bots by difficulty, reach preview; Patintero tag-grace scoring and Sipa speed fixes | Claude, on the team's request | Commit 439823a |
| Oct 22, 2026 | Fixes and new menus: landscape and narrow-phone layouts, standalone share link, honest online-unavailable message, Sipa anti-mashing, dialog keyboard handling; in-game menu with pause and sound settings; save and resume; standings on player cards | Claude, on the team's request | Commit f06a07f |
| Oct 22, 2026 | Imported prototype version 4 into this repo, unchanged, as the starting point for version control | Claude, on the team's request | First commit of `index.html` |
| Oct 22, 2026 | Version 4: Palosebo minigame; round and bot-skill settings; Torneo and Hamon ng Araw modes with a device score board; How to Play guide, tips and real-life rules cards; music and phone vibration; Huling Hirit, bonus crowns, rematch and a shareable result picture | Claude, on the team's request | Game prototype, version 4 (Claude artifact; private) |
| Oct 22, 2026 | Drafted the submission pack from the official mechanics PDF | Claude drafted; team reviews and edits | Laro sa Ulap — Level Up 3.0 Submission Pack |
| Oct 22, 2026 | Texture pass on islands, buildings, sky and characters; sprite sheet re-exported | Claude, on the team's request | Game prototype, version 3; laro-sa-ulap-sprites.png and .json |
| Oct 22, 2026 | Version 2: online rooms by QR or room code, shared-phone mode, sprite gallery and sheet, motion polish | Claude, built to the team's choices of web, shared phone plus online, and cartoon style | Game prototype, version 2 |
| Oct 22, 2026 | Version 1: floating-island board, Tumbang Preso, Patintero, Sipa, bots | Claude, from the team's brief | Game prototype, version 1 |
| Oct 22, 2026 | Research on party board game structure | Claude | Larong Pinoy Party Game research doc (Claude artifact; private) |
| Oct 22, 2026 | Concept: party board game with larong kalye minigames on a floating-island, top-down board | Ian Patrick A. Flores (team lead) | Prompts in the Claude chat |
