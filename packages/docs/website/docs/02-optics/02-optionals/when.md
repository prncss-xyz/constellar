---
---

# when

`when(p: (v: value) => unknown)` focus on value is the predicate is fulfilled, focus is absent otherwise. If the predicate is a type guard, the type of the focus is narrowed accordingly.

```typescript
const focus = flow(
	eq<number>(),
	when((x) => x < 10),
)
view(focus)(5) // 5
view(focus)(20) // undefined
```
