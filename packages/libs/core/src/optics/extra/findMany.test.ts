import { findMany } from '.'
import { pipe } from '../../utils'
import { focus } from '../core'

describe('findMany', () => {
	it('view', () => {
		type Source = string[]
		const source: Source = ['baz', 'quux', 'foo']
		const o = focus<Source>()(findMany((item) => item !== 'quux'))
		const res = o.view(source)
		expectTypeOf(res).toEqualTypeOf<string[]>()
		expect(res).toEqual(['baz', 'foo'])
	})
	describe('put', () => {
		it('preserves reference when possible', () => {
			type Source = string[]
			const source: Source = ['baz', 'quux', 'foo']
			const o = focus<Source>()(pipe(findMany((item) => item !== 'quux')))
			expect(o.update(['baz', 'foo'])(source)).toBe(source)
		})
		it('put the same numbers of items', () => {
			type Source = string[]
			const source: Source = ['baz', 'quux', 'foo']
			const o = focus<Source>()(pipe(findMany((item) => item !== 'quux')))
			expect(o.update(['BAZ', 'FOO'])(source)).toEqual(['BAZ', 'quux', 'FOO'])
		})
		it('put zero items', () => {
			type Source = string[]
			const source: Source = ['foo', '', 'bar']
			const o = focus<Source>()(pipe(findMany((s) => s.length > 0)))
			const result = o.update([])(source)
			expect(result).toEqual([''])
		})
	})
	it('put fewer items', () => {
		type Item = number | string
		type Source = Item[]
		const source: Source = [1, 2, 3, 5, 6]
		const isOdd = (x: Item) => typeof x === 'number' && x % 2 === 1
		const o = focus<Source>()(findMany(isOdd))
		const result = o.update(['foo', 'bar'])(source)
		expect(result).toEqual(['foo', 2, 'bar', 6])
	})
	it('put more items', () => {
		type Item = number | string
		type Source = Item[]
		const source: Source = [1, 2, 3, 5, 6]
		const isOdd = (x: Item) => typeof x === 'number' && x % 2 === 1
		const o = focus<Source>()(findMany(isOdd))
		const result = o.update(['foo', 'bar', 'baz', 'quux', 'foo'])(source)
		expect(result).toEqual(['foo', 2, 'bar', 'baz', 6, 'quux', 'foo'])
	})
	describe('narrow type', () => {
		type Source = (number | string)[]
		function isString(x: unknown) {
			return typeof x === 'string'
		}
		const o = focus<Source>()(findMany((x) => isString(x)))
		const sourceDefined: Source = ['a', 3]
		it('view', () => {
			const res = o.view(sourceDefined)
			expectTypeOf(res).toEqualTypeOf<string[]>()
			expect(res).toEqual(['a'])
		})
	})
})
