import { append, id, prepend, remove, replace } from '../../utils'
import { fromArray, toArray } from '../collections'
import {
	inert,
	IOptic,
	lens,
	optional,
	removable,
	REMOVE,
	traversal,
} from '../core'

// getters

export function to<Micro, Part>(
	getter: (v: Part) => Micro,
): <Whole, F, C>(o: IOptic<Part, Whole, F, C>) => IOptic<Micro, Whole, F, never>
export function to<Micro, Part>(
	getter: (v: Part) => Micro | undefined,
): <A, F, C>(o: IOptic<Part, A, F, C>) => IOptic<Micro, A, F | undefined, never>
export function to<Micro, Part>(getter: (v: Part) => Micro | undefined) {
	return optional<Micro, Part>({
		getter,
		setter: inert,
	})
}

// isomorphisms

export function reread<Whole>(mod: (a: Whole) => Whole) {
	return lens<Whole, Whole>({
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
	return lens<number, number>({
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
		// we will use this when browser support is better
		/* setter: (v, o) => o.with(index, v) as O, */
	})
}

// equivalence relation
export function includes<X>(x: X) {
	return lens<boolean, X[]>({
		getter: (xs) => xs.includes(x),
		setter: (v, xs) => {
			if (xs.includes(x) === v) return xs
			if (v) return [...xs, x]
			return xs.filter((x_) => x_ !== x)
		},
		// mapper could improve speed
		// sorted list could improve speed
	})
}

// prisms

export function when<Part, Micro extends Part>(
	p: (v: Part) => v is Micro,
): <Whole, F, C>(
	o: IOptic<Part, Whole, F, C>,
) => IOptic<Micro, Whole, F | undefined, never>
export function when<Part>(
	p: (v: Part) => unknown,
): <Whole, F, C>(
	o: IOptic<Part, Whole, F, C>,
) => IOptic<Part, Whole, F | undefined, never>
export function when<V>(p: (v: V) => unknown) {
	return optional<V, V>({
		getter: (v) => (p(v) ? v : undefined),
		setter: id,
	})
}

// removables

type OptionalKeys<T> = {
	[K in keyof T]: object extends Pick<T, K> ? K : never
}[keyof T]

export function prop<Key extends keyof O, O>(
	key: Key,
): <A, F1, C>(
	p: IOptic<O, A, F1, C>,
) => IOptic<
	Exclude<O[Key], undefined>,
	A,
	F1 | (Key extends OptionalKeys<O> ? undefined : never),
	Key extends OptionalKeys<O> ? typeof REMOVE : never
>
export function prop<Key extends keyof O, O>(key: Key) {
	return removable<Exclude<O[Key], undefined>, O>({
		getter: (o) => o[key] as Exclude<O[Key], undefined>,
		remover: (o) => {
			const res = { ...o }
			delete res[key]
			return res
		},
		setter: (v, o) => ({ ...o, [key]: v }),
	})
}

export function at<X>(index: number) {
	return removable<X, X[]>({
		getter: (xs) => xs.at(index),
		remover: (xs) => remove(index, xs),
		setter: (x: X, xs) => replace(x, index, xs),
		// replace when better browser support
		/* setter: (x: X, xs) => {
			if (index >= xs.length) return xs
			return xs.with(xs, index, x)
		}, 
		remover: (xs) => {
			if (index < 0) index += xs.length
			if (index < 0) return xs
			if (index >= xs.length) return xs
			return xs.toSpliced(index, 1)
		},
    */
	})
}

export function findOne<X, Y extends X>(
	p: (x: X) => x is Y,
): <Mega, F2, C2>(
	o: IOptic<X[], Mega, F2, C2>,
) => IOptic<Y, Mega, F2 | undefined, typeof REMOVE>
export function findOne<X>(
	p: (x: X) => unknown,
): <Mega, F2, C2>(
	o: IOptic<X[], Mega, F2, C2>,
) => IOptic<X, Mega, F2 | undefined, typeof REMOVE>
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
): <A, F, C>(o: IOptic<X[], A, F, C>) => IOptic<Y[], A, F, never>
export function findMany<X>(
	p: (x: X) => unknown,
): <A, F, C>(o: IOptic<X[], A, F, C>) => IOptic<X[], A, F, never>
export function findMany<X>(p: (x: X) => unknown) {
	return lens<X[], X[]>({
		getter: (xs) => xs.filter(p),
		setter: (fs, xs) => {
			const rs = []
			let i = 0
			let j = 0
			let k = 0
			for (i = 0; i < xs.length; i++) {
				const x = xs[i]!
				if (p(x)) {
					if (j < fs.length) {
						rs[k++] = fs[j++]!
					}
				} else {
					rs[k++] = x
				}
			}
			for (; j < fs.length; j++, i++) {
				rs[k++] = fs[j]!
			}
			return rs
		},
		// if needed, implementing a custom mapper could greatly improve speed
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
// can represent a stack, although foot is less efficient
export function head<X>() {
	return removable<X, X[]>({
		getter: (xs) => xs.at(0),
		remover: (xs) => xs.slice(1),
		setter: prepend,
	})
}

// defective
// aka append
// can represent a stack
export function foot<X>() {
	return removable<X, X[]>({
		getter: (xs) => xs.at(-1),
		remover: (xs) => xs.slice(0, -1),
		setter: append,
	})
}

// defective
export function queue<X>() {
	return removable<X, X[]>({
		getter: (xs) => xs.at(0),
		remover: (xs) => xs.slice(1),
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
