import { fromMachine, multistateMachine } from '@constellar/machines'

export type Event = { type: 'next' }

export type State = { type: 'green' | 'yellow' | 'red' }

export const machine = fromMachine(
	multistateMachine<
		Event,
		State,
		void,
		{
			effects?: Partial<{
				timeout: { delay: number; event: 'next' }
			}>
		}
	>({
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
				derive: {},
			},
		},
	}),
)
