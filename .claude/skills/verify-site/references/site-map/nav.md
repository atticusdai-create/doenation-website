# Nav

Sticky header with the egg logo, page links and a Donate button.

## Sub-features

- Logo: egg mark (`/images/egg-mark.png`) + "DoeNation" wordmark, links to `/`.
- Desktop links (≥ 1024px): Home, Get help, Resources, Get involved, Contact. Active link has `aria-current="page"` and a soft purple pill.
- Donate button: links to `/get-involved#donate`.
- Mobile menu (< 1024px, so tablets too): hamburger button toggles `#mobile-menu` (`hidden` attribute); links close the menu on click.

## Where it lives

- Source: `src/components/Header.tsx`, `src/components/Logo.tsx`; nav items in `src/lib/site.ts` (`nav`).

## Driving it with control-site

```bash
C=.claude/skills/verify-site/control-site.mjs
node $C viewport mobile && node $C goto /
node $C click 'role=button[name="Open menu"]'
node $C eval "document.getElementById('mobile-menu').hidden"   # false when open
node $C click '#mobile-menu >> text=Contact'
node $C info   # /contact
node $C eval "document.getElementById('mobile-menu').hidden"   # true again: menu closed after navigating
```

## Expected states to verify

- Desktop nav fits on one line at 1024px (labels are nowrap); header height is 68px. At 820px (tablet) the hamburger shows.
- Mobile: button label flips between "Open menu" and "Close menu"; `aria-expanded` matches.
- Header blur background stays readable in dark mode.

## Gotchas

- Links are rendered twice (desktop + mobile). Scope selectors to `#mobile-menu` or `nav[aria-label="Main"]`.
- "Get help" points to `/client-info`. The slug is kept from the old GoDaddy site for SEO.
