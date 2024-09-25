import { fixstateMachine, machineCb, MachineEffects } from '.'
import { objectMachine } from './object'

const machine = fixstateMachine({
	events: {
		e: ({ n }: { n: number }) => ({ n }),
	},
	init: { n: 0 },
	transform: ({ n }) => ({ effects: { a: n, b: n === 0 ? 1 : undefined }, n }),
})

test('effects with interpreter', () => {
	const cbInA = vi.fn()
	const cbOutA = vi.fn()
	const cbInB = vi.fn()
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

	expect(cbInA.mock.calls[0]?.[0]).toBe(0)
	expect(cbInA).toHaveBeenCalledTimes(1)
	expect(cbInB).toHaveBeenCalledTimes(1)
	expect(cbOutA).toHaveBeenCalledTimes(0)
	m.send({ n: 1, type: 'e' })
	m.send({ n: 1, type: 'e' })
	expect(cbInA.mock.calls[1]?.[0]).toBe(1)
	expect(cbInB).toHaveBeenCalledTimes(1)
	expect(cbOutA).toHaveBeenCalledTimes(1)
	expect(cbOutA).toHaveBeenCalledTimes(1)
	m.flush()
	expect(cbOutA).toHaveBeenCalledTimes(2)
})

test('effects without interpreter', () => {
	expect(() => {
		const m = machine()
		const cb = machineCb(m)
		const { visit } = cb(m.transform({ n: 0 }))
		m.transform({ n: 1 })
		const eff = new MachineEffects(() => {}, undefined)
		eff.update(visit)
	}).not.toThrowError()
})
