import { collect } from '@constellar/utils'
import { fireEvent, render, screen } from '@testing-library/react'
import { atom, createStore, useSetAtom } from 'jotai'
import { useState } from 'react'
import { spy } from 'tinyspy'

import { atomWithReducer, useMachineInterperter } from './machine'

describe('reducer', () => {
	test('default factory', async () => {
		const monoid = collect()
		const reducer = atomWithReducer(monoid)
		const store = createStore()
		store.set(reducer, 1)
		store.set(reducer, 2)
		await Promise.resolve()
		expect(store.get(reducer)).toEqual([1, 2])
	})
	test('provided factory', async () => {
		const monoid = collect<number>()
		let r: number[] = []
		const reducerAtom = atomWithReducer(monoid, {
			atomFactory: (init) => {
				const baseAtom = atom(init)
				return atom(
					(get) => get(baseAtom),
					(_get, set, value: number[]) => {
						r = value
						return set(baseAtom, value)
					},
				)
			},
		})
		const store = createStore()
		store.set(reducerAtom, 1)
		store.set(reducerAtom, 2)
		await Promise.resolve()
		expect(store.get(reducerAtom)).toEqual([1, 2])
		expect(r).toEqual([1, 2])
	})
})

describe('effects', () => {
	test('effects', async () => {
		const machineAtom = atomWithReducer({
			init: { effects: { a: 0 } },
			fold: (n: number, s) => (n < 0 ? s : { effects: { a: s.effects.a + n } }),
		})
		const cbIn = spy((..._: unknown[]) => {})
		const cbOut = spy(() => {})
		function Machine() {
			const send = useSetAtom(machineAtom)
			useMachineInterperter(machineAtom, {
				a: (...args) => {
					cbIn(...args)
					return cbOut
				},
			})
			return <button onClick={() => send(2)}>send</button>
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
