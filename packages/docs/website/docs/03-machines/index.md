---
---

# State Machines

State machine helps you model an application logic in a way that is expressive of domain knowledge.

## Getting started

```bash
pnpm i @constellar/core
```

```typescript
import { objectMachine, simpleStateMachine } from '@constellar/core'

const machine = simpleStateMachine({
	init: (a: string) => a.length,
	events: {
		inc: ({ n }: { n: number }, s) => n + s,
		step: (_: object, s) => s - 1,
	},
})
```

Then you can consume your machine, here as an object.

```typescript
const m = objectMachine(machine('hello')) // m.state -> 5
m.send({ n: 2, type: 'inc' }) // m.state -> 7
m.send('step') // m.state -> 6
```

## Prior art

- [xState](https://stately.ai/docs/xstate) is the most popular implementation of finite state machines in TypeScript. Main differences:
  - We represent state machines as pure function and let integration actually implementing the store and subscription mechanism.
  - Qualitative part of the state (what xState calls the "context") can have a different type depending on the qualitative part of the state (what xState calls "state").
  - We don't have devtools (definitively a strong point of xState).
  - We don't support machine composition yet (working on it).
