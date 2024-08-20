import { eq, update, view } from '@/core'
import { flow } from '@constellar/utils'

import { reread } from '.'

describe('reread', () => {
	const focus = flow(
		eq<string>(),
		reread((s) => s.toUpperCase()),
	)
	it('view', () => {
		expect(view(focus)('foo')).toBe('FOO')
	})
	it('put', () => {
		// TODO: which behavior is better?
		expect(update(focus, '')('foo')).toBe('')
		/* expect(update(focus, '')('foo')).toBe('foo') */
	})
})
