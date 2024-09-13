import { flow, isNever } from '../../utils'
import { Ctx, FoldForm } from '../collections'
import { eq, fold, inert, IOptic, view } from '../core'
import { elems, linear } from '../extra'

function toFold<Part, Acc>(form: FoldForm<Part, Acc, Ctx>) {
	return function <Whole, Fail, Command>(
		o: IOptic<Part, Whole, Fail, Command>,
	): IOptic<Acc, Whole, never, never> {
		return {
			getter: (whole) => fold(o)(form, whole),
			setter: inert,
			mapper: inert,
			refold: () => {
				throw new Error('not implemented')
			},
			/*
			refold:
				<A, Ctx>(fold: FoldFn<Part, Acc, Ctx>) =>
				(v: Whole, acc: Acc, ctx: Ctx) =>
					fold(getter(v) as any, acc, ctx),
        */
			isFaillure: isNever,
			isCommand: isNever,
			command: inert,
		}
	}
}

describe('toFold', () => {
	test('fold', () => {
		const focus = flow(
			eq<number[]>(),
			elems(),
			toFold({ init: 0, foldFn: (a, b) => a + b }),
			linear(3),
		)
		expect(view(focus)([1, 2, 3])).toBe(18)
	})
})
