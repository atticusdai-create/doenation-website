# Footer

Closing block on every page: about blurb, page links, contact details.

## Where it lives

- Source: `src/components/Footer.tsx` (data from `src/lib/site.ts`).

## Driving it with control-site

```bash
node $C goto / && node $C scroll bottom && node $C screenshot .verify/footer.png --viewport mobile
```

## Expected states to verify

- 3 columns on desktop, stacked on mobile. Pages column = nav items + "Privacy".
- Email address wraps (`break-all`) without overflowing at 390px.
- The copyright row isn't covered by the Quick exit button.
