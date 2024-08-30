/* eslint-disable @typescript-eslint/no-explicit-any */
import { ManchineEffects } from './effects'

type State = { effects: { a: number } }
type Event = number
const monoid = {
	init: { effects: { a: 0 } },
	fold: (n: number, s: State) => (n ? { effects: { a: n } } : s),
}

test('effects', () => {
	const eff = new ManchineEffects<State, Event>()
	const cbIn = vi.fn()
	const cbOut = vi.fn()
	const interpreter = {
		a: (...args: any[]) => {
			cbIn(...args)
			return cbOut
		},
	}
	let state = monoid.init
	const send = (n: number) => (state = monoid.fold(n, state))
	eff.update(state, send, interpreter)
	expect(cbIn).toHaveBeenCalledWith(0, send)
	expect(cbOut).toHaveBeenCalledTimes(0)
	send(1)
	eff.update(state, send, interpreter)
	expect(cbIn).toHaveBeenCalledWith(1, send)
	expect(cbOut).toHaveBeenCalledTimes(1)
	const s1 = state
	send(0)
	eff.update(state, send, interpreter)
	expect(state.effects?.a).toBe(s1.effects?.a)
	expect(cbOut).toHaveBeenCalledTimes(1)
	eff.flush()
	expect(cbOut).toHaveBeenCalledTimes(2)
})
