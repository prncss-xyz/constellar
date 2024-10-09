---
tags:
  - array
---

# foot

`foot()` focus on the last element of an array. When writing to an empty array, an element will be created. When updating an empty array, it will result in an empty array.

```typescript
const focus = flow(eq<string[]>(), foot())
update(focus, 'C')(['a', 'b', 'c']) // ['a', 'b', 'C']
```
