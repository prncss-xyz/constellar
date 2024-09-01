import { append, id, prepend, remove, replace } from '@constellar/utils'

import {
	inert,
	IOptic,
	lens,
	optional,
	removable,
	REMOVE,
	traversal,
} from '../core'

// isomorphisms

export function to<B, V>(
	select: (v: V) => B,
): <A, F, C>(o: IOptic<V, A, F, C>) => IOptic<B, A, F, never>
export function to<B, V>(
	select: (v: V) => B | undefined,
): <A, F, C>(o: IOptic<V, A, F, C>) => IOptic<B, A, F | undefined, never>
export function to<B, V>(select: (v: V) => B | undefined) {
	return optional<B, V>({
		getter: select,
		setter: inert,
	})
}

export function reread<A>(mod: (a: A) => A) {
	return lens<A, A>({
		getter: mod,
		setter: id,
		// optics-ts setter is equivalent to: `setter: (_v, a) => a`
	})
}

export function rewrite<A>(f: (next: A, last: A) => A) {
	return lens<A, A>({
		getter: id,
		setter: f,
	})
}

export function dedupe<A>(areEqual: (a: A, b: A) => unknown = Object.is) {
	return rewrite<A>((next, last) => {
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

export function filter<X, Y extends X>(
	p: (x: X) => x is Y,
): <A, F, C>(o: IOptic<X[], A, F, C>) => IOptic<Y[], A, F, never>
export function filter<X>(
	p: (x: X) => unknown,
): <A, F, C>(o: IOptic<X[], A, F, C>) => IOptic<X[], A, F, never>
export function filter<X>(p: (x: X) => unknown) {
	return lens({
		getter: (xs: X[]) => xs.filter(p),
		setter: (fs: X[], xs: X[]) => {
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

export function when<V, W extends V>(
	p: (v: V) => v is W,
): <A, F, C>(o: IOptic<V, A, F, C>) => IOptic<W, A, F | undefined, never>
export function when<V>(
	p: (v: V) => unknown,
): <A, F, C>(o: IOptic<V, A, F, C>) => IOptic<V, A, F | undefined, never>
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
		setter: (v, o) => ({ ...o, [key]: v }),
		remover: (o) => {
			const res = { ...o }
			delete res[key]
			return res
		},
	})
}

export function at<X>(index: number) {
	return removable<X, X[]>({
		getter: (xs) => xs.at(index),
		setter: (x: X, xs) => replace(x, index, xs),
		remover: (xs) => remove(index, xs),
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

// defective (when setting a value not repecting predicate)
export function find<X, Y extends X>(
	p: (x: X) => x is Y,
): <A, F, C>(o: IOptic<X[], A, F, C>) => IOptic<Y, A, undefined, typeof REMOVE>
export function find<X>(
	p: (x: X) => unknown,
): <A, F, C>(o: IOptic<X[], A, F, C>) => IOptic<X, A, undefined, typeof REMOVE>
export function find<X>(p: (x: X) => unknown) {
	return removable({
		getter: (xs: X[]) => xs.find(p),
		setter: (x: X, xs: X[]) => {
			const i = xs.findIndex(p)
			if (i < 0) return [...xs, x]
			return replace(x, i, xs)
		},
		remover: (xs: X[]) => {
			const i = xs.findIndex(p)
			if (i < 0) return xs
			return remove(i, xs)
		},
		mapper: (f, xs) => {
			const i = xs.findIndex(p)
			if (i < 0) return xs
			return replace(f(xs[i]!), i, xs)
		},
	})
}

export function tail<X>() {
	return removable<X[], X[]>({
		getter: (last) => (last.length ? last.slice(1) : undefined),
		setter: (next, last) => (last.length ? [last[0]!, ...next] : last),
		remover: (last) => (last.length ? last.slice(0, 1) : last),
	})
}

// defective
// aka prepend
// can represent a stack, although foot is less efficient
export function head<X>() {
	return removable<X, X[]>({
		getter: (xs) => xs.at(0),
		setter: prepend,
		remover: (xs) => xs.slice(1),
	})
}

// defective
// aka append
// can represent a stack
export function foot<X>() {
	return removable<X, X[]>({
		getter: (xs) => xs.at(-1),
		setter: append,
		remover: (xs) => xs.slice(0, -1),
	})
}

// defective
export function queue<X>() {
	return removable<X, X[]>({
		getter: (xs) => xs.at(0),
		setter: append,
		remover: (xs) => xs.slice(1),
	})
}

export function iterable<Part, Whole>({
	iter,
	mapper,
}: {
	iter: (whole: Whole) => Iterable<Part>
	mapper: (mod: (p: Part) => Part, w: Whole) => Whole
}) {
	return traversal<Part, Whole>({
		refold: <Acc>(fold: (p: Part, acc: Acc) => Acc) => {
			return function (whole: Whole, acc: Acc) {
				for (const part of iter(whole)) {
					acc = fold(part, acc)
				}
				return acc
			}
		},
		mapper,
	})
}

// traversals
export function elems<B>() {
	return iterable<B, B[]>({
		iter: id,
		mapper: (f, bs) => {
			const res: B[] = []
			for (let i = 0; i < bs.length; i++) {
				res[i] = f(bs[i]!)
			}
			return res
		},
	})
}
