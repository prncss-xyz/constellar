---
---

# Multiple State Machines

State has a qualitative part (`{type: Key}`) and a quantitative part (the other values). Unlike xState's context, qualitative state is coupled with `type` key, that is the qualitative state can have a different type for each `type` key.

```typescript
multiStateMachine<Event, State, LocalDerived, Derived, Message>({
    init: (p: Param) => State,
    states: {
        [Key]: {
            always?: (s: State & LocalDerived & Derived) => State | undefined
            events?: {
                [Key]: (e: Event, s: State & {type: Key} & LocalDerived & Derived, emit: (m: Message) => void) => State | undefined
            }
            wildcard?: (e: Event, s: State & LocalDerived & Derived, emit: (m: Message) => void) => State | undefined
            derive?: (state: State & {type: Key}) => LocalDerived

        }
    },
    derive?: (state: State & LocalDerived) => Derived
})
```

`init` is an initializing function. Its argument will be provided while initializing the machine. It can also be a constant.

`states` is an object whose keys are state types and whose values are configuration object:

A state without `events` nor `always` fields is a final state.

`[state].always` is a transition function that is called immediately upon entrance of a state, and changes the state if returning a value other than undefined. Unlike genuine transitions, state changes triggered by `always` are not observable for the machine's consumer.

`[state].events` is as object whose keys are events types and whose values are transition functions `(e: Event, s: State & {type: Key} & LocalDerived & Derived, emit: (m: Message) => void) => State | undefined`. The first parameter is the received event. The second parameter is the derived state (see later) of the machine, restricted to the qualitative state of the current key. Alternatively, you can provide a constant in place of a transition function. If target state only has a `type` field, it can be represented by a string constant. If the function returns undefined, no transition happens. Finally, the function `emit` can be called inside the function to send a message.

`[state].wildcard` is a function that returns the next state if no events are matched. It functions like `[state].events` and can also be a constant.

`[state].derive` is a function receiving the state restricted to the relevant key and returning an object of type LocalDerived which will be merged with state.

`derive` is a function receiving the state and its locally derived value, and returning an object of type Derived which will be merged with state.

## Example

```typescript
import { multiStateMachine, objectMachine } from '@constellar/core'

type Event =
	| {
			now: number
			type: 'reset'
	  }
	| {
			now: number
			type: 'toggle'
	  }

type State =
	| {
			elapsed: number
			type: 'stopped'
	  }
	| {
			since: number
			type: 'running'
	  }
	| { type: 'final' }

init is an initializing function. Its argument will be provided while initializing the machine. It can also be a constant.

states is an object whose keys are state types and whose values are configuration object:

A state without events nor always fields is a final state.

[state].always is a transition function that is called immediatly upon entrance of a state, and changes the state if retruning a value other than undefined. Unlinke genuine transitions, state changes triggered by always are not observable for the machine's consummer.

[state].events is as object whose keys are events types and whose values are transition functions (e: Event, s: State & {type: Key} & LocalDerived & Derived, emit: (m: Message) => void) => State | undefined. The first parameter is the received event. Second parameter is the derived state (see later) of the machine, restricted to the qualitative state of the current key. Alternatively, you can provide a constant in place of a transition function. If target state only has a type field, it can be represented by a string constant. If function retruns undefined, no transition happens. Finally, the function emit can be called inside the function to send a message.

[state].wildcard is a function that returns the next state if no events are matched. It functions like [state].events and can also be a constant.

[state].derive is a function receiving the state restricted to the relevant key and returning an object of type LocalDerived which will be merged with state.

derive is a function receiving the state and it's locally derived value and returning an object of type Derived which will be merged with state.
Exemjple

type LocalDerived = {
	count: (now: number) => number
}

const machine = multiStateMachine<Event, State, LocalDerived>()({
	init: { elapsed: 0, type: 'stopped' },
	states: {
		running: {
			derive: (s) => ({
				count: (now: number) => now - s.since,
			}),
			events: {
				bye: 'final',
				reset: ({ now }) => ({
					since: now,
					type: 'running',
				}),
				toggle: ({ now }, { since }) => ({
					elapsed: now - since,
					type: 'stopped',
				}),
			},
		},
		stopped: {
			derive: (s) => ({
				count: () => s.elapsed,
			}),
			events: {
				bye: 'final',
				reset: {
					elapsed: 0,
					type: 'stopped',
				},
				toggle: ({ now }, { elapsed }) => ({
					since: now - elapsed,
					type: 'running',
				}),
			},
		},
	},
})
```
