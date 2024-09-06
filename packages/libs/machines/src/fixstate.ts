/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	id,
	Init,
	isFunction,
	Prettify,
	toInit,
	Typed,
} from '@constellar/utils'

import { fromSendable, IMachine, Sendable } from '.'

type ExtractEvent<Transition> = Transition extends (
	e: infer E,
	...args: any[]
) => any
	? E
	: void

type UnionValues<T> = T extends Record<string, unknown> ? T[keyof T] : never

type ExtractEventObject<Transitions extends Record<PropertyKey, unknown>> = {
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
>({
	init,
	events,
	transform,
	isFinal,
}: {
	init: Init<State, InitialArg>
	events: T
	transform?: (s: State) => Transformed
	isFinal?: (s: Transformed) => boolean
}) {
	return (
		initialArg: InitialArg,
	): IMachine<
		Sendable<Prettify<ExtractEvents<T>> & Typed>,
		State,
		Transformed
	> => {
		return {
			init: toInit(init)(initialArg),
			visit: (acc, fold, state) => fold(state, acc, ''),
			reducer: (event, transformed) => {
				const e = fromSendable(event as any)
				if (isFinal?.(transformed)) return undefined
				// we want to pass through unknown events
				let res = events[e?.type] as any
				if (isFunction(res)) res = res(e, transformed)
				if (!res) return undefined
				return res
			},
			transform: transform ?? (id as (s: State) => Transformed),
			isFinal: isFinal ? (transformed) => isFinal?.(transformed) : () => false,
		}
	}
}
