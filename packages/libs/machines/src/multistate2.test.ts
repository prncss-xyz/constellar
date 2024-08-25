import { id } from '@constellar/utils'

import { createObjectReducer, fromMachine } from '..'
import { multistateMachine } from './multistate'

describe('machine', () => {
	type Event = {
		type: 'next'
	}

	type State = {
		type: 'green' | 'yellow' | 'red'
	}

	const machine = multistateMachine<
		Event,
		State,
		void,
		object,
		{ len: number }
	>({
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

	it('should start running', () => {
		const m = createObjectReducer(fromMachine(machine), id)()
		const send = m.send.bind(m)
		expect(m.state).toMatchObject({ type: 'green' })
		send('next')
		expect(m.state).toMatchObject({ type: 'yellow' })
	})
})
