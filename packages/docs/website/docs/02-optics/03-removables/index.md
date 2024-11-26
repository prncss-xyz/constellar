---
---

# Removables

Removables are optionals that can also remove the focus.

To remove a focus, provide `REMOVE` symbol as an argument to `put` or `update`.

```typescript
import { flow, eq, at, update, REMOVE } from '@constellar/core'

const focus = flow(eq<string[]>(), at(2))
const removed = update(focus, REMOVE)(['a', 'b']) // ['a']
```

Optionals are optics where the focus is not always present.

When composing with an optional, you don't have to explicitly handle undefined values.

```typescript
function optional<Part, Whole>({
	getter,
	mapper,
	setter,
}: {
	getter: (whole: Whole) => Part | undefined
	mapper?: (mod: (p: Part) => Part, w: Whole) => Whole
	setter: (part: Part, whole: Whole) => Whole
	remover: (p: Part) => Part
})
```

`getter` function returns the value of the focus, `setter` updates it and optionally `mapper` applies a modifying function. When mapper is not provided, it is derived from `getter` and `setter`. `remover` is the function that is appied when setting to remove.
