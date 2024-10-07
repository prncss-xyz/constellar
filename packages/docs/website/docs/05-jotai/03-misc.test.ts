import { findOne } from '@constellar/core'
import { focusAtom, resolvedAtom } from '@constellar/jotai'
import { atom, createStore } from 'jotai'
import { expect, test } from 'vitest'

const idAtom = atom('a')
const registerAtom = atom([
	{ id: 'a', name: 'A' },
	{ id: 'b', name: 'B' },
])
const currentAtom = resolvedAtom(idAtom, (id) =>
	focusAtom(
		registerAtom,
		findOne((entry) => entry.id === id),
	),
)

test('resolvedAtom', () => {
	const store = createStore()
	expect(store.get(currentAtom)).toEqual({ id: 'a', name: 'A' })
	store.set(currentAtom, { id: 'a', name: 'a' })
	expect(store.get(registerAtom)).toEqual([
		{ id: 'a', name: 'a' },
		{ id: 'b', name: 'B' },
	])
})
