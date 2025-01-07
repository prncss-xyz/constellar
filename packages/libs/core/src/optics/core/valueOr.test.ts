import { focus, valueOr } from '.'
import { pipe } from '../../utils'
import { toFirst } from '../collections'
import { elems, linear, prop } from '../extra'

describe('simple', () => {
	type T = { a: string; b?: number }
	const o = focus<T>()(pipe(prop('b'), valueOr(3)))
	test('view', () => {
		expect(o.view({ a: 'a' })).toEqual(3)
	})
	test('put', () => {
		expect(o.put(1, { a: 'a' })).toEqual({ a: 'a', b: 1 })
		expect(o.put(1, { a: 'a', b: 2 })).toEqual({ a: 'a', b: 1 })
	})
	test('modify', () => {
		expect(o.modify((x) => x + 1, { a: 'a' })).toEqual({ a: 'a', b: 4 })
		expect(o.modify((x) => x + 1, { a: 'a', b: 2 })).toEqual({
			a: 'a',
			b: 3,
		})
	})
})
describe('compose', () => {
	type T = { a: string; b?: number }
	const o = focus<T>()(pipe(prop('b'), valueOr(3), linear(2)))
	test('view', () => {
		expect(o.view({ a: 'a' })).toEqual(6)
		expect(o.view({ a: 'a', b: 1 })).toEqual(2)
	})
	test('put', () => {
		expect(o.put(2, { a: 'a' })).toEqual({ a: 'a', b: 1 })
		expect(o.put(2, { a: 'a', b: 2 })).toEqual({ a: 'a', b: 1 })
	})
	test('fold', () => {
		expect(o.fold(toFirst(undefined), { a: 'a' })).toEqual(6)
		expect(o.fold(toFirst(undefined), { a: 'a', b: 1 })).toEqual(2)
	})
})
describe('traversal', () => {
	it('should throw on traversals', () => {
		expect(() => {
			focus<number[]>()(pipe(elems(), valueOr(1)))
		}).toThrow("valueOr don't work with traversals")
	})
})
