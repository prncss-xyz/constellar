import { eq } from '@/core'
import { flow } from '@constellar/utils'

import { includes, rewrite } from '.'

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
			expect(focus.view(sourceDefined)).toBeTruthy()
		})
		it('undefined', () => {
			expect(focus.view(sourceUndefined)).toBeFalsy()
		})
	})
	describe('put', () => {
		it('defined, true', () => {
			expect(focus.put(true)(sourceDefined)).toEqual(['a', 'b', 'c'])
		})
		it('defined, false', () => {
			expect(focus.put(false)(sourceDefined)).toEqual(['a', 'c'])
		})
		it('undefined, true', () => {
			expect(focus.put(true)(sourceUndefined)).toEqual(['a', 'b', 'c'])
		})
		it('undefined, false', () => {
			expect(focus.put(false)(sourceUndefined)).toEqual(['a', 'c'])
		})
	})
})
