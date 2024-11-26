---
---

# prop

`prop(name: K)` focus on the given property of an object. It will be a removable or a lens, depending on wether the property is optional or not.

```typescript
type Source = {
	a?: number
	b: number
}
const focusA = flow(eq<Source>(), prop('a'))
const focusB = flow(eq<Source>(), prop('b'))
const resA: number | undefined = view(focusA)({ a: 3, b: 4 }) // 3
const resB: number = view(focusB)({ a: 3, b: 4 }) // 4
const updated = put(focusA, 4)({ a: 3, b: 4 }) // { a: 5, b: 4 }
const removed = command(focusA, REMOVE)({ a: 3, b: 4 }) // { b: 4 }
```
