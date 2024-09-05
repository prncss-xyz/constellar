import { flow } from '@constellar/utils'

import { active, eq, REMOVE, update, view } from '.'
import { prop } from '../extra'

describe('activate', () => {
	describe('simple', () => {
		const focus = flow(eq<string>(), active('titi'))
		it('view', () => {
			expect(view(focus)('toto')).toEqual(false)
			expect(view(focus)('titi')).toEqual(true)
		})
		it('put', () => {
			expect(update(focus, true)('toto')).toEqual('titi')
			expect(update(focus, false)('toto')).toEqual('toto')
		})
	})
	describe('array', () => {
		function sameLength(a: unknown[], b: unknown[]) {
			return a.length === b.length
		}
		const focus = flow(eq<string[]>(), active([] as string[], sameLength))
		it('view', () => {
			expect(view(focus)(['titi'])).toEqual(false)
			expect(view(focus)([])).toEqual(true)
		})
		it('put', () => {
			expect(update(focus, true)(['toto'])).toEqual([])
			expect(update(focus, false)(['toto'])).toEqual(['toto'])
		})
	})
	describe('update', () => {
		const double = (x: number) => x * 2
		const focus = flow(eq<number>(), active(double))
		it('view', () => {
			expect(view(focus)(1)).toEqual(false)
			expect(view(focus)(0)).toEqual(true)
		})
		it('put', () => {
			expect(update(focus, true)(1)).toEqual(2)
			expect(update(focus, false)(1)).toEqual(1)
		})
	})
	describe('removable', () => {
		type T = { a: string; b?: number }
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const focus = flow(eq<T>(), prop('b'), active<any>(REMOVE))
		it('view', () => {
			expect(view(focus)({ a: 'toto', b: 1 })).toEqual(false)
			expect(view(focus)({ a: 'toto' })).toEqual(true)
		})
		it('put', () => {
			expect(update(focus, true)({ a: 'toto', b: 1 })).toEqual({ a: 'toto' })
			expect(update(focus, false)({ a: 'toto', b: 1 })).toEqual({
				a: 'toto',
				b: 1,
			})
		})
	})
	describe('compose', () => {
		type T = { a: string }
		const focus = flow(eq<T>(), prop('a'), active('titi'))
		it('view', () => {
			expect(view(focus)({ a: 'toto' })).toEqual(false)
			expect(view(focus)({ a: 'titi' })).toEqual(true)
		})
		it('put', () => {
			expect(update(focus, true)({ a: 'toto' })).toEqual({ a: 'titi' })
			expect(update(focus, false)({ a: 'toto' })).toEqual({ a: 'toto' })
		})
	})
})
