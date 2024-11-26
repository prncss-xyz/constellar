import { append, id, prepend, remove, replace } from '../../utils'
import { fromArray, toArray } from '../collections'
import {
	forbidden,
	IOptic,
	iso,
	lens,
	NON_PRISM,
	optional,
	prism,
	removable,
	REMOVE,
	traversal,
} from '../core'

// getters

export function to<Micro, Part>(
	getter: (v: Part) => Micro,
): <Mega, FL, CL, SL>(
	l: IOptic<Part, Mega, FL, CL, SL>,
) => IOptic<Micro, Mega, FL, never, SL>
export function to<Micro, Part>(
	getter: (v: Part) => Micro | undefined,
): <Mega, FL, CL, SL>(
	l: IOptic<Part, Mega, FL, CL, SL>,
) => IOptic<Micro, Mega, FL | undefined, never, SL>
export function to<Micro, Part>(getter: (v: Part) => Micro | undefined) {
	return optional<Micro, Part>({
		getter,
		setter: forbidden,
	})
}

// isomorphisms

export function reread<Whole>(mod: (a: Whole) => Whole) {
	return iso<Whole, Whole>({
		getter: mod,
		setter: id,
		// optics-ts setter is equivalent to: `setter: (_v, a) => a`
	})
}

export function rewrite<Whole>(setter: (next: Whole, last: Whole) => Whole) {
	return lens<Whole, Whole>({
		getter: id,
		setter,
	})
}

export function dedupe<Whole>(
	areEqual: (a: Whole, b: Whole) => unknown = Object.is,
) {
	return rewrite<Whole>((next, last) => {
		if (areEqual(next, last)) return last
		return next
	})
}

export function linear(m: number, b = 0) {
	return iso<number, number>({
		getter: (x) => m * x + b,
		setter: (y) => (y - b) / m,
	})
}

// lenses

export function nth<Index extends keyof O & number, O extends unknown[]>(
	index: Index,
) {
	return lens<O[Index], O>({
		getter: (o) => o[index],
		setter: (v, o) => replace(v, index, o) as O,
	})
}

// equivalence relation
export function includes<X>(x: X) {
	return lens<boolean, X[]>({
		getter: (xs) => xs.includes(x),
		setter: (v, xs) => {
			if (xs.includes(x) === v) return xs
			if (v) return xs.concat(x)
			return xs.filter((x_) => x_ !== x)
		},
		// mapper could improve speed
		// sorted list could improve speed
	})
}

// prisms

export function when<Part, Micro extends Part>(
	p: (v: Part) => v is Micro,
): <Mega, FL, CL, SL>(
	l: IOptic<Part, Mega, FL, CL, SL>,
) => IOptic<Micro, Mega, FL | undefined, never, SL & void>
export function when<Part>(
	p: (v: Part) => unknown,
): <Mega, FL, CL, SL>(
	l: IOptic<Part, Mega, FL, CL, SL>,
) => IOptic<Part, Mega, FL | undefined, never, SL & void>
export function when<V>(p: (v: V) => unknown) {
	return prism<V, V>({
		getter: (v) => (p(v) ? v : undefined),
		setter: id,
	})
}

export function strToNum() {
	return prism<number, string>({
		getter: (str) => {
			const parsed = parseInt(str)
			if (isNaN(parsed)) return undefined
			return parsed
		},
		setter: (num) => String(num),
	})
}

// removables

type OptionalKeys<T> = {
	[K in keyof T]: object extends Pick<T, K> ? K : never
}[keyof T]

export function prop<Key extends keyof O, O extends object>(
	key: Key,
): <A, F1, C, S>(
	p: IOptic<O, A, F1, C, S>,
) => IOptic<
	Exclude<O[Key], undefined>,
	A,
	F1 | (Key extends OptionalKeys<O> ? undefined : never),
	Key extends OptionalKeys<O> ? typeof REMOVE : never,
	NON_PRISM
>
export function prop<Key extends keyof O, O extends object>(key: Key) {
	return removable<Exclude<O[Key], undefined>, O>({
		getter: (o) => o[key] as Exclude<O[Key], undefined>,
		remover: (o) => {
			if (!(key in o)) return o
			const res = { ...o }
			delete res[key]
			return res
		},
		setter: (v, o) => {
			// the second check is to differentiate between a key not existing
			// and a key existing with a value of undefined
			if (Object.is(o[key], v) && key in o) return o
			return { ...o, [key]: v }
		},
	})
}

