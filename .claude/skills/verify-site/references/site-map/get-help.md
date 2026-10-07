# Get help (`/client-info`)

The page for women seeking help: reassurance, how to reach DoeNation, and online-safety tips.

## Sub-features

- Hero: "You do not have to do this alone.", CTAs "Call 720-341-8844" (tel:) and "Contact us".
- Crisis lines panel.
- Three numbered steps: Get in touch, Talk through what you need, Move somewhere safe.
- Online safety tips (4): device, private browsing, clearing history, the Esc key.
- Closing link to `/get-involved`.

## Where it lives

- Source: `src/app/client-info/page.tsx`, hero via `src/components/PageHero.tsx`.

## Driving it with control-site

```bash
node $C goto /client-info && node $C snapshot
node $C screenshot .verify/get-help.png --full --viewport mobile
```

## Gotchas

- Route slug stays `/client-info` for SEO continuity with the old site; nav label is "Get help".
