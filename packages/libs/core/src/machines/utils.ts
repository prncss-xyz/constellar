import { Typed } from '../utils'
import { IMachine, MessageCtx } from './core'

export function isDisabled<
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
	transformed: Transformed,
	event: Event,
) {
	let touched = false
	const res = machine.reducer(event, transformed, () => {
		touched = true
	})
	return !touched && res === undefined
}

export function nextState<
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
	transformed: Transformed,
	event: Event,
) {
	const nextState = machine.reducer(event, transformed, () => {})
	if (nextState === undefined) return transformed
	return machine.transform(nextState)
}
