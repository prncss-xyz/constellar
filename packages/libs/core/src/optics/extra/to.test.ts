import { to } from '.'
import { focus } from '../core'

describe('defined', () => {
	const o = focus<string>()(to((s) => s.toUpperCase()))
	it('view', () => {
		const v = o.view('foo')
		expectTypeOf(v).toBeString()
		expect(v).toBe('FOO')
	})
	it('update', () => {
		expect(() => o.update('')('foo')).toThrowError()
	})
})

function firstVowel(s: string) {
	return s.match(/[aeiou]/i)?.[0]
}

describe('optional', () => {
	const o = focus<string>()(to(firstVowel))
	it('view', () => {
		const v = o.view('foo')
		expectTypeOf(v).toEqualTypeOf<string | undefined>()
		expect(o.view('foo')).toBe('o')
	})
	it('view', () => {
		expect(o.view('rrr')).toBeUndefined()
	})
	it('update', () => {
		expect(() => o.update('')('foo')).toThrowError()
	})
})
