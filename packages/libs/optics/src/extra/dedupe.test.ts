import { eq } from '@/core'
import { flow } from '@constellar/utils'

import { dedupe } from '.'

describe('dedupe', () => {
	const equal = (a: string, b: string) => a.toUpperCase() === b.toUpperCase()
	const focus = flow(eq<string>(), dedupe(equal))
	it('view', () => {
		expect(focus.view('foo')).toBe('foo')
		expect(focus.view('FOO')).toBe('FOO')
	})
	it('put', () => {
		expect(focus.put('foo')('bar')).toBe('foo')
		expect(focus.put('foo')('FOO')).toBe('FOO')
	})
})
