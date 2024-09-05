import { flow } from '@constellar/utils'

import { rewrite } from '.'
import { eq, update, view } from '../core'

describe('rewrite', () => {
	const focus = flow(
		eq<string>(),
		rewrite((s) => s.toUpperCase()),
	)
	it('view', () => {
		expect(view(focus)('foo')).toBe('foo')
	})
	it('put', () => {
		expect(update(focus, 'foo')('')).toBe('FOO')
	})
})
