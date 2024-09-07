import { Typed } from '@constellar/utils'

export interface IMachine<Event, State, Transformed, Final> {
	init: State
	visit: <T>(
		acc: T,
		fold: (state: Transformed, acc: T, index: string) => T,
		transformed: Transformed,
	) => T
	reducer: (event: Event, transformed: Transformed) => State | undefined
	transform: (state: State) => Transformed
	getFinal: (transformed: Transformed) => Final | undefined
}

// when event is just { type: string }, we can use string as shorthand
export type Sendable<T extends Typed> =
	| T
	| (T extends { type: infer U } ? ({ type: U } extends T ? U : never) : never)

export function fromSendable<Event extends Typed>(
	event: Sendable<Event>,
): Event {
	return typeof event === 'string'
		? // Sendable type garantees that resulting event is valid
			({ type: event } as unknown as Event)
		: event
}
