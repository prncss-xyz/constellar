/* eslint-disable @typescript-eslint/no-explicit-any */
import { fromSendable, IMachine, MessageCtx, Sendable } from '.'
import { Init, isEmpty, isFunction, Prettify, toInit, Typed } from '../utils'

type ArgOfInit<T> = T extends (p: infer R) => any ? R : void

type AnyStates<
	Event extends Typed,
	State extends Typed,
	Ctx extends unknown[],
	DerivedLocal,
	Derived,
> = {
	[StateType in State['type']]: {
		always?:
			| (<S extends { type: StateType } & Derived & DerivedLocal & State>(
					state: S,
			  ) => Sendable<State> | undefined)
			| Sendable<State>
		events?: Partial<{
			[EventType in Event['type']]:
				| (<
						E extends { type: EventType } & Event,
						S extends { type: StateType } & Derived & DerivedLocal & State,
				  >(
						event: E,
						state: S,
						...args: Ctx
				  ) => Sendable<State> | undefined | void)
				| Sendable<State>
		}>
		wildcard?:
			| (<
					E extends { type: Event } & Event,
					S extends { type: StateType } & Derived & DerivedLocal & State,
			  >(
					event: E,
					state: S,
					...args: Ctx
			  ) => Sendable<State> | undefined | void)
			| Sendable<State>
	}
} & (DerivedLocal extends { [K in keyof DerivedLocal]: never }
	? { [StateType in State['type']]: object }
	: {
			[StateType in State['type']]: {
				derive:
					| ((state: Prettify<{ type: StateType } & State>) => DerivedLocal)
					| DerivedLocal
			}
		})

type AnyMachine<
	Event extends Typed,
	State extends Typed,
	Ctx extends unknown[] = [],
	DerivedLocal = object,
	Derived = object,
> = {
	derive?: ((s: Prettify<DerivedLocal & State>) => Derived) | Derived
	init: Init<Sendable<State>, any>
	states: AnyStates<Event, State, Ctx, DerivedLocal, Derived>
}

export type IsFinal<
	Type extends string,
	States extends Record<Type, unknown>,
> = States[Type] extends {
	always: unknown
}
	? never
	: States[Type] extends { wildcard: unknown }
		? never
		: States[Type] extends { events: unknown }
			? keyof States[Type]['events'] extends never
				? { type: Type }
				: never
			: { type: Type }

type FinalStatesByKey<States extends Record<string, unknown>> = {
	[Type in keyof States & string]: IsFinal<Type, States>
}
type FinalStates<States extends Record<string, unknown>> =
	FinalStatesByKey<States>[keyof States & string]

type Final<
	State extends Typed,
	States extends Record<string, unknown>,
> = FinalStates<States> & State

export function multiStateMachine<
	Event extends Typed,
	State extends Typed,
	DerivedLocal = object,
	Derived = object,
	Message extends Typed = { type: never },
>() {
	return multiStateBaseMachine<
		Event,
		State,
		DerivedLocal,
		Derived,
		MessageCtx<Message>
	>()
}

export function multiStateBaseMachine<
	Event extends Typed,
	State extends Typed,
	DerivedLocal,
	Derived,
	Ctx extends unknown[],
>() {
	return function <
		Machine extends AnyMachine<Event, State, Ctx, DerivedLocal, Derived>,
	>({ derive, init, states }: Machine) {
		const init0 = toInit(init)
		function fromAlways(s: State) {
			while (true) {
				let s_ = (states as any)[s.type].always
				if (s_ === undefined) break
				if (isFunction(s_)) s_ = s_(s)
				if (s_ === undefined) break
				s = s_
			}
			return s
		}
		type Transformed = Derived & DerivedLocal & State
		return function (
			initialArg: ArgOfInit<Machine['init']>,
		): IMachine<
			Sendable<Event>,
			State,
			Ctx,
			Transformed,
			Transformed,
			Prettify<Final<State, Machine['states']>>
		> {
			return {
				getFinal: (s) => {
					const state = (states as any)[s.type]
					if (state.always) return undefined
					if (state.wildcard) return undefined
					if (!isEmpty(state.events)) return undefined
					return s as any
				},
				init: () => fromAlways(fromSendable(init0(initialArg))),
				reducer: (event, s, ...args) => {
					const e = fromSendable(event)
					const state = (states as any)[s.type]
					let res = state?.events?.[e.type]
					if (isFunction(res)) res = res(e, s, ...args)
					else if (res === undefined) {
						res = state?.wildcard
						if (isFunction(res)) res = res(e, s, ...args)
					}
					if (res === undefined) return undefined
					return fromAlways(fromSendable(res))
				},
				transform: (s, ...args) => {
					const localDerive = (states as any)[s.type].derive
					const d1 = localDerive
						? join(s, localDerive, ...args)
						: (s as DerivedLocal & State)
					const d2 = derive
						? join(d1, derive, ...args)
						: (d1 as Derived & DerivedLocal & State)
					return d2
				},
				visit: (acc, fold, state, ...args) =>
					fold(state, acc, state.type, ...args),
			}
		}
	}
}

function join<A, B, Ctx extends unknown[]>(
	a: A,
	b: ((a: A, ...args: Ctx) => B) | B,
	...args: Ctx
): A & B {
	const x = isFunction(b) ? b(a, ...args) : b
	return { ...a, ...x }
}
