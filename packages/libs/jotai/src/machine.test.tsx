import { fixstateMachine } from '@constellar/core'
import { fireEvent, render, screen } from '@testing-library/react'
import { atom, createStore, useAtom } from 'jotai'
import { useState } from 'react'
import { spy } from 'tinyspy'

import {
	disabledEventAtom,
	machineAtom,
	useMachineEffects,
	valueEventAtom,
} from './machine'

describe('machineAtom', () => {
	type State = { n: number }
	const someMachine = fixstateMachine({
		init: { n: 1 },
		events: {
			add: (e: { n: number }, { n }) => ({
				n: n + e.n,
			}),
		},
		getFinal: (s) => (s.n === 2 ? s : undefined),
	})
	test('default factory', async () => {
		const someAtom = machineAtom(someMachine())
		const store = createStore()
		store.set(someAtom, { type: 'add', n: 1 })
		await Promise.resolve()
		expect(store.get(someAtom)).toMatchObject({ n: 2 })
	})
	test('async factory', async () => {
		const someAtom = machineAtom(someMachine(), {
			atomFactory: (init) => atom(Promise.resolve(init)),
		})
		const store = createStore()
		store.set(someAtom, { type: 'add', n: 1 })
		await Promise.resolve()
		expect(await store.get(someAtom)).toMatchObject({ n: 2 })
	})
	test('provided factory', async () => {
		const someAtom = machineAtom(someMachine(), {
			atomFactory: (init) => atom(Promise.resolve(init)),
		})
		const store = createStore()
		store.set(someAtom, { type: 'add', n: 1 })
		await Promise.resolve()
		expect(await store.get(someAtom)).toMatchObject({ n: 2 })
	})
	test('provided factory', async () => {
		let r: State = { n: -1 }
		const someAtom = machineAtom(someMachine(), {
			atomFactory: (init) => {
				const baseAtom = atom(init)
				return atom(
					(get) => get(baseAtom),
					(_get, set, value: State) => {
						r = value
						return set(baseAtom, value)
					},
				)
			},
		})
		const store = createStore()
		store.set(someAtom, { type: 'add', n: 1 })
		await Promise.resolve()
		expect(store.get(someAtom)).toMatchObject({ n: 2 })
		// only the serializable part is stored
		expect(r).toEqual({ n: 2 })
	})
})

describe('effects', () => {
	const someMachine = fixstateMachine({
		init: { n: 0 },
		events: {
			n: (e: { value: number }) => ({
				n: e.value,
			}),
		},
		transform: (s) => ({ ...s, effects: s.n < 0 ? {} : { a: s.n } }),
		getFinal: (s) => (s.n === 2 ? s : undefined),
	})
	test('effects', async () => {
		const someAtom = machineAtom(someMachine())
		const cbIn = spy((..._: unknown[]) => {})
		const cbOut = spy(() => {})
		function Machine() {
			const [state, send] = useAtom(someAtom)
			useMachineEffects(state, send, {
				a: (...args: unknown[]) => {
					cbIn(...args)
					return cbOut
				},
			})
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
		expect(cbIn.calls[0]?.[0]).toBe(0)
		expect(typeof cbIn.calls[0]?.[1]).toEqual('function')
		expect(cbIn.calls).toHaveLength(1)
		expect(cbOut.calls).toHaveLength(0)

		fireEvent.click(screen.getByText('send'))
		expect(cbIn.calls[1]?.[0]).toBe(2)
		expect(typeof cbIn.calls[1]?.[1]).toEqual('function')
		expect(cbIn.calls).toHaveLength(2)
		expect(cbOut.calls).toHaveLength(1)

		// unmount th ecomponent
		fireEvent.click(screen.getByText('toggle'))
		expect(cbIn.calls).toHaveLength(2)
		expect(cbOut.calls).toHaveLength(2)
	})
})

describe('disabledEventAtom', () => {
	const store = createStore()
	const machine = fixstateMachine({
		init: { a: 0 },
		events: {
			a: ({ value }: { value: number }) =>
				value === 0 ? undefined : { a: value },
		},
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
		const reducerAtom = machineAtom(machine(), {
			atomFactory: (init) => atom(Promise.resolve(init)),
		})
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
	const someMachine = fixstateMachine({
		init: { a: 0 },
		events: {
			a: (e: { value: number }) => ({ a: e.value }),
		},
	})
	test('sync', async () => {
		const store = createStore()
		const someAtom = machineAtom(someMachine())
		const valueAtom = valueEventAtom(
			someAtom,
			(s) => s.a,
			(value, send) => send({ type: 'a', value }),
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
		const someAtom = machineAtom(someMachine(), {
			atomFactory: (init) => atom(Promise.resolve(init)),
		})
		const valueAtom = valueEventAtom(
			someAtom,
			(s) => s.a,
			(value, send) => send({ type: 'a', value }),
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
