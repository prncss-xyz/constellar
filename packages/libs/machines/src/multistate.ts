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
					derive:
						| DerivedLocal
						| (<S extends State & { type: StateType }>(
								state: S,
						  ) => DerivedLocal)
				}
			})
	derive?: Derived | ((s: State & DerivedLocal) => Derived)
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
	function derivator(s: State) {
		// we take derive from the next state
		const localDerive = (states as any)[s.type].derive
		const d1 = localDerive ? join(s, localDerive) : (s as State & DerivedLocal)
		const d2 = derive
			? join(d1, derive)
			: (d1 as State & DerivedLocal & Derived)
		return d2
	}
	return {
		init: (initialArg: InitialArg) => {
			const s = fromSendable(init0(initialArg))
			return derivator(s)
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
			return derivator(res)
		},
		isFinal: (s) => Object.keys((states as any)[s.type]).length === 0,
	}
}

function join<A, B>(a: A, b: B | ((a: A) => B)): A & B {
	const x = isFunction(b) ? b(a) : b
	return { ...a, ...x }
}
