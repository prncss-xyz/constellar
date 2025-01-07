import { stack } from '.'
import { focus, REMOVE } from '../core'

describe('stack', () => {
	type Source = string[]
	const sourceDefined: Source = ['a', 'b', 'c']
	const sourceUndefined: Source = []
	const o = focus<string[]>()(stack())
	describe('view', () => {
		it('defined', () => {
			expect(o.view(sourceDefined)).toBe('c')
		})
		it('undefined', () => {
			expect(o.view(sourceUndefined)).toBeUndefined()
		})
	})
	describe('put', () => {
		it('defined', () => {
			expect(o.update('A')(sourceDefined)).toEqual(['a', 'b', 'c', 'A'])
		})
		it('undefined', () => {
			expect(o.update('A')(sourceUndefined)).toEqual(['A'])
		})
	})
	describe('remove', () => {
		it('defined', () => {
			expect(o.update(REMOVE)(sourceDefined)).toEqual(['a', 'b'])
		})
		it('undefined', () => {
			expect(o.update(REMOVE)(sourceUndefined)).toEqual(sourceUndefined)
		})
	})
})
