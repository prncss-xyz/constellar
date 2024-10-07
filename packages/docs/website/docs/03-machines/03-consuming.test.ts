import { multiStateMachine, objectMachine } from '@constellar/core'
import { expect, test } from 'vitest'

type Event = { type: 'next' }

type State = { type: 'green' | 'red' | 'yellow' }

const someMachine = multiStateMachine<Event, State>()({
	init: 'green',
	states: {
		green: {
			events: { next: 'yellow' },
		},
		red: {
			events: { next: 'green' },
		},
		yellow: {
			events: { next: 'red' },
		},
	},
})

test('consuming', () => {
	const m = objectMachine(someMachine())
	m.send({ type: 'next' })
	expect(m.state).toEqual({ type: 'yellow' })
})
