import { findMany } from '.'
import { flow } from '../../utils'
import { eq, update, view } from '../core'

describe('findMany', () => {
	it('view', () => {
		type Source = string[]
		const source: Source = ['baz', 'quux', 'foo']
		const focus = flow(
			eq<Source>(),
			findMany((item) => item !== 'quux'),
		)
		const res = view(focus)(source)
		expectTypeOf(res).toEqualTypeOf<string[]>()
		expect(res).toEqual(['baz', 'foo'])
	})
	describe('put', () => {
		it('put the same numbers of items', () => {
			type Source = string[]
			const source: Source = ['baz', 'quux', 'foo']
			const focus = flow(
				eq<Source>(),
				findMany((item) => item !== 'quux'),
			)
			expect(update(focus, ['BAZ', 'FOO'])(source)).toEqual([
				'BAZ',
				'quux',
				'FOO',
			])
		})
		it('put fewer items', () => {
			type Item = number | string
			type Source = Item[]
			const source: Source = [1, 2, 3, 5, 6]
			const isOdd = (x: Item) => typeof x === 'number' && x % 2 === 1
			const focus = flow(eq<Source>(), findMany(isOdd))
			const result = update(focus, ['foo', 'bar'])(source)
			expect(result).toEqual(['foo', 2, 'bar', 6])
		})
		it('put more items', () => {
			type Item = number | string
			type Source = Item[]
			const source: Source = [1, 2, 3, 5, 6]
			const isOdd = (x: Item) => typeof x === 'number' && x % 2 === 1
			const focus = flow(eq<Source>(), findMany(isOdd))
			const result = update(focus, ['foo', 'bar', 'baz', 'quux', 'foo'])(source)
			expect(result).toEqual(['foo', 2, 'bar', 'baz', 6, 'quux', 'foo'])
		})
	})
	describe('narrow type', () => {
		type Source = (number | string)[]
		function isString(x: unknown) {
			return typeof x === 'string'
		}
		const focus = flow(
			eq<Source>(),
			findMany((x) => isString(x)),
		)
		const sourceDefined: Source = ['a', 3]
		it('view', () => {
			const res = view(focus)(sourceDefined)
			expectTypeOf(res).toEqualTypeOf<string[]>()
			expect(res).toEqual(['a'])
		})
	})
})
