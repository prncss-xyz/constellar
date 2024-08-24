/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	fromInit,
	id,
	Init,
	isFunction,
	Modify,
	Monoid,
	noop,
	pipe2,
	toInit,
	TReducer,
	Updater,
} from '@constellar/utils'

function pipe2varargs<P extends unknown[], Q, R>(
	f: (...p: P) => Q,
	g: (q: Q) => R,
): (...p: P) => R {
	if (f === (id as unknown)) return g as unknown as (...p: P) => R
	if (g === (id as unknown)) return f as unknown as (...p: P) => R
	return (...p: P) => g(f(...p))
}

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
		const normalize = opts?.normalize
		const areEqual = opts?.areEqual
		const reset = pipe2(toInit(init), normalize ?? id)
		const send = (event: Updater<Value, typeof RESET>, last: Value) =>
			isFunction(event)
				? (event(last) as Value)
				: event === RESET
					? reset()
					: event
		const fold = areEqual
			? (event: Updater<Value, typeof RESET>, last: Value) => {
					const next = send(event, last)
					return areEqual(last, next) ? last : next
				}
			: send
		return {
			init: reset,
			fold: pipe2varargs(fold, normalize ?? id),
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

export class SelectAtom<Part, Whole> extends Atom<Part> {
	source
	select
	constructor(source: IRAtom<Whole>, select: (w: Whole) => Part) {
		super()
		this.source = source
		this.select = select
	}
	read() {
		return this.select(this.source.peek())
	}
	onMount() {
		return this.source.subscribe(() => {
			this.invalidate()
		})
	}
}

export type Depromised<T> = T extends Promise<infer U> ? U : T

export function createSelectAtom<Part, Whole>(
	source: IRAtom<Promise<Whole>>,
	select: (w: Whole) => Part,
): SelectAtom<Promise<Part>, Promise<Whole>>
export function createSelectAtom<Part, Whole>(
	source: IRAtom<Whole>,
	select: (w: Whole) => Part,
): SelectAtom<Part, Whole>
export function createSelectAtom<Part, Whole>(
	source: IRAtom<Whole | Promise<Whole>>,
	select: (w: Whole) => Part,
) {
	return new SelectAtom(source, (w) =>
		w instanceof Promise ? w.then(select) : select(w),
	)
}

export class DerivedAtom<Part, Whole, Event>
	extends Atom<Part>
	implements IRWAtom<Event, Part>
{
	source
	getter
	sender
	constructor(
		source: IRWAtom<Modify<Whole>, Whole>,
		getter: (w: Whole) => Part,
		sender: (event: Event) => Modify<Whole>,
	) {
		super()
		this.source = source
		this.getter = getter
		this.sender = sender
	}
	read() {
		return this.getter(this.source.peek())
	}
	onMount() {
		return this.source.subscribe(() => {
			this.invalidate()
		})
	}
	send(event: Event) {
		this.source.send(this.sender(event))
	}
}

function unwrap<T, U>(cb: (t: T) => U): (w: Promise<T>) => Promise<U>
function unwrap<T, U>(cb: (t: T) => U): (w: T) => U
function unwrap<T, U>(cb: (t: T) => U) {
	return (w: T | Promise<T>) => (w instanceof Promise ? w.then(cb) : cb(w))
}

export function createDerivedAtom<
	Whole,
	Wrapped extends Whole | Promise<Whole>,
	Part = never,
	Event = never,
>(
	source: IRWAtom<Modify<Wrapped>, Wrapped>,
	select: ((w: Whole) => Part) | null,
	send: (event: Event) => Modify<Whole>,
) {
	return new DerivedAtom<Part, Wrapped, Event>(
		source,
		select ? unwrap(select) : (noop as any),
		(e: Event) => unwrap(send(e)) as any,
	)
}
