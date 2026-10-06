# Theme and design system

Tokens, type, shapes and motion shared by every page.

## Sub-features

- Colors: CSS variables in `src/app/globals.css` (`--bg`, `--surface`, `--ink`, `--muted`, `--accent`, `--accent-soft`, `--border`), mapped to Tailwind colors (`bg-accent`, `text-muted`, `border-line`…). One accent: brand plum `#5b2e91` (dark mode: `#c3a6ef`).
- Dark mode: `prefers-color-scheme` only, no toggle.
- Type: Lexend only (variable, loaded via `next/font` as `--font-body`), used for headings (`.display` utility: tight tracking, balanced wrap) and body. Lexend has no italic, so headline emphasis is accent color only. Never add `italic` (the browser would fake an oblique).
- Shapes: buttons are full pills (`btn-primary`, `btn-secondary`), panels and images 20px, inputs 12px.
- Motion: `.reveal` (via `src/components/Reveal.tsx`) uses CSS scroll-driven animation; disabled under `prefers-reduced-motion`.
- Z-index scale (only these): header `z-40` (mobile menu lives inside it), Quick exit and focused skip link `z-50`.

## Driving it with control-site

```bash
node $C theme dark && node $C goto / && node $C screenshot .verify/home-dark.png --full
node $C sweep --themes light,dark
```

## Expected states to verify

- Every accent CTA text passes contrast in both themes (`a11y` checks this).
- No section flips theme mid-page; the image bands use their own fixed dark scrim in both modes.

## Gotchas

- Tailwind v4: custom classes used with `@apply` must be declared with `@utility`, not in `@layer components`.
