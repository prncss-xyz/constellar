/* eslint-disable @typescript-eslint/no-explicit-any */
import { fromSendable, IMachine, Sendable } from '.'
import { id, Init, isFunction, Prettify, toInit, Typed } from '../utils'

type ExtractEvent<Transition> = Transition extends (
	e: infer E,
	...args: any[]
) => any
	? E
	: void

type UnionValues<T> = T extends Record<string, unknown> ? T[keyof T] : never

type ExtractEventObject<Transitions extends Record<string, unknown>> = {
	[K in keyof Transitions]: { type: K } & ExtractEvent<Transitions[K]>
}

type ExtractEvents<Transitions extends Record<PropertyKey, unknown>> =
	UnionValues<ExtractEventObject<Transitions>>

type Transition<State, Transformed> =
	| State
	| ((e: any, s: Transformed) => State | undefined)

type Transitions<State, Transformed> = Record<
	any,
	Transition<State, Transformed>
>

export function fixstateMachine<
	State,
	T extends Transitions<State, Transformed>,
	Transformed = State,
	InitialArg = void,
	Final = never,
>({
	init,
	events,
	transform,
	getFinal,
}: {
	init: Init<State, InitialArg>
	events: T
	transform?: (s: State) => Transformed
	getFinal?: (s: Transformed) => Final | undefined
}) {
	return (
		initialArg: InitialArg,
	): IMachine<
		Sendable<Prettify<ExtractEvents<T>> & Typed>,
		State,
		Transformed,
		Transformed,
		Final
	> => {
		return {
			init: toInit(init)(initialArg),
			visit: (acc, fold, state, ...args) => fold(state, acc, '', ...args),
			reducer: (event, transformed) => {
				const e = fromSendable(event as any)
				if (getFinal?.(transformed) !== undefined) return undefined
				// we want to pass through unknown events
				let res = events[e?.type] as any
				if (isFunction(res)) res = res(e, transformed)
				if (!res) return undefined
				return res
			},
			transform: transform ?? (id as (s: State) => Transformed),
			getFinal: getFinal ?? (() => undefined),
		}
	}
}
