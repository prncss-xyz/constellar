import { eq } from '@/core'
import { flow } from '@constellar/utils'

import { split } from '.'

describe('split', () => {
	const source = 'foo bar baz'
	const focus = flow(eq<string>(), split(' '))
	it('view', () => {
		expect(focus.view(source)).toEqual(['foo', 'bar', 'baz'])
	})
	it('put', () => {
		expect(focus.put(['FOO', 'BAR', 'BAZ'])(source)).toEqual('FOO BAR BAZ')
	})
})
