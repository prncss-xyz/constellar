import { multiStateJotaiMachine } from '@constellar/jotai'
import { atom, Atom } from 'jotai'

import { nowAtom } from './now'

type Event = { type: 'reset' } | { type: 'toggle' }

type State =
	| { elapsed: number; type: 'stopped' }
	| { since: number; type: 'running' }

type Derived = {
	count: Atom<number>
}

export const timerMachine = multiStateJotaiMachine<Event, State, Derived>()({
	init: { elapsed: 0, type: 'stopped' },
	states: {
		running: {
			derive: (s) => ({
				count: atom((get) => get(nowAtom) - s.since),
			}),
			events: {
				reset: (_e, _s, get) => ({
					since: get(nowAtom),
					type: 'running',
				}),
				toggle: (_, { since }, get) => ({
					elapsed: get(nowAtom) - since,
					type: 'stopped',
				}),
			},
		},
		stopped: {
			derive: (s) => ({
				count: atom(() => s.elapsed),
			}),
			events: {
				reset: () => ({
					elapsed: 0,
					type: 'stopped',
				}),
				toggle: (_, { elapsed }, get) => ({
					since: get(nowAtom) - elapsed,
					type: 'running',
				}),
			},
		},
	},
})
