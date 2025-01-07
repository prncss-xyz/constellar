import {
	EffectsHandlers,
	IMachine,
	isFunction,
	Listener,
	MachineEffects,
	MessageCtx,
	Sendable,
	toListener,
	Typed,
	Updater,
} from '@constellar/core'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export function useMachine<
	Event extends Typed,
	State,
	Message extends Typed,
	Transformed,
	SubState,
	Final,
>(
	machine: IMachine<
		Sendable<Event>,
		State,
		MessageCtx<Message>,
		Transformed,
		SubState,
		Final
	>,
	onMessage?: Listener<Message>,
) {
	const [state, setState] = useState(machine.init)
	const transformed = useMemo(() => machine.transform(state), [machine, state])
	const emit = useMemo(
		() => (onMessage ? toListener(onMessage) : () => {}),
		[onMessage],
	)
	const send = useCallback(
		(event: Sendable<Event>) => {
			const nextState = machine.reducer(event, transformed, emit)
			if (nextState === undefined) return
			setState(nextState)
		},
		[machine, transformed, emit],
	)
	return [transformed, send] as const
}

export function useMachineEffects<
	Event extends Typed,
	SubState extends Typed,
	Transformed,
>(
	machine: {
		visit: <Acc>(
			acc: Acc,
			fold: (subState: SubState, acc: Acc, index: string) => Acc,
			transformed: Transformed,
		) => Acc
	},
	transformed: Transformed,
	send: (event: Sendable<Event>) => void,
	effects: EffectsHandlers<Event, SubState>,
) {
	const machineEffects = useRef<MachineEffects<Event, SubState>>()
	useEffect(() => {
		machineEffects.current = new MachineEffects<Event, SubState>(effects)
		return () => machineEffects.current!.flush()
	}, [effects, send])

	const visit = useCallback(
		<Acc>(
			fold: (subState: SubState, acc: Acc, index: string) => Acc,
			acc: Acc,
		) => machine.visit(acc, fold, transformed),
		[machine, transformed],
	)

	useEffect(
		() => machineEffects.current!.update(visit, send),
		[transformed, send, effects, visit],
	)
}

// utilities

export function valueEvent<Event, State, Value>(
	select: (state: State) => Value,
	put: (value: Value, send: (event: Event) => void) => void,
	[state, send]: [State, (event: Event) => void],
) {
	function update(arg: Updater<Value, never>, state: State): Value {
		if (isFunction(arg)) return arg(select(state))
		return arg
	}
	return [
		select(state),
		(value: Updater<Value, never>) => put(update(value, state), send),
	] as const
}
