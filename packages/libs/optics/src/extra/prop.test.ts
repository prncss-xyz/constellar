import { flow } from '@constellar/utils'

import { prop } from '.'
import { eq, REMOVE, update, view } from '../core'

describe('prop', () => {
	type Source = {
		a: string
		b?: string
	}
	const sourceDefined: Source = { a: 'A', b: 'B' }
	const sourceUndefined: Source = { a: 'A' }
	const focusA = flow(eq<Source>(), prop('a'))
	const focusB = flow(eq<Source>(), prop('b'))
	it('view', () => {
		expectTypeOf(view(focusA)(sourceDefined)).toEqualTypeOf<string>()
		expectTypeOf(view(focusB)(sourceDefined)).toEqualTypeOf<
			string | undefined
		>()

		expect(view(focusA)(sourceDefined)).toBe('A')
		expect(view(focusA)(sourceUndefined)).toBe('A')
		expect(view(focusB)(sourceDefined)).toBe('B')
		expect(view(focusB)(sourceUndefined)).toBeUndefined()
	})
	it('put', () => {
		expect(update(focusA, 'C')(sourceDefined)).toEqual({ a: 'C', b: 'B' })
		expect(update(focusA, 'C')(sourceUndefined)).toEqual({ a: 'C' })
		expect(update(focusB, 'C')(sourceDefined)).toEqual({ a: 'A', b: 'C' })
		expect(update(focusB, 'C')(sourceUndefined)).toEqual({ a: 'A', b: 'C' })
	})
	it('remove', () => {
		// testing the types
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		;() => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-expect-error
			update(focusA, REMOVE)(sourceDefined)
			// no error
			update(focusB, REMOVE)(sourceDefined)
		}

		expect(update(focusB, REMOVE)(sourceDefined)).toEqual({ a: 'A' })
		expect(update(focusB, REMOVE)(sourceUndefined)).toEqual({ a: 'A' })
	})
	it('modify', () => {
		const cb = (x: string) => `${x} UPDATED`
		expect(update(focusA, cb)(sourceDefined)).toEqual({
			a: 'A UPDATED',
			b: 'B',
		})
		expect(update(focusA, cb)(sourceUndefined)).toEqual({ a: 'A UPDATED' })

		expect(update(focusB, cb)(sourceDefined)).toEqual({
			a: 'A',
			b: 'B UPDATED',
		})
		expect(update(focusB, cb)(sourceUndefined)).toEqual({ a: 'A' })
	})
	describe('compose', () => {
		it('removable-lens', () => {
			type Source = { a?: { b: number } }
			const source: Source = { a: { b: 2 } }
			const focus = flow(eq<Source>(), prop('a'), prop('b'))
			const res = view(focus)(source)
			expectTypeOf(view(focus)(source)).toEqualTypeOf<number | undefined>(res)
		})
	})
})
