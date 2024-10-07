---
---

# nth

`nth(index: number)` focus on the nth element of a tuple. When working with an array, use [`at`](../removables/at) instead.

```typescript
type Source = [number, string, boolean]
const source: Source = [1, 'a', true]
const focus = flow(eq<Source>(), nth(1))
const res: string = view(focus)(source) // 'a'
const updated = put(focus, 'A')(source) // [1, 'A', true]
```
