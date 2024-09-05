import { ManchineEffects } from './effects'

type State = { effects: Partial<{ a: number; b: number }> }
type Event = number
const monoid = {
	init: { effects: { a: 0, b: 0 } } as State,
	fold: (n: number, s: State) =>
		n ? { effects: { a: n, b: n ? undefined : 1 } } : s,
}

test('effects', () => {
	const eff = new ManchineEffects<Event, State>()
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
	let state = monoid.init
	const send = (n: number) => (state = monoid.fold(n, state))
	eff.update(state, send, interpreter)
	expect(cbInA).toHaveBeenCalledWith(0, send)
	expect(cbInB).toHaveBeenCalledTimes(1)
	expect(cbOutA).toHaveBeenCalledTimes(0)
	send(1)
	eff.update(state, send, interpreter)
	expect(cbInA).toHaveBeenCalledWith(1, send)
	expect(cbInB).toHaveBeenCalledTimes(1)
	expect(cbOutA).toHaveBeenCalledTimes(1)
	const s1 = state
	send(0)
	eff.update(state, send, interpreter)
	expect(state.effects?.a).toBe(s1.effects?.a)
	expect(cbOutA).toHaveBeenCalledTimes(1)
	eff.flush()
	expect(cbOutA).toHaveBeenCalledTimes(2)
})
