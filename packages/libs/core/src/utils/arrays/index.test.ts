import {
	append,
	insert,
	insertValue,
	prepend,
	remove,
	removeValue,
	replace,
} from '.'

describe('prepend', () => {
	it('prepends an element', () => {
		expect(prepend(3, [0, 1, 2])).toEqual([3, 0, 1, 2])
	})
})

describe('append', () => {
	it('appends an element', () => {
		expect(append(3, [0, 1, 2])).toEqual([0, 1, 2, 3])
	})
})

describe('insert', () => {
	it('inserts an element', () => {
		expect(insert(0, 3, [0, 1, 2])).toEqual([3, 0, 1, 2])
		expect(insert(1, 3, [0, 1, 2])).toEqual([0, 3, 1, 2])
		expect(insert(2, 3, [0, 1, 2])).toEqual([0, 1, 3, 2])
		expect(insert(-1, 3, [0, 1, 2])).toEqual([0, 1, 3, 2])
		expect(insert(3, 3, [0, 1, 2])).toEqual([0, 1, 2, 3])
		expect(insert(4, 3, [0, 1, 2])).toEqual([0, 1, 2])
		expect(insert(-4, 3, [0, 1, 2])).toEqual([0, 1, 2])
	})
})

describe('replace', () => {
	it('replace an element', () => {
		expect(replace(3, 0, [0, 1, 2])).toEqual([3, 1, 2])
		expect(replace(3, 1, [0, 1, 2])).toEqual([0, 3, 2])
		expect(replace(3, 2, [0, 1, 2])).toEqual([0, 1, 3])
		expect(replace(3, -1, [0, 1, 2])).toEqual([0, 1, 3])
		expect(replace(3, 3, [0, 1, 2])).toEqual([0, 1, 2])
		expect(replace(-4, 3, [0, 1, 2])).toEqual([0, 1, 2])
	})
	it('keeps the reference when possible', () => {
		const xs = [0, 1, 2]
		expect(replace(0, 0, xs)).toBe(xs)
	})
})

describe('remove', () => {
	it('remove an element', () => {
		expect(remove(0, [0, 1, 2])).toEqual([1, 2])
		expect(remove(1, [0, 1, 2])).toEqual([0, 2])
		expect(remove(2, [0, 1, 2])).toEqual([0, 1])
		expect(remove(-1, [0, 1, 2])).toEqual([0, 1])
		expect(remove(3, [0, 1, 2])).toEqual([0, 1, 2])
		expect(remove(-4, [0, 1, 2])).toEqual([0, 1, 2])
	})
	it('keeps the reference when possible', () => {
		const xs = [0, 1, 2]
		expect(remove(4, xs)).toBe(xs)
	})
})

describe('insertValue', () => {
	test('insertValue', () => {
		expect(insertValue(3, [1, 2])).toEqual([1, 2, 3])
	})
	test('keep reference', () => {
		const a = [1, 2, 3]
		expect(insertValue(1, a)).toBe(a)
	})
})

describe('removeValue', () => {
	test('removeValue', () => {
		expect(removeValue(1, [1, 2])).toEqual([2])
	})
	test('keep reference', () => {
		const a = [1, 2]
		expect(removeValue(3, a)).toBe(a)
	})
})
