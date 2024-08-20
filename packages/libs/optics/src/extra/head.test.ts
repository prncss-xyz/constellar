import { eq, REMOVE, update, view } from '@/core'
import { flow } from '@constellar/utils'

import { head } from '.'

describe('head', () => {
	type Source = string[]
	const sourceDefined: Source = ['a', 'b', 'c']
	const sourceUndefined: Source = []
	const focus = flow(eq<string[]>(), head())
	describe('view', () => {
		it('defined', () => {
			expect(view(focus)(sourceDefined)).toBe('a')
		})
		it('undefined', () => {
			expect(view(focus)(sourceUndefined)).toBeUndefined()
		})
	})
	describe('put', () => {
		it('defined', () => {
			expect(update(focus, 'A')(sourceDefined)).toEqual(['A', 'a', 'b', 'c'])
		})
		it('undefined', () => {
			expect(update(focus, 'A')(sourceUndefined)).toEqual(['A'])
		})
	})
	describe('remove', () => {
		it('defined', () => {
			expect(update(focus, REMOVE)(sourceDefined)).toEqual(['b', 'c'])
		})
		it('undefined', () => {
			expect(update(focus, REMOVE)(sourceUndefined)).toEqual(sourceUndefined)
		})
	})
})
