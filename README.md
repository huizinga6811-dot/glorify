# GLORIFY — Maison de Couture

A self-contained, dependency-free luxury fashion website for the clothing brand **Glorify**.

Quiet-luxury art direction: bone & ink palette, champagne-gold accents, editorial serif
typography, and a single cohesive campaign — *Campagna N°1 · Lumière* — photographed in
a sunlit travertine gallery.

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
| `assets/fonts/` | Self-hosted Italiana, Cormorant Garamond & Jost (woff2, latin subset) |
| `assets/img/` | Campaign photography |

## Design notes

- **Typography** — Italiana for the wordmark and display headings, Cormorant Garamond for
  editorial copy and italics, Jost for navigation, labels and UI.
- **Palette** — bone `#f4efe7`, ink `#14120e`, champagne gold `#a8854c`.
- **Motion** — letter-split hero reveal, clip-path image wipes, parallax frames, marquee,
  magnetic buttons and a custom cursor. All motion respects `prefers-reduced-motion`.
- **Accessibility** — semantic landmarks, keyboard-accessible signatures list and menus,
  visible focus states, descriptive alt text.

## Imagery

The campaign photographs were generated with Higgsfield Soul 2.0 specifically for this
project and are committed locally, so the site has no external runtime dependencies.
