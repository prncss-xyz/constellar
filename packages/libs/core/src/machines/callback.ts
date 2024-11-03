import { IMachine } from './core'
import { isDisabled, nextState } from './utils'

export type Spiced<Event, Transformed, SubState, Final> = {
	final: Final | undefined
	isDisabled: (event: Event) => boolean
	next: (event: Event) => Transformed
	visit: <Acc>(
		fold: (subState: SubState, acc: Acc, index: string) => Acc,
		acc: Acc,
	) => Acc
} & Transformed

export function machineCb<Event, State, Message, Transformed, SubState, Final>(
	machine: IMachine<Event, State, Message, Transformed, SubState, Final>,
) {
	return function (state: State) {
		const transformed = machine.transform(state)
		return {
			...transformed,
			final: machine.getFinal(transformed),
			isDisabled: (event: Event) => {
				return isDisabled(machine, transformed, event)
			},
			next: (event: Event) => {
				return nextState(machine, transformed, event)
			},
			visit: <Acc>(
				fold: (subState: SubState, acc: Acc, index: string) => Acc,
				acc: Acc,
			) => machine.visit(acc, fold, transformed),
		} satisfies Spiced<Event, Transformed, SubState, Final>
	}
}
