# Safety

Features that protect visitors who may be in danger or on a monitored device. Verify these after **any** layout change.

## Sub-features

- Esc key exit: any `keydown` Escape (non-repeat) opens the exit URL in a new tab and `location.replace`s the current tab, so Back does not return to DoeNation. Works even inside form fields (intentional). **There is no visible Quick exit button** (removed 2026-10-07 at the owner's request); the Get help tips and the Privacy page tell visitors about Esc.
- Crisis bar: purple top strip (`<aside aria-label="Crisis lines">`) with 911 and the National DV Hotline; DoeNation's number appears from `sm` up.
- Skip link: "Skip to content", visible on keyboard focus.
- Privacy: `referrer: no-referrer` metadata; the guest house address is never shown, only "Aurora, Colorado".

## Where it lives

- Source: `src/components/EscapeExit.tsx` (renders nothing), `src/components/SafetyBar.tsx`, skip link in `src/app/layout.tsx`.
- Exit target: `quickExitUrl` in `src/lib/site.ts`.

## Driving it with control-site

```bash
C=.claude/skills/verify-site/control-site.mjs
node $C goto /get-involved && node $C press Escape
node $C tabs                                        # BOTH tabs (0 = original, 1 = window.open) should be on google.com
node $C tab close-others                            # clean up before the next check
node $C snapshot --selector 'aside[aria-label="Crisis lines"]'
```

## Expected states to verify

- After Esc, `tabs` shows no localhost tab.
- No element on the page is named "Quick exit" (the button was removed on purpose; don't re-add it without asking).
- Crisis bar wraps to two centered lines on mobile, one line on desktop.

## Gotchas

- `location.replace` only replaces the *current* history entry. If the visitor browsed several DoeNation pages in that tab, Back can still reach the earlier ones. The Privacy page says so and recommends a private window.
- Headless Chrome hits Google's bot check after exit; console errors from `google.com/sorry` are expected noise.
- Don't use `press Escape` to dismiss things in tests. It leaves the site.
