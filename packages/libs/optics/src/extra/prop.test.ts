import { eq, REMOVE } from '@/core'
import { flow } from '@constellar/utils'

import { prop } from '.'

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
		expectTypeOf(focusA.view(sourceDefined)).toEqualTypeOf<string>()
		expectTypeOf(focusB.view(sourceDefined)).toEqualTypeOf<string | undefined>()

		expect(focusA.view(sourceDefined)).toBe('A')
		expect(focusA.view(sourceUndefined)).toBe('A')
		expect(focusB.view(sourceDefined)).toBe('B')
		expect(focusB.view(sourceUndefined)).toBeUndefined()
	})
	it('put', () => {
		expect(focusA.put('C')(sourceDefined)).toEqual({ a: 'C', b: 'B' })
		expect(focusA.put('C')(sourceUndefined)).toEqual({ a: 'C' })
		expect(focusB.put('C')(sourceDefined)).toEqual({ a: 'A', b: 'C' })
		expect(focusB.put('C')(sourceUndefined)).toEqual({ a: 'A', b: 'C' })
	})
	it('remove', () => {
		// testing the types
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		;() => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-expect-error
			focusA.command(REMOVE)(sourceDefined)
			// no error
			focusB.command(REMOVE)(sourceDefined)
		}

		expect(focusB.command(REMOVE)(sourceDefined)).toEqual({ a: 'A' })
		expect(focusB.command(REMOVE)(sourceUndefined)).toEqual({ a: 'A' })
	})
	it('modify', () => {
		const cb = (x: string) => `${x} UPDATED`
		expect(focusA.modify(cb)(sourceDefined)).toEqual({
			a: 'A UPDATED',
			b: 'B',
		})
		expect(focusA.modify(cb)(sourceUndefined)).toEqual({ a: 'A UPDATED' })

		expect(focusB.modify(cb)(sourceDefined)).toEqual({
			a: 'A',
			b: 'B UPDATED',
		})
		expect(focusB.modify(cb)(sourceUndefined)).toEqual({ a: 'A' })
	})
	describe('compose', () => {
		it('removable-lens', () => {
			type Source = { a?: { b: number } }
			const source: Source = { a: { b: 2 } }
			const focus = flow(eq<Source>(), prop('a'), prop('b'))
			const res = focus.view(source)
			expectTypeOf(focus.view(source)).toEqualTypeOf<number | undefined>(res)
		})
		it('lens-removable', () => {
			type Source = { a: { b?: number } }
			const source: Source = { a: { b: 2 } }
			const focus = flow(eq<Source>(), prop('a'), prop('b'))
			const res = focus.view(source)
			expectTypeOf(focus.view(source)).toEqualTypeOf<number | undefined>(res)
		})
	})
})
