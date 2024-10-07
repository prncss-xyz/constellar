---
---

# Miscellaneous

## selectAtom

```typescript
function selectAtom<Part, Whole>(
	sourceAtom: Atom<Whole>,
	select: (w: Whole) => Part,
)
```

Returns a readonly atom whose value is derived by the select function.

## resolvedAtom

```typescript
function resolvedAtom<Reference, Value, Args extends unknown[], Result>(
	referenceAtom: Atom<Reference>,
	valueFactory: (reference: Reference) => WritableAtom<Value, Args, Result>,
)
```

`referenceAtom` is the atom containing the reference to be resolved. `valueFactory` is a function taking the current value of `referenceAtom` and returning an atom corresponding to the resolved reference.

```typescript
const store = createStore()
store.get(currentAtom) // { id: 'a', name: 'A' }
store.set(currentAtom, { id: 'a', name: 'a' })
store.get(registerAtom) /* [
	{ id: 'a', name: 'a' },
	{ id: 'b', name: 'B' },
] */
```
