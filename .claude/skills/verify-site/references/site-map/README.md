# DoeNation — Site Map

What a visitor can see and do, and where it lives. One line per feature. Details are in the linked files. Keep it current: if you change what users experience, update this in the same change.

Last full audit: 2026-10-06 (maintenance pass same day) · Base URL: http://localhost:3100

## Routes

| Route | Template / source file | Features on it |
|---|---|---|
| `/` | `src/app/page.tsx` | home-sections, crisis-lines |
| `/client-info` ("Get help") | `src/app/client-info/page.tsx` | get-help, crisis-lines |
| `/get-involved` | `src/app/get-involved/page.tsx` | get-involved (incl. `#donate`) |
| `/contact` | `src/app/contact/page.tsx` | contact-form |
| `/*` (404) | `src/app/not-found.tsx` | not-found |
| `/sitemap.xml`, `/robots.txt`, `/icon.png`, `/apple-icon.png` | `src/app/*.ts`, `src/app/icon.png` | SEO + icons |

All pages share the global features below via `src/app/layout.tsx`.

## Global features (on every page)

- [safety](safety.md): Quick exit button (fixed bottom-right) + Esc key, crisis-line top bar, skip link. **Highest priority.**
- [nav](nav.md): sticky header, logo, 4 links + Donate; hamburger menu < 768px.
- [footer](footer.md): about blurb, page links, phone/email/location.
- [theme](theme.md): design tokens, light/dark by `prefers-color-scheme`, scroll reveals.

## Page features

- [home-sections](home-sections.md): hero, story with the hand-drawn logo, "What we do" bento, get-involved image band, closing CTA.
- [crisis-lines](crisis-lines.md): 911 / National DV Hotline / DoeNation tap-to-call panel (home + Get help).
- [get-help](get-help.md): hero, 3 steps, online-safety tips.
- [get-involved](get-involved.md): 3 ways to help (mailto), Donate section `#donate` (mailto + phone; no payment processor yet).
- [contact-form](contact-form.md): validated form that opens the visitor's email app; error + success states.
- [not-found](not-found.md): friendly 404 with Home / Get help.

## Cross-feature journeys

- Survivor seeking help: `/` → "Get help" → call `720-341-8844` or "Contact us" → `/contact` form.
- Survivor interrupted: any page → Esc or "Quick exit" → page replaced by a Google weather search (Back does not return).
- Donor: nav "Donate" (any page) → `/get-involved#donate` → mailto / phone.
