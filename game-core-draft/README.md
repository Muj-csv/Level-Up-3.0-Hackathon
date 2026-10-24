# game-core draft (Phase 1a exploration — not wired into the game)

This is a **safe, isolated draft**, not a real extraction. It does not replace, import
from, or get imported by `index.html`. The live game is unchanged; nothing here ships
until the team actually starts `BUILD_PLAN.md`'s Phase 1, after the finals.

## Why this exists

`BUILD_PLAN.md`'s Phase 1a asks to extract the game's deterministic rules into
`packages/game-core`, pure TypeScript, no DOM. That's weeks of work for the whole team
and depends on a monorepo (Phase 0) that doesn't exist yet. Building that for real now
would mean working against `index.html` while Ian is actively changing it for the
finals (F1-F6) — guaranteed merge conflicts, for a package nobody can adopt yet.

This folder is the much smaller, fully reversible slice of that idea: the **pure
numeric and decision logic**, ported faithfully from `index.html`, with unit tests that
check it against known-good values from the real game (e.g. the board really is 37
spaces with 9 types — see `board.test.mjs`). It's meant to be a reference for whoever
does the real Phase 1a later, not a deliverable in itself.

## What's ported (and verified against the live game)

| File | From `index.html` | Covers |
|---|---|---|
| `util.mjs` | `G()`, `gpick` | Seeded RNG, pick-from-array |
| `board.mjs` | `buildPath()`, `assignTypes()`, `KORONA_CANDS` | Board geometry → space types → korona-eligible spaces |
| `config.mjs` | `KCOST`, `ITEMS`, `MODES`, `DIFFS`, `normCfg()`, `rollRange()` | Mode/round/difficulty validation, item costs, dice ranges |
| `scoring.mjs` | `koronaDist()`, `standings()`, `rankPay()`, `bonusList()` | Distance-to-korona, win ranking, minigame payouts, bonus korona |
| `bots.mjs` | `botUsesItem()`, `botGintoPick()`, `botShop()`, `botRival()`, Kasama-join pick | All bot decisions, by difficulty |
| `jackenpoy.mjs` | `HANDKEYS`, `BEATS`, win/transfer math | Jack en Poy outcome and piso transfer |

## What's deliberately NOT ported

- Anything that touches the DOM, Canvas, Three.js, audio, or animation timing
  (`await wait()`, `tween()`, `say()`, `burst()`, etc.) — that's presentation, not a
  rule, and belongs to the real Phase 1b (React/r3f port), not this.
- The full turn loop as a single `applyAction(state, action) -> {state, events}`
  reducer, as BUILD_PLAN's Phase 1a prompt describes. Building that faithfully means
  touching every space-effect handler, the shop flow, trivia, and the online sync path
  — a correct version of that is real Phase 1a work, done against a monorepo, with the
  whole team's sign-off. This draft is the easy 80%; the reducer shape is the hard 20%.
- Island/character names, UI copy, icons — content, not rules (see `content/fil.json`
  for where that lives already, per F9).

## Running the tests

No new dependencies — just Node's built-in test runner:

```bash
node --test game-core-draft/*.test.mjs
```

42 tests, covering the board geometry, every bot decision function, scoring/payouts,
and Jack en Poy — all passing as of this port (Oct 23, 2026).
