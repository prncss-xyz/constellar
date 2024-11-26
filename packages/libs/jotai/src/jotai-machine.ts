import { IMachine, noop } from '@constellar/core'
import { Getter, WritableAtom } from 'jotai'

export type Setter = <Value, Args extends unknown[], Result>(
	atom: WritableAtom<Value, Args, Result>,
	...args: Args
) => void

type Ctx = [Getter, Setter]

export type JotaiMachine<Event, State, Transformed, SubState, Final> = IMachine<
	Event,
	State,
	Ctx,
	Transformed,
	SubState,
	Final
>

export type Spiced<Event, Transformed, SubState, Final> = {
	final: Final | undefined
	isDisabled: (event: Event, get: Getter) => boolean
	next: (event: Event, get: Getter) => Transformed
	visit: <Acc>(
		fold: (subState: SubState, acc: Acc, index: string) => Acc,
		acc: Acc,
	) => Acc
} & Transformed

export function machineCb<Event, State, Transformed, SubState, Final>(
	machine: JotaiMachine<Event, State, Transformed, SubState, Final>,
) {
	return function (state: State) {
		const transformed = machine.transform(state)
		return {
			...transformed,
			final: machine.getFinal(transformed),
			isDisabled: (event: Event, get: Getter) => {
				let touched = false
				const res = machine.reducer(event, transformed, get, () => {
					touched = true
				})
				return !touched && res === undefined
			},
			next: (event: Event, get: Getter) => {
				const nextState = machine.reducer(event, transformed, get, noop)
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
