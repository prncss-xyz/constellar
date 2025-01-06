/* eslint-disable react-hooks/exhaustive-deps */
import { multiStateMachine } from '@constellar/core'
import { renderHook } from '@testing-library/react'
import { useEffect, useMemo } from 'react'

import { useMachine, useMachineEffects, valueEvent } from './machine'

describe.skip('machine', () => {
	const someMachine = multiStateMachine<
		{ type: 'add' },
		{ n: number; type: 'main' },
		object,
		{ effects: { a?: number } },
		{ type: 'hi' }
	>()({
		derive: (s) => ({ ...s, effects: s.n < 0 ? {} : { a: s.n } }),
		init: { n: 0, type: 'main' },
		states: {
			main: {
				events: {
					add: (_e, { n }, send) => (
						send('hi'),
						{
							n: n + 1,
							type: 'main',
						}
					),
				},
			},
		},
	})
	test('update on event', () => {
		const listener = vi.fn()
		const { result } = renderHook(() => {
			const [state, send] = useMachine(someMachine(), listener)
			useEffect(() => {
				send('add')
			}, [])
			return state
		})
		expect(result.current).toMatchObject({ n: 1 })
		expect(listener).toHaveBeenCalledTimes(1)
		expect(listener).toHaveBeenCalledWith({ type: 'hi' })
	})
	test('effects', () => {
		const m = someMachine()
		const listener = vi.fn()
		const { result } = renderHook(() => {
			const [state, send] = useMachine(m, listener)
			useEffect(() => {
				send('add')
			}, [])
			return state
		})
		const cbIn = vi.fn((..._: unknown[]) => {})
		const cbOut = vi.fn(() => {})
		useMachineEffects(
			m,
			result.current,
			listener,
			useMemo(
				() => ({
					a: (e: number) => {
						cbIn(e)
						return () => cbOut()
					},
				}),
				[],
			),
		)
		expect(listener).toHaveBeenCalledTimes(1)
		expect(listener).toHaveBeenCalledWith({ type: 'hi' })
	})
})

test('useMachineEffects', () => {})

test('valueEvent', () => {
	type Event = number
	type State = { n: number }
	type Value = number
	const send = vi.fn<(event: Event) => void>()
	const [v, s] = valueEvent<Event, State, Value>(
		(s) => s.n,
		(value, send) => send(value),
		[{ n: 1 }, send],
	)
	expect(v).toBe(1)
	s(2)
	expect(send).toHaveBeenCalledWith(2)
	s((x) => x - 1)
	expect(send).toHaveBeenCalledWith(0)
})
