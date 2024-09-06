import { id, Init, noop } from '@constellar/utils'

export type UnfoldForm<Part, Index> = () =>
	| { part: Part; index: Index }
	| undefined

export type Unfolder<Part, Whole, Index> = (w: Whole) => UnfoldForm<Part, Index>

export const fromArray = <T>(xs: T[]): UnfoldForm<T, number> => {
	let index = 0
	return function () {
		if (index === xs.length) return undefined
		return { part: xs[index++]!, index }
	}
}

export function toArray<V>(): FoldForm<V, V[], Ctx> {
	return {
		init: () => [],
		foldFn: (v, acc) => {
			acc.push(v)
			return acc
		},
	}
}

export function toValue<V>(init: Init<V>): FoldForm<V, V, Ctx> {
	return {
		init,
		foldFn: id,
	}
}

export function toFirst<Part, Fail, Ctx extends { close: () => void }>(
	fail: Fail,
): FoldForm<Part, Part | Fail, Ctx> {
	return {
		init: fail,
		foldFn: (p, _, { close }) => (close(), p),
	}
}

export type Ctx = { close: () => void }

export const ctxNull: Ctx = { close: noop }

// TODO:
export interface ICtx<Whole, Index> {
	close: () => void
	whole: Whole
	index: Index
}

export type FoldFn<Part, Acc, Ctx> = (p: Part, acc: Acc, ctx: Ctx) => Acc
export type Refold<Part, Whole, C> = <Acc>(
	fold: FoldFn<Part, Acc, C>,
) => FoldFn<Whole, Acc, C>

export interface FoldForm<Part, Acc, C> {
	init: Init<Acc>
	foldFn: FoldFn<Part, Acc, C>
}
