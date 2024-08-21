import { eq, update, view } from '@/core'
import { flow } from '@constellar/utils'

import { to } from '.'

describe('defined', () => {
	const focus = flow(
		eq<string>(),
		to((s) => s.toUpperCase()),
	)
	it('view', () => {
		const v = view(focus)('foo')
		expectTypeOf(v).toBeString()
		expect(v).toBe('FOO')
	})
	it('update', () => {
		expect(update(focus, '')('foo')).toBe('foo')
	})
})

function firstVoyel(s: string) {
	return s.match(/[aeiou]/i)?.[0]
}

describe('optional', () => {
	const focus = flow(eq<string>(), to(firstVoyel))
	it('view', () => {
		const v = view(focus)('foo')
		expectTypeOf(v).toEqualTypeOf<string | undefined>()
		expect(view(focus)('foo')).toBe('o')
	})
	it('view', () => {
		expect(view(focus)('rrr')).toBeUndefined()
	})
	it('update', () => {
		expect(update(focus, '')('foo')).toBe('foo')
	})
})
