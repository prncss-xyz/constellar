---
---

# Simple State Machines

This is basically a glorified reducer, where state is simply an arbitrary value. This lets you define a machine as you would with [zustand-xs](https://github.com/zustandjs/zustand-xs) or [xstate-store](https://stately.ai/docs/xstate-store) (type inference included).

```typescript
import { simpleStateMachine } from '@constellar/core'

const machine = simpleStateMachine(
	{
		init: (a: string) => a.length,
		transform: (s) => s * 2,
		events: {
			inc: ({ n }: { n: number }, s) => n + s,
			reset: 3,
			step: (_: object, s) => s - 1,
		},
	},
	(t) => (t === 8 ? t : undefined), // optional
)
```

`init` is an initializing function. Its argument will be provided while initializing the machine. It can also be a constant.

(optional) `transform: (s: State) => Transformed` is a transforming function. It can be used to normalize state or add computed properties. If not provided, is it assumed to be the identity function.

`events` is an object whose keys are transition functions of the form `(e: Event, t: Transformed) => State`. The type of the event is the union of the type parameter with `{type: Key}` where key is a string constant. When `type` is the only field, `event` must be of type `object`. Alternatively, you can provide a constant in place of a transition function. `Transformed` and `State` are respectively the output and input of the transform function.

(optional second parameter) `getFinal: (t: Transformed) => Final | undefined` extracts a final value or returns undefined. If result is not undefined, the `send` method will become inert.
