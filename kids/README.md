# Mga Bata: the four playable kids in 3D

Jun, Neneng, Totoy and Bunso as rigged 3D figures, from the team's **Mga Bata** character
set (v5, made by Ian Patrick A. Flores using Claude). They are built in code with Three.js:
no model files. `index.html` loads these modules after Three.js and builds each kid once.

| Kid | Look |
|---|---|
| Jun | Red tee, cap worn backwards, long hair, cheek bandage |
| Neneng | Yellow floral dress, pigtails, holds a flower |
| Totoy | Blue tee with a *bangus* print, bowl cut |
| Bunso | Green tank top, curly hair, nose bandage, gap teeth, tirador (slingshot) |

| File | What it does |
|---|---|
| `kids.js` | `buildKid(THREE, def)` builds one kid: a skinned body on an 18-joint rig, face, hair, clothes, tsinelas and prop. `KIDS` holds the four designs, `CLIPS` the animations (idle, walk, run, jump, fall, victory, defeat, pickUp, kick, throw, wave), `setExpression` the 8 faces, `applyPose` / `poseAt` pose a kid |
| `kidgeo.js` | The shape helpers the kids are swept from |
| `hero.js` | The four kids on their own transparent layer, for the splash: they hop in, Neneng waves, all cheer on cue. Adapted from the splash design's "3D kids v4". (The main menu now shows the kids in its Plaza scene, `maps/title.js`) |

Sizes are in meters (a kid is about 0.95 m tall); the game scales them by 60.

How the game uses them: board, title, HUD portraits and minigames show these kids for the
four players; the game's moods pick the animation and face (walking or hopping → walk/run,
cheer → victory and excited face, sad → defeat, Sipa kick → kick, Palosebo → a climbing
pose, Luksong Tinik jumps → jump). Kasama friends, spectators, guards and the other
minigame kids are built from the same rig: `NPC_KIDS` holds their four designs (Lito,
Mayumi, Boyet, Dodong). `buildKid` merges each kid's static parts by material and
`castShadows` keeps small parts out of the shadow pass, so a kid costs about 31 to 35
draws.

On devices without 3D (no WebGL, or before `kids.js` has loaded) the board and portraits
use `sprites.png` / `sprites.json`: the 8 kids in 15 poses (front, back, side; idle, walk,
hop, cheer, sad), 96 × 120 frames, rendered from these 3D kids by
`node tools/kid-sprites.mjs`. Re-run it after changing a kid's design. The Mga Bata
gallery shows the 3D kids themselves through `hero.js` (`gallery(clip, yaw)`).

Changes from the character set: the import of `kid-geo` points at `./kidgeo.js`, and an
`LOD` setting lets phones and tablets build the swept forms and Bunso's curls with fewer
segments.
