import { noop, Typed } from '../utils'
import { IMachine, MessageCtx } from './core'

export type Spiced<Event, Transformed, SubState, Final> = {
	final: Final | undefined
	isDisabled: (event: Event) => boolean
	next: (event: Event) => Transformed
	visit: <Acc>(
		fold: (subState: SubState, acc: Acc, index: string) => Acc,
		acc: Acc,
	) => Acc
} & Transformed

export function machineCb<
	Event,
	State,
	Message extends Typed,
	Transformed,
	SubState,
	Final,
>(
	machine: IMachine<
		Event,
		State,
		MessageCtx<Message>,
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
			isDisabled: (event: Event) => {
				let touched = false
				const res = machine.reducer(event, transformed, () => {
					touched = true
				})
				return !touched && res === undefined
			},
			next: (event: Event) => {
				const nextState = machine.reducer(event, transformed, noop)
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
