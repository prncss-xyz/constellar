import { shallowEqual } from '.'

describe('shallowEqual', () => {
	test('description', () => {
		expect(shallowEqual(1, 1)).toBeTruthy()
		expect(shallowEqual(1, 2)).toBeFalsy()
		expect(shallowEqual([], [1])).toBeFalsy()
		expect(shallowEqual([1], [])).toBeFalsy()
		expect(shallowEqual([1], [1])).toBeTruthy()
		expect(shallowEqual([1], [2])).toBeFalsy()
		expect(shallowEqual({ a: 1 }, { a: 1 })).toBeTruthy()
		expect(shallowEqual({ a: 1 }, { a: 2 })).toBeFalsy()
		expect(shallowEqual([[1]], [[1]])).toBeFalsy()
		expect(shallowEqual({ a: undefined }, {})).toBeFalsy()
	})
})
