import { eq } from '@/core'
import { flow } from '@constellar/utils'

import { rewrite } from '.'

describe('rewrite', () => {
	const focus = flow(
		eq<string>(),
		rewrite((s) => s.toUpperCase()),
	)
	it('view', () => {
		expect(focus.view('foo')).toBe('foo')
	})
	it('put', () => {
		expect(focus.put('foo')('')).toBe('FOO')
	})
})
