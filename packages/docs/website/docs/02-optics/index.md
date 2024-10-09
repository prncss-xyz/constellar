---
---

# Optics

Optics are a way of getting and setting parts of a larger data structure in a purely functional way. Optics are still a little known gem, despite being backed by a strong theoretical foundation and having been implemented in every major language. It lets you handle complex cases by composing simple primitives. Optics can solve problems of structural coupling, such as syncing an application state with API calls or UI components.

## Getting started

```bash
pnpm i @constellar/core
```

```typescript
import {
	command,
	flow,
	modify,
	prop,
	put,
	view,
	REMOVE,
} from '@constellar/core'

type T = { a?: number }

const focus = flow(eq<T>(), prop('a'))
const res: number | undefined = view(focus)({ a: 2 }) // res === 2
const updated = put(focus, 3)({ a: 2 }) // updated === { a: 3 }
const modified = modify(focus, (x) => -x)({ a: 2 }) // modified === { a: -2 }
const removed = command(focus, REMOVE)({ a: 2 }) // removed === {}
```

Optics really starts to be valuable when using composition:

```typescript
type T = { pools: { id: string; celsius: number }[] }
// focus the temperature of the pool with id 'asdf' in farenheit
const focus = flow(
	eq<T>(),
	prop('pools'),
	findOne(({ id }) => id === 'asdf'),
	prop('celsius'),
	linear(1.8, 32),
)
const sample: T = { pools: [{ id: 'asdf', celsius: 20 }] }
const res = view(focus)(sample) // res === 68
const updated = put(focus, 212)(sample) // updated === { pools: [{ id: 'asdf', celsius: 100 }] }
```

However on a typical front-end application, you will use this through an [integration](../05-jotai/index.md).

## Prior art

- [calmm-js/partial.lenses](https://github.com/calmm-js/partial.lenses) a wide collection of optics from the JavaScript era.
- [optics-ts](https://akheron.github.io/optics-ts/) a very well-made TypeScript library. It is my main inspiration for this project. Beside differences in ergonomics, I wanted something that was way less demanding on the TypeScript compiler.
