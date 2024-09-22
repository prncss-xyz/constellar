import { Typed } from '../utils'
import { IMachine, Sendable } from './core'

export type Spiced<Event extends Typed, Transformed, Substate, Final> = {
	final: Final | undefined
	next: (event: Sendable<Event>) => Transformed
	isDisabled: (event: Sendable<Event>) => boolean
	visit: <Acc>(
		fold: (substate: Substate, acc: Acc, index: string) => Acc,
		acc: Acc,
	) => Acc
} & Transformed

export function machineCb<
	Event extends Typed,
	State,
	Transformed,
	Substate,
	Final,
>(machine: IMachine<Sendable<Event>, State, Transformed, Substate, Final>) {
	return function (state: State) {
		const transformed = machine.transform(state)
		return {
			...transformed,
			final: machine.getFinal(transformed),
			next: (event: Sendable<Event>) => {
				const nextState = machine.reducer(event, transformed)
				if (nextState === undefined) return transformed
				return machine.transform(nextState)
			},
			isDisabled: (event: Sendable<Event>) =>
				machine.reducer(event, transformed) === undefined,
			visit: <Acc>(
				fold: (substate: Substate, acc: Acc, index: string) => Acc,
				acc: Acc,
			) => machine.visit(acc, fold, transformed),
		} satisfies Spiced<Event, Transformed, Substate, Final>
	}
}
