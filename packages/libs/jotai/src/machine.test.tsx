import { fireEvent, render, screen } from '@testing-library/react'
import { atom, createStore, useAtom } from 'jotai'
import { useMemo, useState } from 'react'

import {
	disabledEventAtom,
	machineAtom,
	multiStateJotaiMachine,
	simpleStateJotaiMachine,
	valueEventAtom,
} from './machine'
import { useMachineEffects } from './machine-effects'

describe('machineAtom', () => {
	type State = { n: number }
	const someMachine = simpleStateJotaiMachine()(
		{
			events: {
				add: (e: { n: number }, { n }) => ({
					n: n + e.n,
				}),
				noop: () => undefined,
			},
			init: { n: 1 },
		},

		(s) => (s.n === 2 ? s : undefined),
	)
	test('default factory', async () => {
		const someAtom = machineAtom(someMachine())
		const store = createStore()
		store.set(someAtom, { n: 1, type: 'add' })
		await Promise.resolve()
		expect(store.get(someAtom)).toMatchObject({ n: 2 })
	})
	test('async factory', async () => {
		const someAtom = machineAtom(someMachine(), (init) =>
			atom(Promise.resolve(init)),
		)
		const store = createStore()
		store.set(someAtom, { n: 1, type: 'add' })
		await Promise.resolve()
		expect(await store.get(someAtom)).toMatchObject({ n: 2 })
	})
	test('async factory, noop', async () => {
		const someAtom = machineAtom(someMachine(), (init) =>
			atom(Promise.resolve(init)),
		)
		const store = createStore()
		store.set(someAtom, 'noop')
		await Promise.resolve()
		expect(await store.get(someAtom)).toMatchObject({ n: 1 })
	})
	test('provided factory', async () => {
		const someAtom = machineAtom(someMachine(), (init) =>
			atom(Promise.resolve(init)),
		)
		const store = createStore()
		store.set(someAtom, { n: 1, type: 'add' })
		await Promise.resolve()
		expect(await store.get(someAtom)).toMatchObject({ n: 2 })
	})
	test('provided factory', async () => {
		let r: State = { n: -1 }
		const someAtom = machineAtom(someMachine(), (init) => {
			const baseAtom = atom(init)
			return atom(
				(get) => get(baseAtom),
				(_get, set, value: State) => {
					r = value
					return set(baseAtom, value)
				},
			)
		})
		const store = createStore()
		store.set(someAtom, { n: 1, type: 'add' })
		await Promise.resolve()
		expect(store.get(someAtom)).toMatchObject({ n: 2 })
		// only the serializable part is stored
		expect(r).toEqual({ n: 2 })
	})
})

describe('effects', () => {
	const someMachine = simpleStateJotaiMachine()(
		{
			events: {
				n: (e: { value: number }) => ({
					n: e.value,
				}),
			},
			init: { n: 0 },
			transform: (s) => ({ ...s, effects: s.n < 0 ? {} : { a: s.n } }),
		},
		(s) => (s.n === 2 ? s : undefined),
	)
	test('effects', async () => {
		const cbIn = vi.fn((..._: unknown[]) => {})
		const cbOut = vi.fn(() => {})
		const someAtom = machineAtom(someMachine())
		function Machine() {
			useMachineEffects(
				someAtom,
				useMemo(
					() => ({
						a: (e) => {
							cbIn(e)
							return () => cbOut()
						},
					}),
					[],
				),
			)
			const [, send] = useAtom(someAtom)
			return <button onClick={() => send({ type: 'n', value: 2 })}>send</button>
		}
		function App() {
			const [open, setOpen] = useState(true)
			return (
				<>
					<button onClick={() => setOpen(!open)}>toggle</button>
					{open && <Machine />}
				</>
			)
		}
		render(<App />)
		expect(cbIn.mock.calls[0]?.[0]).toBe(0)
		expect(cbIn).toHaveBeenCalledTimes(1)
		expect(cbOut).toHaveBeenCalledTimes(0)

		fireEvent.click(screen.getByText('send'))
		expect(cbIn.mock.calls[1]?.[0]).toBe(2)
		expect(cbIn).toHaveBeenCalledTimes(2)
		expect(cbOut).toHaveBeenCalledTimes(1)

		// unmount the component
		fireEvent.click(screen.getByText('toggle'))
		expect(cbIn).toHaveBeenCalledTimes(2)
		expect(cbOut).toHaveBeenCalledTimes(2)
	})
})

describe('disabledEventAtom', () => {
	const store = createStore()
	const machine = simpleStateJotaiMachine()({
		events: {
			a: ({ value }: { value: number }) =>
				value === 0 ? undefined : { a: value },
		},
		init: { a: 0 },
	})
	test('sync', () => {
		const reducerAtom = machineAtom(machine())
		const a0Atom = disabledEventAtom(reducerAtom, {
			type: 'a',
			value: 0,
		})
		expect(store.get(a0Atom)).toBeTruthy()
		const a1Atom = disabledEventAtom(reducerAtom, { type: 'a', value: 1 })
		expect(store.get(a1Atom)).toBeFalsy()
	})
	test('async', async () => {
		const reducerAtom = machineAtom(machine(), (init) =>
			atom(Promise.resolve(init)),
		)
		const a0Atom = disabledEventAtom(reducerAtom, {
			type: 'a',
			value: 0,
		})
		expect(await store.get(a0Atom)).toBeTruthy()
		const a1Atom = disabledEventAtom(reducerAtom, { type: 'a', value: 1 })
		expect(await store.get(a1Atom)).toBeFalsy()
	})
})

describe('value', () => {
	const someMachine = simpleStateJotaiMachine()({
		events: {
			a: (e: { value: number }) => ({ a: e.value }),
		},
		init: { a: 0 },
	})
	test('sync', async () => {
		const store = createStore()
		const someAtom = machineAtom(someMachine())
		const valueAtom = valueEventAtom(
			someAtom,
			(s) => s.a,
			(value: number, send) => send({ type: 'a', value }),
		)
		expect(store.get(valueAtom)).toBe(0)
		store.set(valueAtom, 1)
		await Promise.resolve()
		expect(store.get(valueAtom)).toBe(1)
		store.set(valueAtom, (x) => x + 1)
		await Promise.resolve()
		expect(store.get(valueAtom)).toBe(2)
	})

	test('async', async () => {
		const store = createStore()
		const someAtom = machineAtom(someMachine(), (init) =>
			atom(Promise.resolve(init)),
		)
		const valueAtom = valueEventAtom(
			someAtom,
			(s) => s.a,
			(value: number, send) => send({ type: 'a', value }),
		)
		expect(await store.get(valueAtom)).toBe(0)
		await store.set(valueAtom, 1)
		await Promise.resolve()
		expect(await store.get(valueAtom)).toBe(1)
		store.set(valueAtom, (x) => x + 1)
		await Promise.resolve()
		expect(await store.get(valueAtom)).toBe(2)
	})
})

describe('messages', () => {
	type State = { type: 'a' }
	type Event = { type: 'in' }
	const countAtom = atom(0)
	const someMachine = multiStateJotaiMachine<Event, State, object, object>()({
		init: 'a',
		states: {
			a: {
				events: {
					in: (_e, _s, _get, set) => set(countAtom, (x) => x + 1),
				},
			},
		},
	})
	const reducerAtom = machineAtom(someMachine())
	test('event should propagate as message', async () => {
		const store = createStore()
		expect(store.get(countAtom)).toBe(0)
		store.set(reducerAtom, 'in')
		await Promise.resolve()
		expect(store.get(countAtom)).toBe(1)
	})
})
