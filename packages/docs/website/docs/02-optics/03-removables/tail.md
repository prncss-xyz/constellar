---
tags:
  - array
---

# tail

`tail()` focus on subarray that remains after skipping the first element. It complements [head](./head.md).

When writing to an empty array, an element will be created. When updating to an empty array, it will result in an empty array.

```typescript
const focus = flow(eq<string[]>(), tail())
view(focus)(['a', 'b', 'c']) // ['b', 'c']
view(focus)([]) // []
command(focus, REMOVE)(['a', 'b', 'c']) // ['a']
put(focus, ['P', 'Q'])(['a', 'b', 'c']) // ['a', 'P', 'Q']
```
