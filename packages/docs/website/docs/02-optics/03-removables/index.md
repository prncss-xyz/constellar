---
---

# Removables

Removables are optionals that can remove the focus.

To remove a focus, use `REMOVE` symbol in place of a value with `put` or `update`.

```typescript
import { flow, eq, at, update, REMOVE } from '@constellar/core'

const focus = flow(eq<string[]>(), at(2))
const removed = update(focus, REMOVE)(['a', 'b']) // ['a']
```
