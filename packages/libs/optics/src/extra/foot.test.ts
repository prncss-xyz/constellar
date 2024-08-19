import { eq, REMOVE } from '@/core'
import { flow } from '@constellar/utils'

import { foot } from '.'

describe('foot', () => {
	type Source = string[]
	const sourceDefined: Source = ['a', 'b', 'c']
	const sourceUndefined: Source = []
	const focus = flow(eq<string[]>(), foot())
	describe('view', () => {
		it('defined', () => {
			expect(focus.view(sourceDefined)).toBe('c')
		})
		it('undefined', () => {
			expect(focus.view(sourceUndefined)).toBeUndefined()
		})
	})
	describe('put', () => {
		it('defined', () => {
			expect(focus.put('A')(sourceDefined)).toEqual(['a', 'b', 'c', 'A'])
		})
		it('undefined', () => {
			expect(focus.put('A')(sourceUndefined)).toEqual(['A'])
		})
	})
	describe('remove', () => {
		it('defined', () => {
			expect(focus.command(REMOVE)(sourceDefined)).toEqual(['a', 'b'])
		})
		it('undefined', () => {
			expect(focus.command(REMOVE)(sourceUndefined)).toEqual(sourceUndefined)
		})
	})
})
