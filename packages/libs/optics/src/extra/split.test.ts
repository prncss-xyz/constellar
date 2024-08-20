import { eq, update, view } from '@/core'
import { flow } from '@constellar/utils'

import { split } from '.'

describe('split', () => {
	const source = 'foo bar baz'
	const focus = flow(eq<string>(), split(' '))
	it('view', () => {
		expect(view(focus)(source)).toEqual(['foo', 'bar', 'baz'])
	})
	it('put', () => {
		expect(update(focus, ['FOO', 'BAR', 'BAZ'])(source)).toEqual('FOO BAR BAZ')
	})
})
