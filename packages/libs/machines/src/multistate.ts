/* eslint-disable @typescript-eslint/no-explicit-any */
import { Init, toInit, Typed } from '@constellar/utils'

import { IMachine } from '..'

// TODO: sendable for results too
// TODO: derive: optional
// TODO: transitions can be values

type IMultistateMachine<
	Event extends Typed,
	State extends Typed,
	DerivedLocal,
	InitialArg,
> = {
	init: Init<State, InitialArg>
	states: {
		[StateType in Exclude<State['type'], 'final'>]: {
			events: Partial<{
				[EventType in Event['type']]: <
					E extends Event & { type: EventType },
					S extends State & { type: StateType } & DerivedLocal,
				>(
					event: E,
					state: S,
				) => State | undefined
			}>
		}
	} & {
		[StateType in State['type']]: {
			derive: <S extends State & { type: StateType }>(
				state: S,
			) => S & DerivedLocal
		}
	}
}

export function multistateMachine<
	Event extends Typed,
	State extends Typed,
	Context,
	InitialArg = void,
>({
	init,
	states,
}: IMultistateMachine<Event, State, Context, InitialArg>): IMachine<
	Event,
	State & Context,
	InitialArg
> {
	const init0 = toInit(init)
	return {
		init: (initialArg: InitialArg) => {
			const s = init0(initialArg)
			return (states as any)[s.type].derive(s)
		},
		reducer: (
			event: Event,
			s: State & Context,
		): (State & Context) | undefined => {
			const state = (states as any)[s.type]
			const res = state?.events[event.type]?.(event, s)
			if (res === undefined) return undefined
			return (states as any)[res.type].derive(res)
		},
		isFinal: (s: State & Context) => s.type === 'final',
	}
}
