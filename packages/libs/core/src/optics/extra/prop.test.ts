import { prop } from '.'
import { pipe } from '../../utils'
import { focus, REMOVE } from '../core'

describe('prop', () => {
	type Source = {
		a: string
		b?: string
	}
	const sourceDefined: Source = { a: 'A', b: 'B' }
	const sourceUndefined: Source = { a: 'A' }
	const focusA = focus<Source>()(prop('a'))
	const focusB = focus<Source>()(prop('b'))
	it('view', () => {
		expectTypeOf(focusA.view(sourceDefined)).toEqualTypeOf<string>()
		expectTypeOf(focusB.view(sourceDefined)).toEqualTypeOf<string | undefined>()
		expectTypeOf(focusB.view(sourceDefined, 'toto')).toEqualTypeOf<
			'toto' | string
		>()
		expectTypeOf(focusB.view(sourceDefined, () => 'toto')).toEqualTypeOf<
			'toto' | string
		>()

		expect(focusA.view(sourceDefined)).toBe('A')
		expect(focusA.view(sourceUndefined)).toBe('A')
		expect(focusB.view(sourceDefined)).toBe('B')
		expect(focusB.view(sourceUndefined)).toBeUndefined()
	})
	it('put', () => {
		expect(focusA.update('C')(sourceDefined)).toEqual({ a: 'C', b: 'B' })
		expect(focusA.update('C')(sourceUndefined)).toEqual({ a: 'C' })
		expect(focusB.update('C')(sourceDefined)).toEqual({ a: 'A', b: 'C' })
		expect(focusB.update('C')(sourceUndefined)).toEqual({ a: 'A', b: 'C' })
	})
	it('remove', () => {
		// testing the types
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		;() => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-expect-error
			focusA.update(REMOVE)(sourceDefined)
			// no error
			focusB.update(REMOVE)(sourceDefined)
		}

		expect(focusB.update(REMOVE)(sourceDefined)).toEqual({ a: 'A' })
		expect(focusB.update(REMOVE)(sourceUndefined)).toEqual({ a: 'A' })
	})
	it('modify', () => {
		const cb = (x: string) => `${x} UPDATED`
		expect(focusA.update(cb)(sourceDefined)).toEqual({
			a: 'A UPDATED',
			b: 'B',
		})
		expect(focusA.update(cb)(sourceUndefined)).toEqual({ a: 'A UPDATED' })

		expect(focusB.update(cb)(sourceDefined)).toEqual({
			a: 'A',
			b: 'B UPDATED',
		})
		expect(focusB.update(cb)(sourceUndefined)).toEqual({ a: 'A' })
	})
	describe('compose', () => {
		it('removable-lens', () => {
			type Source = { a?: { b: number } }
			const source: Source = { a: { b: 2 } }
			const o = focus<Source>()(pipe(prop('a'), prop('b')))
			const res = o.view(source)
			expectTypeOf(o.view(source)).toEqualTypeOf<number | undefined>(res)
		})
	})
})
