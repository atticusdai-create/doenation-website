# Not found

Friendly 404: "This page is not here." with "Back to home" and "Get help".

- Source: `src/app/not-found.tsx`. Config lists `/this-page-does-not-exist` in `routes` and `expectNotFound`, so `sweep` treats its 404 as expected.

```bash
node $C goto /this-page-does-not-exist   # status 404
```
