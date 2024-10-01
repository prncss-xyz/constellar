import { Typed } from '../utils'
import { IMachine, Sendable } from './core'

export type Spiced<Event extends Typed, Transformed, SubState, Final> = {
	final: Final | undefined
	isDisabled: (event: Sendable<Event>) => boolean
	next: (event: Sendable<Event>) => Transformed
	visit: <Acc>(
		fold: (subState: SubState, acc: Acc, index: string) => Acc,
		acc: Acc,
	) => Acc
} & Transformed

export function machineCb<
	Event extends Typed,
	State,
	Message,
	Transformed,
	SubState,
	Final,
>(
	machine: IMachine<
		Sendable<Event>,
		State,
		Message,
		Transformed,
		SubState,
		Final
	>,
) {
	return function (state: State) {
		const transformed = machine.transform(state)
		return {
			...transformed,
			final: machine.getFinal(transformed),
			isDisabled: (event: Sendable<Event>) => {
				let touched = false
				return (
					machine.reducer(event, transformed, () => (touched = true)) ===
						undefined && !touched
				)
			},
			next: (event: Sendable<Event>, send: (e: Message) => void = () => {}) => {
				const nextState = machine.reducer(event, transformed, send)
				if (nextState === undefined) return transformed
				return machine.transform(nextState)
			},
			visit: <Acc>(
				fold: (subState: SubState, acc: Acc, index: string) => Acc,
				acc: Acc,
			) => machine.visit(acc, fold, transformed),
		} satisfies Spiced<Event, Transformed, SubState, Final>
	}
}
