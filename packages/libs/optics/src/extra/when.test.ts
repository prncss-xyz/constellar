import { eq } from '@/core'
import { flow } from '@constellar/utils'

import { prop, when } from '.'

describe('when', () => {
	describe('filter elements', () => {
		type Source = { foo: number }
		const source1 = { foo: 5 }
		const source2 = { foo: 15 }
		const focus = flow(
			eq<Source>(),
			prop('foo'),
			when((x) => x < 10),
		)
		describe('view', () => {
			it('defined', () => {
				expect(focus.view(source1)).toBe(5)
			})
			it('undefined', () => {
				expect(focus.view(source2)).toBeUndefined()
			})
		})
		describe('modify', () => {
			const opposite = (x: number) => -x
			it('defined', () => {
				expect(focus.modify(opposite)(source1)).toEqual({ foo: -5 })
			})
			it('undefined', () => {
				expect(focus.modify(opposite)(source2)).toEqual(source2)
			})
		})
	})
	describe('narrow type', () => {
		type Source = string | number
		function isString(x: unknown) {
			return typeof x === 'string'
		}
		const focus = flow(
			eq<Source>(),
			when((x) => isString(x)),
		)
		const sourceDefined: Source = 'toto'
		const sourceUndefined: Source = 5
		describe('view', () => {
			it('defined', () => {
				const res = focus.view(sourceDefined)
				expectTypeOf(res).toEqualTypeOf<string | undefined>()
				expect(res).toBe('toto')
			})
			it('undefined', () => {
				const res = focus.view(sourceUndefined)
				expectTypeOf(res).toEqualTypeOf<string | undefined>()
				expect(res).toBeUndefined()
			})
		})
	})
})
