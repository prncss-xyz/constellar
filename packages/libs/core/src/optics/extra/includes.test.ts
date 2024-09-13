import { includes, rewrite } from '.'
import { flow } from '../../utils'
import { eq, update, view } from '../core'

describe('strToNum', () => {
	const sourceDefined = ['a', 'b', 'c']
	const sourceUndefined = ['a', 'c']
	const focus = flow(
		eq<string[]>(),
		rewrite((x) => x.sort()),
		includes('b'),
	)
	describe('view', () => {
		it('defined', () => {
			expect(view(focus)(sourceDefined)).toBeTruthy()
		})
		it('undefined', () => {
			expect(view(focus)(sourceUndefined)).toBeFalsy()
		})
	})
	describe('put', () => {
		it('defined, true', () => {
			expect(update(focus, true)(sourceDefined)).toEqual(['a', 'b', 'c'])
		})
		it('defined, false', () => {
			expect(update(focus, false)(sourceDefined)).toEqual(['a', 'c'])
		})
		it('undefined, true', () => {
			expect(update(focus, true)(sourceUndefined)).toEqual(['a', 'b', 'c'])
		})
		it('undefined, false', () => {
			expect(update(focus, false)(sourceUndefined)).toEqual(['a', 'c'])
		})
	})
})
