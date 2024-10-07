import {
	command,
	eq,
	findOne,
	flow,
	linear,
	modify,
	prop,
	put,
	REMOVE,
	view,
} from '@constellar/core'
import { expect, test } from 'vitest'

test('test', () => {
	type T = { a?: number }

	const focus = flow(eq<T>(), prop('a'))
	const res: number | undefined = view(focus)({ a: 2 }) // res === 2
	expect(res).toEqual(2)
	const updated = put(focus, 3)({ a: 2 }) // updated === { a: 3 }
	expect(updated).toEqual({ a: 3 })
	const modified = modify(focus, (x) => -x)({ a: 2 }) // modified === { a: -2 }
	expect(modified).toEqual({ a: -2 })
	const removed = command(focus, REMOVE)({ a: 2 }) // removed === {}
	expect(removed).toEqual({})
})

test('test', () => {
	type T = { pools: { celsius: number; id: string }[] }
	// focus the temperature of the pool with id 'asdf' in fahrenheit
	const focus = flow(
		eq<T>(),
		prop('pools'),
		findOne(({ id }) => id === 'asdf'),
		prop('celsius'),
		linear(1.8, 32),
	)
	const sample: T = { pools: [{ celsius: 20, id: 'asdf' }] }
	const res = view(focus)(sample) // res === 68
	expect(res).toEqual(68)
	const updated = put(focus, 212)(sample) // updated === { pools: [{ id: 'asdf', celsius: 100 }] }
	expect(updated).toEqual({ pools: [{ celsius: 100, id: 'asdf' }] })
})
