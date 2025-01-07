/* eslint-disable @typescript-eslint/no-explicit-any */
export function isFunction<T>(x: T): x is ((...args: any[]) => any) & T {
	return typeof x === 'function'
}

export function isUndefined(v: unknown): v is undefined {
	return v === undefined
}

export function isNever(_v: unknown): _v is never {
	return false
}
