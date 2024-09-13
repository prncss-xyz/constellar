import { reread } from '.'
import { flow } from '../../utils'
import { eq, update, view } from '../core'

describe('reread', () => {
	const focus = flow(
		eq<string>(),
		reread((s) => s.toUpperCase()),
	)
	it('view', () => {
		expect(view(focus)('foo')).toBe('FOO')
	})
	it('update', () => {
		// TODO: which behavior is better?
		expect(update(focus, '')('foo')).toBe('')
		/* expect(update(focus, '')('foo')).toBe('foo') */
	})
})
