---
tags:
  - array
---

# queue

`queue()` reads to and removes from the first position of an array, but writes to the last position of the array, making the focus metaphor less relevant. Passing an update function is not likely to make any sense. The name says it!

```typescript
const focus = flow(eq<string[]>(), queue())
view(focus)(['a', 'b', 'c']) // 'a'
command(focus, REMOVE)(['a', 'b', 'c']) // ['b', 'c']
put(focus, 'd')(['a', 'b', 'c']) // ['a', 'b', 'c', 'd']
```
