# Home sections

The home page (`/`) tells a first-time visitor what DoeNation is and routes them to help or to giving.

## Sub-features

- Hero: split layout, H1 "A safe place to begin again.", CTAs "Get help" (→ `/client-info`) and "Donate" (→ `/get-involved#donate`); hero photo is the LCP element (`preload`).
- Crisis lines: see [crisis-lines.md](crisis-lines.md).
- Story: hand-drawn "A DOE NATION" sketch (`/images/doenation-sketch.jpg`) + mission copy, link "How we can help".
- What we do (bento, the only eyebrow on the page): confidential stay (image tile), community outreach (accent), education (soft), health and wellbeing (wide row with "Get help").
- Get involved band: sunrise photo with scrim, "Donate" + "Get involved" CTAs, 3 glass list items.
- Closing: "Not sure where to start? Start with a call." + "Contact us".

## Where it lives

- Source: `src/app/page.tsx`. Images in `public/images/`.

## Driving it with control-site

```bash
node $C goto / && node $C snapshot
node $C screenshot .verify/home.png --full --viewport desktop
node $C click 'main >> role=link[name="Get help"] >> nth=0'   # hero CTA at every viewport (scoping to main skips the header nav)
```

## Expected states to verify

- Hero headline ≤ 2 lines on desktop; both CTAs visible without scrolling at 1440×900 and 390×844.
- Bento: 4 cells, image tile spans 2 rows on desktop, all stacked on mobile.

## Gotchas

- Story image is slightly scaled (`scale-[1.06]`) to hide the photo's dark edges.
