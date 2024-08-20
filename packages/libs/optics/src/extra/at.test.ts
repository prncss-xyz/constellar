import { eq, REMOVE, update, view } from '@/core'
import { flow } from '@constellar/utils'

import { at } from '.'

describe('at', () => {
	type Source = string[]
	const sourceDefined: Source = ['foo', 'bar', 'baz', 'quux']
	const sourceUndefined: Source = ['foo']
	const cb = (x: string) => `${x} UPDATED`
	const focus = flow(eq<Source>(), at(1))

	it('view undefined', () => {
		expect(view(focus)(sourceUndefined)).toBeUndefined()
	})
	it('view defined', () => {
		expect(view(focus)(sourceDefined)).toBe('bar')
	})
	it('put undefined', () => {
		expect(update(focus, 'UPDATED')(sourceUndefined)).toEqual(sourceUndefined)
	})
	it('put defined', () => {
		expect(update(focus, 'UPDATED')(sourceDefined)).toEqual([
			'foo',
			'UPDATED',
			'baz',
			'quux',
		])
	})
	it('modify undefined', () => {
		expect(update(focus, cb)(sourceUndefined)).toEqual(sourceUndefined)
	})
	it('modify defined', () => {
		expect(update(focus, cb)(sourceDefined)).toEqual([
			'foo',
			'bar UPDATED',
			'baz',
			'quux',
		])
	})
	test('negative index', () => {
		const focus = flow(eq<string[]>(), at(-1))
		const res: string | undefined = view(focus)(['a', 'b'])
		expect(res).toBe('b')
		const updated = update(focus, 'B')(['a', 'b'])
		expect(updated).toEqual(['a', 'B'])
		const removed = update(focus, REMOVE)(['a', 'b'])
		expect(removed).toEqual(['a'])
	})
})
