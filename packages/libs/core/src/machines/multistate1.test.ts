import { multistateMachine } from './multistate'
import { objectMachine } from './object'

describe('machine', () => {
	type Event =
		| {
				now: number
				type: 'reset'
		  }
		| {
				now: number
				type: 'toggle'
		  }
		| { type: 'bye' }

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

	type LocalDerived = {
		count: (now: number) => number
	}

	const machine = multistateMachine<Event, State, LocalDerived>()({
		derive: (s) => s,
		init: { elapsed: 0, type: 'stopped' },
		states: {
			final: {
				derive: { count: () => 0 },
				events: {},
			},
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

	it('should start running', () => {
		const m = objectMachine(machine())

		expect(m.state).toMatchObject({ elapsed: 0, type: 'stopped' })
		m.send({ now: 1, type: 'toggle' })
		expect(m.state).toMatchObject({ since: 1, type: 'running' })
		expect(m.state.count(3)).toBe(2)
		m.send({ now: 3, type: 'toggle' })
		expect(m.state.count(3)).toBe(2)
		expect(m.state).toMatchObject({ elapsed: 2, type: 'stopped' })
		m.send({ now: 6, type: 'reset' })
		expect(m.state).toMatchObject({ elapsed: 0, type: 'stopped' })
		m.send({ now: 9, type: 'toggle' })
		m.send({ now: 11, type: 'reset' })
		m.send({ now: 11, type: 'toggle' })
		m.send('bye')
		expect(m.state).toMatchObject({ type: 'final' })
		const acc = m.visit((_, acc, index) => acc + index, '')
		expect(acc).toBe('final')
	})
})
