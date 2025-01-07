import { linear } from '.'
import { focus } from '../core'

describe('linear', () => {
	const o = focus<number>()(linear(1.8, 32))
	it('celsius to fahrenheit', () => {
		expect(o.view(-40)).toBe(-40)
		expect(o.view(100)).toBe(212)
	})
	it('fahrenheit to celsius', () => {
		expect(o.update(-40)(0)).toBe(-40)
		expect(o.update(212)(0)).toBe(100)
	})
})
