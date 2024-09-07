import { fixstateMachine } from './fixstate'
import { objectMachineFactory } from './object'

const machine = fixstateMachine({
	init: { n: 0 },
	events: {
		next: (e: { u: number }, { n }) => ({ n: n + e.u }),
	},
})

describe('fixstateMachine', () => {
	test('default isFinal', () => {
		const m = objectMachineFactory(machine())
		expect(m.peek()).toMatchObject({ n: 0 })
		expect(m.getFinal()).toBeUndefined()
	})
})
