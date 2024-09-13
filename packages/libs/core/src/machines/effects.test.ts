import { spy } from 'tinyspy'

import { fixstateMachine } from '.'
import { objectMachine } from './object'

const machine = fixstateMachine({
	init: { n: 0 },
	events: {
		e: ({ n }: { n: number }) => ({ n }),
	},
	transform: ({ n }) => ({ n, effects: { a: n, b: n === 0 ? 1 : undefined } }),
})

test('effects', () => {
	const cbInA = spy()
	const cbOutA = spy()
	const cbInB = spy()
	const interpreter = {
		a: (...args: unknown[]) => {
			cbInA(...args)
			return cbOutA
		},
		b: (...args: unknown[]) => {
			cbInB(...args)
		},
	}

	const m = objectMachine(machine(), { interpreter })

	expect(cbInA.calls[0]?.[0]).toBe(0)
	expect(cbInB.calls).toHaveLength(1)
	expect(cbOutA.calls).toHaveLength(0)
	m.send({ type: 'e', n: 1 })
	expect(cbInA.calls[1]?.[0]).toBe(1)
	expect(cbInB.calls).toHaveLength(1)
	expect(cbOutA.calls).toHaveLength(1)
	expect(cbOutA.calls).toHaveLength(1)
	m.flush()
	expect(cbOutA.calls).toHaveLength(2)
})
