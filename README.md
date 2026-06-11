# GLORIFY — Luxury Christian Streetwear

*Soli Deo Gloria.* A self-contained, dependency-free website for **Glorify**, a luxury
Christian streetwear house. Cut slow. Worn loud. To His glory.

Quiet-luxury art direction: bone & ink palette, champagne-gold accents, editorial serif
typography, a crown-of-thorns "G" brand mark, and a single cohesive campaign —
*Collection N°1 · Lux Mundi* — photographed in basilica light.

## Running it

No build step, no dependencies. Open `index.html` directly, or serve the folder:

```sh
python3 -m http.server 8000
# → http://localhost:8000
```

It also works out of the box on GitHub Pages or any static host.

## What's inside

| Path | Purpose |
| --- | --- |
| `index.html` | The complete one-page experience |
| `css/style.css` | Design system + all styling (custom properties, no framework) |
| `js/main.js` | Interactions — preloader, custom cursor, scroll reveals, parallax, lookbook drag, signatures hover pane (vanilla JS, no libraries) |
| `assets/fonts/` | Self-hosted variable fonts: Italiana, Cormorant Garamond & Jost (woff2, latin subset, ~113 KB total) |
| `assets/img/` | Campaign photography |
| `_preview/` | Rendered screenshots of every section (desktop & mobile) |
| `.github/` | Opt-in preview workflow — add `[preview]` to a commit message to re-render `_preview/` with headless Chrome |

Appending `?still` to the URL freezes all motion (preloader, reveals, parallax,
marquee) — handy for screenshots, testing, or motion-free reading.

## Design notes

- **Typography** — Italiana for the wordmark and display headings, Cormorant Garamond for
  editorial copy and italics, Jost for navigation, labels and UI.
- **Palette** — bone `#f4efe7`, ink `#14120e`, champagne gold `#a8854c`.
- **Motion** — letter-split hero reveal, clip-path image wipes, parallax frames, marquee,
  magnetic buttons and a custom cursor. All motion respects `prefers-reduced-motion`.
- **Accessibility** — semantic landmarks, keyboard-accessible signatures list and menus,
  visible focus states, descriptive alt text.

## Imagery & mark

The campaign photographs were generated with Higgsfield Soul 2.0 specifically for this
project and are committed locally, so the site has no external runtime dependencies.

The crown-of-thorns "G" currently on the site is an inline SVG interpretation of the
official brand logo. To use the original artwork, commit it to `assets/img/` and swap
the `#mark` references in `index.html`.
