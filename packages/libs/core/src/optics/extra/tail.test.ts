import { tail } from '.'
import { flow } from '../../utils'
import { eq, REMOVE, update, view } from '../core'

describe('tail', () => {
	type Source = string[]
	const sourceDefined: Source = ['a', 'b', 'c']
	const sourceEmpty: Source = ['a']
	const sourceUndefined: Source = []
	const focus = flow(eq<string[]>(), tail())
	describe('view', () => {
		it('defined', () => {
			expect(view(focus)(sourceDefined)).toEqual(['b', 'c'])
		})
		it('empty', () => {
			expect(view(focus)(sourceEmpty)).toEqual([])
		})
		it('undefined', () => {
			expect(view(focus)(sourceUndefined)).toBeUndefined()
		})
	})
	describe('put', () => {
		it('defined', () => {
			expect(update(focus, ['P', 'Q'])(sourceDefined)).toEqual(['a', 'P', 'Q'])
		})
		it('empty', () => {
			expect(update(focus, ['P', 'Q'])(sourceEmpty)).toEqual(['a', 'P', 'Q'])
		})
		it('undefined', () => {
			expect(update(focus, ['P', 'Q'])(sourceUndefined)).toEqual([])
		})
	})
	describe('remove', () => {
		it('defined', () => {
			expect(update(focus, REMOVE)(sourceDefined)).toEqual(['a'])
		})
		it('empty', () => {
			expect(update(focus, REMOVE)(sourceEmpty)).toEqual(['a'])
		})
		it('undefined', () => {
			expect(update(focus, REMOVE)(sourceUndefined)).toEqual(sourceUndefined)
		})
	})
})
