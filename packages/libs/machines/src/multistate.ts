/* eslint-disable @typescript-eslint/no-explicit-any */
import { Init, isFunction, toInit, Typed } from '@constellar/utils'

import { fromSendable, IMachine, Sendable } from '..'

// TODO: derive: optional

type IMultistateMachine<
	Event extends Typed,
	State extends Typed,
	InitialArg,
	DerivedLocal,
	Derived,
> = {
	init: Init<Sendable<State>, InitialArg>
	states: {
		[StateType in State['type']]: {
			events: Partial<{
				[EventType in Event['type']]:
					| Sendable<State>
					| (<
							E extends Event & { type: EventType },
							S extends State & { type: StateType } & DerivedLocal & Derived,
					  >(
							event: E,
							state: S,
					  ) => Sendable<State> | undefined)
			}>
		}
	} & (DerivedLocal extends { [K in keyof DerivedLocal]: never }
		? { [StateType in State['type']]: object }
		: {
				[StateType in State['type']]: {
					derive: <S extends State & { type: StateType }>(
						state: S,
					) => S & DerivedLocal
				}
			})
	derive?: (s: State & DerivedLocal) => State & DerivedLocal & Derived
}

export function multistateMachine<
	Event extends Typed,
	State extends Typed,
	InitialArg = void,
	DerivedLocal = object,
	Derived = object,
>({
	init,
	states,
	derive,
}: IMultistateMachine<
	Event,
	State,
	InitialArg,
	DerivedLocal,
	Derived
>): IMachine<Event, State & DerivedLocal, InitialArg> {
	const init0 = toInit(init)
	return {
		init: (initialArg: InitialArg) => {
			const s = fromSendable(init0(initialArg))
			const derive = (states as any)[s.type].derive
			return derive ? derive(s) : s
		},
		reducer: (
			event: Event,
			s: State & DerivedLocal,
		): (State & DerivedLocal) | undefined => {
			const state = (states as any)[s.type]
			let res = state?.events[event.type]
			if (isFunction(res)) res = res(event, s)
			if (res === undefined) return undefined
			res = fromSendable(res)
			const localDerive = (states as any)[res.type].derive
			// we take derive from the next state
			if (localDerive) res = localDerive(res)
			if (derive) res = derive(res)
			return res
		},
		isFinal: (s) => Object.keys((states as any)[s.type]).length === 0,
	}
}
