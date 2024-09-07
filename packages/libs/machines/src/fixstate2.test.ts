import { fixstateMachine } from './fixstate'
import { objectMachineFactory } from './object'

const machine = fixstateMachine({
	init: { n: 0 },
	events: {
		next: (e: { u: number }, { n }) => ({ n: n + e.u }),
	},
	getFinal: (s) => (s.n === 1 ? s : undefined),
})

describe('description', () => {
	test('without transform', () => {
		const m = objectMachineFactory(machine())
		expect(m.peek()).toMatchObject({ n: 0 })
		expect(m.getFinal()).toBeUndefined()
		m.send({ type: 'next', u: 1 })
		expect(m.peek()).toMatchObject({ n: 1 })
		expect(m.getFinal()).toEqual({ n: 1 })
	})
})
