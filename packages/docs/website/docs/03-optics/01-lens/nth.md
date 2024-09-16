---
---

# Nth

`nth(index: number)` focus on the nth element of a tuple. When working with an array, use [`at`](../removables/at) instead.

```typescript
type Source = [number, string, boolean]
const source: Source = [1, 'a', true]
const focus = flow(eq<Source>(), nth(1))
const res: string = focus.view(source) // res === 'a'
const updated = focus.put('A', source) // updated === [1, 'A', true]
```
