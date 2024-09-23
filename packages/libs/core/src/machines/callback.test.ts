import { machineCb } from './callback'
import { fixstateMachine } from './fixstate'

describe('callback', () => {
	const machine = fixstateMachine({
		init: { n: 1 },
		events: {
			add: (e: { n: number }, { n }) => ({
				n: n + e.n,
			}),
			noop: () => undefined,
		},
		getFinal: (s) => (s.n === 2 ? s : undefined),
	})()
	const init = machine.init
	const cb = machineCb(machine)

	test('init', () => {
		expect(cb(init)).toMatchObject({ n: 1 })
	})
	test('next, defined', () => {
		expect(cb(init).next({ type: 'add', n: 2 })).toMatchObject({
			n: 3,
		})
	})
	test('next, undefined', () => {
		expect(cb(init).next('noop')).toMatchObject({
			n: 1,
		})
	})
	test('isDisabled', () => {
		expect(cb(init).isDisabled('noop')).toBe(true)
	})
	test('visit', () => {
		expect(
			cb(init).visit(({ n }, acc, i) => acc + ` n=${n}; i=${i};`, ''),
		).toBe(' n=1; i=;')
	})
})