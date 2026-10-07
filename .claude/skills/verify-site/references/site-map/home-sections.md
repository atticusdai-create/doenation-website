# Home sections

The home page (`/`) tells a first-time visitor what DoeNation is and routes them to help or to giving.

## Sub-features

- Hero: split layout, H1 "Discover DoeNation / Guest House." (forced break from md up; 2 lines on desktop/tablet, 3 on phones), CTAs "Get help" (→ `/client-info`) and "Donate" (→ `/get-involved#donate`); hero photo `room-warm.jpg` is the LCP element (`preload`).
- Crisis lines: see [crisis-lines.md](crisis-lines.md).
- Story: hand-drawn "A DOE NATION" sketch (`/images/doenation-sketch.jpg`) + "Welcome to DoeNation." mission copy, link "How we can help".
- Our programs (bento, the only eyebrow on the page): DoeNation Guest House (image tile, `room-quiet.jpg`), community outreach (accent), education (soft), health care initiatives (wide row with "Get help").
- Join DoeNation band: solid dark plum (`#3d1d66`, same in both themes), "Donate" + "Get involved" CTAs, 3 list items (events, member, volunteer).
- Closing: "Have a question or want to get in touch?" + "Contact us".

Copy comes from the original GoDaddy site (see README "Content and image sources"). Keep new copy in that voice and don't invent services or claims.

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
