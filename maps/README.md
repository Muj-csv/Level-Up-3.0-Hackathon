# Island maps

The four 3D islands the game is played on: Plaza, Palengke, Aplaya and Palayan. They come
from the team's **Taympers Maps** package (made by Ian Patrick A. Flores using Claude) and
are built in code with Three.js, in meters. `index.html` loads only the island being
played, when the game starts.

| File | What it does |
|---|---|
| `islands/<id>.js` | `build(THREE)` builds the island; its board graph is the `board_spaces` group's `userData` |
| `polish.js` | Board path, tiles, sky dome, fog, light and material polish |
| `life.js` | Banners, walkers, birds, flags (the game hides this file's korona; it draws its own) |
| `living.js` | Water, grass, leaves, people, animals, vehicles, seasons |
| `boards.js` | The four board graphs as data (`window.TAYMPERS_BOARDS`), so the board also works in 2D and without WebGL |
| `world/` | The map-screen pictures: `world.jpg` (all four islands) and a close-up of each island |

Changes from the package:

- `polish.js`: `normals: false` skips the normal maps made from textures (slow on phones).
- `life.js`: each frame's update is wrapped so one bad frame cannot stop the loop, and a
  `stopped()` option ends the loop when the game drops the island.
- `boards.js` is the package's `boards/*_board.json` files in one script.
- The game passes `post: false` and `ui: false` to `living.js` (no bloom pass, no
  on-screen controls) and fewer leaves and grass layers on phones and tablets.

If an island changes, re-render the map-screen pictures with `node tools/world-render.mjs`
and copy the island boxes it prints into `WORLD` in `index.html`.
