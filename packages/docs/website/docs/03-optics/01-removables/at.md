---
tags:
  - array
---

# At

`at(index: number)` focus on the nth element of an array. If `index` is negative, indexes backward starting from last position of the array. When working with a tuple, use [`nth`](../lens/nth) instead.

```typescript
const focus = flow(eq<string[]>(), at(-1))
const res: string | undefined = focus.view(['a', 'b']) // res === 'b'
const updated = focus.put('B', ['a', 'B']) // updated === ['A', 'b']
const removed = focus.exec(REMOVE, ['a', 'b']) // removed === ['a']
```
