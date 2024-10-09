---
tags:
  - array
---

# includes

`includes(value)` focus is a boolean that says whether a given value is included in the array. Setting the value will update the value accordingly.

```typescript
const focus = flow(eq<string[]>(), includes('z'))
view(focus)(['a', 'b', 'c']) // false
put(focus, true)(['a', 'b', 'c']) // ['a', 'b', 'c', 'z']
update(focus, (p) => !p)(['a', 'b', 'z']) // ['a', 'b']
```
