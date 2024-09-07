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

	const machine = multistateMachine<Event, State>()({
		init: (n: number) => ({ type: 'a' as const, count: n }),
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
		const m = objectMachineFactory(machine(0))
		expect(m.peek()).toMatchObject({ count: 0, type: 'a' })
		expect(m.isDisabled('next')).toBeTruthy()
		expect(m.getFinal()).toBeUndefined()
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
		expect(m.getFinal()).toBeUndefined()
		m.send('zz')
		expect(m.getFinal()).toEqual({ count: 3, type: 'c' })
		expectTypeOf(m.getFinal()).toEqualTypeOf<
			{ type: 'c'; count: number } | undefined
		>()
	})
})
