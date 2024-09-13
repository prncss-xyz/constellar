import { fixstateMachine } from './fixstate'
import { objectMachine } from './object'

const machine = fixstateMachine({
	init: (a: string) => a.length,
	events: {
		next: (e: { u: number }, n) => n + e.u,
		jazz: (e: { j: boolean }) => (e.j ? 20 : undefined),
		toto: (e: { j: string }) => e.j.length,
		fluf: 4,
	},
	transform: (x) => x * 2,
	getFinal: (x) => (x === 8 ? x : undefined),
})

describe('fixstateMachine', () => {
	test('with transform and isFinal', () => {
		const m = objectMachine(machine('hello'))
		expect(m.state).toBe(10)
		m.send({ type: 'next', u: 2 })
		expect(m.state).toBe(24)
		m.send({ type: 'toto', j: 'oo' })
		expect(m.state).toBe(4)
		m.send({ type: 'jazz', j: false })
		expect(m.state).toBe(4)
		m.send({ type: 'jazz', j: true })
		expect(m.state).toBe(40)
		m.send('fluf')
		expect(m.state).toBe(8)
		m.send({ type: 'next', u: 2 })
		expect(m.state).toBe(8)
	})
})
