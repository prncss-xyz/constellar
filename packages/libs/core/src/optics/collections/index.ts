import { Init, noop } from '../../utils'

export type UnfoldForm<Part, Index> = () =>
	| { index: Index; part: Part }
	| undefined

export type Unfolder<Part, Whole, Index> = (w: Whole) => UnfoldForm<Part, Index>

export const fromArray = <T>(xs: T[]): UnfoldForm<T, number> => {
	let index = 0
	return function () {
		if (index === xs.length) return undefined
		return { index, part: xs[index++]! }
	}
}

export function toArray<V>(): FoldForm<V, V[], Ctx> {
	return {
		foldFn: (v, acc) => {
			acc.push(v)
			return acc
		},
		init: () => [],
	}
}

export function toFirst<Part, Fail, Ctx extends { close: () => void }>(
	fail: Fail,
): FoldForm<Part, Fail | Part, Ctx> {
	return {
		foldFn: (p, _, { close }) => (close(), p),
		init: fail,
	}
}

export type Ctx = { close: () => void }

export const ctxNull: Ctx = { close: noop }

// TODO:
export interface ICtx<Whole, Index> {
	close: () => void
	index: Index
	whole: Whole
}

export type FoldFn<Part, Acc, Ctx> = (p: Part, acc: Acc, ctx: Ctx) => Acc
export type Refold<Part, Whole, C> = <Acc>(
	fold: FoldFn<Part, Acc, C>,
) => FoldFn<Whole, Acc, C>

export interface FoldForm<Part, Acc, C> {
	foldFn: FoldFn<Part, Acc, C>
	init: Init<Acc>
}
