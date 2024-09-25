import { multistateMachine } from '@constellar/core'

export type Event = { type: 'next' }

export type State = { type: 'green' | 'red' | 'yellow' }

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
			derive: {
				effects: { timeout: { delay: 1000, event: 'next' } },
			},
			events: { next: 'yellow' },
		},
		red: {
			derive: {
				effects: { timeout: { delay: 1000, event: 'next' } },
			},
			events: { next: 'green' },
		},
		yellow: {
			derive: {
				effects: { timeout: { delay: 1000, event: 'next' } },
			},
			events: { next: 'red' },
		},
	},
})
