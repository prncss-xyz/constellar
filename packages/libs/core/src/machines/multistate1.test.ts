import { multistateMachine } from './multistate'
import { objectMachine } from './object'

describe('machine', () => {
	type Event =
		| {
				type: 'toggle'
				now: number
		  }
		| {
				type: 'reset'
				now: number
		  }
		| { type: 'bye' }

	type State =
		| {
				type: 'running'
				since: number
		  }
		| {
				type: 'stopped'
				elapsed: number
		  }
		| { type: 'final' }

	type LocalDerived = {
		count: (now: number) => number
	}

	const machine = multistateMachine<Event, State, LocalDerived>()({
		init: { type: 'stopped', elapsed: 0 },
		states: {
			running: {
				events: {
					toggle: ({ now }, { since }) => ({
						type: 'stopped',
						elapsed: now - since,
					}),
					reset: ({ now }) => ({
						type: 'running',
						since: now,
					}),
					bye: 'final',
				},
				derive: (s) => ({
					count: (now: number) => now - s.since,
				}),
			},
			stopped: {
				events: {
					toggle: ({ now }, { elapsed }) => ({
						type: 'running',
						since: now - elapsed,
					}),
					reset: {
						type: 'stopped',
						elapsed: 0,
					},
					bye: 'final',
				},
				derive: (s) => ({
					count: () => s.elapsed,
				}),
			},
			final: {
				events: {},
				derive: { count: () => 0 },
			},
		},
		derive: (s) => s,
	})

	it('should start running', () => {
		const m = objectMachine(machine())

		expect(m.state).toMatchObject({ type: 'stopped', elapsed: 0 })
		m.send({ type: 'toggle', now: 1 })
		expect(m.state).toMatchObject({ type: 'running', since: 1 })
		expect(m.state.count(3)).toBe(2)
		m.send({ type: 'toggle', now: 3 })
		expect(m.state.count(3)).toBe(2)
		expect(m.state).toMatchObject({ type: 'stopped', elapsed: 2 })
		m.send({ type: 'reset', now: 6 })
		expect(m.state).toMatchObject({ type: 'stopped', elapsed: 0 })
		m.send({ type: 'toggle', now: 9 })
		m.send({ type: 'reset', now: 11 })
		m.send({ type: 'toggle', now: 11 })
		m.send('bye')
		expect(m.state).toMatchObject({ type: 'final' })
	})
})
