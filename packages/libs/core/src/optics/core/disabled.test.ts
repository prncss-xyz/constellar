import { disabled, focus, REMOVE } from '.'
import { pipe } from '../../utils'
import { findMany, prop } from '../extra'

describe('disabled', () => {
	describe('simple', () => {
		const o = focus<string>()(disabled('titi'))
		it('view', () => {
			expect(o.view('toto')).toEqual(false)
			expect(o.view('titi')).toEqual(true)
		})
		it('put', () => {
			expect(o.update(true)('toto')).toEqual('titi')
			expect(o.update(false)('toto')).toEqual('toto')
		})
	})
	describe('array', () => {
		const zeroLength: string[] = []
		const o = focus<string[]>()(
			pipe(
				findMany(() => true),
				disabled(zeroLength),
			),
		)
		test('view, false', () => {
			expect(o.view(['titi'])).toEqual(false)
		})
		test('view, true', () => {
			expect(o.view([])).toEqual(true)
		})
		test('put, false', () => {
			expect(o.update(false)(['toto'])).toEqual(['toto'])
		})
		test('put, true', () => {
			expect(o.update(true)(['toto'])).toEqual([])
		})
	})
	describe('update', () => {
		const double = (x: number) => x * 2
		const o = focus<number>()(disabled(double))
		it('view', () => {
			expect(o.view(1)).toEqual(false)
			expect(o.view(0)).toEqual(true)
		})
		it('put', () => {
			expect(o.update(true)(1)).toEqual(2)
			expect(o.update(false)(1)).toEqual(1)
		})
	})
	describe('removable', () => {
		type T = { a: string; b?: number }
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const o = focus<T>()(pipe(prop('b'), disabled<any>(REMOVE)))
		it('view', () => {
			expect(o.view({ a: 'toto', b: 1 })).toEqual(false)
			expect(o.view({ a: 'toto' })).toEqual(true)
		})
		it('put', () => {
			expect(o.update(true)({ a: 'toto', b: 1 })).toEqual({ a: 'toto' })
			expect(o.update(false)({ a: 'toto', b: 1 })).toEqual({
				a: 'toto',
				b: 1,
			})
		})
	})
	describe('compose', () => {
		type T = { a: string }
		const o = focus<T>()(pipe(prop('a'), disabled('titi')))
		it('view', () => {
			expect(o.view({ a: 'toto' })).toEqual(false)
			expect(o.view({ a: 'titi' })).toEqual(true)
		})
		it('put', () => {
			expect(o.update(true)({ a: 'toto' })).toEqual({ a: 'titi' })
			expect(o.update(false)({ a: 'toto' })).toEqual({ a: 'toto' })
		})
	})
})
