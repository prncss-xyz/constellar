import { Typed } from '../utils'

export interface IMachine<Event, State, Message, Transformed, SubState, Final> {
	getFinal: (transformed: Transformed) => Final | undefined
	init: State
	reducer: (
		event: Event,
		transformed: Transformed,
		send: (e: Message) => void,
	) => State | undefined
	transform: (state: State) => Transformed
	visit: <Acc>(
		acc: Acc,
		fold: (subState: SubState, acc: Acc, index: string) => Acc,
		transformed: Transformed,
	) => Acc
}

// when event is just { type: string }, we can use string as shorthand
export type Sendable<T extends Typed | void> =
	| T
	| (T extends { type: infer U }
			? { type: U } extends T
				? U
				: never
			: T extends void
				? void
				: never)

export function fromSendable<Event extends Typed>(
	event: Sendable<Event>,
): Event {
	return typeof event === 'string'
		? // Sendable type guarantees that resulting event is valid
			({ type: event } as unknown as Event)
		: event
}
