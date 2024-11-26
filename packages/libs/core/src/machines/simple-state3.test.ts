import { objectMachine } from './object'
import { simpleStateBaseMachine } from './simple-state'

const machine = simpleStateBaseMachine()({
	events: {
		next: (e: { u: number }, { n }) => ({ n: n + e.u }),
	},
	init: { n: 0 },
})

describe('simpleStateMachine', () => {
	test('default isFinal', () => {
		const m = objectMachine(machine())
		expect(m.state).toMatchObject({ n: 0 })
		expect(m.final).toBeUndefined()
	})
})
