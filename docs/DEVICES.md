# Demo devices (F10)

F10.1 asks us to name the demo devices by Nov 1, including the slowest one — that
device sets the performance floor for the whole build. Targets, from the PRD (F10.1)
and build plan: 30 fps or better on the slowest device, 60 fps on a recent phone or
iPad; first load under 8 s on 4G; total download under 15 MB; offline play works after
the first load.

## Current roster

| Device | Owner | Model | OS version | RAM | Role (phone/tablet) | Status |
|---|---|---|---|---|---|---|
| iPad | TBD | TBD | TBD | TBD | Tablet | Specs needed |
| iPhone | TBD | TBD | TBD | TBD | Phone | Specs needed |
| Android phone | TBD | TBD | TBD | TBD | Phone | Specs needed |

Fill in the owner, exact model, OS version and RAM for each device above. Whoever owns
the device: Settings > About (or About phone) has the model name and OS version;
RAM is usually on the same screen or the box/spec sheet if you still have it.

## Gap vs. the build plan

`BUILD_PLAN.md` ("Assets and tools") recommends at least one iPad, one budget Android
tablet, and one Android phone for testing. We currently have no Android tablet — only
an Android phone. Action: either source a budget Android tablet before the Nov 15
"World build" milestone, or explicitly accept the Android phone as the low-end stand-in
and say so here.

## Picking the slowest device

Once the specs above are filled in, the slowest device is normally the oldest /
lowest-RAM one — typically an older Android phone over a recent iPhone or iPad. Confirm
with a real run of `tests/3d.mjs`'s board frame-time benchmark or a manual fps check in
`index.html?debug` once specs are known; don't assume from specs alone if two devices
are close.

## Weekly test log (F10.5)

One row per device per week. fps columns: board / a representative minigame. Until the
real devices above have specs filled in, the "headless proxy" rows below stand in —
they catch bundle-size and load-time regressions early, but they are not a substitute
for a real fps reading on the actual demo devices. See `docs/F10_PERFORMANCE.md` for
the full method and findings behind each headless row.

| Date | Device | Build (commit or Vercel URL) | fps (board) | fps (minigame) | First load | Offline after first load? | Notes | Tester |
|---|---|---|---|---|---|---|---|---|
| Oct 23, 2026 | headless proxy (no real device yet) | local, commit at time of test | n/a (not measured headless) | n/a | ~3.0 s to menu-ready (simulated Fast 4G, Playwright CDP) | No (no service worker yet; see F10_PERFORMANCE.md) | Bundle 961 KB total (well under the 15 MB budget) | Joey (Claude) |

## Action items

- [ ] Get exact model, OS version and RAM for the iPad, iPhone and Android phone from
  their owners, by Oct 31 (ahead of the Nov 1 F10.1 deadline)
- [ ] Decide the slowest device / performance floor once specs are in
- [ ] Decide whether to source an Android tablet or test without one
- [ ] Get a real fps reading on each named device once specs are in — see
  `docs/F10_PERFORMANCE.md` for what's been checked headless so far (bundle size, load
  time, offline behavior) and what still needs a real device (fps, true offline-after-
  close test on a phone)
- [x] Fonts are now self-hosted (`vendor/fonts/`), closing part of the F10.3 offline gap
- [ ] F10.3's bigger piece — actually caching the game for offline play after the first
  load (a service worker / cache strategy) — is still missing; see
  `docs/F10_PERFORMANCE.md`
