import { multiStateMachine } from './multi-state'
import { objectMachine } from './object'

describe('machine', () => {
	type Event = {
		type: 'inc' | 'next' | 'zz'
	}

	type State = {
		count: number
		type: 'a' | 'b' | 'c'
	}

	const machine = multiStateMachine<Event, State>()({
		init: (n: number) => ({ count: n, type: 'a' as const }),
		states: {
			a: {
				always: (s) => (s.count > 3 ? { ...s, count: 3 } : undefined),
				events: {
					inc: (_, s) => ({ ...s, count: s.count + 1 }),
					next: (_, s) => (s.count % 2 ? { ...s, type: 'b' } : undefined),
				},
			},
			b: {
				events: {
					inc: (_, s) => ({ ...s, count: s.count + 1 }),
					next: (_, s) => ({ ...s, type: 'a' }),
				},
				wildcard: (_, s) => ({ ...s, type: 'c' }),
			},
			c: {},
		},
	})

	it('with wildcard', () => {
		const m = objectMachine(machine(0))
		expect(m.state).toMatchObject({ count: 0, type: 'a' })
		expect(m.isDisabled('next')).toBeTruthy()
		expect(m.final).toBeUndefined()
		m.send('next')
		expect(m.state).toMatchObject({ type: 'a' })
		m.send('inc')
		expect(m.isDisabled('next')).toBeFalsy()
		m.send('next')
		expect(m.state).toMatchObject({ type: 'b' })
		m.send('next')
		expect(m.state).toMatchObject({ type: 'a' })
		m.send('inc')
		m.send('inc')
		m.send('inc')
		m.send('inc')
		expect(m.state).toMatchObject({ count: 3 })
		m.send('next')
		expect(m.final).toBeUndefined()
		m.send('zz')
		expect(m.final).toEqual({ count: 3, type: 'c' })
		expectTypeOf(m.final).toEqualTypeOf<
			{ count: number; type: 'c' } | undefined
		>()
	})
})
