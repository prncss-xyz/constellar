---
tags:
  - array
---

# findMany

`findMany<X>(p: (x: X) => unknown)` focus on the subarray of values satisfying the predicate.

```typescript
const focus = flow(
	eq<number[]>(),
	findMany((x) => x % 2 === 0),
)
const res: number[] | undefined = view(focus)([5, 4, 3, 2]) // [4, 2]
const modified = modify(focus, (xs) => xs.toSorted())([5, 4, 3, 2]) // [5, 2, 3, 4]
```

When reading, if the predicate is a type guard, the type of the returned value will be accordingly restricted.

```typescript
const focus = flow(
	eq<(number | string)[]>(),
	findMany((x) => typeof x === 'number'),
)
const res: number[] = view(focus)([2, 'a']) // res === [2]
```

While writing, if the provided array is shorter, last elements are deleted.

```typescript
const focus = flow(
	eq<number[]>(),
	findMany((x) => x % 2 === 0),
)
const res: number[] | undefined = view(focus)([0, 1, 2, 3]) // [0, 2]
const modified = put(focus, [8])([0, 1, 2, 3]) // [8, 1, 3]
```

While writing, if the provided array is longer, extra elements are appended.

While writing to a non-existing focus, will append the value.

```typescript
const focus = flow(
	eq<number[]>(),
	findMany((x) => x > 3),
)
const updated = put(focus, 5)([0, 3]) // updated === [0, 3, 5]
```
