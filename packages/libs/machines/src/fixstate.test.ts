import { id } from '@constellar/utils'

import { createObjectReducer, fromRawMachine } from '..'
import { fixstateMachine } from './fixstate'

const machine = fixstateMachine({
	init: (a: string) => a.length,
	transitions: {
		next: (e: { u: number }, n) => e.u + n,
		toto: (e: { j: string }) => e.j.length,
	},
	derive: (x) => x * 2,
})

test('fixstateMachine', () => {
	const m = createObjectReducer(fromRawMachine(machine), id)('hello')
	const send = m.send.bind(m)
	expect(m.state).toBe(10)
	send({ type: 'next', u: 2 })
	expect(m.state).toBe(24)
	send({ type: 'toto', j: 'oo' })
	expect(m.state).toBe(4)
})
