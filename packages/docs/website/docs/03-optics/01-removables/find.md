---
tags:
  - array
  - unlawful
---

# Find

`find<X>(p: (x: X) => unknown)` focus on the first value of an array which satisfies a predicate.

```typescript
const focus = flow(
	eq<number[]>(),
	find((x) => x > 3),
)
const res: number | undefined = focus.view([2, 4, 6]) // res === 4
const updated = focus.put(5, [2, 4, 6]) // updated === [2, 5, 6]
const removed = focus.exec(REMOVE, [2, 4, 6]) // removed === [2, 6]
```

When reading, if predicate is a type guard, type of the returned value will be accordingly restricted.

```typescript
const focus = flow(
	eq<number | string[]>(),
	find((x) => typeof x === 'number'),
)
const res: number | undefined = focus.view([2, 'a']) // res === 2
```

When writing to a non-existing focus, will append the value.

```typescript
const updated = focus.put(5, [0, 3]) // updated === [0, 3, 5]
```

## Unlawful behavior

[**get after put**](/docs/optics/#laws-of-lenses) will not hold when writing a value which do not satisfy the predicate.

```typescript
const updated = focus.put(0, [2, 4, 6]) // updated === [2, 0, 6]
const res = focus.view(updated) // res === 6
```
