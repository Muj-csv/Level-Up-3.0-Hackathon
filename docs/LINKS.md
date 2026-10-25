# Taympers — Project Links

Updated 23 Oct 2026. One place for every link the team needs. If a link changes, update
it here.

## Play the game

| What | Link | Notes |
|---|---|---|
| **Live game (Vercel, production)** | https://taympers.vercel.app | Rebuilds every time `main` changes. This is the link to share with judges and players. Confirm the exact address in Vercel → taympers → Settings → Domains, and fix it here if it differs. |
| Preview of the working branch (Vercel) | https://taympers-git-claude-sharp-thompson-xec8ut-mujjs-projects.vercel.app | Rebuilds from `claude/sharp-thompson-xec8ut` before it is merged. Vercel may ask visitors to log in, so use it for team testing only. |
| Preview of the language testing branch (Vercel) | https://taympers-git-lang-testing-mujjs-projects.vercel.app | **Not checked yet:** `lang/testing` (Simpler Filipino and English work) is not pushed, so Vercel has not built it. The address follows the pattern above; after the push, confirm it in Vercel → Deployments, fix it here if it differs, and note whether it asks for a login. If it does, test from a laptop instead: `python3 -m http.server 8000` on `lang/testing`, phones on the same Wi-Fi. |
| Backup copy (GitHub Pages) | https://muj-csv.github.io/Level-Up-3.0-Hackathon/ | Also built from `main`, if Pages is turned on in the repo settings. |
| Original prototype (Claude artifact) | https://claude.ai/artifact/FQqtor9NZvLytPNJotsPuc | Private and older than the live game. Currently the only place where online rooms work. |

## Code

| What | Link |
|---|---|
| GitHub repository | https://github.com/Muj-csv/Level-Up-3.0-Hackathon |
| `main` branch (what is live) | https://github.com/Muj-csv/Level-Up-3.0-Hackathon/tree/main |
| Working branch (new changes, merged by Ian) | https://github.com/Muj-csv/Level-Up-3.0-Hackathon/tree/claude/sharp-thompson-xec8ut |
| Pull requests | https://github.com/Muj-csv/Level-Up-3.0-Hackathon/pulls |
| Commit history | https://github.com/Muj-csv/Level-Up-3.0-Hackathon/commits/main |

Clone it:

```bash
git clone https://github.com/Muj-csv/Level-Up-3.0-Hackathon.git
```

## Deployment and settings (repo and Vercel owners)

| What | Link |
|---|---|
| Vercel project | https://vercel.com/mujjs-projects/taympers |
| Vercel domains | https://vercel.com/mujjs-projects/taympers/settings/domains |
| Vercel deployments | https://vercel.com/mujjs-projects/taympers/deployments |
| GitHub Pages settings | https://github.com/Muj-csv/Level-Up-3.0-Hackathon/settings/pages |
| Add teammates to the repo | https://github.com/Muj-csv/Level-Up-3.0-Hackathon/settings/access |

## Project documents

| Document | What it is |
|---|---|
| [README](../README.md) | How to play, rules, controls, deployment, team, credits |
| [Product requirements (PRD)](PRD.md) | Roles and work plan up to the finals |
| [Build plan](BUILD_PLAN.md) | Longer-term plan after the finals |
| [Writing rules](WRITING.md) | How the game's Filipino and English text is written, and the protected terms |
| [Text inventory](TEXT_INVENTORY.md) | Every piece of player-facing text, made by `node tools/text-scan.mjs` |
| [Dev log](../DEVLOG.md) | Work log and AI-use record for Form 03 |
| [Tests](../tests/README.md) | How the automated play-tests work |
| [Bundled libraries](../vendor/README.md) | Three.js and the QR library, with licences |

The submission forms (Forms 01–03, Template 01) and the video scripts are Word files kept
outside this public repo, because they hold signatures and school details. Shared copy:
[add the team drive link].

## Contest

| What | Details |
|---|---|
| Competition | Level Up 3.0 Esports Game Dev Challenge, Student Category |
| Entry deadline | 25 Oct 2026 |
| Finalists announced | 9 Nov 2026 |
| Finals (game demonstration and judging) | 26–27 Nov 2026, General Santos City |
| Registration and upload links | [add the links from the organizers] |
