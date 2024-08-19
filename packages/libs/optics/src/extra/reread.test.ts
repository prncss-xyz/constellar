import { eq } from '@/core'
import { flow } from '@constellar/utils'

import { reread } from '.'

describe('reread', () => {
	const focus = flow(
		eq<string>(),
		reread((s) => s.toUpperCase()),
	)
	it('view', () => {
		expect(focus.view('foo')).toBe('FOO')
	})
	it('put', () => {
		// TODO: which behavior is better?
		expect(focus.put('')('foo')).toBe('')
		/* expect(focus.put('', 'foo')).toBe('foo') */
	})
})
