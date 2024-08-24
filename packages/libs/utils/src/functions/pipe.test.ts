import { pipe } from './pipe'

const plus1 = (v: number): number => v + 1
const times2 = (v: number): number => v * 2

test('works', () => {
	const result = pipe(plus1, plus1)(0)
	expect(result).toEqual(2)

	const result2 = pipe(
		plus1,
		plus1,
		plus1,
		plus1,
		plus1,
		plus1,
		plus1,
		plus1,
		plus1,
		times2,
	)(0)
	expect(result2).toEqual(18)
})
