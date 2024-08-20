import { eq, update, view } from '@/core'
import { flow } from '@constellar/utils'

import { filter } from '.'

describe('filter', () => {
	it('view', () => {
		type Source = string[]
		const source: Source = ['baz', 'quux', 'xyzzy']
		const focus = flow(
			eq<Source>(),
			filter((item) => item !== 'quux'),
		)
		const res = view(focus)(source)
		expectTypeOf(res).toEqualTypeOf<string[]>()
		expect(res).toEqual(['baz', 'xyzzy'])
	})
	describe('put', () => {
		it('put the same numbers of items', () => {
			type Source = string[]
			const source: Source = ['baz', 'quux', 'xyzzy']
			const focus = flow(
				eq<Source>(),
				filter((item) => item !== 'quux'),
			)
			expect(update(focus, ['BAZ', 'XYZZY'])(source)).toEqual([
				'BAZ',
				'quux',
				'XYZZY',
			])
		})
		it('put fewer items', () => {
			type Item = number | string
			type Source = Item[]
			const source: Source = [1, 2, 3, 5, 6]
			const isOdd = (x: Item) => typeof x === 'number' && x % 2 === 1
			const focus = flow(eq<Source>(), filter(isOdd))
			const result = update(focus, ['foo', 'bar'])(source)
			expect(result).toEqual(['foo', 2, 'bar', 6])
		})
		it('put more items', () => {
			type Item = number | string
			type Source = Item[]
			const source: Source = [1, 2, 3, 5, 6]
			const isOdd = (x: Item) => typeof x === 'number' && x % 2 === 1
			const focus = flow(eq<Source>(), filter(isOdd))
			const result = update(focus, ['foo', 'bar', 'baz', 'quux', 'xyzzy'])(
				source,
			)
			expect(result).toEqual(['foo', 2, 'bar', 'baz', 6, 'quux', 'xyzzy'])
		})
	})
	describe('narrow type', () => {
		type Source = (string | number)[]
		function isString(x: unknown) {
			return typeof x === 'string'
		}
		const focus = flow(
			eq<Source>(),
			filter((x) => isString(x)),
		)
		const sourceDefined: Source = ['a', 3]
		it('view', () => {
			const res = view(focus)(sourceDefined)
			expectTypeOf(res).toEqualTypeOf<string[]>()
			expect(res).toEqual(['a'])
		})
	})
})
