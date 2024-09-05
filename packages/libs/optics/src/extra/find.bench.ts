// https://github.com/nodeshapes/js-optics-benchmark
import { flow } from '@constellar/utils'
import * as O from 'optics-ts'
// @ts-expect-error no declaration file
import * as L from 'partial.lenses'
import { bench } from 'vitest'

import { find, prop } from '.'
import { eq, update, view } from '../core'

const size = 5000
const mid = Math.floor(size / 2)
const id = 'id-' + mid
const name = 'Luke-' + mid
const nameModified = 'Luke-' + mid + '-modified'

const makeNames = () => {
	const arr = []
	for (let i = 0; i < size; i++)
		arr.push({
			id: 'id-' + i,
			name: 'Luke-' + i,
		})

	return arr
}

interface Child {
	id: string
	name: string
}
const data = {
	m: {
		n: {
			names: makeNames(),
		},
	},
}
type Data = typeof data

describe('find 2', () => {
	const data2 = data.m.n.names
	type Data2 = typeof data2
	;(() => {
		const optics = flow(
			eq<Data2>(),
			find((name: Child) => name.id === id),
		)
		const v = view(optics)
		const fn = () => v(data2)
		bench('compsoer', fn as () => void)
		expect(fn()).toEqual({ id, name })
	})()
	;(() => {
		const optics = O.optic<Data2>().find((name: Child) => name.id === id)
		const v = O.preview(optics)
		const fn = () => v(data2)
		bench('optics-ts', fn as () => void)
		expect(fn()).toEqual({ id, name })
	})()
	;(() => {
		const optics = L.compose(L.find((name: Child) => name.id === id))
		const fn = () => L.get(optics, data2)
		bench('partial.lenses', fn as () => void)
		expect(fn()).toEqual({ id, name })
	})()
})

describe('find read array element by predicate', () => {
	;(() => {
		const optics = flow(
			eq<Data>(),
			prop('m'),
			prop('n'),
			prop('names'),
			find((name: Child) => name.id === id),
		)
		const v = view(optics)
		const fn = () => v(data)
		bench('constellar', fn as () => void)
		expect(fn()).toEqual({ id, name })
	})()
	;(() => {
		const optics = O.optic<Data>()
			.path('m', 'n', 'names')
			.find((name: Child) => name.id === id)
		const v = O.preview(optics)
		const fn = () => v(data)
		bench('optics-ts', fn as () => void)
		expect(fn()).toEqual({ id, name })
	})()
	;(() => {
		const optics = L.compose(
			L.prop('m'),
			L.prop('n'),
			L.prop('names'),
			L.find((name: Child) => name.id === id),
		)
		const fn = () => L.get(optics, data)
		bench('partial.lenses', fn as () => void)
		expect(fn()).toEqual({ id, name })
	})()
})

describe('find modify array element by predicate', () => {
	const up = (obj: Child) => ({ ...obj, name: nameModified })
	;(() => {
		const optics = flow(
			eq<Data>(),
			prop('m'),
			prop('n'),
			prop('names'),
			find((name: Child) => name.id === id),
		)
		const v = update(optics, up)
		const fn = () => v(data)
		bench('constellar', fn as () => void)
		expect(view(optics)(fn())).toEqual({ id, name: nameModified })
	})()
	;(() => {
		const optics = O.optic<Data>()
			.path('m', 'n', 'names')
			.find((name: Child) => name.id === id)
		const v = O.modify(optics)(up)
		const fn = () => v(data)
		bench('optics-ts', fn as () => void)
		expect(O.preview(optics)(fn())).toEqual({ id, name: nameModified })
	})()
	;(() => {
		const optics = L.compose(
			L.prop('m'),
			L.prop('n'),
			L.prop('names'),
			L.find((name: Child) => name.id === id),
		)
		const fn = () => L.modify(optics, up, data)
		bench('partial.lenses', fn as () => void)
		expect(L.get(optics, fn())).toEqual({ id, name: nameModified })
	})()
})

describe('find modify 2 array element by predicate', () => {
	const up = (x: number) => x + 1
	const data = 0 as number
	type Data = typeof data
	;(() => {
		const optics = flow(eq<Data>())
		const v = update(optics, up)
		/* const v = (x: number) => optics.setter(up(optics.getter(x)), 0) */
		const fn = () => v(data)
		bench('constellar', fn as () => void)
		expect(view(optics)(fn())).toEqual(1)
	})()
	;(() => {
		const optics = O.optic<Data>()
		const v = O.modify(optics)(up)
		const fn = () => v(data)
		bench('optics-ts', fn as () => void)
		expect(O.get(optics)(fn())).toEqual(1)
	})()
})

describe.only('find modify 2 array element by predicate', () => {
	const up = (obj: Child) => ({ ...obj, name: nameModified })
	const data2 = data.m.n.names
	type Data2 = typeof data2
	;(() => {
		const optics = flow(
			eq<Data2>(),
			find((name: Child) => name.id === id),
		)
		const v = update(optics, up)
		const fn = () => v(data2)
		bench('constellar', fn as () => void)
		expect(view(optics)(fn())).toEqual({ id, name: nameModified })
	})()
	;(() => {
		const optics = O.optic<Data2>().find((name: Child) => name.id === id)
		const v = O.modify(optics)(up)
		const fn = () => v(data2)
		bench('optics-ts', fn as () => void)
		expect(O.preview(optics)(fn())).toEqual({ id, name: nameModified })
	})()
	;(() => {
		const optics = L.compose(L.find((name: Child) => name.id === id))
		const fn = () => L.modify(optics, up, data2)
		bench('partial.lenses', fn as () => void)
		expect(L.get(optics, fn())).toEqual({ id, name: nameModified })
	})()
})
