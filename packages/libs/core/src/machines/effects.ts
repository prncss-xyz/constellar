import { shallowEqual } from '../utils'

/* eslint-disable @typescript-eslint/no-explicit-any */

export type Interpreter_<Event, SubState> = SubState extends {
	effects?: infer Effects
}
	? {
			[Key in keyof Required<Effects>]: (
				effect: Exclude<Effects[Key], undefined>,
				send: (event: Event) => void,
			) => (() => void) | void
		}
	: undefined

export type Interpreter<Event, SubState> = SubState extends {
	effects?: infer Effects
}
	? {
			[Key in keyof Required<Effects>]: (
				effect: Exclude<Effects[Key], undefined>,
				send: (event: Event) => void,
			) => (() => void) | void
		}
	: undefined

export class MachineEffects<Event, SubState> {
	private last = new Map<
		string,
		Map<string, { args: any; unmount: (() => void) | void }>
	>()
	constructor(private interpreter: Interpreter<Event, SubState>) {}
	private foldSubState(send: (event: Event) => void) {
		return (subState: SubState, acc: Set<string>, index: string) => {
			if (this.interpreter === undefined) return acc
			acc.add(index)
			for (const entry of Object.entries(this.interpreter)) {
				const [effect, cb] = entry as [string, any]
				const args = ((subState as any).effects as any)?.[effect]
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
					unmount: args === undefined ? undefined : cb(args, send),
				})
			}
			return acc
		}
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
			f: (subState: SubState, acc: Set<string>, index: string) => Set<string>,
			acc: Set<string>,
		) => Set<string>,
		send: (event: Event) => void,
	) {
		this.flush(visit(this.foldSubState(send), new Set<string>()))
	}
}
