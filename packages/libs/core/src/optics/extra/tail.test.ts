import { tail } from '.'
import { focus, REMOVE } from '../core'

describe('tail', () => {
	type Source = string[]
	const sourceDefined: Source = ['a', 'b', 'c']
	const sourceEmpty: Source = ['a']
	const sourceUndefined: Source = []
	const o = focus<string[]>()(tail())
	describe('view', () => {
		it('defined', () => {
			expect(o.view(sourceDefined)).toEqual(['b', 'c'])
		})
		it('empty', () => {
			expect(o.view(sourceEmpty)).toEqual([])
		})
		it('undefined', () => {
			expect(o.view(sourceUndefined)).toBeUndefined()
		})
	})
	describe('put', () => {
		it('defined', () => {
			expect(o.update(['P', 'Q'])(sourceDefined)).toEqual(['a', 'P', 'Q'])
		})
		it('empty', () => {
			expect(o.update(['P', 'Q'])(sourceEmpty)).toEqual(['a', 'P', 'Q'])
		})
		it('undefined', () => {
			expect(o.update(['P', 'Q'])(sourceUndefined)).toEqual([])
		})
	})
	describe('remove', () => {
		it('defined', () => {
			expect(o.update(REMOVE)(sourceDefined)).toEqual(['a'])
		})
		it('empty', () => {
			expect(o.update(REMOVE)(sourceEmpty)).toEqual(['a'])
		})
		it('undefined', () => {
			expect(o.update(REMOVE)(sourceUndefined)).toEqual(sourceUndefined)
		})
	})
})
