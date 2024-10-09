---
---

# linear

`linear(m, b = 0)` focus on the affine or linear transformation of the source. Notice the value of the focus is discarded on updates.

```typescript
const focus = flow(eq<number>(), linear(1.8, 32))
// celsius to fahrenheit
view(focus)(-40) // -40
view(focus)(100) // 212
// fahrenheit to celsius
update(focus, -40)(0) // -40
update(focus, 212)(0) // 100
```
