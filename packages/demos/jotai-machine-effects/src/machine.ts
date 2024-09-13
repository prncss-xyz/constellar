import { multistateMachine } from '@constellar/core/machines'

export type Event = { type: 'next' }

export type State = { type: 'green' | 'yellow' | 'red' }

export type Effects = {
	timeout: { delay: number; event: 'next' }
}
export const lightsMachine = multistateMachine<
	Event,
	State,
	{
		effects?: Partial<Effects>
	}
>()({
	init: 'green',
	states: {
		green: {
			events: { next: 'yellow' },
			derive: {
				effects: { timeout: { delay: 1000, event: 'next' } },
			},
		},
		yellow: {
			events: { next: 'red' },
			derive: {
				effects: { timeout: { delay: 1000, event: 'next' } },
			},
		},
		red: {
			events: { next: 'green' },
			derive: {
				effects: { timeout: { delay: 1000, event: 'next' } },
			},
		},
	},
})
