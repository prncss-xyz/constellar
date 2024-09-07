import { Ctx, ctxNull, FoldFn, FoldForm, Refold, toValue } from '@/collections'
import { elems } from '@/extra'
import {
	flow,
	fromInit,
	id,
	Init,
	isFunction,
	isNever,
	pipe2,
} from '@constellar/utils'

import { eq, fold, inert, IOptic, view } from '.'

type ModForm<P, Q> = <Part, C>(
	form: FoldForm<Part, P, C>,
) => FoldForm<Part, Q, C>

/*
export function map<P, Q>(f: (p: Q) => P) {
	return function <Part, C>(form: FoldForm<Part, Q, C>) {
		const init = form.init
		return {
			init: isFunction(init) ? pipe2(init, f) : f(init),
			foldFn: (p: Part, acc: P, ctx: C) => form.foldFn(p, f(acc), ctx),
		}
	}
}

describe('fold', () => {
	test('fold', () => {
		const focus = flow(eq<string[]>(), elems())
		expect(
			fold(focus)(
				flow(
					toValue(0),
					map((x) => x.length),
				),
				['a', 'bb'],
			),
		).toBe(2)
	})
})
*/
