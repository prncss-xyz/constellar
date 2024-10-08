import { findOne } from '.'
import { flow } from '../../utils'
import { command, eq, put, REMOVE, update, view } from '../core'

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
	const focus = flow(
		eq<Source[]>(),
		findOne((item) => item.bar === 'quux'),
	)
	describe('view', () => {
		it('defined', () => {
			expect(view(focus)(sourceDefined)).toEqual({ bar: 'quux' })
		})
		it('undefined', () => {
			expect(view(focus)(sourceUndefined)).toBeUndefined()
		})
	})
	describe('put', () => {
		it('defined', () => {
			expect(put(focus, { bar: 'UPDATED' })(sourceDefined)).toEqual([
				{ bar: 'baz' },
				{ bar: 'UPDATED' },
				{ bar: 'foo' },
			])
		})
		it('undefined', () => {
			expect(update(focus, { bar: 'UPDATED' })(sourceUndefined)).toEqual([
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
				update(focus, (x) => ({
					bar: `${x.bar} UPDATED`,
				}))(sourceDefined),
			).toEqual([{ bar: 'baz' }, { bar: 'quux UPDATED' }, { bar: 'foo' }])
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
			expect(command(focus, REMOVE)(sourceDefined)).toEqual([
				{ bar: 'baz' },
				{ bar: 'foo' },
			])
		})
		it('undefined', () => {
			expect(update(focus, REMOVE)(sourceUndefined)).toEqual(sourceUndefined)
		})
	})
	test('refine type', () => {
		type T = number | string
		const focus = flow(
			eq<T[]>(),
			findOne((item) => typeof item === 'string'),
		)
		const source: T[] = []
		const res = view(focus)(source)
		expectTypeOf(res).toEqualTypeOf<string | undefined>()
	})
})
