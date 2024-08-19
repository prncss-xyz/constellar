import { prop } from '@/extra'
import { flow } from '@constellar/utils'
import { describe, expect, it } from 'vitest'

import { active, eq, REMOVE } from '.'

const activateIs = active()

describe('activate', () => {
	describe('simple', () => {
		const focus = flow(eq<string>(), activateIs('titi'))
		it('view', () => {
			expect(focus.view('toto')).toEqual(false)
			expect(focus.view('titi')).toEqual(true)
		})
		it('put', () => {
			expect(focus.put(true)('toto')).toEqual('titi')
			expect(focus.put(false)('toto')).toEqual('toto')
		})
	})
	describe('array', () => {
		const actiateLength = active((a, b) => a.length === b.length)
		const focus = flow(eq<string[]>(), actiateLength([] as string[]))
		it('view', () => {
			expect(focus.view(['titi'])).toEqual(false)
			expect(focus.view([])).toEqual(true)
		})
		it('put', () => {
			expect(focus.put(true)(['toto'])).toEqual([])
			expect(focus.put(false)(['toto'])).toEqual(['toto'])
		})
	})
	describe('update', () => {
		const double = (x: number) => x * 2
		const focus = flow(eq<number>(), activateIs(double))
		it('view', () => {
			expect(focus.view(1)).toEqual(false)
			expect(focus.view(0)).toEqual(true)
		})
		it('put', () => {
			expect(focus.put(true)(1)).toEqual(2)
			expect(focus.put(false)(1)).toEqual(1)
		})
	})
	describe('removable', () => {
		type T = { a: string; b?: number }
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const focus = flow(eq<T>(), prop('b'), activateIs<any>(REMOVE))
		it('view', () => {
			expect(focus.view({ a: 'toto', b: 1 })).toEqual(false)
			expect(focus.view({ a: 'toto' })).toEqual(true)
		})
		it('put', () => {
			expect(focus.put(true)({ a: 'toto', b: 1 })).toEqual({ a: 'toto' })
			expect(focus.put(false)({ a: 'toto', b: 1 })).toEqual({ a: 'toto', b: 1 })
		})
	})
	describe('compose', () => {
		type T = { a: string }
		const focus = flow(eq<T>(), prop('a'), activateIs('titi'))
		it('view', () => {
			expect(focus.view({ a: 'toto' })).toEqual(false)
			expect(focus.view({ a: 'titi' })).toEqual(true)
		})
		it('put', () => {
			expect(focus.put(true)({ a: 'toto' })).toEqual({ a: 'titi' })
			expect(focus.put(false)({ a: 'toto' })).toEqual({ a: 'toto' })
		})
	})
})
