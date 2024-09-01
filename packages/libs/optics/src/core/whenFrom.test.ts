/* eslint-disable @typescript-eslint/no-explicit-any */
import { elems, prop } from '@/extra'
import { collect, flow } from '@constellar/utils'

import { eq, fold, modify, put, view, whenFrom } from '.'

describe('simple', () => {
	type T = { index: string[]; items: { id: string; name: string }[] }
	const focus = flow(
		eq<T>(),
		prop('items'),
		elems(),
		whenFrom((whole, part) => whole.index.includes(part.id)),
		prop('name'),
	)
	test('view', () => {
		const source: T = {
			index: ['b', 'c', 'a'],
			items: [
				{ id: 'z', name: 'name z' },
				{ id: 'a', name: 'name a' },
				{ id: 'b', name: 'name b' },
			],
		}
		expect(view(focus)(source)).toEqual('name a')
	})
	test('fold', () => {
		const source: T = {
			index: ['b', 'c', 'a'],
			items: [
				{ id: 'z', name: 'name z' },
				{ id: 'a', name: 'name a' },
				{ id: 'b', name: 'name b' },
			],
		}
		expect(fold(focus, collect())(source)).toEqual(['name a', 'name b'])
	})
	test('put', () => {
		const source: T = {
			index: ['b', 'c', 'a'],
			items: [
				{ id: 'a', name: 'name a' },
				{ id: 'z', name: 'name z' },
				{ id: 'b', name: 'name b' },
			],
		}
		expect(put(focus, 'PUT')(source).items).toEqual([
			{ id: 'a', name: 'PUT' },
			{ id: 'z', name: 'name z' },
			{ id: 'b', name: 'PUT' },
		])
	})
	test('modify', () => {
		const source: T = {
			index: ['b', 'c', 'a'],
			items: [
				{ id: 'a', name: 'name a' },
				{ id: 'z', name: 'name z' },
				{ id: 'b', name: 'name b' },
			],
		}
		expect(modify(focus, (x) => x.toUpperCase())(source).items).toEqual([
			{ id: 'a', name: 'NAME A' },
			{ id: 'z', name: 'name z' },
			{ id: 'b', name: 'NAME B' },
		])
	})
})
