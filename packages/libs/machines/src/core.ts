import { Typed } from '@constellar/utils'

export interface IMachine<Event, State, Transformed, Substate, Final> {
	init: State
	visit: <Acc>(
		acc: Acc,
		fold: (substate: Substate, acc: Acc, index: string) => Acc,
		transformed: Transformed,
	) => Acc
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
