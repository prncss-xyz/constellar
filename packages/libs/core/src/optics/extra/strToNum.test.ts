import { strToNum } from '.'
import { flow } from '../../utils'
import { encode, eq, view } from '../core'

describe('strToNum', () => {
	const focus = flow(eq<string>(), strToNum())
	test('view undefined', () => {
		expect(view(focus)('a')).toBeUndefined()
	})
	test('view defined', () => {
		expect(view(focus)('')).toBeUndefined()
	})
	test('view defined', () => {
		expect(view(focus)('3')).toBe(3)
	})
	test('encode', () => {
		expect(encode(focus)(3)).toEqual('3')
	})
})
