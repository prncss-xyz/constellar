import { insert, remove, replace } from '.'

describe('insert', () => {
	it('inserts an element', () => {
		expect(insert(3, 0, [0, 1, 2])).toEqual([3, 0, 1, 2])
		expect(insert(3, 1, [0, 1, 2])).toEqual([0, 3, 1, 2])
		expect(insert(3, 2, [0, 1, 2])).toEqual([0, 1, 3, 2])
	})
})

describe('replace', () => {
	it('replace an element', () => {
		expect(replace(3, 0, [0, 1, 2])).toEqual([3, 1, 2])
		expect(replace(3, 1, [0, 1, 2])).toEqual([0, 3, 2])
		expect(replace(3, 2, [0, 1, 2])).toEqual([0, 1, 3])
	})
})

describe('remove', () => {
	it('remove an element', () => {
		expect(remove([0, 1, 2], 0)).toEqual([1, 2])
		expect(remove([0, 1, 2], 1)).toEqual([0, 2])
		expect(remove([0, 1, 2], 2)).toEqual([0, 1])
	})
})
