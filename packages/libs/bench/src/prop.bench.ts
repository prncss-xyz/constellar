// https://github.com/nodeshapes/js-optics-benchmark
import { focus, pipe, prop } from '@constellar/core'
import { Lens } from 'monocle-ts'
import * as O from 'optics-ts'
// @ts-expect-error no declaration file
import * as L from 'partial.lenses'
import { bench } from 'vitest'

const data = { a: { b: { c: { d: { e: 'hello' } } } } }
type Data = typeof data

describe('read', () => {
	;(() => {
		const o = focus<Data>()(
			pipe(prop('a'), prop('b'), prop('c'), prop('d'), prop('e')),
		)
		const fn = () => o.view(data)
		bench('constellar', fn as () => void)
		expect(fn()).toBe('hello')
	})()
	;(() => {
		const focus = O.optic<Data>().path('a', 'b', 'c', 'd', 'e')
		const v = O.get(focus)
		const fn = () => v(data)
		bench('optics-ts', fn as () => void)
		expect(fn()).toBe('hello')
	})()
	;(() => {
		const optics = Lens.fromPath<Data>()(['a', 'b', 'c', 'd', 'e'])
		const fn = () => optics.get(data)
		bench('monocle-ts', fn as () => void)
		expect(fn()).toBe('hello')
	})()
	;(() => {
		const focus = L.compose(['a', 'b', 'c', 'd', 'e'])
		const fn = () => L.get(focus, data)
		bench('partial.lenses', fn as () => void)
		expect(fn()).toBe('hello')
	})()
})

describe('write', () => {
	const str = 'world,'
	;(() => {
		const o = focus<Data>()(
			pipe(prop('a'), prop('b'), prop('c'), prop('d'), prop('e')),
		)
		const v = o.update(str)
		const fn = () => v(data)
		bench('constellar', fn as () => void)
		expect(o.view(fn())).toEqual(str)
	})()
	;(() => {
		const focus = O.optic<Data>().path('a', 'b', 'c', 'd', 'e')
		const v = O.set(focus)(str)
		const fn = () => v(data)
		bench('optics-ts', fn as () => void)
		expect(O.get(focus)(fn())).toEqual(str)
	})()
	;(() => {
		const focus = Lens.fromPath<Data>()(['a', 'b', 'c', 'd', 'e'])
		const v = focus.set(str)
		const fn = () => v(data)
		bench('monocle-ts', fn as () => void)
		expect(focus.get(fn())).toEqual(str)
	})()
	;(() => {
		const focus = L.compose(['a', 'b', 'c', 'd', 'e'])
		const fn = () => L.set(focus, str, data)
		bench('partial.lenses', fn as () => void)
		expect(L.get(focus, fn())).toEqual(str)
	})()
})

describe('modify', () => {
	;(() => {
		const cb = (s: string) => s.toUpperCase()
		const res = 'HELLO'
		const o = focus<Data>()(
			pipe(prop('a'), prop('b'), prop('c'), prop('d'), prop('e')),
		)
		const v = o.update(cb)
		const fn = () => v(data)
		bench('constellar', fn as () => void)
		expect(o.view.bind(o)(fn())).toEqual(res)
	})()
	;(() => {
		const cb = (s: string) => s.toUpperCase()
		const res = 'HELLO'
		const focus = O.optic<Data>().path('a', 'b', 'c', 'd', 'e')
		const v = O.modify(focus)(cb)
		const fn = () => v(data)
		bench('optics-ts', fn as () => void)
		expect(O.get(focus)(fn())).toEqual(res)
	})()
	;(() => {
		const cb = (s: string) => s.toUpperCase()
		const res = 'HELLO'
		const focus = Lens.fromPath<Data>()(['a', 'b', 'c', 'd', 'e'])
		const v = focus.modify(cb)
		const fn = () => v(data)
		bench('monocle-ts', fn as () => void)
		expect(focus.get(fn())).toEqual(res)
	})()
	;(() => {
		const cb = (s: string) => s.toUpperCase()
		const res = 'HELLO'
		const focus = L.compose(['a', 'b', 'c', 'd', 'e'])
		const fn = () => L.modify(focus, cb, data)
		bench('partial.lenses', fn as () => void)
		expect(L.get(focus, fn())).toEqual(res)
	})()
})
