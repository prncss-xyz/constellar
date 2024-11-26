import { stack } from '.'
import { flow } from '../../utils'
import { eq, REMOVE, update, view } from '../core'

describe('stack', () => {
	type Source = string[]
	const sourceDefined: Source = ['a', 'b', 'c']
	const sourceUndefined: Source = []
	const focus = flow(eq<string[]>(), stack())
	describe('view', () => {
		it('defined', () => {
			expect(view(focus)(sourceDefined)).toBe('c')
		})
		it('undefined', () => {
			expect(view(focus)(sourceUndefined)).toBeUndefined()
		})
	})
	describe('put', () => {
		it('defined', () => {
			expect(update(focus, 'A')(sourceDefined)).toEqual(['a', 'b', 'c', 'A'])
		})
		it('undefined', () => {
			expect(update(focus, 'A')(sourceUndefined)).toEqual(['A'])
		})
	})
	describe('remove', () => {
		it('defined', () => {
			expect(update(focus, REMOVE)(sourceDefined)).toEqual(['a', 'b'])
		})
		it('undefined', () => {
			expect(update(focus, REMOVE)(sourceUndefined)).toEqual(sourceUndefined)
		})
	})
})
