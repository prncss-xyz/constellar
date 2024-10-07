---
tags:
  - array
---

# at

`at(index: number)` focus on the nth element of an array. If `index` is negative, indexes backward starting from last position of the array. When working with a tuple, use [`nth`](../lens/nth) instead.

```typescript
const focus = flow(eq<string[]>(), at(-1))
const res: string | undefined = view(focus)(['a', 'b']) // 'b'
const updated = put(focus, 'B')(['a', 'B']) // ['A', 'b']
const removed = command(focus, REMOVE)(['a', 'b']) // ['a']
```
