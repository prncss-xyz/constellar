import { multistateMachine } from './multistate'
import { objectMachineFactory } from './object'

describe('machine', () => {
	type Event = {
		type: 'next' | 'inc' | 'zz'
	}

	type State = {
		type: 'a' | 'b' | 'c'
		count: number
	}

	const machine = multistateMachine<Event, State>({
		init: { type: 'a', count: 0 },
		states: {
			a: {
				always: (s) => (s.count > 3 ? { ...s, count: 3 } : undefined),
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
				wildcard: (_, s) => ({ ...s, type: 'c' }),
			},
			c: {},
		},
	})

	it('with wildcard', () => {
		const m = objectMachineFactory(machine())
		expect(m.peek()).toMatchObject({ count: 0, type: 'a' })
		expect(m.isDisabled('next')).toBeTruthy()
		expect(m.isFinal()).toBe(false)
		m.send('next')
		expect(m.peek()).toMatchObject({ type: 'a' })
		m.send('inc')
		expect(m.isDisabled('next')).toBeFalsy()
		m.send('next')
		expect(m.peek()).toMatchObject({ type: 'b' })
		m.send('next')
		expect(m.peek()).toMatchObject({ type: 'a' })
		m.send('inc')
		m.send('inc')
		m.send('inc')
		m.send('inc')
		expect(m.peek()).toMatchObject({ count: 3 })
		m.send('next')
		expect(m.isFinal()).toBe(false)
		m.send('zz')
		expect(m.isFinal()).toBe(true)
	})
})
