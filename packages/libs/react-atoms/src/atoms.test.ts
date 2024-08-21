import { fromState, RESET } from '.'

describe('fromState', () => {
	test('put', () => {
		const { fold } = fromState<number>()(0)
		expect(fold(1, 5)).toEqual(1)
	})
	test('modify', () => {
		const { fold } = fromState<number>()(0)
		expect(fold((x) => x + 1, 5)).toEqual(6)
	})
	test('reset', () => {
		const { fold } = fromState<number>()(0)
		expect(fold(RESET, 5)).toEqual(0)
	})
	describe('areEqual', () => {
		it('should keep original value if it equals to the new one', () => {
			const { fold } = fromState<number>({
				areEqual: (a, b) => Math.abs(a) === Math.abs(b),
			})(0)
			expect(fold((x) => x + 1, 1)).toEqual(2)
			expect(fold((x) => -x, 1)).toEqual(1)
		})
	})
	it('normalize', () => {
		const { init, fold } = fromState<number>({ normalize: (x) => x - (x % 2) })(
			1,
		)
		expect(init()).toBe(0)
		expect(fold(1, 4)).toBe(0)
	})
})
