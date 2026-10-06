# Safety

Features that protect visitors who may be in danger or on a monitored device. Verify these after **any** layout change.

## Sub-features

- Quick exit button: fixed bottom-right on every page (`z-50`). Opens the quick-exit URL in a new tab and `location.replace`s the current tab, so Back does not return to DoeNation.
- Esc key: any `keydown` Escape (non-repeat) triggers the same exit, even inside form fields (intentional).
- Crisis bar: purple top strip (`<aside aria-label="Crisis lines">`) with 911 and the National DV Hotline; DoeNation's number appears from `sm` up.
- Skip link: "Skip to content", visible on keyboard focus.
- Privacy: `referrer: no-referrer` metadata; the guest house address is never shown, only "Aurora, Colorado".

## Where it lives

- Source: `src/components/QuickExit.tsx`, `src/components/SafetyBar.tsx`, skip link in `src/app/layout.tsx`.
- Exit target: `quickExitUrl` in `src/lib/site.ts`.

## Driving it with control-site

```bash
C=.claude/skills/verify-site/control-site.mjs
node $C goto /
node $C visible 'role=button[name^="Quick exit"]'  # visible:true, covered:false
node $C click 'role=button[name^="Quick exit"]'    # accessible name starts with "Quick exit"
node $C tabs                                        # BOTH tabs (0 = original, 1 = window.open) should be on google.com
node $C tab close-others                            # clean up before the next check
node $C goto /get-involved && node $C press Escape && node $C tabs && node $C tab close-others
node $C snapshot --selector 'aside[aria-label="Crisis lines"]'
```

## Expected states to verify

- Quick exit is visible and not covered at mobile 390px and desktop; it must not hide the footer copyright (footer has `pr-40` on that row).
- Accessible name begins with the visible text "Quick exit" (axe `label-content-name-mismatch` must stay clean).
- After exit, `info.url` is not localhost.
- Crisis bar wraps to two centered lines on mobile, one line on desktop.

## Gotchas

- `location.replace` only replaces the *current* history entry. If the visitor browsed several DoeNation pages in that tab, Back can still reach the earlier ones. This is a known limit of every quick-exit button; the Get help page tells visitors to browse privately or clear history.

- Headless Chrome hits Google's bot check after exit; console errors from `google.com/sorry` are expected noise.
- Don't use `press Escape` to dismiss things in tests. It leaves the site.
