---
---

# to

`to(cb: (p: P) => P)` create a getter from provided callback. It disables the writing operations.

```typescript
const focus = flow(
	eq<string>(),
	to((s) => s.toUpperCase()),
)
view(focus)('foo') // 'FOO'
```
