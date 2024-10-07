---
---

# Lens

Lenses are the simplest and most intuitive optics. They represent a unique focus that always exists.

You can create a lens by calling:

```typescript
lens<Part, Whole>({
	getter,
	mapper,
	setter,
}: {
	getter: (whole: Whole) => Part
	mapper?: Mapper<Part, Whole>
	setter: (part: Part, whole: Whole) => Whole
})
```

`getter` function returns the value of the focus, `setter` updates it and optionally `mapper` applies a modifying function. When mapper is not provided, it is derived from `getter` and `setter`

Most of the time, however, you will be better off composing ready-made lenses than using this more generic optic.
