# Taympers Build Plan

22 Oct 2026, updated 23 Oct 2026 to match the game in this repo.

## Status (23 Oct 2026)

The contest build is the single-file prototype in this repo (`index.html`). It already
covers most of the game design spec below, and it can be deployed on Vercel or GitHub
Pages as it is. None of the seven roadmap phases has started: there is no monorepo,
React app, Supabase project or Colyseus server yet. Those come after the contest
submission (Oct 25) and are the plan for the finals and beyond.

| Area | Status |
|---|---|
| Game design spec (board, spaces, items, korona, minigames, modes) | Built in the prototype |
| 3D board and minigames | Built (Three.js r184, 2D fallback); four island maps since Oct 24 |
| Learning layer (Tanong ni Lola, real-street rules, Subukan sa labas, Pasaporte) | Built in the prototype |
| Online rooms | Work only inside the Claude artifact; a room service the team controls is needed |
| Nickname picker (privacy rule) | Not built: the prototype still lets players type a name |
| Accounts, saved progress across devices, teacher tools | Not built (Phases 3 and 5) |
| Automated tests | Playwright play-tests for the prototype (`tests/`) |
| Web deployment | Ready: `vercel.json` and GitHub Pages |

## Overview

Taympers is a board party game for phones and iPads that teaches Filipino kids how to play
larong kalye, then pushes them to play those games for real with friends. Players roll
dice on a 3D board, land on event spaces, and play a short minigame after every round.
Every minigame is a real Filipino street game. "Taym pers!" is what kids shout to pause a
game on the street.

**Problem.** Many kids today grow up on screens and never learn games like Tumbang Preso,
Patintero or Sipa. The games survive through play, and fewer kids play them.

**Goal.** Meet kids where they already are (tablets and phones) and use that time to teach
the rules, history and how-to of each game. Success is a kid who plays Tumbang Preso
outside after learning it in the app.

**Audience.**

- Primary: kids aged 7 to 12 in the Philippines, playing alone, with siblings on one
  device, or with classmates online
- Secondary: parents and teachers who want screen time that leads to outdoor play

### What the prototype already has

Single file plus two bundled libraries, playable now.

| Area | Built |
|---|---|
| Board | 3D floating islands (Plaza, Palengke, Aplaya, Bukid) in Three.js, tilted follow camera, 2D fallback and a 3D/2D setting |
| Characters | Jun, Neneng, Totoy, Bunso as 3D kids with walk, hop, cheer, sad, kick, climb and sit poses; 3D portraits on the HUD cards |
| Board spaces | Piso, Utang, Swerte, Tikbalang, Sari-sari, Jack en Poy, Kasama, Tanong ni Lola, Korona |
| Items | Dobleng dice, Kendi, Gintong dice, Agimat |
| Minigames | Tumbang Preso, Patintero, Sipa, Palosebo, Luksong Tinik, all in 3D on a floating arena island with banderitas, palm trees and cheering kids |
| Allies | Kasama system: up to 2 friends (Lito, Mayumi, Boyet, Dodong), each adds +1 or +2 to every roll |
| Learning | Tanong ni Lola trivia, real-street rules cards, "Subukan sa labas" challenges, Pasaporte ng Laro stamps |
| Modes | Party (3, 5 or 8 rounds), Torneo, Hamon ng Araw, Pagsasanay |
| Multiplayer | One-device play for up to 4, bots in three skill levels fill empty seats; online rooms with QR and 4-letter code (Claude artifact only) |
| Saves and settings | Resume a local game after the page closes; music, sound, vibration and graphics settings |
| Polish | 3D title scene orbiting the kids on the plaza, procedural rondalla-style music, sound effects, haptics, first-time tips, shareable result image |

The prototype proves the game is fun. The work ahead is turning one large file into a
maintainable app with accounts, saved progress, a real multiplayer server and safe
handling of kids' data.

## Game design spec

The winner is the player with the most korona at the end; piso breaks ties. Everything
else in the design either helps players earn korona or teaches a Filipino game.

### Turn loop

1. Turn order is drawn at the start (bunutan).
2. Player taps **Tamaan ang dice** (1 to 10). Items are used before rolling; each Kasama
   adds +1 or +2.
3. The kid walks that many spaces around the four islands and across the rope bridges.
   Walking past the Sari-sari with empty hands lets the player shop.
