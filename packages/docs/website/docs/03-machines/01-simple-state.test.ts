import { simpleStateMachine } from '@constellar/core'
import { expect, test } from 'vitest'

const machine = simpleStateMachine()(
	{
		events: {
			inc: ({ n }: { n: number }, s) => n + s,
			reset: 3,
			step: (_: object, s) => s - 1,
		},
		init: (a: string) => a.length,
		transform: (s) => s * 2,
	},
	(t) => (t === 8 ? t : undefined),
)

test('dummy', () => {
	expect(machine).toBe(machine)
})
