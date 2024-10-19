/* eslint-disable @typescript-eslint/no-explicit-any */
import { toListener } from './listener'

describe('listener', () => {
	test('object', () => {
		const a = vi.fn()
		const b = vi.fn()
		const listener = toListener<any, any>({
			a,
			b,
		})
		listener({ type: 'a', value: 1 }, 2)
		expect(a).toHaveBeenCalledWith({ type: 'a', value: 1 }, 2)
		expect(b).toHaveBeenCalledTimes(0)
	})
	test('function', () => {
		const listener = toListener(vi.fn())
		listener({ type: 'a', value: 1 }, 2)
		expect(listener).toHaveBeenCalledWith({ type: 'a', value: 1 }, 2)
	})
})