4. Passing a korona with 10 piso lets the player buy it. The korona then flies to a new
   space.
5. The space the player stops on triggers its event.
6. After all four players move, everyone plays one minigame. Payouts: +10, +5, +3, 0 piso.
7. Final round (Huling Hirit): double minigame payouts and a boost for last place. Then
   bonus korona: Hari ng Laro (most minigame wins), Mayaman (most piso), Malas sa Dice
   (lowest average roll).

### Board spaces

| Space | Effect | Teaches |
|---|---|---|
| Piso (blue) | +3 piso | — |
| Utang (red) | −3 piso | — |
| Swerte (gold) | +5 or +8 piso, or a free Kendi or Agimat | — |
| Tikbalang (purple) | Move back 3 spaces | Philippine folklore |
| Sari-sari (teal) | Buy one item: Dobleng dice (5), Kendi +3 (3), Gintong dice (8), Agimat (4) | The neighborhood store |
| Jack en Poy (orange) | Pick a rival and duel for up to 5 piso | Jack en Poy rules |
| Kasama (green) | Recruit a friend, max 2; else +3 piso | Barkada, group play |
| Tanong ni Lola (pink) | Trivia question, +5 piso if right | Rules and history of 10 games |
| Korona | Buy for 10 piso when passing | — |

### Items

Players carry one item at a time.

| Item | Cost | Effect |
|---|---|---|
| Dobleng dice | 5 | Roll two dice |
| Kendi | 3 | +3 steps |
| Gintong dice | 8 | Pick your number, 1 to 10 |
| Agimat | 4 | Blocks the next Utang, Tikbalang or Jack en Poy loss |

### Minigames

| Minigame | Players | Input | Win condition | Status |
|---|---|---|---|---|
| Tumbang Preso | 4 at once | Timing tap on a swinging aim line | Most cans knocked in 5 throws | Built |
| Patintero | 1 runner vs 3 guards | Drag or arrow keys | Highest points in 20 s | Built |
| Sipa | 4 at once | Timing tap when the ring glows | Most kicks before it drops | Built |
| Palosebo | 4 at once | Rhythm tap, slips if too fast | Highest climb, time bonus | Built |
| Luksong Tinik | 4 at once | Timing tap in the jump zone | Highest level cleared | Built |
| Piko | 4 at once | Hop sequence, memory | Fewest mistakes | Planned |
| Agawan Base | 2 vs 2 | Drag, tag and rescue | First to touch the other base | Planned |
| Sungka | 1 vs 1 | Turn-based strategy | Most sigay in your store | Planned |
| Holen | 4 at once | Flick with aim and power | Most marbles knocked out | Planned |

### Modes

- **Party:** board, dice and minigames; 3, 5 or 8 rounds
- **Torneo:** minigames only; each win is a korona
- **Hamon ng Araw:** one shared daily challenge against hard bots. The prototype keeps
  scores on the device; an online leaderboard comes in Phase 3
- **Pagsasanay:** practice any minigame alone
- **Online:** rooms joined by QR code or 4-letter code; bots take empty or dropped seats

### Learning layer

This layer is what sets Taympers apart from other party board games. Keep it in every
phase.

- **Sa totoong kalye:** a short card on how each game is played on a real street, shown
  before the minigame
- **Subukan sa labas:** after each minigame, what you need to play it for real (a can,
  slippers, 3 friends)
- **Pasaporte ng Laro:** a red stamp for playing a game in the app, a gold stamp for
  playing it outside
- **Tanong ni Lola:** trivia spaces that also introduce games not yet in the app

Planned: Lola or Lolo as narrator, Filipino / English / Kapampangan voice-over, regional
boards (Visayas fiesta, Mindanao coast), a teacher-confirmed Barkada Challenge.

## Requirements

The hardest requirements are not graphics; they are running smoothly on cheap Android
tablets and handling kids' data safely.

### Functional

- Play a full Party game offline on one device with 1 to 4 humans plus bots
- Create and join online rooms by QR or 4-letter code; reconnect after a dropped
  connection; bots replace players who leave
- Guest play with no account; optional parent-created account to save progress across
  devices
- Save Pasaporte stamps, minigame best scores and settings
- Daily Hamon with a leaderboard that shows nicknames only
- Language toggle: Filipino and English at launch, Kapampangan later
- Teacher view: create a class code, see which games the class has stamped, confirm gold
  stamps for the Barkada Challenge
