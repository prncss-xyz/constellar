import { objectMachine, simpleStateMachine } from '@constellar/core'
import { describe, expect, test } from 'vitest'

const machine = simpleStateMachine({
	events: {
		inc: ({ n }: { n: number }, s) => n + s,
		step: (_: object, s) => s - 1,
	},
	init: (a: string) => a.length,
	transform: (x) => x - (x % 2),
})

describe('simpleStateMachine', () => {
	test('with transform and isFinal', () => {
		const m = objectMachine(machine('hello'))
		expect(m.state).toBe(4)
		m.send({ n: 2, type: 'inc' })
		expect(m.state).toBe(6)
		m.send('step')
		expect(m.state).toBe(4)
	})
})
