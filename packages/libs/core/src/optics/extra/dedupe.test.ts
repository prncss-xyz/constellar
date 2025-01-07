import { dedupe } from '.'
import { focus } from '../core'

describe('dedupe', () => {
	const equal = (a: string, b: string) => a.toUpperCase() === b.toUpperCase()
	const o = focus<string>()(dedupe(equal))
	it('view', () => {
		expect(o.view('foo')).toBe('foo')
		expect(o.view('FOO')).toBe('FOO')
	})
	it('put', () => {
		expect(o.update('FOO')('foo')).toBe('foo')
		expect(o.update('bar')('foo')).toBe('bar')
	})
})
