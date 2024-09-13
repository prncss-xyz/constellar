import { linear } from '.'
import { flow } from '../../utils'
import { eq, update, view } from '../core'

describe('linear', () => {
	const focus = flow(eq<number>(), linear(1.8, 32))
	it('celsius to fahrenheit', () => {
		expect(view(focus)(-40)).toBe(-40)
		expect(view(focus)(100)).toBe(212)
	})
	it('fahrenheit to celsius', () => {
		expect(update(focus, -40)(0)).toBe(-40)
		expect(update(focus, 212)(0)).toBe(100)
	})
})
