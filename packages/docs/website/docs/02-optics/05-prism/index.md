---
---

# Prisms

Primsms are opionals where the setter doesn't need a second (`whole`) argument, which makes them reveresible. They are used for converting back and forth between two reprenstations of the same data, hence the name.

You can create an iso by calling:

```typescript
prism<Part, Whole>({
	getter,
	mapper,
	setter,
}: {
	getter: (whole: Whole) => Part | undefined
	mapper?: (mod: (p: Part) => Part, w: Whole) => Whole
	setter: (part: Part) => Whole
})
```

`getter` function returns the value of the focus, `setter` updates it and optionally `mapper` applies a modifying function. When mapper is not provided, it is derived from `getter` and `setter`
