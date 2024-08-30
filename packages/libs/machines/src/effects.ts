/* eslint-disable @typescript-eslint/no-explicit-any */
export type AnyState = { effects?: Partial<Record<string, any>> }

export type Effects<State extends AnyState> = Required<
	Exclude<State['effects'], undefined>
>
export type Interpreter<State extends AnyState, Event> = {
	[Key in keyof Effects<State>]: (
		effect: Exclude<Effects<State>[Key], undefined>,
		send: (event: Event) => void,
	) => void | (() => void)
}

export class ManchineEffects<State extends AnyState, Event> {
	lastArgs = new Map<keyof Effects<State>, any>()
	unmount = new Map<keyof Effects<State>, void | (() => void)>()
	lastCb = new Map<keyof Effects<State>, unknown>()
	lastSend: unknown
	constructor() {}
	update(
		state: State,
		send: (event: Event) => void,
		interpreter: Interpreter<State, Event>,
	) {
		for (const entry of Object.entries(interpreter)) {
			const k = entry[0] as keyof Effects<State>
			const cb = entry[1] as any
			const args = (state.effects as any)?.[k]
			if (
				this.lastArgs.get(k) === args &&
				this.lastSend === send &&
				this.lastCb.get(k) === cb
			)
				continue
			this.lastArgs.set(k, args)
			this.lastCb.set(k, cb)
			this.unmount.get(k)?.()
			this.unmount.set(k, args === undefined ? undefined : cb(args, send))
		}
		this.lastSend = send
	}
	flush() {
		for (const [, v] of this.unmount) {
			v?.()
		}
		this.unmount.clear()
		this.lastArgs.clear()
		this.lastCb.clear()
		this.lastSend = undefined
	}
}
