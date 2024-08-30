import { id } from '@constellar/utils'

import { createObjectReducer, fromMachine } from '..'
import { fixstateMachine } from './fixstate'

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

test('fixstateMachine', () => {
	const m = createObjectReducer(fromMachine(machine), id)('hello')
	const send = m.send.bind(m)
	expect(m.state).toBe(10)
	send({ type: 'next', u: 2 })
	expect(m.state).toBe(24)
	send({ type: 'toto', j: 'oo' })
	expect(m.state).toBe(4)
	send({ type: 'jazz', j: false })
	expect(m.state).toBe(4)
	send({ type: 'jazz', j: true })
	expect(m.state).toBe(40)
	send('fluf')
	expect(m.state).toBe(8)
	send({ type: 'next', u: 2 })
	expect(m.state).toBe(8)
})
