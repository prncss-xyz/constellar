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
	| ((e: any, s: Transformed) => State | undefined)
	| State

type Transitions<State, Transformed> = Record<
	any,
	Transition<State, Transformed>
>

export function simpleStateMachine<
	State,
	T extends Transitions<State, Transformed>,
	Transformed = State,
	InitialArg = void,
	Final = never,
>(
	{
		events,
		init,
		transform,
	}: {
		events: T
		init: Init<State, InitialArg>
		transform?: (s: State) => Transformed
	},
	getFinal?: (s: Transformed) => Final | undefined,
) {
	return (
		initialArg: InitialArg,
	): IMachine<
		Sendable<Prettify<ExtractEvents<T>> & Typed>,
		State,
		void,
		Transformed,
		Transformed,
		Final
	> => {
		return {
			getFinal: getFinal ?? (() => undefined),
			init: toInit(init)(initialArg),
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
			visit: (acc, fold, state, ...args) => fold(state, acc, '', ...args),
		}
	}
}
