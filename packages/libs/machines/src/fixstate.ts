/* eslint-disable @typescript-eslint/no-explicit-any */
import { id, Init, isFunction, Prettify, toInit } from '@constellar/utils'

import { IMachine } from '..'

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

type Transition<State, Derived> =
	| State
	| ((e: any, s: Derived) => State | undefined)

type Transitions<State, Derived> = Record<any, Transition<State, Derived>>

export function fixstateMachine<
	State,
	T extends Transitions<State, Derived>,
	Derived = State,
	InitialArg = void,
>({
	init,
	events,
	transform,
	isFinal,
}: {
	init: Init<State, InitialArg>
	events: T
	transform?: (s: State) => Derived
	isFinal?: (s: Derived) => boolean
}): IMachine<Prettify<ExtractEvents<T>>, Derived, InitialArg> {
	const init0 = toInit(init)
	transform = transform ?? (id as (s: State) => Derived)
	return {
		init: (initialArg) => transform(init0(initialArg)),
		reducer: (event, derived) => {
			if (isFinal?.(derived)) return undefined
			// we want to pass through unknown events
			let res = events[event?.type] as any
			if (isFunction(res)) res = res(event, derived)
			if (!res) return undefined
			return transform(res)
		},
		isFinal: isFinal ? (derived) => isFinal?.(derived) : () => false,
	}
}
