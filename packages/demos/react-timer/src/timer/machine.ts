import { fromMachine, multistateMachine } from '@constellar/machines'

type Event =
	| { type: 'toggle'; now: number }
	| { type: 'reset'; now: number }
	| { type: 'bye' }

type State =
	| { type: 'running'; since: number }
	| { type: 'stopped'; elapsed: number }

type Derived = {
	count: (now: number) => number
}

export const machine = fromMachine(
	multistateMachine<Event, State, Derived>({
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
					...s,
					count: (now: number) => now - s.since,
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
					...s,
					count: () => s.elapsed,
				}),
			},
		},
	}),
)
