# SEO and sharing

- `site.url` in `src/lib/site.ts` is the canonical origin used by metadata, sitemap and robots. Currently `https://doenation.vercel.app`; change it when a custom domain is connected.
- Share card: `src/app/opengraph-image.tsx` (1200×630, plum, egg mark, "A safe place to begin again."). Prebuilt at build time (fonts/images read at module level). Font: `assets/Lexend-SemiBold.ttf` (static TTF, because `next/og` can't read woff2 or variable fonts).
- Sitemap: `src/app/sitemap.ts`. Add new public routes there.
- JSON-LD (`NGO`) in `src/app/layout.tsx`.

```bash
curl -s http://localhost:3100/opengraph-image -o .verify/og.png    # then Read the PNG
curl -s http://localhost:3100/ | grep -o '<meta property="og:image"[^>]*>'
curl -s http://localhost:3100/sitemap.xml
```
