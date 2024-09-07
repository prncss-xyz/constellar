import {
	EffectState,
	IMachine,
	Interpreter,
	ManchineEffects,
	Sendable,
} from '@constellar/machines'
import { isFunction, memo1, Typed, Updater } from '@constellar/utils'
import { atom, useAtom, WritableAtom } from 'jotai'
import { useEffect, useRef } from 'react'

import { unwrap } from './utils'

type Spiced<Event extends Typed, Transformed, Final> = {
	getFinal: () => Final | undefined
	getState: (event: Sendable<Event>) => Transformed
	isDisabled: (event: Sendable<Event>) => boolean
} & Transformed

export function machineAtom<
	Event extends Typed,
	State,
	Final extends Transformed,
	Transformed,
	R,
>(
	machine: IMachine<Sendable<Event>, State, Transformed, Final>,
	atomFactory: (
		init: State,
	) => WritableAtom<Promise<State>, [Promise<State>], R>,
): WritableAtom<
	Promise<Spiced<Event, Transformed, Final>>,
	[Sendable<Event>],
	R
>
export function machineAtom<
	Event extends Typed,
	State,
	Transformed,
	Final extends Transformed,
	R,
>(
	machine: IMachine<Sendable<Event>, State, Transformed, Final>,
	atomFactory?: (init: State) => WritableAtom<State, [State], R>,
): WritableAtom<Spiced<Event, Transformed, Final>, [Sendable<Event>], R>
export function machineAtom<
	Event extends Typed,
	State,
	Transformed,
	Final extends Transformed,
	R,
>(
	machine: IMachine<Sendable<Event>, State, Transformed, Final>,
	atomFactory?: (init: State) => WritableAtom<State, [State], R>,
) {
	const stateAtom = (
		atomFactory ? atomFactory(machine.init) : atom(machine.init)
	) as WritableAtom<State, [State], R>
	const transform = memo1(machine.transform)
	return atom(
		(get) =>
			unwrap(
				get(stateAtom),
				(state) =>
					({
						...transform(state),
						getFinal: () => machine.getFinal(transform(state)),
						isDisabled: (event: Sendable<Event>) =>
							machine.reducer(event, transform(state)) === undefined,
						getState: (event: Sendable<Event>) => {
							const nextState = machine.reducer(event, transform(state))
							if (nextState === undefined) return transform(state)
							return machine.transform(nextState)
						},
					}) satisfies Spiced<Event, Transformed, Final>,
			),
		(get, set, event: Sendable<Event>) =>
			unwrap(get(stateAtom), (state) => {
				const nextState = machine.reducer(event, transform(state))
				if (nextState === undefined) return
				set(stateAtom, nextState)
			}),
	)
}

export function useMachineEffects<Event, State extends EffectState>(
	machineAtom:
		| WritableAtom<State, [Event], void>
		| WritableAtom<Promise<State>, [Promise<State>], void>,
	interpreter: Interpreter<Event, State>,
) {
	const [state, send] = useAtom(machineAtom)
	const machineEffects = useRef(new ManchineEffects<Event, State>())
	useEffect(() => () => machineEffects.current.flush(), [])
	useEffect(
		() => machineEffects.current.update(state, send, interpreter),
		[state, send, interpreter],
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
	put: (value: Value) => Event,
): WritableAtom<Promise<Value>, [Updater<Value, never>], Promise<R>>
export function valueEventAtom<State, Event, Value, R>(
	machineAtom: WritableAtom<State, [Event], R>,
	select: (state: State) => Value,
	put: (value: Value) => Event,
): WritableAtom<Value, [Updater<Value, never>], R>
export function valueEventAtom<State, Event, Value, R>(
	machineAtom: WritableAtom<State, [Event], R>,
	select: (state: State) => Value,
	put: (value: Value) => Event,
) {
	function update(arg: Updater<Value, never>, state: State) {
		if (isFunction(arg)) return arg(select(state))
		return arg
	}
	return atom(
		(get) => unwrap(get(machineAtom), select),
		(get, set, arg: Updater<Value, never>) =>
			unwrap(get(machineAtom), (state) =>
				set(machineAtom, put(update(arg, state))),
			),
	)
}
