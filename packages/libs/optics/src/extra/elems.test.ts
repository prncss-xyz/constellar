import { eq, fold, update, view } from '@/core/index.ts'
import { collect, flow } from '@constellar/utils'

import { elems, prop, when } from './index.ts'

describe('simple', () => {
	type Source = number[]
	const sourceDefined: Source = [1, 2, 3]
	const sourceUndefined: Source = []
	const cb = (x: number) => 2 * x
	const focus = flow(eq<Source>(), elems())

	it('view undefined', () => {
		expect(view(focus)(sourceUndefined)).toBeUndefined()
	})
	it('view defined', () => {
		expect(view(focus)(sourceDefined)).toBe(1)
	})
	it('fold undefined', () => {
		expect(fold(focus, collect())(sourceUndefined)).toEqual([])
	})
	it('fold defined', () => {
		expect(fold(focus, collect())(sourceDefined)).toEqual([1, 2, 3])
	})
	it('put undefined', () => {
		expect(update(focus, 9)(sourceUndefined)).toEqual(sourceUndefined)
	})
	it('put defined', () => {
		expect(update(focus, 8)(sourceDefined)).toEqual([8, 8, 8])
	})
	it('modify undefined', () => {
		expect(update(focus, cb)(sourceUndefined)).toEqual(sourceUndefined)
	})
	it('modify defined', () => {
		expect(update(focus, cb)(sourceDefined)).toEqual([2, 4, 6])
	})
})

describe('composed', () => {
	describe('prop-elemets-prop', () => {
		type Source = { a: { c: number }[] }
		const source: Source = { a: [{ c: 1 }, { c: 2 }] }
		const focus = flow(eq<Source>(), prop('a'), elems(), prop('c'))
		it('fold', () => {
			expect(fold(focus, collect())(source)).toEqual([1, 2])
		})
		it('modify', () => {
			expect(update(focus, (x) => x * 2)(source)).toEqual({
				a: [{ c: 2 }, { c: 4 }],
			})
		})
	})
	describe('nested elements', () => {
		type Source = number[][]
		const source: Source = [
			[1, 2],
			[3, 4],
		]
		const focus = flow(eq<Source>(), elems(), elems())
		it('fold', () => {
			expect(fold(focus, collect())(source)).toEqual([1, 2, 3, 4])
		})
		it('modify', () => {
			expect(update(focus, (x) => x * 2)(source)).toEqual([
				[2, 4],
				[6, 8],
			])
		})
	})
	describe('when', () => {
		it('fold', () => {
			type Source = string[]
			const source: Source = ['baz', 'quux', 'xyzzy']
			const focus = flow(
				eq<Source>(),
				elems(),
				when((item) => item !== 'quux'),
			)
			expect(fold(focus, collect())(source)).toEqual(['baz', 'xyzzy'])
		})
		it('map', () => {
			type Source = string[]
			const source: Source = ['baz', 'quux', 'xyzzy']
			const focus = flow(
				eq<Source>(),
				elems(),
				when((item) => item !== 'baz'),
			)
			expect(update(focus, (x) => x.toUpperCase())(source)).toEqual([
				'baz',
				'QUUX',
				'XYZZY',
			])
		})
		it('fold', () => {
			type Source = string[]
			const source: Source = ['baz', 'quux', 'xyzzy']
			const focus = flow(
				eq<Source>(),
				elems(),
				when((item) => item !== 'baz'),
			)
			expect(fold(focus, collect())(source)).toEqual(['quux', 'xyzzy'])
		})
		it('view', () => {
			type Source = string[]
			const source: Source = ['baz', 'quux', 'xyzzy', 'baz']
			const focus = flow(
				eq<Source>(),
				elems(),
				when((item) => item !== 'baz'),
			)
			expect(view(focus)(source)).toEqual('quux')
		})
		it('put', () => {
			type Source = string[]
			const source: Source = ['baz', 'quux', 'xyzzy']
			const focus = flow(
				eq<Source>(),
				elems(),
				when((item) => item !== 'baz'),
			)
			expect(update(focus, 'toto')(source)).toEqual(['baz', 'toto', 'toto'])
		})
	})
})
