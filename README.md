# Half-Life 2 Lambda Cache Tracker

A static web tool for finishing the **Lambda Locator** achievement in Half-Life 2.
Upload your `gamestate.txt` and it shows which of the 45 lambda caches you've
already found, grouped by chapter, with a video guide link for each chapter.

Everything runs in your browser — the file you upload is never sent anywhere.

## Usage

1. Open `index.html` (or the hosted site).
2. Click **Upload gamestate.txt** and pick the file from your Half-Life 2 install.
3. Found caches are checked; missing ones are not.

### Where is gamestate.txt?

In Steam, right-click **Half-Life 2 → Properties → Installed Files → Browse**,
then open either the `hl2` or `hl2_complete` directory. (`hl2_complete` exists if
you have Episode One and Episode Two installed, or the 20th Anniversary Edition.)
`gamestate.txt` lives at the top level.

## How it works

`gamestate.txt` contains a `GameState` block whose `id 86` entry holds the cache
bitmask:

```
"id"    "86"
"value" "0"
"data"  "0x00000008C2C5D3C1"
```

The tool pulls out `"data"`, validates it as hex, and reads it as a 45-bit mask
(`BigInt`): cache _N_ is obtained when bit _N-1_ is set. Caches are then grouped
into the 11 chapters they appear in, in play order.

## Running locally

No build step and no dependencies.

```sh
git clone git@github.com:aspeckt112/LambdaCacheTracker.git
cd LambdaCacheTracker
python3 -m http.server 8000
```

Then open <http://localhost:8000>. Opening `index.html` directly also works.

`docs/gamestate.txt` is a real sample file you can upload while developing.

## Tests

```sh
node --test tests
```

Requires Node 18 or newer (uses the built-in `node:test` runner). The suite covers
file parsing, validation failures, cache numbering, and the bitmask-to-chapter
mapping.

## Project layout

| Path                       | Purpose                                              |
| -------------------------- | ---------------------------------------------------- |
| `index.html`               | Single page: instructions and the upload control      |
| `js/game-state.js`         | Parsing and bitmask logic (pure; exported for tests)  |
| `js/site.js`               | DOM wiring and rendering                             |
| `css/site.css`             | Styling                                              |
| `tests/game-state.test.js` | Unit tests for the parsing logic                     |
| `images/`                  | Screenshots used in the on-page instructions         |
| `docs/gamestate.txt`       | Sample `gamestate.txt` for development               |

## License

MIT — see [LICENSE](LICENSE).
