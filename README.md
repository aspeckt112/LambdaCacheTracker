# Half-Life 2 Lambda Cache Tracker

A static web tool for finishing the **Lambda Locator** achievement in Half-Life 2.
Upload your `gamestate.txt` and it shows which of the 45 lambda caches you've
already found, grouped by chapter, with a video guide link for each chapter.

Everything runs in your browser — the file you upload is never sent anywhere.

## Usage

1. Open `index.html` (or the hosted site).
2. Click **Upload gamestate.txt** and pick the file from your Half-Life 2 install.
3. Found caches are filled in and ticked; missing ones are outlined and hollow.

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
| `index.html`               | Single page: instructions, cache table, FAQ, upload   |
| `js/game-state.js`         | Parsing and bitmask logic (pure; exported for tests)  |
| `js/site.js`               | DOM wiring and rendering                             |
| `css/site.css`             | Styling                                              |
| `tests/game-state.test.js` | Unit tests for the parsing logic                     |
| `images/`                  | Screenshots used in the on-page instructions         |
| `docs/gamestate.txt`       | Sample `gamestate.txt` for development               |
| `sitemap.xml`              | Single-URL sitemap for search engines                |
| `robots.txt`               | Crawl directives (see the note below)                |

## Hosting and SEO

The site is published with GitHub Pages at
<https://aspeckt112.github.io/LambdaCacheTracker/>. Because it lives on a project
subpath:

- The canonical URL in `index.html` and the URL in `sitemap.xml` must keep the
  trailing slash and the `/LambdaCacheTracker/` prefix. GitHub Pages also serves
  `/index.html`, so the canonical tag is what prevents a duplicate-URL split.
- `robots.txt` is only read from the origin root
  (`https://aspeckt112.github.io/robots.txt`), so this copy is **not** used by
  crawlers. Nothing is blocked, so the page is indexable regardless; submit
  `sitemap.xml` directly in Search Console instead.
- `.nojekyll` makes Pages serve files verbatim instead of running a Jekyll build.

After deploying, submit the sitemap in Google Search Console (URL-prefix property
for the subpath) and optionally in Bing Webmaster Tools. Update `<lastmod>` in
`sitemap.xml` and the `<time>` in the page footer when the content changes.


## License

MIT — see [LICENSE](LICENSE).
