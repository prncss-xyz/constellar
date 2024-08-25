import { id } from '@constellar/utils'

import { createObjectReducer, fromMachine } from '..'
import { multistateMachine } from './multistate'

describe('machine', () => {
	type Event = {
		type: 'next' | 'inc'
	}

	type State = {
		type: 'a' | 'b'
		count: number
	}

	const machine = multistateMachine<Event, State>({
		init: { type: 'a', count: 0 },
		states: {
			a: {
				events: {
					next: (_, s) => (s.count % 2 ? { ...s, type: 'b' } : undefined),
					inc: (_, s) => ({ ...s, count: s.count + 1 }),
				},
			},
			b: {
				events: {
					next: (_, s) => ({ ...s, type: 'a' }),
					inc: (_, s) => ({ ...s, count: s.count + 1 }),
				},
			},
		},
	})

	it('should start running', () => {
		const m = createObjectReducer(fromMachine(machine), id)()
		const send = m.send.bind(m)
		expect(m.state).toMatchObject({ type: 'a' })
		send('next')
		expect(m.state).toMatchObject({ type: 'a' })
		send('inc')
		send('next')
		expect(m.state).toMatchObject({ type: 'b' })
	})
})
