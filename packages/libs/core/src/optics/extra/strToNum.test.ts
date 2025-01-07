import { strToNum } from '.'
import { focus } from '../core'

describe('strToNum', () => {
	const o = focus<string>()(strToNum())
	test('view undefined', () => {
		expect(o.view('a')).toBeUndefined()
	})
	test('view defined', () => {
		expect(o.view('')).toBeUndefined()
	})
	test('view defined', () => {
		expect(o.view('3')).toBe(3)
	})
	test('put', () => {
		expect(o.put(3)).toEqual('3')
	})
})
