import { id, Init } from '.'

export interface Monoid<Value, Acc> {
	init: Init<Acc>
	fold: (v: Value, acc: Acc) => Acc
}

export function first<V>(): Monoid<V, V | undefined> {
	return {
		init: undefined,
		fold: (v, acc) => acc ?? v,
	}
}

export function last<V>(): Monoid<V, V | undefined> {
	return {
		init: undefined,
		fold: id,
	}
}

export function collect<V>(): Monoid<V, V[]> {
	return {
		init: () => [],
		fold: (v, acc) => {
			acc.push(v)
			return acc
		},
	}
}

export type TReducer<Event, Acc, Param = void> = (
	p: Param,
) => Monoid<Event, Acc>
