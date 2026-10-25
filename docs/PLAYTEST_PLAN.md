# Playtest 1 plan (Nov 8)

Owner: Joey (writes this plan, collects notes). Ian schedules the session and runs the
room. See `docs/PRD.md` section 4 ("Shared: Playtests") and the Nov 8 milestone
("Playtest build 1": F1, F2, F3 in the game; F4 first version; first kid playtest, 5–8
kids).

## Goal

Find out, before we spend the next two weeks on art and islands, whether a first-time
kid player understands what's happening on screen and can start and finish a game
without an adult. This is the first real signal on F1 (pacing) and F3 (menu), and a
first look at F4 (pre-game visuals).

## Who

- 5 to 8 kids, ages 7–12, mixed first-time and returning players if possible (note
  which is which — first-time reactions matter most for F2/F3/F4)
- Ian runs the room (hands out devices, keeps time); Joey observes, takes notes, and
  runs the short post-game questions; a third team member records attention/confusion
  moments at the first sign of hesitation (don't rely on memory afterward)
- Get a parent/guardian's okay before the session; no names or photos go in our notes —
  use "Kid 1", "Kid 2", etc.

## What we're testing

Only what's actually in the Nov 8 build: F1 (pacing), F2 (splash), F3 (menu), F4 v1
(pre-game visuals, may still be rough). Don't test islands/art polish (F5/F6, not due
yet) or online play (F7, separate test).

## Setup

- Devices: use what's in `docs/DEVICES.md` — ideally include the slowest one once it's
  named, so pacing/frame-rate problems show up here, not just at the finals
- One device per kid where possible; if devices are short, pair kids and watch for who
  disengages while waiting
- Build: the Vercel preview or production URL as of the session date, not a local file
- Have the "Bilis ng laro" setting (F1.1) at its default (Tama) unless specifically
  testing another speed

## Protocol

1. Hand the kid the device with the title screen already open. Say nothing about how
   to play — this tests F2/F3, not an explained tutorial.
2. Let them tap through on their own. Note where they hesitate, mis-tap, or ask "what do
   I do?" Time from splash tap to first dice roll.
3. Let them play at least 3 rounds (or until they want to stop).
4. After their last turn of a round, pause and ask: **"Ano nangyari sa huling turn mo?"**
   (What happened on your last turn?) — this is the F1 acceptance check. Mark right/
   vague/wrong.
5. After the session, ask:
   - "Ano ang paborito mong parte?" (favorite part)
   - "May nalito ka ba?" (anything confusing) — let them point at the screen
   - For one or two of the minigames played: "Alam mo ba kung paano ito laruin sa
     totoong buhay?" (do you know how to play this for real) — early signal for the
     learning layer, not a hard F9 metric yet
6. **Read-aloud check (Simpler Filipino PRD, L1.6):** open one minigame's rules card
   (Hamon ng Araw → Pagsasanay, or the card before a minigame) and ask the kid to read it
   out loud, then: **"Paano laruin ito? Sabihin mo sa sarili mong salita."** (How do you
   play this? Say it in your own words.) Mark explained / partly / couldn't, and note any
   word they stumbled on. Target: at least 4 of 5 kids explain it.
7. Thank them; no scores or names recorded publicly.

## What to record (per kid)

Use the template below, one row per kid, kept in a shared sheet (not committed to the
repo — may include a parent's contact for follow-up).

| Field | Notes |
|---|---|
| Kid # | "Kid 1", no real name |
| First-time player? | Y/N |
| Device used | from `docs/DEVICES.md` |
| Splash → first roll time | seconds |
| Started without help? | Y/N — did an adult have to explain anything before their first roll |
| Could explain last turn? | Y / vague / N, plus their exact words if useful |
| Visible confusion moments | what happened, which screen/space, estimate when (round/turn) |
| Minigame reactions | which they liked, which they struggled with |
| Read-aloud rules card | which game; explained / partly / couldn't; words they stumbled on |
| Finished a game? | Y/N, how many rounds |
| Free notes | anything else worth remembering |

## Metrics we're checking against (from the PRD)

- F1 acceptance: at least 8 of 10 kids can say what happened on their last turn
- F3 acceptance: 9 of 10 kids start a game without help
- Section 8 success metrics (finals-level targets, this session is an early read, not
  the final measurement): 8/10 finish a 3-round game without help; 8/10 can explain the
  last turn; 7/10 can name the real rules of 2 games after playing

Since this group is only 5–8 kids, report raw counts ("5 of 6") rather than forcing them
into the 10-kid ratios above — note if the sample is too small to call a metric pass or
fail.

## After the session

1. Joey compiles the sheet into a short summary: what worked, what confused kids, and
   whether any F1/F3/F4 acceptance criteria failed.
2. File a GitHub issue per confusion point that maps to a specific feature (tag with the
   feature ID: F1, F2, F3, or F4) so Ian can triage.
3. Share the summary at the next Sunday build call before deciding whether F1/F3 need
   another pass before the Nov 15 "World build" milestone.
