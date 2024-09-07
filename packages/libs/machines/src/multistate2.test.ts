import { multistateMachine } from './multistate'
import { objectMachineFactory } from './object'

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
		const m = objectMachineFactory(machine())
		expect(m.peek()).toEqual({ type: 'green', len: 5 })
		expect(m.getFinal()).toBeUndefined()
		m.send('next')
		expect(m.peek()).toEqual({ type: 'yellow', len: 6 })
		expect(m.getFinal()).toBeUndefined()
	})
})
