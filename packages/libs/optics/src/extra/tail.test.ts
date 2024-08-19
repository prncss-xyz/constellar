import { eq, REMOVE } from '@/core'
import { flow } from '@constellar/utils'

import { tail } from '.'

describe('tail', () => {
	type Source = string[]
	const sourceDefined: Source = ['a', 'b', 'c']
	const sourceEmpty: Source = ['a']
	const sourceUndefined: Source = []
	const focus = flow(eq<string[]>(), tail())
	describe('view', () => {
		it('defined', () => {
			expect(focus.view(sourceDefined)).toEqual(['b', 'c'])
		})
		it('empty', () => {
			expect(focus.view(sourceEmpty)).toEqual([])
		})
		it('undefined', () => {
			expect(focus.view(sourceUndefined)).toBeUndefined()
		})
	})
	describe('put', () => {
		it('defined', () => {
			expect(focus.put(['P', 'Q'])(sourceDefined)).toEqual(['a', 'P', 'Q'])
		})
		it('empty', () => {
			expect(focus.put(['P', 'Q'])(sourceEmpty)).toEqual(['a', 'P', 'Q'])
		})
		it('undefined', () => {
			expect(focus.put(['P', 'Q'])(sourceUndefined)).toEqual([])
		})
	})
	describe('remove', () => {
		it('defined', () => {
			expect(focus.command(REMOVE)(sourceDefined)).toEqual(['a'])
		})
		it('empty', () => {
			expect(focus.command(REMOVE)(sourceEmpty)).toEqual(['a'])
		})
		it('undefined', () => {
			expect(focus.command(REMOVE)(sourceUndefined)).toEqual(sourceUndefined)
		})
	})
})
