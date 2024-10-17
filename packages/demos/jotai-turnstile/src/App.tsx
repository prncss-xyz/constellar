import {
	disabledEventAtom,
	machineAtom,
	useMachineEffects,
} from '@constellar/jotai'
import { useAtom } from 'jotai'
import { useCallback, useMemo } from 'react'
import toast, { Toaster } from 'react-hot-toast'

import { Json } from './json'
import { localCached } from './localCache'
import { turnstileMachine } from './machine'

const turnstileAtom = machineAtom(turnstileMachine(), {
	listener: {
		error: () => toast.error('Payment refused.'),
		success: ({ amount }) =>
			toast.success(`Payment accepted, you still have ${amount} tickets.`),
	},
})

function payment(_: {
	id: string
	now: number
}): Promise<{ amount: number; type: 'success' } | { type: 'error' }> {
	return new Promise((resolve) => {
		setTimeout(() => {
			const r = Math.random()
			if (r < 0.5) {
				resolve({ type: 'error' })
				return
			}
			const amount = Math.round(Math.random() * 10)
			resolve({ amount, type: 'success' })
		}, 1000)
	})
}

function Effects() {
	const [state, send] = useAtom(turnstileAtom)
	useMachineEffects(
		state,
		send,
		useMemo(() => ({ payment: localCached('now', payment, send) }), [send]),
	)
	return null
}

function Pay({ id }: { id: string }) {
	const [state, send] = useAtom(turnstileAtom)
	const disabled = state.isDisabled({ id, now: 0, type: 'payment' })
	const onClick = useCallback(() => {
		send({ id, now: Date.now(), type: 'payment' })
	}, [id, send])
	return (
		<button disabled={disabled} onClick={onClick}>
			Pay
		</button>
	)
}

const pushAtom = disabledEventAtom(turnstileAtom, 'push')
function Push() {
	const [disabled, onClick] = useAtom(pushAtom)
	return (
		<button disabled={disabled} onClick={onClick}>
			Push
		</button>
	)
}

export default function App() {
	return (
		<div>
			<Effects />
			<Pay id="123" />
			<Push />
			<Json store={turnstileAtom} />
			<Toaster />
		</div>
	)
}
