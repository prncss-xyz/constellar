import { flow } from '@constellar/utils'

import { nth } from '.'
import { eq, update, view } from '../core'

describe('nth', () => {
	type Source = [number, string, boolean]
	const source: Source = [1, 'a', true]
	const focus = flow(eq<Source>(), nth(1))
	it('view', () => {
		const res = view(focus)(source)
		expectTypeOf(res).toEqualTypeOf<string>()
		expect(res).toBe('a')
	})
	it('put', () => {
		const res = update(focus, 'A')(source)
		expect(res).toEqual([1, 'A', true])
		expectTypeOf(res).toEqualTypeOf<Source>()
	})
})
