import { at } from '.'
import { focus, REMOVE } from '../core'

describe('at', () => {
	type Source = string[]
	const sourceDefined: Source = ['foo', 'bar', 'baz', 'quux']
	const sourceUndefined: Source = ['foo']
	const cb = (x: string) => `${x} UPDATED`
	const o = focus<Source>()(at(1))

	it('view undefined', () => {
		expect(o.view(sourceUndefined)).toBeUndefined()
	})
	it('view defined', () => {
		expect(o.view(sourceDefined)).toBe('bar')
	})
	it('put undefined', () => {
		expect(o.update('UPDATED')(sourceUndefined)).toEqual(sourceUndefined)
	})
	it('put defined', () => {
		expect(o.update('UPDATED')(sourceDefined)).toEqual([
			'foo',
			'UPDATED',
			'baz',
			'quux',
		])
	})
	it('modify undefined', () => {
		expect(o.update(cb)(sourceUndefined)).toEqual(sourceUndefined)
	})
	it('modify defined', () => {
		expect(o.update(cb)(sourceDefined)).toEqual([
			'foo',
			'bar UPDATED',
			'baz',
			'quux',
		])
	})
	test('negative index', () => {
		const o = focus<string[]>()(at(-1))
		const res: string | undefined = o.view(['a', 'b'])
		expect(res).toBe('b')
		const updated = o.update('B')(['a', 'b'])
		expect(updated).toEqual(['a', 'B'])
		const removed = o.update(REMOVE)(['a', 'b'])
		expect(removed).toEqual(['a'])
	})
	test('negative out of range index', () => {
		const o = focus<string[]>()(at(-10))
		const res: string | undefined = o.view(['a', 'b'])
		expect(res).toBeUndefined()
		const updated = o.update('B')(['a', 'b'])
		expect(updated).toEqual(['a', 'b'])
		const removed = o.update(REMOVE)(['a', 'b'])
		expect(removed).toEqual(['a', 'b'])
	})
})
