import { shallowEqual } from '../utils'

/* eslint-disable @typescript-eslint/no-explicit-any */

export type Interpreter_<Event, Substate> = Substate extends {
	effects?: infer Effects
}
	? {
			[Key in keyof Required<Effects>]: (
				effect: Exclude<Effects[Key], undefined>,
				send: (event: Event) => void,
			) => (() => void) | void
		}
	: undefined

export type Interpreter<Event, Substate> = Substate extends {
	effects?: infer Effects
}
	? {
			[Key in keyof Required<Effects>]: (
				effect: Exclude<Effects[Key], undefined>,
				send: (event: Event) => void,
			) => (() => void) | void
		}
	: undefined

export class MachineEffects<Event, Substate> {
	private last = new Map<
		string,
		Map<string, { args: any; unmount: (() => void) | void }>
	>()
	constructor(
		private send: (event: Event) => void,
		private interpreter: Interpreter<Event, Substate>,
	) {}
	private foldSubstate(substate: Substate, acc: Set<string>, index: string) {
		if (this.interpreter === undefined) return acc
		acc.add(index)
		for (const entry of Object.entries(this.interpreter)) {
			const [effect, cb] = entry as [string, any]
			const args = ((substate as any).effects as any)?.[effect]
			let fromIndex = this.last.get(index)
			if (!fromIndex) {
				fromIndex = new Map()
				this.last.set(index, fromIndex)
			}
			const last = fromIndex.get(effect)
			if (shallowEqual(last?.args, args)) continue
			last?.unmount?.()
			fromIndex.set(effect, {
				args,
				unmount: args === undefined ? undefined : cb(args, this.send),
			})
		}
		return acc
	}
	flush(indices?: Set<string>) {
		this.last.forEach((fromIndex, index) => {
			if (indices?.has(index)) return
			fromIndex.forEach(({ unmount }) => unmount?.())
			fromIndex.clear()
		})
	}
	update(
		visit: (
			f: (substate: Substate, acc: Set<string>, index: string) => Set<string>,
			acc: Set<string>,
		) => Set<string>,
	) {
		this.flush(visit(this.foldSubstate.bind(this), new Set<string>()))
	}
}