- Admin tools: edit trivia questions, game history cards and outdoor challenges without a
  new release

### Non-functional

| Requirement | Target |
|---|---|
| Frame rate | 60 fps on iPad 9th gen; 30 fps or better on a mid-range Android tablet (e.g. 3–4 GB RAM) |
| First load | Under 5 s on 4G; total download under 15 MB before caching |
| Offline | Full one-device play after first load (PWA cache) |
| Online latency | Turn actions visible to other players in under 300 ms on local networks |
| Input | Touch first; big tap targets (at least 48 px); keyboard support on desktop |
| Accessibility | Reduced-motion setting, text readable at arm's length, no reliance on color alone, voice-over for non-readers |
| Reliability | No game-breaking crash in a 30-minute session; auto-save between turns |

## Privacy and child safety

Players are minors, so collect as little as possible and get a parent involved before any
account exists.

- No real names, photos, location or free-text chat from kids. Use nicknames from a
  picker and preset emotes only. (Gap: the prototype still has a typed name field; replace
  it with a picker before any school use.)
- Accounts are created by a parent or teacher with their own email and consent.
- Follow the Philippine Data Privacy Act of 2012 (RA 10173), including a privacy notice in
  Filipino and English. If you publish to app stores, also meet Apple's Kids Category and
  Google Play Families rules. Have your adviser or a lawyer confirm the details.
- No ads and no in-app purchases in the school version.

## Content accuracy

Every game's rules, history and trivia answer gets reviewed by a PE teacher or a cultural
expert before launch. Regional variations (names, rules) are shown as "sa ibang lugar"
notes, not as errors.

## Team

| Member | Role |
|---|---|
| Ian Patrick A. Flores | Project lead, frontend / game dev |
| Mary Princess Angel L. Dizon | Artist: characters and effects |
| Joey T. Cuison | Backend: content, data and quality |
| Mark Jemiel P. Guevarra | Artist: world and UI |
| Jace Matthew M. Catriz | Backend: online and multiplayer |

The team is two backend developers, one frontend developer and two artists. Roles up to
the finals are in [`PRD.md`](PRD.md).

### Roles

| Role | Owns |
|---|---|
| Project lead | Scope, schedule, playtests, adviser updates |
| Frontend / game dev (1–2) | React app, board, minigames, 3D, audio |
| Backend dev | Database, auth, multiplayer server, admin tools |
| UI/UX and art | Screens, characters, icons, islands, accessibility |
| Content and QA | Trivia, history cards, translations, test plans, kid playtests |

## Assets and tools

- **Devices:** at least one iPad, one budget Android tablet and one Android phone for
  testing
- **Accounts:** GitHub, Supabase, Vercel (or Netlify), and later Apple and Google developer
  accounts if publishing to stores
- **Audio:** recorded voice lines for Lola/Lolo and instructions in each language; licensed
  or original music
- **Art:** 3D models (Blender, exported as .glb) to replace the code-built kids and props

## Tech stack and architecture

Use one TypeScript codebase: a React web app that also ships to iOS and Android through
Capacitor, Supabase for data and accounts, and a small Colyseus server for online rooms.
The key design rule is a shared game-core package with all the rules, so the app, the bots
and the server never disagree.

| Layer | Choice | Why |
|---|---|---|
| Language | TypeScript everywhere | One language for client, server and shared rules |
| Repo | pnpm monorepo: apps/web, apps/server, packages/game-core, packages/content | Rules and content shared, versioned together |
| UI | React 18 + Vite | Fast builds, the team likely knows it |
| 3D board | react-three-fiber + drei (Three.js) | The prototype already uses Three.js; R3F makes scenes components |
| 3D minigames | react-three-fiber scenes on one shared arena island, ported from the prototype | Same look, lighting and camera rig as the board |
| State | Zustand | Small, works well with R3F |
| Audio | Howler.js | Reliable on iOS Safari |
| Languages | i18next | Filipino, English, Kapampangan files |
| Offline | vite-plugin-pwa | Cache the game for offline one-device play |
| Mobile apps | Capacitor | Same web build wrapped for App Store and Play Store |
| Database and auth | Supabase (Postgres, Auth, Row Level Security, Storage) | Free tier, parent accounts, safe per-user data rules |
| Online rooms | Colyseus (Node.js), server-authoritative | Handles rooms, reconnects and cheating; runs game-core on the server |
| Hosting | Vercel (web), Supabase Cloud (data), Fly.io or Render (Colyseus) | Simple deploys, free or low-cost tiers |
| Quality | Vitest (rules), Playwright (flows), Sentry (crashes) | Catch rule bugs before kids do |

