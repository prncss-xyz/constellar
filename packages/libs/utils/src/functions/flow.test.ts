import { flow } from './flow'

const plus1 = (v: number): number => v + 1
const times2 = (v: number): number => v * 2

test('flow', () => {
	const result = flow(0, plus1, plus1)
	expect(result).toEqual(2)

	const result2 = flow(
		0,
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
	)
	expect(result2).toEqual(18)
})
