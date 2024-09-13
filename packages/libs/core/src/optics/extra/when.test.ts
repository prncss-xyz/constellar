import { prop, when } from '.'
import { flow } from '../../utils'
import { eq, update, view } from '../core'

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
				expect(view(focus)(source1)).toBe(5)
			})
			it('undefined', () => {
				expect(view(focus)(source2)).toBeUndefined()
			})
		})
		describe('modify', () => {
			const opposite = (x: number) => -x
			it('defined', () => {
				expect(update(focus, opposite)(source1)).toEqual({ foo: -5 })
			})
			it('undefined', () => {
				expect(update(focus, opposite)(source2)).toEqual(source2)
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
				const res = view(focus)(sourceDefined)
				expectTypeOf(res).toEqualTypeOf<string | undefined>()
				expect(res).toBe('toto')
			})
			it('undefined', () => {
				const res = view(focus)(sourceUndefined)
				expectTypeOf(res).toEqualTypeOf<string | undefined>()
				expect(res).toBeUndefined()
			})
		})
	})
})
