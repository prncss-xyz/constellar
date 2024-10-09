---
tags:
  - array
---

# head

`head()` focus on the first element of an array. When writing to an empty array, element will be created. When updating an empty array, will result in an empty array. It complements [tail](./tail.md).

```typescript
const focus = flow(eq<string[]>(), head())
update(focus, 'A')(['a', 'b', 'c']) // ['A', 'b', 'c']
```
