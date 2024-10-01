import {
	IMachine,
	Interpreter,
	isFunction,
	machineCb,
	MachineEffects,
	Sendable,
	Spiced,
	Typed,
	Updater,
} from '@constellar/core'
import { atom, Getter, Setter, WritableAtom } from 'jotai'
import { useEffect, useRef } from 'react'

import { unwrap } from './utils'

export function machineAtom<
	Event extends Typed,
	State,
	Message,
	Transformed,
	SubState,
	Final,
	R,
>(
	machine: IMachine<
		Sendable<Event>,
		State,
		Message,
		Transformed,
		SubState,
		Final
	>,
	opts: {
		atomFactory: (
			init: State,
		) => WritableAtom<Promise<State>, [Promise<State>], R>
		listener?: (event: Message, get: Getter, set: Setter) => void
	},
): WritableAtom<
	Promise<Spiced<Event, Transformed, SubState, Final>>,
	[Sendable<Event>],
	R
>
export function machineAtom<
	Event extends Typed,
	State,
	Message,
	Transformed,
	SubState,
	Final,
	R = void,
>(
	machine: IMachine<
		Sendable<Event>,
		State,
		Message,
		Transformed,
		SubState,
		Final
	>,
	opts?: {
		atomFactory?: (init: State) => WritableAtom<State, [State], R>
		listener?: (event: Message, get: Getter, set: Setter) => void
	},
): WritableAtom<
	Spiced<Event, Transformed, SubState, Final>,
	[Sendable<Event>],
	R
>
export function machineAtom<
	Event extends Typed,
	State,
	Message,
	Transformed,
	SubState,
	Final,
	R,
>(
	machine: IMachine<
		Sendable<Event>,
		State,
		Message,
		Transformed,
		SubState,
		Final
	>,
	opts?: {
		atomFactory?: (init: State) => WritableAtom<State, [State], R>
		listener?: (event: Message, get: Getter, set: Setter) => void
	},
) {
	const stateAtom = (
		opts?.atomFactory ? opts.atomFactory(machine.init) : atom(machine.init)
	) as WritableAtom<State, [State], R>
	const reducer = machine.reducer
	const cb = machineCb(machine)
	return atom(
		(get) => unwrap(get(stateAtom), cb),
		(get, set, event: Sendable<Event>) =>
			unwrap(get(stateAtom), (state) => {
				const nextState = reducer(
					event,
					machine.transform(state),
					opts?.listener
						? (e) => {
								opts.listener!(e, get, set)
							}
						: () => {},
				)
				if (nextState === undefined) return
				set(stateAtom, nextState)
			}),
	)
}

export function useMachineEffects<
	Event extends Typed,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	Transformed extends Spiced<Event, unknown, any, unknown>,
>(
	transformed: Transformed,
	send: (event: Sendable<Event>) => void,
	interpreter: Interpreter<Event, Transformed>,
) {
	const machineEffects = useRef<MachineEffects<Event, Transformed>>()
	useEffect(() => {
		machineEffects.current = new MachineEffects<Event, Transformed>(
			send,
			interpreter,
		)
		return () => machineEffects.current!.flush()
	}, [interpreter, send])
	useEffect(
		() => machineEffects.current!.update(transformed.visit),
		[transformed, send, interpreter],
	)
}

// utilities

type IsDisabled<Event> = { isDisabled: (event: Event) => boolean }

export function disabledEventAtom<Event, R>(
	machineAtom: WritableAtom<Promise<IsDisabled<Event>>, [Event], R>,
	event: Event,
): WritableAtom<Promise<boolean>, [], R>
export function disabledEventAtom<Event, R>(
	machineAtom: WritableAtom<IsDisabled<Event>, [Event], R>,
	event: Event,
): WritableAtom<boolean, [], R>
export function disabledEventAtom<Event, R>(
	machineAtom: WritableAtom<
		IsDisabled<Event> | Promise<IsDisabled<Event>>,
		[Event],
		R
	>,
	event: Event,
) {
	return atom(
		(get) => unwrap(get(machineAtom), (state) => state.isDisabled(event)),
		(_, set) => set(machineAtom, event),
	)
}

export function valueEventAtom<State, Event, Value, R>(
	machineAtom: WritableAtom<Promise<State>, [Event], R>,
	select: (state: State) => Value,
	put: (value: Value, send: (event: Event) => Promise<void>) => Promise<void>,
): WritableAtom<Promise<Value>, [Updater<Value, never>], Promise<void>>
export function valueEventAtom<State, Event, Value, R>(
	machineAtom: WritableAtom<State, [Event], R>,
	select: (state: State) => Value,
	put: (value: Value, send: (event: Event) => void) => void,
): WritableAtom<Value, [Updater<Value, never>], void>
export function valueEventAtom<State, Event, Value, R>(
	machineAtom: WritableAtom<State, [Event], R>,
	select: (state: State) => Value,
	put: (value: Value, send: (event: Event) => R) => R,
) {
	function update(arg: Updater<Value, never>, state: State): Value {
		if (isFunction(arg)) return arg(select(state))
		return arg
	}
	return atom(
		(get) => unwrap(get(machineAtom), select),
		(get, set, arg: Updater<Value, never>) =>
			unwrap(get(machineAtom), (state) =>
				put(update(arg, state), (event: Event) => set(machineAtom, event)),
			),
	)
}
