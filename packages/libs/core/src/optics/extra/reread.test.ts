import { reread } from '.'
import { focus } from '../core'

describe('reread', () => {
	const o = focus<string>()(reread((s) => s.toUpperCase()))
	it('view', () => {
		expect(o.view('foo')).toBe('FOO')
	})
	it('update', () => {
		// TODO: which behavior is better?
		expect(o.update('')('foo')).toBe('')
		/* expect(update(focus, '')('foo')).toBe('foo') */
	})
})
