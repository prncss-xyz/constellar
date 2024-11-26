import { multiStateJotaiMachine } from '@constellar/jotai'

import { messageQueueAtom } from './messages'

export type State =
	| { effects: { payment: { id: string; now: number } }; type: 'payment' }
	| { id: string; type: 'payment' }
	| { type: 'locked' }
	| { type: 'unlocked' }
export type Event =
	| { amount: number; type: 'success' }
	| { id: string; now: number; type: 'payment' }
	| { type: 'error' }
	| { type: 'push' }
export type Message = { amount: number; type: 'success' } | { type: 'error' }

export const turnstileMachine = multiStateJotaiMachine<
	Event,
	State,
	object,
	object
>()({
	init: { type: 'locked' },
	states: {
		locked: {
			events: {
				payment: ({ id, now }) => ({
					effects: { payment: { id, now } },
					type: 'payment',
				}),
			},
		},
		payment: {
			events: {
				error: (_s, _e, _get, set) => {
					set(messageQueueAtom, 'Payment refused.')
					return 'locked'
				},
				success: ({ amount }, _e, _get, set) => {
					set(
						messageQueueAtom,
						`Payment accepted, you still have ${amount} tickets.`,
					)
					return 'unlocked'
				},
			},
		},
		unlocked: {
			events: {
				push: 'locked',
			},
		},
	},
})
