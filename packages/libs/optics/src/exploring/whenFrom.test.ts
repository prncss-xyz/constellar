/* eslint-disable @typescript-eslint/no-explicit-any */
import { eq, fold, inert, IOptic, modify, put, view } from '@/core'
import { flow, id, isNever, isUndefined } from '@constellar/utils'

import { Ctx, FoldFn, toArray } from '../collections'
import { elems, prop } from '../extra'

function composeFaillure<F1, F2>(
	f1: (v: unknown) => v is F1,
	f2: (v: unknown) => v is F2,
): (v: unknown) => v is F1 | F2 {
	if (f1 === isNever) return f2
	if (f2 === isNever) return f1
	if ((f1 as unknown) === f2) return f1
	/* c8 ignore start */
	throw new Error('unexpected faillure value')
}
/* c8 ignore stop */

function opticFrom<Micro, Part, Whole, Fail>({
	getter,
	setter,
	isFaillure,
}: {
	getter: (p: Part, w: Whole) => Micro | Fail
	setter: (m: Micro, p: Part, w: Whole) => Part
	isFaillure: (v: unknown) => v is Fail
}) {
	return function <F2, C>(
		o: IOptic<Part, Whole, F2, C>,
	): IOptic<Micro, Whole, F2 | Fail, never> {
		return {
			getter: o.getter
				? (w) => {
						const part = o.getter!(w)
						if (o.isFaillure(part)) return part
						return getter(part, w)
					}
				: undefined,
			setter: o.setter
				? (m, w) => {
						const part = o.getter!(w)
						if (o.isFaillure(part)) return w
						return o.setter!(setter(m, part, w), w)
					}
				: undefined,
			refold:
				<Acc>(foldPart: FoldFn<Micro, Acc, Ctx>) =>
				(whole, acc: Acc, ctx) =>
					o.refold((part, acc: Acc, ctx) => {
						const micro = getter(part, whole)
						if (isFaillure(micro)) return acc
						return foldPart(micro, acc, ctx)
					})(whole, acc, ctx),
			mapper: (mod, whole) =>
				o.mapper((part) => {
					const micro = getter(part, whole)
					if (isFaillure(micro)) return part
					return setter(mod(micro), part, whole)
				}, whole),
			isFaillure: composeFaillure(o.isFaillure, isFaillure),
			isCommand: isNever,
			command: inert,
		}
	}
}

export function optionalFrom<Micro, Part, Whole>({
	getter,
	setter,
}: {
	getter: (p: Part, w: Whole) => Micro | undefined
	setter: (m: Micro, p: Part, w: Whole) => Part
}) {
	return opticFrom({
		getter,
		setter,
		isFaillure: isUndefined,
	})
}

function whenFrom<Whole, Part>(p: (part: Part, whole: Whole) => unknown) {
	return optionalFrom<Part, Part, Whole>({
		getter: (part, whole) => (p(part, whole) ? part : undefined),
		setter: id,
	})
}

describe('simple', () => {
	type T = { index: string[]; items: { id: string; name: string }[] }
	const focus = flow(
		eq<T>(),
		prop('items'),
		elems(),
		whenFrom((part, whole) => whole.index.includes(part.id)),
		prop('name'),
	)
	test('view', () => {
		const source: T = {
			index: ['b', 'c', 'a'],
			items: [
				{ id: 'z', name: 'name z' },
				{ id: 'a', name: 'name a' },
				{ id: 'b', name: 'name b' },
			],
		}
		expect(view(focus)(source)).toEqual('name a')
	})
	test('fold', () => {
		const source: T = {
			index: ['b', 'c', 'a'],
			items: [
				{ id: 'z', name: 'name z' },
				{ id: 'a', name: 'name a' },
				{ id: 'b', name: 'name b' },
			],
		}
		expect(fold(focus)(toArray(), source)).toEqual(['name a', 'name b'])
	})
	test('put', () => {
		const source: T = {
			index: ['b', 'c', 'a'],
			items: [
				{ id: 'a', name: 'name a' },
				{ id: 'z', name: 'name z' },
				{ id: 'b', name: 'name b' },
			],
		}
		expect(put(focus, 'PUT')(source).items).toEqual([
			{ id: 'a', name: 'PUT' },
			{ id: 'z', name: 'name z' },
			{ id: 'b', name: 'PUT' },
		])
	})
	test('modify', () => {
		const source: T = {
			index: ['b', 'c', 'a'],
			items: [
				{ id: 'a', name: 'name a' },
				{ id: 'z', name: 'name z' },
				{ id: 'b', name: 'name b' },
			],
		}
		expect(modify(focus, (x) => x.toUpperCase())(source).items).toEqual([
			{ id: 'a', name: 'NAME A' },
			{ id: 'z', name: 'name z' },
			{ id: 'b', name: 'NAME B' },
		])
	})
})