Option for a smaller team: skip Colyseus at first and keep the prototype's
host-authoritative model on Supabase Realtime broadcast channels. Move to Colyseus when
you need reconnects and anti-cheat.

The app plays offline on its own; it talks to Colyseus only for online rooms and to
Supabase only for accounts, saved progress and content.

## Phased roadmap

Build front to back in seven phases over about 22 weeks: the game works offline first,
then gains accounts and saved progress, then a real multiplayer server. Each phase ends
with a playable build and a gate it must pass. Week counts assume a team of 4 to 5
working part-time; adjust to your semester.

Phases 2 and 3 overlap so the backend is ready when the offline game is; Phase 4 starts
only after accounts work.

### Phase 0 — Setup and design lock (weeks 1–2)

- Create the monorepo, CI (lint, type-check, tests on every push), branch rules and a
  shared Figma file
- Freeze the game design spec above as v1; list every screen
- Pick the 2 test devices that set the performance floor
- Gate: repo builds and deploys a "hello board" page to Vercel

### Phase 1 — Frontend foundation (weeks 3–6)

- Move all rules out of the prototype into packages/game-core: board, spaces, dice,
  items, Kasama, korona, scoring, bots, seeded random
- Write unit tests for game-core (every space effect, tie-breaks, Huling Hirit, bonus
  korona)
- Build the React app shell: title, setup, HUD, cards, settings, how-to-play, using design
  tokens from the prototype
- Port the 3D board to react-three-fiber components (Island, Space, Kid, DiceBlock,
  Korona, Bridge)
- Gate: a full one-phone Party game runs end to end in React with bots, at target frame
  rate on both test devices

### Phase 2 — Gameplay and content (weeks 7–12)

- Port the 5 3D minigames into a common Minigame interface (setup, input, update, 3D
  scene, result) that shares the arena island, spectators and camera rig; score labels
  stay as 2D overlays placed from 3D positions
- Add Piko and Agawan Base; add a 10-second practice round before each minigame
- Content system: trivia, history cards and outdoor challenges as JSON in
  packages/content, in Filipino and English
- Audio with Howler, Lola narrator voice lines, reduced-motion and sound settings
- PWA offline caching; local saves for Pasaporte and best scores
- First kid playtest (5–8 kids) and a teacher review of every game's rules
- Gate: offline build passes the playtest with no blocking confusion; content reviewed

### Phase 3 — Backend core (weeks 10–15, overlaps Phase 2)

- Supabase project: schema below, Row Level Security on every table
- Parent and teacher sign-up with email; child profiles with nickname and avatar only
- Sync Pasaporte stamps and best scores from local storage to the account
- Hamon ng Araw: daily seed, score submit, nickname leaderboard
- Content admin: a protected page to edit trivia, history cards and challenges; the app
  fetches them at start and caches them
- Gate: a stamp earned on one device appears on another; RLS tests prove a parent sees
  only their own children

### Phase 4 — Multiplayer server (weeks 14–18)

- Colyseus server in apps/server that runs game-core authoritatively; clients send inputs
  only
- Rooms with 4-letter codes and QR, lobby, host settings, bot fill, reconnect within 60 s,
  bot takeover after that
- Minigame sync: clients send timing inputs, server decides scores
- Load test 50 rooms at once
- Gate: 4 phones on different networks finish a 5-round game with one forced disconnect
  and rejoin

### Phase 5 — Teacher tools and Barkada Challenge (weeks 17–19)

- Class codes; teacher dashboard of class stamps; teacher confirms gold stamps after real
  outdoor play
- Printable or on-screen weekly challenge cards
- Gate: one real class runs a week-long Barkada Challenge

### Phase 6 — Testing, launch and defense (weeks 19–22)

- Second playtest round, accessibility pass, performance pass, Sentry monitoring
- Privacy notice, parent consent flow, data deletion on request
- Deploy web version; optionally wrap with Capacitor for TestFlight and Play internal
  testing
