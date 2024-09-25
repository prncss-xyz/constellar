import { flow, isNever } from '../../utils'
import { Ctx, FoldForm } from '../collections'
import { eq, fold, inert, IOptic, view } from '../core'
import { elems, linear } from '../extra'

function toFold<Part, Acc>(form: FoldForm<Part, Acc, Ctx>) {
	return function <Whole, Fail, Command>(
		o: IOptic<Part, Whole, Fail, Command>,
	): IOptic<Acc, Whole, never, never> {
		return {
			command: inert,
			getter: (whole) => fold(o)(form, whole),
			isCommand: isNever,
			/*
			refold:
				<A, Ctx>(fold: FoldFn<Part, Acc, Ctx>) =>
				(v: Whole, acc: Acc, ctx: Ctx) =>
					fold(getter(v) as any, acc, ctx),
        */
			isFailure: isNever,
			mapper: inert,
			refold: () => {
				throw new Error('not implemented')
			},
			setter: inert,
		}
	}
}

describe('toFold', () => {
	test('fold', () => {
		const focus = flow(
			eq<number[]>(),
			elems(),
			toFold({ foldFn: (a, b) => a + b, init: 0 }),
			linear(3),
		)
		expect(view(focus)([1, 2, 3])).toBe(18)
	})
})
