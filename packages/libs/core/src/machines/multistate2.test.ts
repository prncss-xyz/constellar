import { multistateMachine } from './multistate'
import { objectMachine } from './object'

describe('machine', () => {
	type Event = {
		type: 'next'
	}

	type State = {
		type: 'green' | 'red' | 'yellow'
	}

	const machine = multistateMachine<Event, State, object, { len: number }>()({
		derive: (s) => ({ ...s, len: s.type.length }),
		init: 'green',
		states: {
			green: {
				events: {
					next: 'yellow',
				},
			},
			red: {
				events: {
					next: 'green',
				},
			},
			yellow: {
				events: {
					next: 'red',
				},
			},
		},
	})

	it('simple finite state machine', () => {
		const m = objectMachine(machine())
		expect(m.state).toEqual({ len: 5, type: 'green' })
		expect(m.final).toBeUndefined()
		m.send('next')
		expect(m.state).toEqual({ len: 6, type: 'yellow' })
		expect(m.final).toBeUndefined()
	})
})
