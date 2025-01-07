import { nth } from '.'
import { focus } from '../core'

describe('nth', () => {
	type Source = [number, string, boolean]
	const source: Source = [1, 'a', true]
	const o = focus<Source>()(nth(1))
	it('view', () => {
		const res = o.view(source)
		expectTypeOf(res).toEqualTypeOf<string>()
		expect(res).toBe('a')
	})
	it('put', () => {
		const res = o.update('A')(source)
		expect(res).toEqual([1, 'A', true])
		expectTypeOf(res).toEqualTypeOf<Source>()
	})
})
