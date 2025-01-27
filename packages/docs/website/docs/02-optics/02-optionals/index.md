---
---

# Optionals

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
})
```

`getter` function returns the value of the focus, `setter` updates it and optionally `mapper` applies a modifying function. When mapper is not provided, it is derived from `getter` and `setter`
