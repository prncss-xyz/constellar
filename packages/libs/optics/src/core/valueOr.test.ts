import { linear, prop } from '@/extra'
import { flow } from '@constellar/utils'
import { describe, expect, it } from 'vitest'

import { eq, valueOr } from '.'

describe('simple', () => {
	type T = { a: string; b?: number }
	const focus = flow(eq<T>(), prop('b'), valueOr(3))
	it('view', () => {
		expect(focus.view({ a: 'a' })).toEqual(3)
		expect(focus.view({ a: 'a', b: 1 })).toEqual(1)
	})
	it('put', () => {
		expect(focus.put(1)({ a: 'a' })).toEqual({ a: 'a', b: 1 })
		expect(focus.put(1)({ a: 'a', b: 2 })).toEqual({ a: 'a', b: 1 })
	})
})
describe('compose', () => {
	type T = { a: string; b?: number }
	const focus = flow(eq<T>(), prop('b'), valueOr(3), linear(2))
	it('view', () => {
		expect(focus.view({ a: 'a' })).toEqual(6)
		expect(focus.view({ a: 'a', b: 1 })).toEqual(2)
	})
	it('put', () => {
		expect(focus.put(2)({ a: 'a' })).toEqual({ a: 'a', b: 1 })
		expect(focus.put(2)({ a: 'a', b: 2 })).toEqual({ a: 'a', b: 1 })
	})
})
