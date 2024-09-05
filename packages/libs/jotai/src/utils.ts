// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NonFunction<T> = [T] extends [(...args: any[]) => any] ? never : T

export function unwrap<Part, Whole>(
	source: Whole | Promise<Whole>,
	select: (w: Whole) => Part,
) {
	return source instanceof Promise ? source.then(select) : select(source)
}
