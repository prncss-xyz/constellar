import { Init } from '..'
import { isFunction } from './guards'

export const noop = () => {}

export function apply<P, Q>(f: (p: P) => Q, p: P) {
	return f(p)
}

export function id<T>(t: T) {
	return t
}

export function pipe2<P, Q, R>(f: (p: P) => Q, g: (q: Q) => R): (p: P) => R {
	if (f === id) return g as unknown as (p: P) => R
	if (g === id) return f as unknown as (p: P) => R
	return (p: P) => g(f(p))
}

export function fromInit<T>(init: Init<T, void>): T {
	return isFunction(init) ? init() : init
}

export function toInit<T, P = void>(init: Init<T, P>): (p: P) => T {
	return isFunction(init) ? (p) => init(p) : () => init
}

export function isEmpty(obj?: object) {
	if (!obj) return true
	for (const _ of Object.keys(obj)) {
		return false
	}
	return true
}
