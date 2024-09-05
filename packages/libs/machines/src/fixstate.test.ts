import { fixstateMachine } from './fixstate'
import { objectMachineFactory } from './object'

const machine = fixstateMachine({
	init: (a: string) => a.length,
	events: {
		next: (e: { u: number }, n) => n + e.u,
		jazz: (e: { j: boolean }) => (e.j ? 20 : undefined),
		toto: (e: { j: string }) => e.j.length,
		fluf: 4,
	},
	transform: (x) => x * 2,
	isFinal: (x) => x === 8,
})

describe('fixstateMachine', () => {
	test('with transform and isFinal', () => {
		const m = objectMachineFactory(machine('hello'))
		expect(m.peek()).toBe(10)
		m.send({ type: 'next', u: 2 })
		expect(m.peek()).toBe(24)
		m.send({ type: 'toto', j: 'oo' })
		expect(m.peek()).toBe(4)
		m.send({ type: 'jazz', j: false })
		expect(m.peek()).toBe(4)
		m.send({ type: 'jazz', j: true })
		expect(m.peek()).toBe(40)
		m.send('fluf')
		expect(m.peek()).toBe(8)
		m.send({ type: 'next', u: 2 })
		expect(m.peek()).toBe(8)
	})
})