export function at<X>(index: number) {
	return removable<X, X[]>({
		getter: (xs) => xs.at(index),
		remover: (xs) => remove(index, xs),
		setter: (x: X, xs) => replace(x, index, xs),
	})
}

export function findOne<X, Y extends X>(
	p: (x: X) => x is Y,
): <Mega, F2, C2, S>(
	o: IOptic<X[], Mega, F2, C2, S>,
) => IOptic<Y, Mega, F2 | undefined, typeof REMOVE, NON_PRISM>
export function findOne<X>(
	p: (x: X) => unknown,
): <Mega, F2, C2, S>(
	o: IOptic<X[], Mega, F2, C2, S>,
) => IOptic<X, Mega, F2 | undefined, typeof REMOVE, NON_PRISM>
export function findOne<X>(p: (x: X) => unknown) {
	return removable<X, X[]>({
		getter: (xs) => xs.find(p),
		mapper: (f, xs) => {
			const index = xs.findIndex(p)
			if (index < 0) return xs
			const x = f(xs[index]!)
			return [...xs.slice(0, index), x, ...xs.slice(index + 1)]
		},
		remover: (xs) => {
			const index = xs.findIndex(p)
			if (index < 0) return xs
			return [...xs.slice(0, index), ...xs.slice(index + 1)]
		},
		setter: (x, xs) => {
			const index = xs.findIndex(p)
			if (index < 0) return append(x, xs)
			return [...xs.slice(0, index), x, ...xs.slice(index + 1)]
		},
	})
}

// defective (when setting a value not respecting predicate)
export function findMany<X, Y extends X>(
	p: (x: X) => x is Y,
): <A, F, C, S>(
	o: IOptic<X[], A, F, C, S>,
) => IOptic<Y[], A, F, never, NON_PRISM>
export function findMany<X>(
	p: (x: X) => unknown,
): <A, F, C, S>(
	o: IOptic<X[], A, F, C, S>,
) => IOptic<X[], A, F, never, NON_PRISM>
export function findMany<X>(p: (x: X) => unknown) {
	return lens<X[], X[]>({
		getter: (xs) => xs.filter(p),
		setter: (fs, xs) => {
			let dirty = false
			const rs: X[] = []
			let i = 0
			let j = 0
			let k = 0
			for (i = 0; i < xs.length; i++) {
				const x = xs[i]!
				if (p(x)) {
					if (j < fs.length) {
						dirty = dirty || !Object.is(fs[j], x)
						rs[k] = fs[j]!
						j++
						k++
					} else {
						dirty = true
					}
				} else {
					rs[k] = x
					k++
				}
			}
			for (; j < fs.length; j++, k++) {
				dirty = true
				rs[k] = fs[j]!
			}
			return dirty ? rs : xs
		},
		// if needed, implementing a custom mapper could improve speed
	})
}

export function tail<X>() {
	return removable<X[], X[]>({
		getter: (last) => (last.length ? last.slice(1) : undefined),
		remover: (last) => (last.length ? last.slice(0, 1) : last),
		setter: (next, last) => (last.length ? [last[0]!, ...next] : last),
	})
}

// defective
// aka prepend
// can represent a stack, although foot is more efficient
export function head<X>() {
	return removable<X, X[]>({
		getter: (xs) => xs.at(0),
		remover: (last) => (last.length ? last.slice(1) : last),
		setter: prepend,
	})
}

// defective
// aka foot, append
// can represent a stack
export function stack<X>() {
	return removable<X, X[]>({
		getter: (xs) => xs.at(-1),
		remover: (last) => (last.length ? last.slice(0, -1) : last),
		setter: append,
	})
}

// defective
export function queue<X>() {
	return removable<X, X[]>({
		getter: (xs) => xs.at(0),
		remover: (last) => (last.length ? last.slice(1) : last),
		setter: append,
	})
}

// traversals
export function elems<X>() {
	return traversal<X, X[], number>({
		coll: fromArray<X>,
		form: toArray<X>,
	})
}
