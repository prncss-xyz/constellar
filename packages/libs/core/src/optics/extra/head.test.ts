import { head } from '.'
import { focus, REMOVE } from '../core'

describe('head', () => {
	type Source = string[]
	const sourceDefined: Source = ['a', 'b', 'c']
	const sourceUndefined: Source = []
	const o = focus<string[]>()(head())
	describe('view', () => {
		it('defined', () => {
			expect(o.view(sourceDefined)).toBe('a')
		})
		it('undefined', () => {
			expect(o.view(sourceUndefined)).toBeUndefined()
		})
	})
	describe('put', () => {
		it('defined', () => {
			expect(o.update('A')(sourceDefined)).toEqual(['A', 'a', 'b', 'c'])
		})
		it('undefined', () => {
			expect(o.update('A')(sourceUndefined)).toEqual(['A'])
		})
	})
	describe('remove', () => {
		it('defined', () => {
			expect(o.update(REMOVE)(sourceDefined)).toEqual(['b', 'c'])
		})
		it('undefined', () => {
			expect(o.update(REMOVE)(sourceUndefined)).toEqual(sourceUndefined)
		})
	})
})
