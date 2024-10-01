import { promiseMachine } from './object'
import { simpleStateMachine } from './simple-state'

type Effect = Partial<{ dbl: true; inc: true }>

test('promiseMachine', async () => {
	const machine = simpleStateMachine(
		{
			events: {
				double: (_: object, { n }) => ({
					n: n * 2,
				}),
				next: (_: object, { n }) => ({
					n: n + 1,
				}),
			},
			init: { n: 0 },
			transform: ({ n }) => ({
				effects: (n % 2 === 0
					? {
							inc: true,
						}
					: {
							dbl: true,
						}) as Effect,
				n,
			}),
		},
		({ n }) => (n > 10 ? n : undefined),
	)
	const res = promiseMachine(machine(), {
		dbl: (_, send) => send('double'),
		inc: (_, send) => send('next'),
	})
	expect(await res).toBe(14)
})
