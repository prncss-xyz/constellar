import {
	compose2,
	fromInit,
	id,
	Init,
	isFunction,
	Monoid,
	toInit,
	TReducer,
	Updater,
} from '@constellar/utils'

export interface IRAtom<State> {
	peek(): State
	subscribe(subscriber: () => void): () => void
}

export interface IRWAtom<Event, State> extends IRAtom<State> {
	send(event: Event): void
}

export abstract class Atom<State> implements IRAtom<State> {
	private subscribers: Set<() => void> = new Set()
	private unmount: void | (() => void) = undefined
	private dirty = true
	// `dirty = true` ensures this value is never read
	protected state = undefined as State
	protected abstract read(): State
	protected abstract onMount(): void | (() => void)
	subscribe(subscriber: () => void) {
		if (this.subscribers.size === 0) this.unmount = this.onMount()
		this.subscribers.add(subscriber)
		return () => {
			this.subscribers.delete(subscriber)
			// we dont't do it sink to avoid unmonting when an observer to subscribe and another to unsubscribe in a sync task
			if (this.unmount && this.subscribers.size === 0) {
				setTimeout(() => {
					if (this.subscribers.size === 0) this.unmount!()
				}, 0)
			}
		}
	}
	peek() {
		if (this.dirty) {
			this.state = this.read()
			this.dirty = false
		}
		return this.state
	}
	private notify() {
		for (const subscriber of this.subscribers) {
			subscriber()
		}
	}
	update(next: State) {
		this.state = next
		this.notify()
	}
	invalidate() {
		this.dirty = true
		this.notify()
	}
}

export class StoreAtom<Event, State>
	extends Atom<State>
	implements IRWAtom<Event, State>
{
	private fold
	init
	constructor({ init, fold }: Monoid<Event, State>) {
		super()
		this.init = init
		this.fold = fold
	}
	read() {
		return fromInit(this.init)
	}
	onMount() {}
	send(v: Event) {
		const state = this.peek()
		const next = this.fold(v, state)
		if (Object.is(next, state)) return
		this.update(next)
	}
}

export function createReducer<Event, Acc, InitialArg, E = Event, A = Acc>(
	reducer: TReducer<Event, Acc, InitialArg>,
	middleware: (r: Monoid<Event, Acc>) => Monoid<E, A>,
) {
	return function (initalArg: InitialArg) {
		return new StoreAtom(middleware(reducer(initalArg)))
	}
}

export const RESET = Symbol('RESET')

export function fromState<Value>(opts?: {
	areEqual?: (a: Value, b: Value) => boolean
	normalize?: (next: Value) => Value
}) {
	return function (init: Init<Value>) {
		const reset = compose2(toInit(init), opts?.normalize ?? id)
		let send = (event: Updater<Value, typeof RESET>, last: Value) =>
			isFunction(event)
				? (event(last) as Value)
				: event === RESET
					? reset()
					: event
		const normalizer = opts?.normalize
		if (normalizer) send = (next, last) => normalizer(send(next, last))
		return {
			init: toInit(init),
			fold: send,
		}
	}
}

export function createState<Value>(
	init: Init<Value>,
	opts?: {
		areEqual?: (a: Value, b: Value) => boolean
		normalize?: (next: Value) => Value
	},
) {
	return createReducer(fromState(opts), id)(init)
}
