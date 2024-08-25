import { fromInit, Monoid, TReducer, Typed } from '@constellar/utils'

export interface IMachine<Event, Acc, Param> {
	init: (p: Param) => Acc
	reducer: (e: Event, acc: Acc) => Acc | undefined
	// TODO: type narrowing
	isFinal: (acc: Acc) => boolean
}

/*
export function fromRawMachine<Event, Acc, Param>({
	init,
	reducer,
}: IMachine<Event, Acc, Param>): TReducer<Event, Acc, Param> {
	return function (p) {
		return {
			init: () => init(p),
			fold: (event, acc) => reducer(event, acc) ?? acc,
		}
	}
}
*/

// when event is just { type: string }, we can use string as shorthand
export type Sendable<T extends Typed> =
	| T
	| (T extends { type: infer U } ? ({ type: U } extends T ? U : never) : never)

export function fromSendable<Event extends Typed>(
	event: Sendable<Event>,
): Event {
	return (
		typeof event === 'string' ? ({ type: event } as unknown) : event
	) as Event
}

export function fromMachine<Event extends Typed, Acc, Param>({
	init,
	reducer,
}: IMachine<Event, Acc, Param>): TReducer<Sendable<Event>, Acc, Param> {
	return function (p) {
		return {
			init: () => init(p),
			fold: (event, acc) => reducer(fromSendable(event), acc) ?? acc,
		}
	}
}

export type Machine<Event, State, InitialArg> = <Store>(
	interpreter: (m: IMachine<Event, State, InitialArg>) => Store,
) => (initalArg: InitialArg) => Store

class ObjectReducer<Event, Acc> {
	state
	fold
	constructor({ init, fold }: Monoid<Event, Acc>) {
		this.state = fromInit(init)
		this.fold = fold
	}
	send(event: Event) {
		return (this.state = this.fold(event, this.state))
	}
}

// An object with a `send` method and a `state` property
export function createObjectReducer<Event, Acc, InitialArg, E = Event, A = Acc>(
	reducer: TReducer<Event, Acc, InitialArg>,
	middleware: (r: Monoid<Event, Acc>) => Monoid<E, A>,
) {
	return function (initalArg: InitialArg) {
		return new ObjectReducer(middleware(reducer(initalArg)))
	}
}
