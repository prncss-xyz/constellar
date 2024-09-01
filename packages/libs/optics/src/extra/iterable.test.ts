import { eq, fold, modify, put, view } from '@/core'
import { iterable, prop } from '@/extra'
import { collect, flow } from '@constellar/utils'

type T = { index: string[]; items: { id: string; name: string }[] }
const focus = flow(
	eq<T>(),
	iterable({
		iter: (whole) =>
			whole.items.filter((item) => whole.index.includes(item.id)),
		mapper: (mod, whole) => {
			return {
				...whole,
				items: whole.items.map((item) =>
					whole.index.includes(item.id) ? mod(item) : item,
				),
			}
		},
	}),
	prop('name'),
)

describe('read', () => {
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
})

describe('write', () => {
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
		expect(modify(focus, (x: string) => x.toUpperCase())(source).items).toEqual(
			[
				{ id: 'a', name: 'NAME A' },
				{ id: 'z', name: 'name z' },
				{ id: 'b', name: 'NAME B' },
			],
		)
	})
})
