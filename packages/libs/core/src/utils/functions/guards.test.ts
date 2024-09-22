import { eq, findMany, view } from '../../optics'
import { flow } from './flow'
import { isDefined } from './guards'

describe('isDefined', () => {
	test('description', () => {
		const focus = flow(eq<(string | undefined)[]>(), findMany(isDefined))
		const e = view(focus)(['', undefined])
		expectTypeOf(e).toEqualTypeOf<string[]>()
		expect(e).toEqual([''])
	})
})