- Gate: launch checklist signed off by the adviser; demo build ready for defense

## Data model and realtime events

Ten Supabase tables cover accounts, progress, classes and content; live game state lives
only on the Colyseus server and is never stored with a child's identity.

### Tables

| Table | Key columns | Access rule (RLS) |
|---|---|---|
| guardians | id (= auth user), role (parent / teacher), display_name, consent_at | Own row only |
| child_profiles | id, guardian_id, nickname, avatar_char, language, created_at | Guardian only |
| stamps | child_id, game_key, kind (played / outside), count, confirmed_by, updated_at | Guardian; teacher of the child's class |
| best_scores | child_id, game_key, score, achieved_at | Guardian only |
| daily_challenges | day, game_key, seed, bot_difficulty | Public read |
| daily_scores | day, child_id, nickname_snapshot, score | Public read of nickname + score only |
| classes | id, teacher_id, name, join_code | Teacher only |
| class_members | class_id, child_id, joined_at | Teacher and the child's guardian |
| content_items | id, type (trivia / history / challenge), game_key, lang, body (json), version, published | Public read when published; admin write |
| match_results | id, mode, rounds, finished_at, players (json: nickname, char, korona, piso) | Insert by server only; guardian reads own child's |

### Online room messages (Colyseus)

Clients send inputs; the server validates them with game-core and broadcasts state.

| Direction | Message | Payload |
|---|---|---|
| Client → server | join | nickname, avatar_char, room code |
| Client → server | setSettings (host) | mode, rounds, bot difficulty |
| Client → server | start (host) | — |
| Client → server | roll | useItem: boolean |
| Client → server | choose | decision id, value (buy korona, shop item, Jack en Poy rival and hand, trivia answer, Gintong dice number) |
| Client → server | mgInput | minigame id, input type, timestamp |
| Server → clients | state patch | board, players, korona spots, turn, round, phase |
| Server → clients | event | dice result, space effect, korona bought, ally joined |
| Server → clients | mgStart / mgResult | minigame key and seed / scores and payouts |
| Server → clients | playerLeft / botTookOver | seat id |

All randomness (dice, korona moves, bot choices, minigame order) comes from one seeded
generator on the server, as the prototype already does, so replays and bug reports are
reproducible.

## Cursor prompts

Paste the context prompt once at the start of each Cursor session (or save it as
`.cursorrules`), then the prompt for the phase you are on. Attach `index.html` from this
repo (the prototype) whenever a prompt says to port something.

### Context prompt (always first)

```text
You are working on "Taympers", a 3D board party game that teaches Filipino kids (ages 7-12) traditional street games (larong kalye) on phones and iPads, and pushes them to play those games outside.

Stack: pnpm monorepo, TypeScript strict. apps/web = React 18 + Vite + react-three-fiber + drei + Zustand + Howler + i18next + vite-plugin-pwa. apps/server = Colyseus (Node 20). packages/game-core = pure TypeScript game rules, no DOM, no Three.js. packages/content = JSON content in fil and en. Backend = Supabase (Postgres, Auth, RLS).

Rules:
- All game rules live in packages/game-core and are deterministic from a seed. UI and server only call game-core.
- Never collect kids' real names, photos, location or free-text chat. Nicknames come from a picker.
- UI text in Filipino by default, English as a toggle; never hard-code strings, use i18next keys.
- Touch-first: tap targets at least 48 px; respect prefers-reduced-motion.
- Performance floor: 60 fps iPad 9th gen, 30 fps on a 3-4 GB RAM Android tablet.
- Keep the prototype's look: warm paper cards, thick dark-brown outlines, Bagel Fat One display font, Nunito body font, banig stripe accents.
- All names, characters and art are original. Do not use other games' names, characters or art.
- Write Vitest tests for every game-core change. Explain the files you will change before editing.
```

### Phase 0 — Setup

```text
Set up the monorepo for Taympers.
1. pnpm workspaces with apps/web, apps/server, packages/game-core, packages/content.
2. Shared tsconfig (strict), ESLint, Prettier, Vitest at the root.
3. apps/web: Vite + React 18 + TypeScript, with react-three-fiber, drei, zustand, howler, i18next, vite-plugin-pwa installed. Render a placeholder page that shows one rotating 3D floating island.
4. GitHub Actions: install, lint, type-check, test on every push and pull request.
5. A README with how to run each app.
Do not add game logic yet.
```

