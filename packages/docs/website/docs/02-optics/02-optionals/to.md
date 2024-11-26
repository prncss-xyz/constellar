---
---

# to

`to(cb: (p: P) => P)` create a getter from provided callback. Calling the setter will cause an exception.

```typescript
const focus = flow(
	eq<string>(),
	to((s) => s.toUpperCase()),
)
view(focus)('foo') // 'FOO'
```
