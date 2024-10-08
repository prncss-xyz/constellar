---
---

# Utils

## pipe

```typescript
pipe(f, g, h, ...)(a)
```

Returns a function equivalent to left-to-right composition of the functions passed as arguments. The first argument may have any arity; the remaining arguments must be unary.

## flow

```typescript
flow(a, f, g, h, ...)
```

Taking the first argument as an initial value, applies all the remaining arguments (which are functions) from lef-to-right. The main raison to use `flow` over `type` is a better type inference in many circumstances.

## shallowEqual

Performs a shallow equality comparaison. Based on [this blogpost](https://romgrk.com/posts/react-fast-memo/).

```typescript
shallowEqual([1, 2], [1, 2]) // true
shallowEqual({ a: 1 }, { a: 1 }) // true
shallowEqual({ a: undefined }, {}) // false
shallowEqual([[1]], [[1]]) // false
```
