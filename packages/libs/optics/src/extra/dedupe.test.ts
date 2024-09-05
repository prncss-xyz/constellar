import { flow } from '@constellar/utils'

import { dedupe } from '.'
import { eq, update, view } from '../core'

describe('dedupe', () => {
	const equal = (a: string, b: string) => a.toUpperCase() === b.toUpperCase()
	const focus = flow(eq<string>(), dedupe(equal))
	it('view', () => {
		expect(view(focus)('foo')).toBe('foo')
		expect(view(focus)('FOO')).toBe('FOO')
	})
	it('put', () => {
		expect(update(focus, 'foo')('bar')).toBe('foo')
		expect(update(focus, 'foo')('FOO')).toBe('FOO')
	})
})
