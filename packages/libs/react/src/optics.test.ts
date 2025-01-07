import { elems, prop, toArray } from '@constellar/core'

import { disabledFocusValue, focusValue, foldValue, viewValue } from '.'

describe('react optics', () => {
	test('foldValue', () => {
		const fold = foldValue([0, 1, 2], elems())
		const array = fold(toArray())
		expect(array).toEqual([0, 1, 2])
	})
	test('viewValue', () => {
		const value = viewValue({ a: 0 }, prop('a'))
		expect(value).toBe(0)
	})
	test('focusValue', () => {
		const setWhole = vi.fn()
		const [value, update] = focusValue({ a: 0 }, setWhole, prop('a'))
		expect(value).toBe(0)
		update(1)
		expect(setWhole).toHaveBeenCalledWith({ a: 1 })
	})
	describe('disabledFocusValue', () => {
		test('enabled', () => {
			const setWhole = vi.fn()
			const [disabled, update] = disabledFocusValue(
				{ a: 0 },
				setWhole,
				prop('a'),
				1,
			)
			expect(disabled).toBe(false)
			update()
			expect(setWhole).toHaveBeenCalledWith({ a: 1 })
		})
		describe('disabled', () => {
			const setWhole = vi.fn()
			const value = { a: 1 }
			const [disabled, update] = disabledFocusValue(
				{ a: 1 },
				setWhole,
				prop('a'),
				1,
			)
			test('is disabled', () => {
				expect(disabled).toBe(true)
			})
			test('preserve reference', () => {
				update()
				expect(setWhole).toHaveBeenCalledWith(value)
			})
		})
	})
})
