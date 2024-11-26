import {
	isFunction,
	multiStateBaseMachine,
	simpleStateBaseMachine,
	Typed,
	Updater,
} from '@constellar/core'
import { Atom, atom, Getter, WritableAtom } from 'jotai'

import { JotaiMachine, machineCb, Setter, Spiced } from './jotai-machine'
import { unwrap } from './utils'

export function simpleStateJotaiMachine() {
	return simpleStateBaseMachine<[Getter, Setter]>()
}

export function multiStateJotaiMachine<
	Event extends Typed,
	State extends Typed,
	DerivedLocal = object,
	Derived = object,
>() {
	return multiStateBaseMachine<
		Event,
		State,
		DerivedLocal,
		Derived,
		[Getter, Setter]
	>()
}

function voidReturn<Args extends unknown[], Res>(cb: (...args: Args) => Res) {
	return (...args: Args) => {
		cb(...args)
	}
}

export function machineAtom<Event, State, Transformed, SubState, Final, R>(
	machine: JotaiMachine<Event, State, Transformed, SubState, Final>,
	atomFactory: (
		init: State,
	) => WritableAtom<Promise<State>, [Promise<State>], R>,
): WritableAtom<
	Promise<Spiced<Event, Transformed, SubState, Final>>,
	[Event],
	R
>
export function machineAtom<
	Event,
	State,
	Transformed,
	SubState,
	Final,
	R = void,
>(
	machine: JotaiMachine<Event, State, Transformed, SubState, Final>,
	atomFactory?: (init: State) => WritableAtom<State, [State], R>,
): WritableAtom<Spiced<Event, Transformed, SubState, Final>, [Event], R>
export function machineAtom<Event, State, Transformed, SubState, Final, R>(
	machine: JotaiMachine<Event, State, Transformed, SubState, Final>,
	atomFactory?: (init: State) => WritableAtom<State, [State], R>,
) {
	const stateAtom = (
		atomFactory ? atomFactory(machine.init()) : atom(machine.init())
	) as WritableAtom<State, [State], R>
	const reducer = machine.reducer
	const toSpiced = machineCb(machine)
	return atom(
		(get) => unwrap(get(stateAtom), (state) => toSpiced(state)),
		(get, set, event: Event) =>
			unwrap(get(stateAtom), (state) => {
				const nextState = reducer(
					event,
					machine.transform(state),
					get,
					voidReturn(set),
				)
				if (nextState === undefined) return
				set(stateAtom, nextState)
			}),
	)
}

// utilities

type IsDisabled<Event> = { isDisabled: (event: Event, get: Getter) => boolean }

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
		(get) => unwrap(get(machineAtom), (state) => state.isDisabled(event, get)),
		(_, set) => set(machineAtom, event),
	)
}

type NextState<Event, State> = { next: (event: Event, get: Getter) => State }

export function nextStateAtom<State, Event>(
	machineAtom: Atom<NextState<Event, Promise<State>>>,
	event: Event,
): Atom<Promise<State>>
export function nextStateAtom<State, Event>(
	machineAtom: Atom<NextState<Event, State>>,
	event: Event,
): Atom<State>
export function nextStateAtom<State, Event>(
	machineAtom: Atom<NextState<Event, State>>,
	event: Event,
) {
	return atom((get) =>
		unwrap(get(machineAtom), (machine) => machine.next(event, get)),
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
