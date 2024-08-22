/* eslint-disable @typescript-eslint/no-explicit-any */
export function isFunction<T>(x: T): x is T & ((...args: any[]) => any) {
	return typeof x === 'function'
}

export function isUndefined(v: unknown): v is undefined {
	return v === undefined
}

export function isDefined<V>(v: V): v is Exclude<V, undefined> {
	return v !== undefined
}

export function isNever(_v: unknown): _v is never {
	return false
}
