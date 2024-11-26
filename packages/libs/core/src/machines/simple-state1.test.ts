import { objectMachine } from './object'
import { simpleStateMachine } from './simple-state'

const machine = simpleStateMachine()(
	{
		events: {
			gogo: 4,
			jazz: (e: { j: boolean }) => (e.j ? 20 : undefined),
			next: (e: { u: number }, n) => n + e.u,
			toto: (e: { j: string }) => e.j.length,
		},
		init: (a: string) => a.length,
		transform: (x) => x * 2,
	},
	(x) => (x === 8 ? x : undefined),
)

describe('simpleStateMachine', () => {
	test('with transform and isFinal', () => {
		const m = objectMachine(machine('hello'))
		expect(m.state).toBe(10)
		m.send({ type: 'next', u: 2 })
		expect(m.state).toBe(24)
		m.send({ j: 'oo', type: 'toto' })
		expect(m.state).toBe(4)
		m.send({ j: false, type: 'jazz' })
		expect(m.state).toBe(4)
		m.send({ j: true, type: 'jazz' })
		expect(m.state).toBe(40)
		m.send('gogo')
		expect(m.state).toBe(8)
		m.send({ type: 'next', u: 2 })
		expect(m.state).toBe(8)
	})
})
