---
---

# Optics

## focusAtom

Takes an atom and creates a writable atom with corresponding focus.

```typescript
function focusAtom(wholeAtom: WritableAtom, focus: Focus): WritableAtom
```

```typescript
const wholeAtom = atom({ a: 2 })
const partAtom = focusAtom(wholeAtom, prop('a'))

const store = createStore()
store.get(partAtom) // 2
store.set(partAtom, 3) // { a: 3 }
```

## viewAtom

```typescript
function viewAtom(wholeAtom, focus)
```

Takes an atom and creates a readonly atom with corresponding focus. It is useful when the `wholeAtom` is either readonly or has a setter type that would not be compatible with `focusAtom`, such as a `machineAtom`.

```typescript
const wholeAtom = atom(1)
const partAtom = wholeAtom(sourceAtom, linear(2))
```

## foldAtom

```typescript
function foldAtom(wholeAtom: Atom, focus: Focus): ({
    foldFn: (p: Part, acc: Acc) => Acc,
    init: Acc | () => Acc,
}) => Atom
```

Takes an atom and creates a function taking a `FoldForm` and returning a readonly atom corresponding to the result of the folding operation.

```typescript
const odd = (x: number) => x % 2
const wholeAtom = atom([1, 2, 3])
const store = createStore()

const collectAtom = foldAtom(wholeAtom, pipe(elems(), when(odd)))(toArray())
store.get(collectAtom) // [1, 3]

const sumAtom = foldAtom(
	wholeAtom,
	pipe(elems(), when(odd)),
)({
	foldFn: (value, acc) => value + acc,
	init: 0,
})

store.get(sumAtom) // 4
```

## disabledFocusAtom

The setter of the resulting atom takes no parameter and updates wholeAtom according to part and focus.

The getter is a boolean reflecting whether applying the setter would have an effect on the value. We only compare the value in focus before and after applying the value, which avoid the need for deep comparison (but might be misleading with very unlawful optics, such as `queue`). The default comparison function is `shallowEqual`.

`part` can also be the symbol `REMOVE` (when applicable) or an update function.

This is useful for binding an event with a button-like element, hence the name.

```typescript
disabledFocusAtom(wholeAtom, focus, part, areEqual?)
```
