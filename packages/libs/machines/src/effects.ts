import { shallowEqual } from '@constellar/utils'

/* eslint-disable @typescript-eslint/no-explicit-any */
export type EffectState = { effects?: Partial<Record<string, any>> }

export type Effects<State extends EffectState> = Required<
	Exclude<State['effects'], undefined>
>
export type Interpreter<Event, State extends EffectState> = {
	[Key in keyof Effects<State>]: (
		effect: Exclude<Effects<State>[Key], undefined>,
		send: (event: Event) => void,
	) => void | (() => void)
}

export class ManchineEffects<Event, State extends EffectState> {
	last = new Map<
		keyof Effects<State>,
		{ args: any; unmount: void | (() => void); cb: unknown }
	>()
	lastSend: unknown
	constructor() {}
	update(
		state: State,
		send: (event: Event) => void,
		interpreter: Interpreter<Event, State>,
	) {
		for (const entry of Object.entries(interpreter)) {
			const [effect, cb] = entry as [keyof Effects<State>, any]

			const args = (state.effects as any)?.[effect]
			const last = this.last.get(effect)
			if (
				shallowEqual(last?.args, args) &&
				this.lastSend === send &&
				last?.cb === cb
			)
				continue
			last?.unmount?.()
			this.last.set(effect, {
				args,
				cb,
				unmount: args === undefined ? undefined : cb(args, send),
			})
		}
		this.lastSend = send
	}
	flush() {
		for (const [, last] of this.last) {
			last.unmount?.()
		}
		this.last.clear()
		this.lastSend = undefined
	}
}
