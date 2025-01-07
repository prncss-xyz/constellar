import { includes, rewrite } from '.'
import { pipe } from '../../utils'
import { focus } from '../core'

describe('includes', () => {
	const sourceDefined = ['a', 'b', 'c']
	const sourceUndefined = ['a', 'c']
	const o = focus<string[]>()(
		pipe(
			rewrite((x) => x.sort()),
			includes('b'),
		),
	)
	describe('view', () => {
		it('defined', () => {
			expect(o.view(sourceDefined)).toBeTruthy()
		})
		it('undefined', () => {
			expect(o.view(sourceUndefined)).toBeFalsy()
		})
	})
	describe('put', () => {
		it('defined, true', () => {
			expect(o.update(true)(sourceDefined)).toEqual(['a', 'b', 'c'])
		})
		it('defined, false', () => {
			expect(o.update(false)(sourceDefined)).toEqual(['a', 'c'])
		})
		it('undefined, true', () => {
			expect(o.update(true)(sourceUndefined)).toEqual(['a', 'b', 'c'])
		})
		it('undefined, false', () => {
			expect(o.update(false)(sourceUndefined)).toEqual(['a', 'c'])
		})
	})
})
