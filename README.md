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

- **Esc key** on every page: replaces the page with a neutral weather search (no visible button; the Get help and Privacy pages explain it).
- Crisis line bar (911, National DV Hotline) on every page.
- The guest house address is never published.

## Before going live

- Donations currently use email/phone. Add an online giving link in `src/app/get-involved/page.tsx` when available.
- The contact form opens the visitor's email app. A server-side email service would let it send directly.
- Update `site.url` in `src/lib/site.ts` to the final domain.

## Content and image sources

Copy is adapted from the original GoDaddy site (doenation.godaddysites.com), with grammar fixes. The Resources and Privacy pages and the crisis-line/safety text are new.

| Image | Used on | Source | License |
|---|---|---|---|
| `doenation-sketch.jpg`, `egg-mark.png` | Home, logo, icons | DoeNation's own hand-drawn logo (from the original site) | DoeNation |
| `hello.jpg` | Contact | Drew Beamer, Unsplash (also used on the original site) | Unsplash License |
| `room-warm.jpg` | Home hero | Archee Lal, Unsplash | Unsplash License |
| `room-quiet.jpg` | Home programs, Donate | Annie Spratt, Unsplash | Unsplash License |
| `warm-lights.jpg` | Get help | Patrick Tomasso, Unsplash | Unsplash License |
| `welcome-home.jpg` | Get involved | Stocker LL, Unsplash | Unsplash License |

The original site's other three photos (a "welcome back" note, a bedroom and light bulbs) were Getty images licensed through GoDaddy's builder, which can't be reused off GoDaddy. The Unsplash photos above were chosen as free look-alikes of those subjects.

## Verifying changes

Agents (and people) can drive and check the site with the `verify-site` skill: `.claude/skills/verify-site/SKILL.md`.
