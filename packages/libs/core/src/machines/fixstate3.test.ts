import { fixstateMachine } from './fixstate'
import { objectMachine } from './object'

const machine = fixstateMachine({
	init: { n: 0 },
	events: {
		next: (e: { u: number }, { n }) => ({ n: n + e.u }),
	},
})

describe('fixstateMachine', () => {
	test('default isFinal', () => {
		const m = objectMachine(machine())
		expect(m.state).toMatchObject({ n: 0 })
		expect(m.final).toBeUndefined()
	})
})
