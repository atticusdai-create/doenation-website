# Crisis lines

Tap-to-call panel: Emergency 911, National Domestic Violence Hotline 1-800-799-7233 (text START to 88788), DoeNation 720-341-8844.

## Where it lives

- Routes: `/` (title "Reach someone now"), `/client-info` (title "If you need help now").
- Source: `src/components/CrisisLines.tsx`; data `crisisLines` in `src/lib/site.ts`.

## Driving it with control-site

```bash
node $C goto / && node $C snapshot --selector 'section[aria-labelledby="crisis-title"]'
node $C eval "[...document.querySelectorAll('section[aria-labelledby=crisis-title] a')].map(a=>a.href)"
```

## Expected states to verify

- hrefs: `tel:911`, `tel:+18007997233`, `tel:+17203418844`.
- Desktop: 3 columns with dividers; mobile: stacked.
