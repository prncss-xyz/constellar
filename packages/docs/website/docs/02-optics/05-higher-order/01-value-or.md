---
---

# valueOr

`valueOr` turns an optional into a lens by providing a default value.

```typescript
const focus = flow(eq<{ a: string; b?: number }>(), prop('b'), valueOr(3))
view(focus)({ a: 'a' }) // 3
view(focus)({ a: 'a', b: 1 }) // 1
```
