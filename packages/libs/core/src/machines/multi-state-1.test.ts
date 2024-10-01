import { multiStateMachine } from './multi-state'
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
		| { type: 'say' }

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

	type Message = { type: 'hi' }

	type LocalDerived = {
		count: (now: number) => number
	}

	const machine = multiStateMachine<
		Event,
		State,
		LocalDerived,
		object,
		Message
	>()({
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
					say: (_e, _s, send) => send('hi'),
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
		const listener = vi.fn()
		const m = objectMachine(machine(), { listener })
		expect(m.state).toMatchObject({ elapsed: 0, type: 'stopped' })
		expect(m.isDisabled('say')).toBeTruthy()
		expect(m.next({ now: 1, type: 'toggle' })).toMatchObject({
			since: 1,
			type: 'running',
		})
		m.send({ now: 1, type: 'toggle' })
		expect(m.state).toMatchObject({ since: 1, type: 'running' })
		expect(m.isDisabled('say')).toBeFalsy()
		m.send('say')
		expect(listener.mock.calls).toEqual([[{ type: 'hi' }]])
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
