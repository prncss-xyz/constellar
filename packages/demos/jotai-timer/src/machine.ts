import { multiStateMachine } from '@constellar/core'

type Event = { now: number; type: 'reset' } | { now: number; type: 'toggle' }

type State =
	| { elapsed: number; type: 'stopped' }
	| { since: number; type: 'running' }

type Derived = {
	count: (now: number) => number
}

export const timerMachine = multiStateMachine<Event, State, Derived>()({
	init: { elapsed: 0, type: 'stopped' },
	states: {
		running: {
			derive: (s) => ({
				count: (now: number) => now - s.since,
			}),
			events: {
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
				reset: () => ({
					elapsed: 0,
					type: 'stopped',
				}),
				toggle: ({ now }, { elapsed }) => ({
					since: now - elapsed,
					type: 'running',
				}),
			},
		},
	},
})
