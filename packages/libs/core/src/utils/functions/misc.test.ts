import { curry, isEmpty } from './misc'

describe('isEmpty', () => {
	test('empty', () => {
		expect(isEmpty({})).toBe(true)
	})

	test('not empty', () => {
		expect(isEmpty({ a: 1 })).toBe(false)
	})
})

describe('curry', () => {
	const f = (a: number, b: number, c: number) => a + b + c
	test('0 arguments', () => {
		const g = curry(f)
		expect(g(1, 2, 3)).toBe(6)
	})
	test('1 argument', () => {
		const g = curry(f, 1)
		expect(g(2, 3)).toBe(6)
	})
	test('3 arguments', () => {
		const g = curry(f, 1, 2, 3)
		expect(g()).toBe(6)
	})
})
