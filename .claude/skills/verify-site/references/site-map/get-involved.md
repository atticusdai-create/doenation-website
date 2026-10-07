# Get involved (`/get-involved`)

How supporters can help: volunteer, attend events, become a member, donate.

## Sub-features

- Hero "Join DoeNation in making a difference." with `welcome-home.jpg`.
- 3 ways to get involved (Volunteer is the accent tile), each with "Email us about this" (mailto with a subject).
- Donate section `#donate`: "Donate" button (mailto, subject "I would like to donate") + phone button. **No online payment yet.** When a payment link exists, replace the mailto in `src/app/get-involved/page.tsx`.
- Closing "Contact us" CTA.

## Driving it with control-site

```bash
node $C goto /get-involved
node $C screenshot .verify/donate.png --selector '#donate'   # full card incl. both buttons
node $C eval "document.querySelector('#donate a').href"
```

## Gotchas

- `#donate` has `scroll-mt-28` so the sticky header doesn't cover the heading.
- `links` skips mailto/tel links (expected).
