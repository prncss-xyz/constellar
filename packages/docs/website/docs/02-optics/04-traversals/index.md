---
---

# Traversals

Travarsals are optics that can have more than one focus. These foci can be filtered by composing with an optional, or further multiplied by composing with another traversal.

```typescript
const focus = flow(
	eq<number[]>(),
	elems(),
	when((x) => x % 2 === 0),
)
put(focus, 9)([0, 1, 2, 3]) // [9, 1, 9, 3]
```
