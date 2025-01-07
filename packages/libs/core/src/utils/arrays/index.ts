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
	if (Object.is(xs[index], x)) return xs
	return [...xs.slice(0, index), x, ...xs.slice(index + 1)]
}

export function remove<T>(index: number, xs: T[]) {
	if (index < 0) index += xs.length
	if (index < 0) return xs
	if (index >= xs.length) return xs
	return [...xs.slice(0, index), ...xs.slice(index + 1)]
}

export function insertValue<X>(element: X, xs: X[]) {
	for (const x of xs) {
		if (Object.is(x, element)) return xs
	}
	return xs.concat(element)
}

export function removeValue<X>(element: X, xs: X[]) {
	let dirty = false
	const res: X[] = []
	for (const x of xs) {
		if (Object.is(x, element)) {
			dirty = true
		} else res.push(x)
	}
	return dirty ? res : xs
}
