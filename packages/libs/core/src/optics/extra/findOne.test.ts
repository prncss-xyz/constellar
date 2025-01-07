import { findOne } from '.'
import { focus, REMOVE } from '../core'

describe('find', () => {
	type Source = { bar: string }
	const sourceDefined: Source[] = [
		{ bar: 'baz' },
		{ bar: 'quux' },
		{ bar: 'foo' },
	]
	const sourceUndefined: Source[] = [
		{ bar: 'baz' },
		{ bar: 'nomatch' },
		{ bar: 'foo' },
	]
	const o = focus<Source[]>()(findOne((item) => item.bar === 'quux'))
	describe('view', () => {
		it('defined', () => {
			expect(o.view(sourceDefined)).toEqual({ bar: 'quux' })
		})
		it('undefined', () => {
			expect(o.view(sourceUndefined)).toBeUndefined()
		})
	})
	describe('put', () => {
		it('defined', () => {
			expect(o.put({ bar: 'UPDATED' }, sourceDefined)).toEqual([
				{ bar: 'baz' },
				{ bar: 'UPDATED' },
				{ bar: 'foo' },
			])
		})
		it('undefined', () => {
			expect(o.update({ bar: 'UPDATED' })(sourceUndefined)).toEqual([
				{ bar: 'baz' },
				{ bar: 'nomatch' },
				{ bar: 'foo' },
				{ bar: 'UPDATED' },
			])
		})
	})
	describe('modify', () => {
		it('defined', () => {
			expect(
				o.update((x) => ({ bar: `${x.bar} UPDATED` }))(sourceDefined),
			).toEqual([{ bar: 'baz' }, { bar: 'quux UPDATED' }, { bar: 'foo' }])
		})
		it('undefined', () => {
			expect(
				o.update((x) => ({ bar: `${x.bar} UPDATED` }))(sourceUndefined),
			).toEqual(sourceUndefined)
		})
	})
	describe('remove', () => {
		it('defined', () => {
			expect(o.command(REMOVE, sourceDefined)).toEqual([
				{ bar: 'baz' },
				{ bar: 'foo' },
			])
		})
		it('undefined', () => {
			expect(o.update(REMOVE)(sourceUndefined)).toEqual(sourceUndefined)
		})
	})
	test('refine type', () => {
		type T = number | string
		const o = focus<T[]>()(findOne((item) => typeof item === 'string'))
		const source: T[] = []
		const res = o.view(source)
		expectTypeOf(res).toEqualTypeOf<string | undefined>()
	})
})
