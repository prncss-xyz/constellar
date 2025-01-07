import { rewrite } from '.'
import { focus } from '../core'

describe('rewrite', () => {
	const o = focus<string>()(rewrite((s) => s.toUpperCase()))
	it('view', () => {
		expect(o.view('foo')).toBe('foo')
	})
	it('put', () => {
		expect(o.update('foo')('')).toBe('FOO')
	})
})
