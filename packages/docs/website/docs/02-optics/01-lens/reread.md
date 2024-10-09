---
---

# reread

`reread(cb: (p: P) => P)` applies a callback to transform the reading operation. It leaves untouched the reading operation. Notice that `reread`'s behaviour differs from [optics-ts](https://akheron.github.io/optics-ts/), which disable writing operations.

```typescript
const focus = flow(
	eq<string>(),
	reread((s) => s.toUpperCase()),
)
view(focus)('foo') // 'FOO'
```
