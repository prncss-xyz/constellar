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

type Spiced<Event extends Typed, Transformed, SubState, Final> = {
	final: Final | undefined
	isDisabled: (event: Sendable<Event>) => boolean
	next: (event: Sendable<Event>) => Transformed
	visit: <Acc>(
		fold: (subState: SubState, acc: Acc, index: string) => Acc,
		acc: Acc,
	) => Acc
} & Transformed

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
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	Transformed extends Spiced<Event, unknown, any, unknown>,
>(
	transformed: Transformed,
	send: (event: Sendable<Event>) => void,
	effects: EffectsHandlers<Event, Transformed>,
) {
	const machineEffects = useRef<MachineEffects<Event, Transformed>>()
	useEffect(() => {
		machineEffects.current = new MachineEffects<Event, Transformed>(effects)
		return () => machineEffects.current!.flush()
	}, [effects, send])
	useEffect(
		() => machineEffects.current!.update(transformed.visit, send),
		[transformed, send, effects],
	)
}

// utilities

export function valueEvent<Event, State, Value>(
	select: (state: State) => Value,
	put: (value: Value, send: (event: Event) => void) => () => void,
	[state, send]: [State, (event: Event) => void],
) {
	function update(arg: Updater<Value, never>, state: State): Value {
		if (isFunction(arg)) return arg(select(state))
		return arg
	}
	return [
		select(state),
		(value: Value) => put(update(value, state), send),
	] as const
}
