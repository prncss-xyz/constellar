// since Array.prototype.splice is not available on Hermes

export function prepend<T>(x: T, xs: T[]) {
	return [x, ...xs]
}

export function append<T>(x: T, xs: T[]) {
	return [...xs, x]
}

export function insert<T>(index: number, x: T, xs: T[]) {
	if (index < 0) index += xs.length
	if (index < 0) return xs
	if (index > xs.length) return xs
	return [...xs.slice(0, index), x, ...xs.slice(index)]
}

export function replace<T>(x: T, index: number, xs: T[]) {
	if (index < 0) index += xs.length
	if (index < 0) return xs
	if (index >= xs.length) return xs
	return [...xs.slice(0, index), x, ...xs.slice(index + 1)]
}

export function remove<T>(index: number, xs: T[]) {
	if (index < 0) index += xs.length
	if (index < 0) return xs
	return [...xs.slice(0, index), ...xs.slice(index + 1)]
}
