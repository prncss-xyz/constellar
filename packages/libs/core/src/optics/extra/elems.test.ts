import { elems, prop, when } from '.'
import { pipe } from '../../utils'
import { toArray, toFirst } from '../collections'
import { focus } from '../core'

describe('first element', () => {
	test('simple', () => {
		type Source = number[]
		const o = focus<Source>()(elems())
		expect(o.fold(toFirst(undefined), [1, 2, 3])).toEqual(1)
	})
	test('nested', () => {
		type Source = number[][]
		const o = focus<Source>()(pipe(elems(), elems()))
		expect(
			o.fold(toFirst(undefined), [
				[1, 2],
				[3, 4],
			]),
		).toEqual(1)
	})
})

describe('simple', () => {
	type Source = number[]
	const sourceDefined: Source = [1, 2, 3]
	const sourceUndefined: Source = []
	const cb = (x: number) => 2 * x
	const o = focus<Source>()(elems())

	it('view undefined', () => {
		expect(o.view(sourceUndefined)).toBeUndefined()
	})
	it('view defined', () => {
		expect(o.view(sourceDefined)).toBe(1)
	})
	it('fold undefined', () => {
		expect(o.fold(toArray(), sourceUndefined)).toEqual([])
	})
	it('fold defined', () => {
		expect(o.fold(toArray(), sourceDefined)).toEqual([1, 2, 3])
	})
	it('put undefined', () => {
		expect(o.update(9)(sourceUndefined)).toEqual(sourceUndefined)
	})
	it('put defined', () => {
		expect(o.update(8)(sourceDefined)).toEqual([8, 8, 8])
	})
	it('modify undefined', () => {
		expect(o.update(cb)(sourceUndefined)).toEqual(sourceUndefined)
	})
	it('modify defined', () => {
		expect(o.update(cb)(sourceDefined)).toEqual([2, 4, 6])
	})
})

describe('composed', () => {
	describe('prop-elements-prop', () => {
		type Source = { a: { c: number }[] }
		const source: Source = { a: [{ c: 1 }, { c: 2 }] }
		const o = focus<Source>()(pipe(prop('a'), elems(), prop('c')))
		it('fold', () => {
			expect(o.fold(toArray(), source)).toEqual([1, 2])
		})
		it('modify', () => {
			expect(o.update((x) => x * 2)(source)).toEqual({
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
		const o = focus<Source>()(pipe(elems(), elems()))
		it('fold', () => {
			expect(o.fold(toArray(), source)).toEqual([1, 2, 3, 4])
		})
		it('modify', () => {
			expect(o.update((x) => x * 2)(source)).toEqual([
				[2, 4],
				[6, 8],
			])
		})
	})
	describe('when', () => {
		it('fold', () => {
			type Source = string[]
			const source: Source = ['baz', 'quux', 'foo']
			const o = focus<Source>()(
				pipe(
					elems(),
					when((item) => item !== 'quux'),
				),
			)
			expect(o.fold(toArray(), source)).toEqual(['baz', 'foo'])
		})
		it('map', () => {
			type Source = string[]
			const source: Source = ['baz', 'quux', 'foo']
			const o = focus<Source>()(
				pipe(
					elems(),
					when((item) => item !== 'baz'),
				),
			)
			expect(o.update((x) => x.toUpperCase())(source)).toEqual([
				'baz',
				'QUUX',
				'FOO',
			])
		})
		it('fold', () => {
			type Source = string[]
			const source: Source = ['baz', 'quux', 'foo']
			const o = focus<Source>()(
				pipe(
					elems(),
					when((item) => item !== 'baz'),
				),
			)
			expect(o.fold(toArray(), source)).toEqual(['quux', 'foo'])
		})
		it('view', () => {
			type Source = string[]
			const source: Source = ['baz', 'quux', 'foo', 'baz']
			const o = focus<Source>()(
				pipe(
					elems(),
					when((item) => item !== 'baz'),
				),
			)
			expect(o.view(source)).toEqual('quux')
		})
		it('put', () => {
			type Source = string[]
			const source: Source = ['baz', 'quux', 'foo']
			const o = focus<Source>()(
				pipe(
					elems(),
					when((item) => item !== 'baz'),
				),
			)
			expect(o.update('toto')(source)).toEqual(['baz', 'toto', 'toto'])
		})
	})
})
