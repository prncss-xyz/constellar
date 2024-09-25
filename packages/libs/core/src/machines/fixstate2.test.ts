import { fixstateMachine } from './fixstate'
import { objectMachine } from './object'

const machine = fixstateMachine(
	{
		events: {
			next: (e: { u: number }, { n }) => ({ n: n + e.u }),
		},
		init: { n: 0 },
	},
	(s) => (s.n === 1 ? s : undefined),
)

describe('description', () => {
	test('without transform', () => {
		const m = objectMachine(machine())
		expect(m.state).toMatchObject({ n: 0 })
		expect(m.final).toBeUndefined()
		m.send({ type: 'next', u: 1 })
		expect(m.state).toMatchObject({ n: 1 })
		expect(m.final).toEqual({ n: 1 })
	})
})
