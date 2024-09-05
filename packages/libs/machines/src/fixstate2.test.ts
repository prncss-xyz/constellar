import { fixstateMachine } from './fixstate'
import { objectMachineFactory } from './object'

const machine = fixstateMachine({
	init: { n: 0 },
	events: {
		next: (e: { u: number }, { n }) => ({ n: n + e.u }),
	},
	isFinal: ({ n }) => n === 1,
})

describe('description', () => {
	test('without transform', () => {
		const m = objectMachineFactory(machine())
		expect(m.peek()).toMatchObject({ n: 0 })
		expect(m.isFinal()).toBeFalsy()
		m.send({ type: 'next', u: 1 })
		expect(m.peek()).toMatchObject({ n: 1 })
		expect(m.isFinal()).toBeTruthy()
	})
})
