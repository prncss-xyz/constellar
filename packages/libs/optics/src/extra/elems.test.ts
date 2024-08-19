import { eq } from '@/core/index.ts'
import { collect, flow } from '@constellar/utils'

import { elems, prop, when } from './index.ts'

describe('simple', () => {
	type Source = number[]
	const sourceDefined: Source = [1, 2, 3]
	const sourceUndefined: Source = []
	const cb = (x: number) => 2 * x
	const focus = flow(eq<Source>(), elems())

	it.skip('view undefined', () => {
		expect(focus.view(sourceUndefined)).toBeUndefined()
	})
	it.skip('view defined', () => {
		expect(focus.view(sourceDefined)).toBe(1)
	})
	it('fold undefined', () => {
		expect(focus.fold(collect())(sourceUndefined)).toEqual([])
	})
	it('fold defined', () => {
		expect(focus.fold(collect())(sourceDefined)).toEqual([1, 2, 3])
	})
	it.skip('put undefined', () => {
		expect(focus.put(9)(sourceUndefined)).toEqual(sourceUndefined)
	})
	it.skip('put defined', () => {
		expect(focus.put(8)(sourceDefined)).toEqual([8, 8, 8])
	})
	it('modify undefined', () => {
		expect(focus.modify(cb)(sourceUndefined)).toEqual(sourceUndefined)
	})
	it('modify defined', () => {
		expect(focus.modify(cb)(sourceDefined)).toEqual([2, 4, 6])
	})
})

describe('composed', () => {
	describe('prop-elemets-prop', () => {
		type Source = { a: { c: number }[] }
		const source: Source = { a: [{ c: 1 }, { c: 2 }] }
		const focus = flow(eq<Source>(), prop('a'), elems(), prop('c'))
		it('fold', () => {
			expect(focus.fold(collect())(source)).toEqual([1, 2])
		})
		it('modify', () => {
			expect(focus.modify((x) => x * 2)(source)).toEqual({
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
			expect(focus.fold(collect())(source)).toEqual([1, 2, 3, 4])
		})
		it('modify', () => {
			expect(focus.modify((x) => x * 2)(source)).toEqual([
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
			expect(focus.fold(collect())(source)).toEqual(['baz', 'xyzzy'])
		})
		it('map', () => {
			type Source = string[]
			const source: Source = ['baz', 'quux', 'xyzzy']
			const focus = flow(
				eq<Source>(),
				elems(),
				when((item) => item !== 'quux'),
			)
			expect(focus.modify((x) => x.toUpperCase())(source)).toEqual([
				'BAZ',
				'quux',
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
			expect(focus.fold(collect())(source)).toEqual(['quux', 'xyzzy'])
		})
		it.skip('view', () => {
			type Source = string[]
			const source: Source = ['baz', 'quux', 'xyzzy', 'baz']
			const focus = flow(
				eq<Source>(),
				elems(),
				when((item) => item !== 'baz'),
			)
			expect(focus.view(source)).toEqual('quux')
		})
		it.skip('put', () => {
			type Source = string[]
			const source: Source = ['baz', 'quux', 'xyzzy']
			const focus = flow(
				eq<Source>(),
				elems(),
				when((item) => item !== 'baz'),
			)
			expect(focus.put('toto')(source)).toEqual(['baz', 'toto', 'toto'])
		})
	})
})
