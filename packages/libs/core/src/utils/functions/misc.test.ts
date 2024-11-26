import { isEmpty } from './misc'

describe('isEmpty', () => {
	test('empty', () => {
		expect(isEmpty({})).toBe(true)
	})

	test('not empty', () => {
		expect(isEmpty({ a: 1 })).toBe(false)
	})
})
