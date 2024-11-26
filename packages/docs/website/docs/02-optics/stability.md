---
---

# Stability

When a put method does not change the focused values (in the sens of `Object.is`), optics have the responsability to preserve the referencial equlity.

```typescript
const focus = flow(eq<{ a: number }>, prop('a'))
const source = { a: 3 }
target = put(focus, 3) // source === target
```