### Phase 1a — Extract game-core

```text
I attached the prototype index.html. Extract all game rules into packages/game-core as pure TypeScript with no DOM or canvas code.
Include: seeded random (port the G() mulberry function), board path with 4 islands and space types (piso, utang, swerte, tikbalang, sari, jack, kasama, tanong, start), korona spots and moving rules, dice 1-10 with items (doble, kendi, ginto, agimat) and Kasama bonus (+1 or +2 each, max 2 allies), space effects, shop (including shopping when walking past with no item), Jack en Poy with a chosen rival, trivia, minigame payouts (10/5/3/0, doubled in the final round), Huling Hirit, bonus korona (Hari ng Laro, Mayaman, Malas sa Dice), win order (korona then piso), turn order draw, bot decisions per difficulty, and modes (party, torneo, hamon).
Design it as a reducer: createGame(config, seed) -> state; applyAction(state, action) -> {state, events}. Actions: roll, choose, minigameResult. Events describe what to animate.
Write Vitest tests covering every space effect, tie-breaks and a full 5-round bot-only game that finishes.
```

### Phase 1b — React shell and 3D board

```text
Build apps/web on top of packages/game-core.
- Screens: Title, LocalSetup (players, mode, rounds, bot skill), Game, Results, HowToPlay (6 pages), Settings, Pasaporte.
- Game HUD: 4 player cards (portrait, korona, piso, item, ally count, standing), round pill, turn pill, korona location pill, action button, item button, map button, menu button. Copy the prototype's CSS tokens.
- 3D board with react-three-fiber: components Island (extruded outline, grass top, cliff side, rock cone underside), TrailRibbon, Bridge, Space (colored cylinder with icon texture, pulses on landing), Kid (toon shading with back-face outline, walk/hop/cheer/sad poses), DiceBlock, Korona, Props (palm, kubo, kiosko, stall, store), Clouds. Use MeshToonMaterial and shadows from one directional light.
- Camera follows the active player at a tilt; while a player chooses a roll it frames every space the roll can reach; the map button zooms out to the whole board. Title screen: a slow camera orbit around the kids on the plaza. HUD portraits are rendered from the 3D kid models.
- Play events from game-core as animations in order (hop per space, dice punch, coin fly to HUD).
Keep the 2D Canvas fallback if WebGL is missing.
```

### Phase 2 — Minigames and content

```text
Create a Minigame interface in apps/web: { key, setup(players, seed, difficulty), onInput(playerId, input, time), update(dt), Scene (an R3F component), result(): number[] }.
Port Tumbang Preso, Patintero, Sipa, Palosebo and Luksong Tinik from the attached prototype into this interface without changing their rules or timing.
Render every minigame in 3D with react-three-fiber on a shared floating arena island (dirt floor, grass rim, banderitas, two palm trees, 4 cheering NPC kids), using the same toon shading and outlines as the board:
- Tumbang Preso: tin can with red label, flying tsinelas, a taya who fetches the can, a flat aim arrow and a hit wedge on the ground
- Patintero: chalk-lined field with DULO and BAHAY painted on the ground; lines change to the runner's color when crossed; guards turn to face the runner
- Sipa: a washer sipa with 12 colored strips; the ground ring glows when it can be kicked; the kid lifts one leg
- Palosebo: greased bamboo poles with node rings, dark grease bands, a prize bag and a flag; kids climb hand over hand; low camera so the whole pole is visible
- Luksong Tinik: two seated kids per lane with a hand-and-foot stack that grows each level; a yellow jump zone on the ground
Keep score badges, timers and the countdown as 2D overlays projected from 3D positions.
Add a 10-second practice round before each minigame that does not count.
Add two new minigames: Piko (hop the correct sequence of boxes, skip the box with the pamato, mistakes end your turn) and Agawan Base (2 vs 2 tag; touch the other team's base to win, tagged players are prisoners until rescued).
Move all trivia, "Sa totoong kalye" history and "Subukan sa labas" text into packages/content as JSON per language, loaded with i18next.
Add Howler audio, a narrator voice line slot per card, PWA offline caching and local saves for Pasaporte and best scores.
```

