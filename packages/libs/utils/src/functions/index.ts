export * from './flow'
export * from './compose'

export const noop = () => {}

export function apply<P, Q>(f: (p: P) => Q, p: P) {
	return f(p)
}

export function id<T>(t: T) {
	return t
}

export function compose2varargs<P extends unknown[], Q, R>(
	f: (...p: P) => Q,
	g: (q: Q) => R,
): (...p: P) => R {
	if (f === (id as unknown)) return g as unknown as (...p: P) => R
	if (g === (id as unknown)) return f as unknown as (...p: P) => R
	return (...p: P) => g(f(...p))
}

export function compose2<P, Q, R>(f: (p: P) => Q, g: (q: Q) => R): (p: P) => R {
	if (f === id) return g as unknown as (p: P) => R
	if (g === id) return f as unknown as (p: P) => R
	return (p: P) => g(f(p))
}

const INIT = Symbol('INIT')

export function memo1<A, B>(f: (a: A) => B): (a: A) => B {
	let a_: A | typeof INIT = INIT
	let memo: B
	return (a: A) => {
		if (!Object.is(a_, a)) {
			memo = f(a)
			a_ = a
		}
		return memo
	}
}
