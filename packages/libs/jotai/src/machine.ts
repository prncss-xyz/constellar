import { AnyState, Interpreter, ManchineEffects } from '@constellar/machines'
import { fromInit, id, Monoid } from '@constellar/utils'
import { atom, useAtom, WritableAtom } from 'jotai'
import { useEffect, useRef } from 'react'

import { NonFunction, unwrap } from './utils'

// see also https://jotai.org/docs/utilities/reducer
export function atomWithReducer<Event, State>(
	monoid: Monoid<Event, State>,
	opts: {
		atomFactory: (
			init: State,
		) => WritableAtom<Promise<State>, [Promise<State>], void>
	},
): WritableAtom<Promise<State>, [event: Event], void>
export function atomWithReducer<Event, State>(
	monoid: Monoid<Event, State>,
	opts?: {
		atomFactory?: (
			init: State,
		) => WritableAtom<State, [NonFunction<State>], void>
	},
): WritableAtom<State, [event: Event], void>
export function atomWithReducer<Event, State>(
	monoid: Monoid<Event, State>,
	opts?: {
		atomFactory?: (
			init: State,
		) => WritableAtom<State, [NonFunction<State>], void>
	},
) {
	const { init, fold } = monoid
	const atomFactory = opts?.atomFactory ?? ((init: State) => atom(init))
	const state0 = fromInit(init)
	const stateAtom = atomFactory(state0)
	return atom(
		(get) => unwrap(get(stateAtom), id),
		(get, set, event: Event) =>
			unwrap(get(stateAtom), (state) =>
				set(stateAtom, fold(event, state) as NonFunction<State>),
			),
	)
}

export function useMachineInterperter<State extends AnyState, Event>(
	machineAtom:
		| WritableAtom<State, [event: Event], void>
		| WritableAtom<Promise<State>, [Promise<State>], void>,
	interpreter: Interpreter<State, Event>,
) {
	const [state, send] = useAtom(machineAtom)
	const machineEffects = useRef(new ManchineEffects<State, Event>())
	useEffect(() => () => machineEffects.current.flush(), [])
	useEffect(
		() => machineEffects.current.update(state, send, interpreter),
		[state, send, interpreter],
	)
}
