# DoeNation website

Website for DoeNation, a guest house in Aurora, Colorado for women leaving abusive homes. Replaces https://doenation.godaddysites.com/.

## Run it

```bash
npm install
npm run dev -- -p 3100     # http://localhost:3100
npm run build && npm start # production
```

## What's where

- Pages: `src/app/` (`/`, `/client-info` = Get help, `/get-involved`, `/contact`, 404)
- Contact details, crisis lines, nav, quick-exit URL: `src/lib/site.ts`
- Design tokens (colors, light/dark), button and layout utilities: `src/app/globals.css`
- Images: `public/images/`

## Safety features

- **Quick exit** button on every page, plus the **Esc** key: replaces the page with a neutral weather search.
- Crisis line bar (911, National DV Hotline) on every page.
- The guest house address is never published.

## Before going live

- Donations currently use email/phone. Add an online giving link in `src/app/get-involved/page.tsx` when available.
- The contact form opens the visitor's email app. A server-side email service would let it send directly.
- Photos in `public/images/` are placeholder photography from Picsum (Unsplash licence). Swap in DoeNation's own when you have them.
- Update `site.url` in `src/lib/site.ts` to the final domain.

## Verifying changes

Agents (and people) can drive and check the site with the `verify-site` skill: `.claude/skills/verify-site/SKILL.md`.
