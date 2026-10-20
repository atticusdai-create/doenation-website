# Resources (`/resources`)

Outside help a survivor can reach right now: hotlines, Colorado programs and safety-planning basics.

## Sub-features

- Hero with "Ayuda en español" pill linking to espanol.thehotline.org (`lang="es"`).
- Featured hotline panel (accent): National Domestic Violence Hotline, with call button, text line and chat link.
- 4 hotline cards (2×2 desktop, stacked mobile): RAINN, Love is Respect, StrongHearts, 988. Each has a tel: link, text instructions and a website link.
- "Help closer to home": Violence Free Colorado (county map) and the Colorado Address Confidentiality Program. Website links only, no phone numbers (they change; the sites stay current).
- Safety-plan checklist (5 items) + "Build a personal safety plan" (thehotline.org tool).
- Closing: DoeNation phone + "Get help".

## Where it lives

- Source: `src/app/resources/page.tsx`; all names, numbers and URLs in `src/lib/resources.ts`.
- Numbers verified 2026-10-07 against each organization's site. **Re-verify before editing any number.** A wrong crisis number is worse than none.

## Driving it with control-site

```bash
node $C goto /resources
node $C eval "[...document.querySelectorAll('main a[href^=tel]')].map(a=>a.getAttribute('href'))"
# expect tel:+18007997233, tel:+18006564673, tel:+18663319474, tel:+18447628483, tel:988 (+ DoeNation)
node $C screenshot .verify/resources.png --full --viewport mobile
```

## Gotchas

- Use `links --all` to check every external link in a real browser. rainn.org and dcs.colorado.gov still return 403 to automation (reported as `blockedExternal`, not broken); both loaded fine in a real browser on 2026-10-07.
- The ACP website is being migrated (state notice, Oct 2026) and its URL may change. The ACP entry has a phone fallback (303-866-2208, verified on the ACP page). Re-check `https://dcs.colorado.gov/acp` and update `src/lib/resources.ts` if it moves.
- External links open in the same tab on purpose (the Esc exit only replaces the current tab).
