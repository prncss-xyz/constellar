/* eslint-disable @typescript-eslint/no-explicit-any */
import { elems, linear, prop, when } from '@constellar/optics'
import { pipe } from '@constellar/utils'
import { atom, createStore } from 'jotai'

import { focusAtom, foldAtom, viewAtom } from '.'

test('view', () => {
	const store = createStore()
	const sourceAtom = atom(1)
	const targetAtom = viewAtom(sourceAtom, linear(2))
	expect(store.get(targetAtom)).toBe(2)
})

test('fold', () => {
	const odd = (x: number) => x % 2
	const store = createStore()
	const wholeAtom = atom([1, 2, 3])
	const resAtom = foldAtom(wholeAtom, pipe(elems(), when(odd)), {
		init: 0,
		fold: (v, acc) => acc + v,
	})
	expect(store.get(resAtom)).toBe(4)
})

describe('focus', async () => {
	test('sync', async () => {
		const store = createStore()
		const wholeAtom = atom({ a: 1 })
		const partAtom = focusAtom(wholeAtom, prop('a'))
		expect(store.get(partAtom)).toBe(1)
		store.set(partAtom, 4)
		await Promise.resolve()
		expect(store.get(wholeAtom)).toEqual({ a: 4 })
	})
	test('async', async () => {
		const store = createStore()
		const wholeAtom = atom(Promise.resolve({ a: 1 }))
		const partAtom = focusAtom(wholeAtom, prop('a'))
		expect(await store.get(partAtom)).toBe(1)
		store.set(partAtom, 4)
		expect(await store.get(wholeAtom)).toEqual({ a: 4 })
	})
})
