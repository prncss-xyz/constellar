import { multistateMachine } from '@constellar/machines'

type Event = { type: 'toggle'; now: number } | { type: 'reset'; now: number }

type State =
	| { type: 'running'; since: number }
	| { type: 'stopped'; elapsed: number }

type Derived = {
	count: (now: number) => number
	toggled: State['type']
}

export const timerMachine = multistateMachine<Event, State, void, Derived>({
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
			},
			derive: (s) => ({
				count: (now: number) => now - s.since,
				toggled: 'stopped',
			}),
		},
		stopped: {
			events: {
				toggle: ({ now }, { elapsed }) => ({
					type: 'running',
					since: now - elapsed,
				}),
				reset: () => ({
					type: 'stopped',
					elapsed: 0,
				}),
			},
			derive: (s) => ({
				count: () => s.elapsed,
				toggled: 'running',
			}),
		},
	},
})