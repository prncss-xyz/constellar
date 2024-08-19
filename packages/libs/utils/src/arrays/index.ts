// since Array.prototype.splice is not available on Hermes

export function insert<T>(x: T, index: number, xs: T[]) {
	return [...xs.slice(0, index), x, ...xs.slice(index)]
}

export function prepend<T>(x: T, xs: T[]) {
	return [x, ...xs]
}

export function append<T>(x: T, xs: T[]) {
	return [...xs, x]
}

export function replace<T>(x: T, index: number, xs: T[]) {
	return [...xs.slice(0, index), x, ...xs.slice(index + 1)]
}

export function remove<T>(xs: T[], index: number) {
	return [...xs.slice(0, index), ...xs.slice(index + 1)]
}
