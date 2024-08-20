import { eq, REMOVE, update, view } from '@/core'
import { flow } from '@constellar/utils'

import { find } from '.'

describe('find', () => {
	type Source = { bar: string }
	const sourceDefined: Source[] = [
		{ bar: 'baz' },
		{ bar: 'quux' },
		{ bar: 'xyzzy' },
	]
	const sourceUndefined: Source[] = [
		{ bar: 'baz' },
		{ bar: 'nomatch' },
		{ bar: 'xyzzy' },
	]
	const focus = flow(
		eq<Source[]>(),
		find((item) => item.bar === 'quux'),
	)
	describe('view', () => {
		it('defined', () => {
			expect(view(focus)(sourceDefined)).toEqual({ bar: 'quux' })
		})
		it('undefined', () => {
			expect(view(focus)(sourceUndefined)).toBeUndefined()
		})
	})
	describe('modify', () => {
		it('defined', () => {
			expect(
				update(focus, (x) => ({
					bar: `${x.bar} UPDATED`,
				}))(sourceDefined),
			).toEqual([{ bar: 'baz' }, { bar: 'quux UPDATED' }, { bar: 'xyzzy' }])
		})
		it('undefined', () => {
			expect(
				update(focus, (x) => ({
					bar: `${x.bar} UPDATED`,
				}))(sourceUndefined),
			).toEqual(sourceUndefined)
		})
	})
	describe('remove', () => {
		it('defined', () => {
			expect(update(focus, REMOVE)(sourceDefined)).toEqual([
				{ bar: 'baz' },
				{ bar: 'xyzzy' },
			])
		})
		it('undefined', () => {
			expect(update(focus, REMOVE)(sourceUndefined)).toEqual(sourceUndefined)
		})
	})
	test('refine type', () => {
		type T = string | number
		const focus = flow(
			eq<T[]>(),
			find((item) => typeof item === 'string'),
		)
		const source: T[] = []
		const res = view(focus)(source)
		expectTypeOf(res).toEqualTypeOf<string | undefined>()
	})
})
