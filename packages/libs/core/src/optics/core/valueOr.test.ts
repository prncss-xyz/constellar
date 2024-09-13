import { eq, fold, modify, put, valueOr, view } from '.'
import { flow } from '../../utils'
import { toFirst } from '../collections'
import { elems, linear, prop } from '../extra'

describe('simple', () => {
	type T = { a: string; b?: number }
	const focus = flow(eq<T>(), prop('b'), valueOr(3))
	test('view', () => {
		expect(view(focus)({ a: 'a' })).toEqual(3)
		expect(view(focus)({ a: 'a', b: 1 })).toEqual(1)
	})
	test('put', () => {
		expect(put(focus, 1)({ a: 'a' })).toEqual({ a: 'a', b: 1 })
		expect(put(focus, 1)({ a: 'a', b: 2 })).toEqual({ a: 'a', b: 1 })
	})
	test('modify', () => {
		expect(modify(focus, (x) => x + 1)({ a: 'a' })).toEqual({ a: 'a', b: 4 })
		expect(modify(focus, (x) => x + 1)({ a: 'a', b: 2 })).toEqual({
			a: 'a',
			b: 3,
		})
	})
})
describe('compose', () => {
	type T = { a: string; b?: number }
	const focus = flow(eq<T>(), prop('b'), valueOr(3), linear(2))
	test('view', () => {
		expect(view(focus)({ a: 'a' })).toEqual(6)
		expect(view(focus)({ a: 'a', b: 1 })).toEqual(2)
	})
	test('put', () => {
		expect(put(focus, 2)({ a: 'a' })).toEqual({ a: 'a', b: 1 })
		expect(put(focus, 2)({ a: 'a', b: 2 })).toEqual({ a: 'a', b: 1 })
	})
	test('fold', () => {
		expect(fold(focus)(toFirst(undefined), { a: 'a' })).toEqual(6)
		expect(fold(focus)(toFirst(undefined), { a: 'a', b: 1 })).toEqual(2)
	})
})
describe('traversal', () => {
	it('should throw on traversals', () => {
		expect(() => {
			flow(eq<number[]>(), elems(), valueOr(1))
		}).toThrow("valueOr don't work with traversals")
	})
})
