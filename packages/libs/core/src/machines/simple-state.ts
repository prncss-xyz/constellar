/* eslint-disable @typescript-eslint/no-explicit-any */
import { fromSendable, IMachine, MessageCtx, Sendable } from '.'
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

type Transition<State, Transformed, Ctx extends unknown[]> =
	| ((e: any, s: Transformed, ...args: Ctx) => State | undefined)
	| State

type Transitions<State, Transformed, Ctx extends unknown[]> = Record<
	any,
	Transition<State, Transformed, Ctx>
>

export function simpleStateMachine<Message extends Typed = { type: never }>() {
	return simpleStateBaseMachine<MessageCtx<Message>>()
}

export function simpleStateBaseMachine<RWCtx extends unknown[]>() {
	return function <
		State,
		T extends Transitions<State, Transformed, RWCtx>,
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
			RWCtx,
			Transformed,
			Transformed,
			Final
		> => {
			return {
				getFinal: getFinal ?? (() => undefined),
				init: () => toInit(init)(initialArg),
				reducer: (event, transformed, ...ctx) => {
					const e = fromSendable(event as any)
					if (getFinal?.(transformed) !== undefined) return undefined
					// we want to pass through unknown events
					let res = events[e?.type] as any
					if (res === undefined) return undefined
					if (isFunction(res)) res = res(e, transformed, ...ctx)
					return res
				},
				transform: transform ?? (id as any),
				visit: (acc, fold, state, ...args) => fold(state, acc, '', ...args),
			}
		}
	}
}
