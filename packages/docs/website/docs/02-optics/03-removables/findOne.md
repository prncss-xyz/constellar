---
tags:
  - array
---

# findOne

`findOne<X>(p: (x: X) => unknown)` focus on the first value of an array which satisfies a predicate.

```typescript
const focus = flow(
	eq<number[]>(),
	findOne((x) => x > 3),
)
const res: number | undefined = view(focus)([2, 4, 6]) // 4
const updated = put(focus, 5)([2, 4, 6]) // [2, 5, 6]
const removed = exec(focus, REMOVE)([2, 4, 6]) // [2, 6]
```

When reading, if the predicate is a type guard, the type of the returned value will be accordingly restricted.

```typescript
const focus = flow(
	eq<(number | string)[]>(),
	findOne((x) => typeof x === 'number'),
)
const res: number | undefined = view(focus)([2, 'a']) // 2
```

When writing to a non-existing focus, will append the value.

```typescript
const updated = put(focus, 5)([0, 3]) // [0, 3, 5]
```
