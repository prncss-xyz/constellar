import { eq, update, view } from '@/core'
import { flow } from '@constellar/utils'

import { to } from '.'

function firstVoyel(s: string) {
	return s.match(/[aeiou]/i)?.[0]
}

describe('toOpt', () => {
	const focus = flow(eq<string>(), to(firstVoyel))
	it('view', () => {
		expect(view(focus)('foo')).toBe('o')
	})
	it('view', () => {
		expect(view(focus)('rrr')).toBeUndefined()
	})
	it('update', () => {
		expect(update(focus, '')('foo')).toBe('foo')
	})
})
