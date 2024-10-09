---
---

# dedupe

`dedupe(areEqual?)` will leave the source untouched when updating to a value which is equal to the focus. `areEqual` defaults to `Object.is`.

```typescript
const equal = (a: string, b: string) => a.toUpperCase() === b.toUpperCase()
const focus = flow(eq<string>(), dedupe(equal))
update(focus, 'FOO')('foo') // 'foo'
update(focus, 'bar')('foo') // 'bar'
```
