---
---

# rewrite

`rewrite(cb: (p: P) => P)` applies a callback to transform the writing operation. It leaves untouched the reading operation.

```typescript
const focus = flow(
	eq<string>(),
	rewrite((s) => s.toUpperCase()),
)
expect(update(focus, 'foo')('')).toBe('FOO')
```
