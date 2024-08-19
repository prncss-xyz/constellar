import { eq, REMOVE } from '@/core'
import { flow } from '@constellar/utils'

import { at } from '.'

describe('at', () => {
	type Source = string[]
	const sourceDefined: Source = ['foo', 'bar', 'baz', 'quux']
	const sourceUndefined: Source = ['foo']
	const cb = (x: string) => `${x} UPDATED`
	const focus = flow(eq<Source>(), at(1))

	it('view undefined', () => {
		expect(focus.view(sourceUndefined)).toBeUndefined()
	})
	it('view defined', () => {
		expect(focus.view(sourceDefined)).toBe('bar')
	})
	it('put undefined', () => {
		expect(focus.put('UPDATED')(sourceUndefined)).toEqual(sourceUndefined)
	})
	it('put defined', () => {
		expect(focus.put('UPDATED')(sourceDefined)).toEqual([
			'foo',
			'UPDATED',
			'baz',
			'quux',
		])
	})
	it('modify undefined', () => {
		expect(focus.modify(cb)(sourceUndefined)).toEqual(sourceUndefined)
	})
	it('modify defined', () => {
		expect(focus.modify(cb)(sourceDefined)).toEqual([
			'foo',
			'bar UPDATED',
			'baz',
			'quux',
		])
	})
	test('negative index', () => {
		const focus = flow(eq<string[]>(), at(-1))
		const res: string | undefined = focus.view(['a', 'b'])
		expect(res).toBe('b')
		const updated = focus.put('B')(['a', 'b'])
		expect(updated).toEqual(['a', 'B'])
		const removed = focus.command(REMOVE)(['a', 'b'])
		expect(removed).toEqual(['a'])
	})
})
