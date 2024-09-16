---
tags:
  - array
---

# Filter

`filter<X>(p: (x: X) => unknown)` focus on the subarray of values satisfying the predicate.

```typescript
const focus = flow(
	eq<number[]>(),
	filter((x) => x % 2 === 0),
)
const res: number[] | undefined = focus.view([5, 4, 3, 2]) // [4, 2]
const modified = focus.update((xs) => xs.toSorted(), [5, 4, 3, 2]) // [5, 2, 3, 4]
```

When reading, if predicate is a type guard, type of the returned value will be accordingly restricted.

```typescript
const focus = flow(
	eq<(number | string)[]>(),
	filter((x) => typeof x === 'number'),
)
const res: number[] = focus.view([2, 'a']) // res === [2]
```

While writing, if the provided array is shorter, last elements are deleted.

```typescript
const focus = flow(
	eq<number[]>(),
	filter((x) => x % 2 === 0),
)
const res: number[] | undefined = focus.view([0, 1, 2, 3]) // [4, 2]
const modified = focus.put([8], (xs) => xs.toSorted()) // [5, 2, 3, 4]
```

While writing, if the provided array is longer, extra elements are appended.

While writing to a non-existing focus, will append the value.

```typescript
const focus = flow(
	eq<number[]>(),
	filter((x) => x > 3),
)
const updated = focus.put(5, [0, 3]) // updated === [0, 3, 5]
```

## Unlawful behavior

[**get after put**](/docs/optics/#laws-of-lenses) will not hold when writing a value which do not satisfy the predicate.

```typescript
const updated = focus.put(0, [2, 4, 6]) // updated === [2, 0, 6]
const res = focus.view(updated) // res === 6
```
