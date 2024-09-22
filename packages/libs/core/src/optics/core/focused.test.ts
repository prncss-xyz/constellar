// exploring how to compose optics
import { eq, Focus, IOptic, optic, view } from '.'
import { flow } from '../../utils'
import { prop } from '../extra'

export function focused<Whole, Part, Fail, Command>(
	focus: IOptic<Part, Whole, Fail, Command>,
) {
	return optic(focus)
}

export function focused2<Whole, Part, Fail, Command>(
	focus: Focus<Part, Whole, Fail, Command>,
) {
	return optic(focus(eq<Whole>()))
}

describe('focused', () => {
	type T = { a: string; b: { c: number } }
	type U = { c: number }
	const focus2 = flow(eq<U>(), prop('c'))
	const focus3 = flow(eq<T>(), prop('b'), focused(focus2))
	const focus4 = flow(eq<T>(), prop('b'), focused2(prop('c')))
	test('view', () => {
		expect(view(focus3)({ a: 'a', b: { c: 1 } })).toEqual(1)
		expect(view(focus4)({ a: 'a', b: { c: 1 } })).toEqual(1)
	})
})
