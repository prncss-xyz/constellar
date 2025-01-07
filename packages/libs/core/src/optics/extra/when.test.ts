import { prop, when } from '.'
import { pipe } from '../../utils'
import { focus } from '../core'

describe('when', () => {
	describe('filter elements', () => {
		type Source = { foo: number }
		const source1 = { foo: 5 }
		const source2 = { foo: 15 }
		const o = focus<Source>()(
			pipe(
				prop('foo'),
				when((x) => x < 10),
			),
		)
		describe('view', () => {
			it('defined', () => {
				expect(o.view(source1)).toBe(5)
			})
			it('undefined', () => {
				expect(o.view(source2)).toBeUndefined()
			})
		})
		describe('modify', () => {
			const opposite = (x: number) => -x
			it('defined', () => {
				expect(o.update(opposite)(source1)).toEqual({ foo: -5 })
			})
			it('undefined', () => {
				expect(o.update(opposite)(source2)).toEqual(source2)
			})
		})
	})
	describe('narrow type', () => {
		type Source = number | string
		function isString(x: unknown) {
			return typeof x === 'string'
		}
		const o = focus<Source>()(when((x) => isString(x)))
		const sourceDefined: Source = 'toto'
		const sourceUndefined: Source = 5
		describe('view', () => {
			it('defined', () => {
				const res = o.view(sourceDefined)
				expectTypeOf(res).toEqualTypeOf<string | undefined>()
				expect(res).toBe('toto')
			})
			it('undefined', () => {
				const res = o.view(sourceUndefined)
				expectTypeOf(res).toEqualTypeOf<string | undefined>()
				expect(res).toBeUndefined()
			})
		})
	})
})
