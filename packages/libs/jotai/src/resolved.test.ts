import { at } from '@constellar/core'
import { atom, createStore } from 'jotai'

import { focusAtom } from './optics'
import { resolvedAtom } from './resolved'

describe('atoms', () => {
	describe('resolvedAtom', () => {
		const referenceAtom = atom(1)
		const listAtom = atom(['a', 'b', 'c'])
		const valueFactory = (i: number) => focusAtom(listAtom, at(i))
		const valueAtom = resolvedAtom(referenceAtom, valueFactory)
		it('resolves reference', () => {
			const store = createStore()
			expect(store.get(valueAtom)).toBe('b')
		})
		it('updates reference', () => {
			const store = createStore()
			expect(store.set(valueAtom, 'x'))
			expect(store.get(valueAtom)).toBe('x')
		})
	})
})
