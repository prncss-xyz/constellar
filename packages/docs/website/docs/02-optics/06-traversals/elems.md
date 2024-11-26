---
tags:
  - array
---

TODO

# elems

`elems()` focus on each element of an array.

```typescript
const focus = flow(
	eq<number[]>(),
	elems(),
	when((x) => x % 2 === 0),
)
put(focus, 9)([0, 1, 2, 3]) // [9, 1, 9, 3]
```
