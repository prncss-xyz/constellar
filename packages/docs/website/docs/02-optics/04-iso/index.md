---
---

# Iso (Isomorphisms)

Iso are special lens where the setter doesn't need a second (`whole`) argument, which makes them reveresible. They are used to convert back and forth between two reprenstations of the same data, hence the name.

You can create an iso by calling:

```typescript
iso<Part, Whole>({
	getter,
	mapper,
	setter,
}: {
	getter: (whole: Whole) => Part
	mapper?: (mod: (p: Part) => Part, w: Whole) => Whole
	setter: (part: Part) => Whole
})
```

`getter` function returns the value of the focus, `setter` updates it and optionally `mapper` applies a modifying function. When mapper is not provided, it is derived from `getter` and `setter`
