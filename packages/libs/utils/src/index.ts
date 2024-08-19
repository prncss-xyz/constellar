import { id } from './functions'
import { isFunction } from './guards'

export * from './arrays'
export * from './guards'
export * from './functions'

export type Prettify<Type> = {
	[Key in keyof Type]: Type[Key]
} & {}

export type Init<T, P = void> = T | ((p: P) => T)
export type Reducer<Event, Acc> = (t: Event, acc: Acc) => Acc
export type Updater<Value, Command> =
	| Command
	| Value
	| ((value: Value) => Value)
export type Modify<Value> = (value: Value) => Value
export type AreEqual<T> = (a: T, b: T) => boolean
export type Typed = {
	type: string
}

export type TReducer<Event, Acc, Param = void> = (
	p: Param,
) => Monoid<Event, Acc>

export function fromInit<T>(init: Init<T, void>): T {
	return isFunction(init) ? init() : init
}

export function toInit<T, P = void>(init: Init<T, P>): (p: P) => T {
	return isFunction(init) ? (p) => init(p) : () => init
}

/* 
export function storeToOptic<V>(store: Store<V>) {
	return eqWithReset(() => store.initial())
}
*/

export type XF = <Event, Acc>() => {
	init: Init<Acc>
	fold: (v: Event, acc: Acc) => Acc
}

export interface Monoid<Value, Acc> {
	init: Init<Acc>
	fold: (v: Value, acc: Acc) => Acc
}

export function first<V>(): Monoid<V, V | undefined> {
	return {
		init: undefined,
		fold: (v, acc) => acc ?? v,
	}
}

export function last<V>(): Monoid<V, V | undefined> {
	return {
		init: undefined,
		fold: id,
	}
}

export function collect<V>(): Monoid<V, V[]> {
	return {
		init: () => [],
		fold: (v, acc) => {
			acc.push(v)
			return acc
		},
	}
}

export interface Monoid2<Value, Acc, Ix> {
	init: Init<Acc>
	fold: (v: Value, acc: Acc, ix: Ix) => Acc
}

export function head2<V>(): Monoid2<V, V | undefined, unknown> {
	return {
		init: undefined,
		fold: id,
	}
}

export function collect2<V>(): Monoid2<V, V[], number> {
	return {
		init: () => [],
		fold: (v, acc, ix) => {
			acc[ix] = v
			return acc
		},
	}
}

export function objForearch<O extends object, K extends keyof O>(
	o: O,
	f: <L extends K>(k: K, v: O[L]) => void,
) {
	for (const [k, v] of Object.entries(o)) {
		f(k as K, v as O[K])
	}
}
