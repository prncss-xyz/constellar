import { linear, prop } from '@/extra'
import { first, flow } from '@constellar/utils'

import { eq, fold, put, valueOr, view } from '.'

describe('simple', () => {
	type T = { a: string; b?: number }
	const focus = flow(eq<T>(), prop('b'), valueOr(3))
	test('view', () => {
		expect(view(focus)({ a: 'a' })).toEqual(3)
		expect(view(focus)({ a: 'a', b: 1 })).toEqual(1)
	})
	test('put', () => {
		expect(put(focus, 1)({ a: 'a' })).toEqual({ a: 'a', b: 1 })
		expect(put(focus, 1)({ a: 'a', b: 2 })).toEqual({ a: 'a', b: 1 })
	})
})
describe('compose', () => {
	type T = { a: string; b?: number }
	const focus = flow(eq<T>(), prop('b'), valueOr(3), linear(2))
	test('view', () => {
		expect(view(focus)({ a: 'a' })).toEqual(6)
		expect(view(focus)({ a: 'a', b: 1 })).toEqual(2)
	})
	test('put', () => {
		expect(put(focus, 2)({ a: 'a' })).toEqual({ a: 'a', b: 1 })
		expect(put(focus, 2)({ a: 'a', b: 2 })).toEqual({ a: 'a', b: 1 })
	})
	test('fold', () => {
		expect(fold(focus, first())({ a: 'a' })).toEqual(6)
		expect(fold(focus, first())({ a: 'a', b: 1 })).toEqual(2)
	})
})
