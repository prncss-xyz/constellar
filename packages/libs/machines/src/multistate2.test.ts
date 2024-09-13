import { multistateMachine } from './multistate'
import { objectMachine } from './object'

describe('machine', () => {
	type Event = {
		type: 'next'
	}

	type State = {
		type: 'green' | 'yellow' | 'red'
	}

	const machine = multistateMachine<Event, State, object, { len: number }>()({
		init: 'green',
		states: {
			green: {
				events: {
					next: 'yellow',
				},
			},
			yellow: {
				events: {
					next: 'red',
				},
			},
			red: {
				events: {
					next: 'green',
				},
			},
		},
		derive: (s) => ({ ...s, len: s.type.length }),
	})

	it('simple finte state machine', () => {
		const m = objectMachine(machine())
		expect(m.state).toEqual({ type: 'green', len: 5 })
		expect(m.final).toBeUndefined()
		m.send('next')
		expect(m.state).toEqual({ type: 'yellow', len: 6 })
		expect(m.final).toBeUndefined()
	})
})
