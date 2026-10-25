# Taympers online play (F7)

Owner: Jace Matthew M. Catriz (Backend 1: online and multiplayer). How online rooms work, how to
run them at the finals (Nov 26–27), and what to do when something goes wrong.

## Demo script (finals)

**Before the judges arrive**

1. Every phone: open https://muj-csv.github.io/Level-Up-3.0-Hackathon/ (or the team's Vercel link)
   and let it load fully once. Check that the title screen shows **Maglaro online**.
2. Decide the **host phone**: the one on the steadiest connection, plugged in, screen lock off.

**Starting a room (host)**

1. Maglaro online → **Gumawa ng room** → type a name → Gumawa.
2. Show the QR code, or read out the 4-letter code. Pick the rounds (3 or 5 for a demo).
3. Wait until every player's name is in the list, then **Simulan ang laro**. Empty seats become bots.

**Joining (everyone else)**

- Scan the host's QR with the phone camera, or: Maglaro online → **Sumali** → type the code and a name.
- The screen says "Hinihintay na simulan ni … ang laro" until the host starts.

**If a phone drops out during the game**

| What happened | What to do | What the game does |
|---|---|---|
| Lost signal for a few seconds | Nothing; wait | Keeps the seat; the others see "Hinihintay si …" |
| Out for more than 60 s | Reconnect, keep the page open | A bot plays the seat ("… ay bot na muna"), and hands it back at the next turn or minigame ("… ay bumalik!") |
| Page reloaded, or the browser closed the tab and reopened it | Open the same tab again | Comes back into the same game |
| The **host** dropped out | Host reconnects or reloads the same tab | Guests see "Naputol ang host…" and wait; the game continues when the host is back |
| Opened the link in a **new tab** | Close it, go back to the old tab | A new tab is a new player and cannot take the old seat |

To talk the judges through it: every phone runs the whole game from the same seed; only the
players' choices travel, through the host, so all phones show the same board, piso and korona.

## Before the event (checklist)

Do these the **day before** and again **on the morning** of the finals.

- [ ] **Supabase project is awake.** Free projects are paused after 1 week of inactivity
      (supabase.com/pricing). Open https://supabase.com/dashboard/project/sxxqfhxhbliulzsulsew;
      if it says *Paused*, press **Restore** and wait until it is active (a few minutes).
- [ ] **Realtime settings** (Project → Realtime → Settings): *Enable Realtime service* on,
      *Allow public access to channels* on.
- [ ] **Supabase status** is green: https://status.supabase.com
- [ ] **Live check from a laptop:** `node tests/online.mjs live` passes (about 3 minutes; needs
      `npm install` and `npx playwright install chromium` once).
- [ ] **Two-phone check on the venue network:** one quick 3-round game.
- [ ] **Hotspot backup:** one phone with mobile data shares a hotspot; the others join it.
      Try one game on the hotspot before the event.
- [ ] Phones charged; screen lock set to the longest time; the game link bookmarked.
- [ ] **Offline copy on every device:** open the game once on each phone and tablet while online (the day before,
      and again in the morning). After that, one-device games work even if the venue Wi-Fi goes down; online rooms
      still need internet.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| "Hindi makakonekta" when making or joining a room | No internet, Supabase paused or down | Check the phone's internet; check the dashboard and status page; switch to the hotspot |
| Guest stuck on "Hinihintay na simulan…" and never starts | Wrong code, or the host has not pressed Simulan | Check the 4 letters; the host presses **Simulan ang laro** |
| "Wala na ang larong ito sa room …" after a reload | The game ended or the host left while the page was closed | Join the next game from the host's QR |
| "Puno na ang laro" | The host started without this phone in the list | Wait for the next game (rematch) |
| Everyone waiting on one player for a long time | That phone is slow or offline | After 60 s offline a bot plays for it; a slow player loses only that one choice |
| "Iba ang bersiyon ng laro mo. I-refresh para makasali." | This phone has an older (cached) copy of the game than the host, so it would pick different minigames | Reload the page on that phone, then join again |
| "Wala pang online dito" on the title screen | The game was opened without the Supabase settings | Use the team's link above, not an old copy of `index.html` |

## How it works

- `index.html`, online section: a room is a Supabase Realtime channel named `lsu-<code>`. Each phone
  broadcasts its whole state at most every 250 ms (plus a 2 s heartbeat); Supabase presence only
  tells who disconnected. The game code sees the same `join / peers / onPeers / presence / leave`
  room as inside Claude (`tests/mock-room.js`).
- Build check: the host and every guest put the game's build id (`BUILD` in `index.html`: a version string
  plus the list of minigames) in their presence. The host never seats a guest on another build, and that guest
  is asked to reload, because the round plan comes from the seed and the minigame list.
- The host keeps the decision log (every human choice, numbered) and publishes it; everyone else
  waits for each entry, so all phones make the same moves. Dice, bots and board events come from one
  shared seed and are never sent.
- Rejoin (F7.3): 60 s grace before a bot takes a seat; the seat goes back at the next turn or
  minigame. A reloaded tab rejoins from the host's checkpoint (start of the current turn) using the
  player id kept in that tab's sessionStorage. Nothing about players is stored on Supabase; saves
  stay on the device.

## Setup and limits

- Project: `sxxqfhxhbliulzsulsew` (free plan). The game holds only the **public**
  project URL and publishable key (`SUPA` in `index.html`). Never put the secret / service_role key
  in the game or the repo.
- Library: `vendor/supabase-2.118.0.js` (MIT), loaded only when a player opens online play.
- Free plan: 100 messages/s and 2 million messages/month for the whole project; a broadcast counts
  once sent plus once per phone that receives it.
- Measured (`tests/four.mjs`, 4 phones, 5 rounds): peak 54 messages/s, average 14. **One busy room
  at a time is safe**; two 4-phone rooms in minigames at the same moment could pass 100/s. About
  17,000 messages per 20-minute game, so roughly 100+ games a month.
- Not supported: rejoining from a brand-new tab; rejoining after a reload inside the Claude artifact.

## Tests

| Command | What it checks |
|---|---|
| `node tests/online.mjs` | Two phones through the Claude room stand-in |
| `node tests/online.mjs supabase` | Two phones through the Supabase adapter (stand-in, no internet) |
| `node tests/online.mjs live` | Two phones through the real Supabase project (needs internet) |
| `node tests/rejoin.mjs` | Drop-outs, bot takeover and seat return, guest and host page reloads |
| `node tests/four.mjs` | Four phones, a drop-out and a reload, traffic against the free plan (needs ~2 GB free memory) |
