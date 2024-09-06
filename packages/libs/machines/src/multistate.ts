/* eslint-disable @typescript-eslint/no-explicit-any */
import { Init, isEmpty, isFunction, toInit, Typed } from '@constellar/utils'

import { fromSendable, IMachine, Sendable } from '.'

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
			always?:
				| Sendable<State>
				| (<S extends State & { type: StateType } & DerivedLocal & Derived>(
						state: S,
				  ) => Sendable<State> | undefined)
			events?: Partial<{
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
			wildcard?:
				| Sendable<State>
				| (<
						E extends Event & { type: Event },
						S extends State & { type: StateType } & DerivedLocal & Derived,
				  >(
						event: E,
						state: S,
				  ) => Sendable<State> | undefined)
		}
		// TODO: DeriveLocal can be omitted if always is alawys defined
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
}: IMultistateMachine<Event, State, InitialArg, DerivedLocal, Derived>) {
	const init0 = toInit(init)
	function fromAlways(s: State) {
		while (true) {
			let s_ = (states as any)[s.type].always
			if (isFunction(s_)) s_ = s_(s)
			if (s_ === undefined) break
			s = s_
		}
		return s
	}
	return function (
		initialArg: InitialArg,
	): IMachine<Sendable<Event>, State, State & DerivedLocal & Derived> {
		return {
			init: fromAlways(fromSendable(init0(initialArg))),
			visit: (acc, fold, state) => fold(state, acc, state.type),
			reducer: (event: Sendable<Event>, s: State & DerivedLocal & Derived) => {
				const e = fromSendable(event)
				const state = (states as any)[s.type]
				let res = state?.events?.[e.type]
				if (isFunction(res)) res = res(e, s)
				if (res === undefined) {
					res = state?.wildcard
					if (isFunction(res)) res = res(e, s)
					if (res === undefined) return undefined
				}
				return fromAlways(fromSendable(res))
			},
			transform: (s: State) => {
				const localDerive = (states as any)[s.type].derive
				const d1 = localDerive
					? join(s, localDerive)
					: (s as State & DerivedLocal)
				const d2 = derive
					? join(d1, derive)
					: (d1 as State & DerivedLocal & Derived)
				return d2
			},
			isFinal: (s) => {
				const state = (states as any)[s.type]
				if (state.always) return false
				if (state.wildcard) return false
				if (!isEmpty(state.events)) return false
				return true
			},
		}
	}
}

function join<A, B>(a: A, b: B | ((a: A) => B)): A & B {
	const x = isFunction(b) ? b(a) : b
	return { ...a, ...x }
}
