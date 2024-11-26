/* eslint-disable @typescript-eslint/no-explicit-any */
import { toListener } from './listener'

describe('listener', () => {
	test('object', () => {
		const a = vi.fn()
		const b = vi.fn()
		const listener = toListener<any>({
			a,
			b,
		})
		listener({ type: 'a', value: 1 })
		expect(a).toHaveBeenCalledWith({ type: 'a', value: 1 })
		expect(b).toHaveBeenCalledTimes(0)
	})
	test('function', () => {
		const a = vi.fn()
		const listener = toListener(a)
		listener({ type: 'a', value: 1 })
		expect(a).toHaveBeenCalledWith({ type: 'a', value: 1 })
	})
})
