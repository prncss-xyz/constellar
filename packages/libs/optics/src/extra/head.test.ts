import { eq, REMOVE } from '@/core'
import { flow } from '@constellar/utils'

import { head } from '.'

describe('head', () => {
	type Source = string[]
	const sourceDefined: Source = ['a', 'b', 'c']
	const sourceUndefined: Source = []
	const focus = flow(eq<string[]>(), head())
	describe('view', () => {
		it('defined', () => {
			expect(focus.view(sourceDefined)).toBe('a')
		})
		it('undefined', () => {
			expect(focus.view(sourceUndefined)).toBeUndefined()
		})
	})
	describe('put', () => {
		it('defined', () => {
			expect(focus.put('A')(sourceDefined)).toEqual(['A', 'a', 'b', 'c'])
		})
		it('undefined', () => {
			expect(focus.put('A')(sourceUndefined)).toEqual(['A'])
		})
	})
	describe('remove', () => {
		it('defined', () => {
			expect(focus.command(REMOVE)(sourceDefined)).toEqual(['b', 'c'])
		})
		it('undefined', () => {
			expect(focus.command(REMOVE)(sourceUndefined)).toEqual(sourceUndefined)
		})
	})
})