### Phase 3 — Supabase backend

```text
Set up Supabase for Taympers.
1. SQL migrations for these tables: guardians, child_profiles, stamps, best_scores, daily_challenges, daily_scores, classes, class_members, content_items, match_results (columns are in our build plan).
2. Row Level Security on every table: a guardian reads and writes only their own children; a teacher reads stamps of children in their classes and can set kind='outside' confirmed_by=teacher; daily_scores and published content_items are public read; match_results insert only with the service role.
3. Email sign-up for guardians with a consent checkbox stored in consent_at; guardians create child profiles with nickname and avatar only.
4. In apps/web: a sync module that merges local stamps and best scores into the account after sign-in, then keeps them in sync.
5. Hamon ng Araw: an Edge Function that creates the daily seed and game, and a score submit endpoint that rejects impossible scores.
6. A protected /admin page to edit content_items with a published flag.
Write RLS tests that prove one guardian cannot read another guardian's children.
```

### Phase 4 — Colyseus multiplayer

```text
Build apps/server with Colyseus.
- TaympersRoom: max 4 seats, 4-letter join code, host settings, start. The room runs packages/game-core; clients only send inputs (roll, choose, mgInput). Validate every input against game-core before applying.
- Fill empty seats with bots. If a player disconnects, hold the seat 60 seconds with allowReconnection, then a bot takes over.
- Minigames: send mgStart with key and seed; collect timed inputs; the server computes scores with the same minigame logic and sends mgResult.
- Broadcast state with Colyseus schema; send discrete events for animations.
- In apps/web: CreateRoom (shows code + QR), JoinRoom (code + nickname picker), Lobby, and reconnect handling.
- Add a load test script that runs 50 rooms of 4 bots.
When a game ends, insert one row into Supabase match_results with nicknames only.
```

### Phase 5 — Teacher tools

```text
Add teacher features.
- Teachers create classes with a join code; guardians add a child to a class with that code.
- Teacher dashboard: a grid of children (nicknames) by game showing red (played) and gold (outside) stamps.
- Teacher can confirm a gold stamp after real outdoor play; the child sees it in their Pasaporte.
- Weekly Barkada Challenge card: pick a game, show what to bring and how many players, with a printable-looking card layout in the app.
```

### Phase 6 — Launch prep

```text
Prepare Taympers for launch.
- Accessibility audit: tap targets, contrast, reduced motion, screen reader labels on menus.
- Performance pass on the 3D board: instance repeated meshes, cap pixel ratio at 2, lower shadow map size on low-end devices, measure fps on both test devices.
- Add Sentry to web and server.
- Privacy notice page in Filipino and English, parent consent flow, and a "delete my child's data" action that removes all their rows.
- Capacitor setup for iOS and Android builds.
- A launch checklist markdown file.
```

## Testing, risks and next steps

### How to measure success

- Kids finish a 3-round Party game without adult help (target: 8 of 10 in playtest)
- After playing, kids can explain the real rules of at least 2 games (short interview)
- At least 30% of active kids earn one gold "played outside" stamp within 2 weeks of a
  class challenge

### Risks

| Risk | Impact | Mitigation |
|---|---|---|
| 3D board and minigames too slow on cheap Android tablets | Kids quit or can't play | Test on the low-end device every week; the 3D/2D setting (already in the prototype) and a quality setting that lowers shadows and pixel ratio |
| Kids' data handled wrongly | Legal and trust problem | Guest play by default, parent-made accounts, nicknames only, RLS tests, adviser review of the privacy notice |
| Rules or history wrong | Teaches kids incorrect facts | Teacher or cultural expert reviews all content before launch |
| Online play desyncs | Unfair or broken games | Server-authoritative Colyseus with seeded game-core |
| Scope creep from new minigames | Miss the defense date | Freeze at 7 minigames for v1; others go to a v2 list |
| Game feels generic, like any party board game | Weak originality | Lean on the Filipino setting, the Pasaporte and the outdoor challenges; keep every name, character and piece of art original |

### Next steps

1. Share this plan with the group and the adviser; agree on the phase dates
2. Assign the roles (see Team)
3. Run the Phase 0 Cursor prompt and set up the repo
4. Book a first playtest with 5 to 8 kids for week 12
5. Find a PE teacher or cultural expert to review game content
