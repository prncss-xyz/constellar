/* eslint-disable @typescript-eslint/no-explicit-any */
import { elems, linear, prop, toArray, when } from '@constellar/optics'
import { pipe } from '@constellar/utils'
import { atom, createStore } from 'jotai'

import { disabledFocusAtom, focusAtom, foldAtom, viewAtom } from '.'

test('view', () => {
	const store = createStore()
	const sourceAtom = atom(1)
	const targetAtom = viewAtom(sourceAtom, linear(2))
	expect(store.get(targetAtom)).toBe(2)
})

describe('fold', () => {
	test('sync', () => {
		const odd = (x: number) => x % 2
		const store = createStore()
		const wholeAtom = atom([1, 2, 3])
		const resAtom = foldAtom(wholeAtom, pipe(elems(), when(odd)))(toArray())
		expect(store.get(resAtom)).toEqual([1, 3])
	})
	test('async', async () => {
		const odd = (x: number) => x % 2
		const store = createStore()
		const wholeAtom = atom(Promise.resolve([1, 2, 3]))
		const resAtom = foldAtom(wholeAtom, pipe(elems(), when(odd)))(toArray())
		expect(await store.get(resAtom)).toEqual([1, 3])
	})
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
		const microAtom = focusAtom(partAtom, linear(2))
		expect(await store.get(microAtom)).toEqual(8)
	})
})

describe('disabledFocus', async () => {
	test('sync', async () => {
		const store = createStore()
		const wholeAtom = atom({ a: 1 })
		const partAtom = disabledFocusAtom(wholeAtom, prop('a'), 4)
		expect(store.get(partAtom)).toBeFalsy()
		store.set(partAtom)
		await Promise.resolve()
		expect(store.get(partAtom)).toBeTruthy()
		expect(store.get(wholeAtom)).toEqual({ a: 4 })
	})
	test('async', async () => {
		const store = createStore()
		const wholeAtom = atom(Promise.resolve({ a: 1 }))
		const partAtom = disabledFocusAtom(wholeAtom, prop('a'), 4)
		expect(await store.get(partAtom)).toBeFalsy()
		store.set(partAtom)
		await Promise.resolve()
		expect(await store.get(partAtom)).toBeTruthy()
		expect(await store.get(wholeAtom)).toEqual({ a: 4 })
	})
})
