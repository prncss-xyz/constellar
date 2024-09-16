---
---

# Optics

## Intro

You can think of a **lens** as a way to focus on a part of an object. It lets you read or modify its value by returning an updated copy.

```typescript
exemple
```

**Optics** is the broader category which lens belongs to. An **optional** is an optitcs who's focus is not garanteed to exist. A **traversal** can have more than one focus. Some optics lets you remove the focus, some can convert between types or units of mesurement. Most importantly, they compose with each other.

```
exemple
```

## Getting started

```typescript
type T = { a: string }
Eq<T>()
at('a')(Eq<T>())
flow(Eq<T>(), at('a'))
```

## Use cases

- structural coupling (shape)
- hidden dependancy

- state-gui
- API

## Laws of Lenses

The behaviors we expect of a lens can be expressed by the following axioms:

- **get after set**: `l.get(l.set(a)(s)) === a`
- **set after get**: `l.set(l.get(s))(s) === s`
- **set after set**: `l.set(b)(l.set(a)(s)) === l.set(b)(s)`

In particular, "set after set" implies idempotency.

- **idempotency**: `l.set(a)(l.set(a)(s)) === l.set(a)(s)`

In plain English:

- **get after set**: If we set a value and then read the focus, we should get the same value.
- **set after get**: If we get a value, and then set the focus to that value, we should get an identical object.
- **set after set**: If we set a value twice (with different values), it should be the same as only setting the second value.

Other types of optics obey similar axioms.

Sometimes it pays to break the laws. Some [useful lenses](/docs/tags/unlawful) do not respect all of the axioms, and it will be documented.

## Roadmap

- traversals

## Out of scope

- polymorphic optics

## Prior art

- [calmm-js/partial.lenses](https://github.com/calmm-js/partial.lenses) presents a wide collection of optics from the JavaScript era.
- [optics-ts](https://akheron.github.io/optics-ts/) is a very well made TypeScript library. It is my main inspiration for this project. Beside differences in ergonomics, I wanted something that was way less demanding on the TypeScript compiler.
