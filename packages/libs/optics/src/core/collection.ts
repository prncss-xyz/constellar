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

export function toArray<V>(): FoldForm<V, V[], unknown> {
	return {
		init: [],
		foldFn: (v, acc) => {
			acc.push(v)
			return acc
		},
	}
}

export function toFirst<Part, Fail>(
	fail: Fail,
): FoldForm<Part, Part | Fail, { close: () => void }> {
	return {
		init: fail,
		foldFn: (p, _, { close }) => (close(), p),
	}
}

export type Ctx = { close: () => void }

export interface ICtx<Whole, Index> {
	close: () => void
	whole: Whole
	index: Index
}

export type FoldFn<Part, Acc, Ctx> = (p: Part, acc: Acc, ctx: Ctx) => Acc
export type Refold<P, Q, C> = <Acc>(
	fold: FoldFn<P, Acc, C>,
) => FoldFn<Q, Acc, C>

export interface FoldForm<Part, Acc, C> {
	init: Acc
	foldFn: FoldFn<Part, Acc, C>
}

export function foldWith<Part, Whole, Acc, Index>(
	acc: Acc,
	foldPart: (w: Part, acc: Acc, ctx: Ctx) => Acc,
	whole: Whole,
	collection: Unfolder<Part, Whole, Index>,
	close?: () => void,
) {
	const unfold = collection(whole)
	let alive = true
	const ctx: ICtx<Whole, Index> = {
		close: () => {
			if (close) close()
			alive = false
		},
		whole,
		index: undefined as Index,
	}
	while (alive) {
		const r = unfold()
		if (r === undefined) break
		ctx.index = r.index
		acc = foldPart(r.part, acc, ctx)
	}
	return acc
}
