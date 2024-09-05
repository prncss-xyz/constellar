import { multistateMachine } from '@constellar/machines'

export type Event = { type: 'next' }

export type State = { type: 'green' | 'yellow' | 'red' }

export type Effects = {
	timeout: { key: State['type']; delay: number; event: 'next' }
}
export const lightsMachine = multistateMachine<
	Event,
	State,
	void,
	{
		effects?: Partial<Effects>
	}
>({
	init: 'green',
	states: {
		green: {
			events: { next: 'yellow' },
			derive: {
				effects: { timeout: { key: 'green', delay: 1000, event: 'next' } },
			},
		},
		yellow: {
			events: { next: 'red' },
			derive: {
				effects: { timeout: { key: 'yellow', delay: 1000, event: 'next' } },
			},
		},
		red: {
			events: { next: 'green' },
			derive: {
				effects: { timeout: { key: 'red', delay: 1000, event: 'next' } },
			},
		},
	},
})
