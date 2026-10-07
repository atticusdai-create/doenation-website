# Privacy (`/privacy`)

Plain-language privacy page, linked from the footer ("Privacy").

- Source: `src/app/privacy/page.tsx` (copy in a `sections` array).
- Claims it makes, which must stay true: no accounts/ads/analytics, no first-party cookies, self-hosted fonts (`next/font`), `referrer: no-referrer` in `src/app/layout.tsx`, contact form sends nothing to a server (mailto), donations go to GoDaddy Payments' hosted checkout, Vercel keeps standard logs. **If you add analytics, cookies, a form backend or third-party embeds, update this page in the same change.**
- "Last updated" date is hard-coded; bump it when the copy changes.

```bash
node $C goto /privacy && node $C screenshot .verify/privacy.png --full --viewport mobile
```
