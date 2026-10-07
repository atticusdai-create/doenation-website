# Get involved (`/get-involved`)

How supporters can help: volunteer, attend events, become a member, donate.

## Sub-features

- Hero "Join DoeNation in making a difference." with `welcome-home.jpg`.
- 3 ways to get involved (Volunteer is the accent tile), each with "Email us about this" (mailto with a subject).
- Donate section `#donate`: "Donate" button → `donateUrl` (`src/lib/site.ts`): DoeNation's GoDaddy Payments "Online payment" checkout on poynt.godaddy.com, donor enters any amount. Same link as the original site's "Pay Now". Plus phone button and a "processed securely by GoDaddy" note. Other Donate buttons (nav, home hero, home band) go to `/get-involved#donate`, not straight to checkout.
- The original site's "Donate" button pointed at a fixed $150 "Individual assessment" checkout; it is deliberately **not** used. Don't switch to it without the owner's say-so.
- Closing "Contact us" CTA.

## Driving it with control-site

```bash
node $C goto /get-involved
node $C screenshot .verify/donate.png --selector '#donate'   # full card incl. both buttons
node $C eval "document.querySelector('#donate a').href"   # https://poynt.godaddy.com/checkout/af1db2d3-…/e0743927-…
# Never submit the checkout form. Viewing it is fine; it's a real payment page.
```

## Gotchas

- `#donate` has `scroll-mt-28` so the sticky header doesn't cover the heading.
- `links` skips mailto/tel links (expected).
