---
name: verify-site
description: Drive, inspect and verify the DoeNation website in a real browser — navigate, click, type, snapshot the a11y tree, screenshot, lint layout, audit a11y, measure perf, sweep every page × viewport × theme, check links and record video proof. Use after any UI, content, style or routing change, to reproduce a bug, or whenever you need evidence that the site works. Includes a Site Map of every page and feature.
---

# Verify DoeNation

You can check your own work. **Don't claim a UI change works until you've seen it work here.** Screenshots and video are the proof you hand back.

DoeNation is a safe house for women leaving abusive homes. Visitors may be in danger or on a monitored device. **The safety features (Quick exit, Esc key, crisis lines) are the most important thing on the site. Re-verify them after any layout change.** See [safety.md](references/site-map/safety.md).

CLI (all output is JSON; failures include a `hint`):
```bash
C=.claude/skills/verify-site/control-site.mjs
node $C help                 # grouped command list; `help <cmd>` for details
node $C doctor               # start here if anything seems off
node $C dev up               # starts `npm run dev -- -p 3100` at http://localhost:3100 if not already running
```

## Core loop
```bash
node $C goto /client-info                          # returns status, title, console errors during load
node $C snapshot                                   # a11y tree: cheapest way to see structure + names for selectors
node $C click 'role=button[name="Open menu"]'      # selectors: CSS | text=… | role=…[name="…"]
node $C screenshot .verify/get-help.png --full --viewport mobile
```
Read the PNG to actually look at it. The session is persistent: viewport (`viewport mobile`), theme (`theme dark`), motion (`motion reduce`) and pinned tab (`tab <n>`) stick until changed.

Useful extras:
```bash
node $C screenshot .verify/donate.png --selector '#donate'   # whole element, even if taller than the viewport, reveals frozen
node $C scroll '#donate' --block start                       # selector → into view (default center); y=N absolute; +N/-N relative
node $C visible 'role=button[name^="Quick exit"]'            # in viewport + not covered + opacity
node $C tabs                                                 # after anything that opens a new tab (Quick exit does)
node $C form-state                                           # after submitting: invalid fields + error text, focus, status messages
```

## Before you say "done"
1. `lint <route> --viewport mobile` and `--viewport desktop`: no **high** issues on pages you touched.
2. `sweep --routes <touched routes> --themes light,dark`: open the gallery and look at every screenshot.
3. `a11y <route>`: 0 serious/critical (baseline is 0 violations on every route).
4. `console --errors --page`: no errors since the last `goto` (plain `console` is the whole session history).
5. Interactive change? Drive it, then `record <route> out.webm --steps steps.json` for video proof. A working steps file: `.verify/proof-steps.json` (menu → contact form errors → submit → Esc exit).
6. Perf-sensitive change (images, fonts, JS deps, above-the-fold)? `prod up` (builds and serves at :3101; `--rebuild` after code changes), then `perf http://localhost:3101/<route> --runs 3 --throttle --viewport mobile`, then `prod down`. Budgets (tightened Oct 2026): LCP 1800 ms, CLS 0.05, TBT 200 ms, JS 200 KB, total 500 KB. Baseline: LCP 0.7–1.4 s throttled (worst `/get-involved`), JS ≈ 145 KB, total 236–305 KB.
7. Links or routing changed? `links`.

## Site Map
Every page and feature, how to reach it, how to drive it: **[references/site-map/README.md](references/site-map/README.md)**. Read the README first, then only the feature files you need.

If you find something the Site Map doesn't cover, or it's wrong, **fix the Site Map in the same change**.

## Project specifics
- Stack: Next.js 16 App Router (all routes static), Tailwind v4 with `@utility` classes + CSS-variable tokens in `src/app/globals.css`, Phosphor icons. Read `node_modules/next/dist/docs/` before using Next APIs (e.g. `next/image` uses `preload`, not `priority`).
- Auth: none. Data: none; all copy lives in the page files and `src/lib/site.ts` (phone, email, crisis lines, nav, quick-exit URL).
- Theme: light/dark via `prefers-color-scheme` only (no toggle). Test with `theme dark`.
- Port: 3100 (port 3000 is used by another project on this machine; don't kill it).
- Known noise: after Quick exit, headless Chrome lands on Google's bot-check (`/sorry`) page and logs 429 / `solveSimpleChallenge` errors. Those come from Google, not from DoeNation. The `/this-page-does-not-exist` 404 is expected (`expectNotFound` in config).

## Gotchas
- `html { scroll-behavior: smooth }` is set. The CLI's scroll commands force `behavior: "instant"`; any custom `eval` scrolling must do the same or screenshots catch the page mid-scroll (sticky header appears in the middle of a full-page shot).
- Reveal animations are CSS scroll-driven (`.reveal`, `animation-timeline: view()`), with no JS. They only progress when the page really scrolls, so `screenshot --full` and `sweep` capture with reduced motion (final states). Pass `--motion` to see live state; use `record` to prove the animation itself. They're disabled for print.
- Changing fonts (or anything else in `src/app/layout.tsx`'s `next/font` calls) doesn't hot-reload: the page keeps the old font classes and silently falls back to system fonts. Run `dev down && dev up`, then confirm with `eval "getComputedStyle(document.querySelector('h1')).fontFamily"`.
- Pressing `Escape` anywhere **leaves the site** (Quick exit). Don't `press Escape` to close things during a test unless you mean to exit.
- `next/image` caches optimized images by filename in dev. If you replace an image file, rename it or restart the dev server.
- Commands follow the **newest tab** by default. Quick exit opens a second tab, so afterwards run `tabs`, and `tab close-others` before continuing.
- `wait-settle --scroll` scrolls the whole page and then returns to the top.
- The Next.js dev badge is turned off (`devIndicators: false` in `next.config.ts`) so it doesn't show up in screenshots.
- `text=Foo` is a case-insensitive **substring** match ("No" also hits "Now", "Not sure"). Use `text="Foo"` for exact text, and heed `click`'s `warning` when a selector matches more than one element.
- Mobile nav links exist twice in the DOM (desktop nav hidden + mobile menu). Scope selectors: `#mobile-menu >> text=Contact`.

## Extending the CLI
Missing a command you needed? Add it to `control-site.mjs` (JSON output, descriptive errors with hints, `--dry-run` for side effects, an entry in `HELP`), then smoke-test it.
