/* eslint-disable @typescript-eslint/no-explicit-any */
import { id, Init, Prettify, toInit } from '@constellar/utils'

import { IMachine } from '..'

type ExtractEvent<Transition> = Transition extends (
	e: infer E,
	...args: any[]
) => any
	? E
	: never

type UnionValues<T> = T extends Record<string, unknown> ? T[keyof T] : never

type ExtractEventObject<Transitions extends Record<PropertyKey, unknown>> = {
	[K in keyof Transitions]: { type: K } & ExtractEvent<Transitions[K]>
}

type ExtractEvents<Transitions extends Record<PropertyKey, unknown>> =
	UnionValues<ExtractEventObject<Transitions>>

type Transition<State, Derived> = (e: any, s: Derived) => State | undefined

type Transitions<State, Derived> = Record<any, Transition<State, Derived>>

export function fixstateMachine<
	State,
	T extends Transitions<State, Derived>,
	Derived = State,
	InitialArg = void,
>({
	init,
	transitions,
	derive,
	isDone,
}: {
	init: Init<State, InitialArg>
	transitions: T
	derive?: (s: State) => Derived
	isDone?: (s: Derived) => boolean
}): IMachine<Prettify<ExtractEvents<T>>, Derived, InitialArg> {
	const init0 = toInit(init)
	derive = derive ?? (id as (s: State) => Derived)
	return {
		init: (initialArg) => derive(init0(initialArg)),
		reducer: (event, derived) => {
			// we want to pass through unknown events
			const transition = transitions[event?.type] as
				| Transition<any, Derived>
				| undefined
			const res = transition?.(event, derived)
			if (res === undefined) return derived
			return derive(res)
		},
		isFinal: (derived) => isDone?.(derived) ?? false,
	}
}
