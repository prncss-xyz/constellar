import {
	disabledEventAtom,
	machineAtom,
	useMachineEffects,
} from '@constellar/jotai'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useMemo, useState } from 'react'

import { Json } from './json'
import { localCached } from './localCache'
import { turnstileMachine } from './machine'
import { messagesAtom } from './messages'

const turnstileAtom = machineAtom(turnstileMachine())

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

function Pay({ id }: { id: string }) {
	const paymentAtom = useMemo(
		() => disabledEventAtom(turnstileAtom, { id, now: 0, type: 'payment' }),
		[id],
	)
	const disabled = useAtomValue(paymentAtom)
	const send = useSetAtom(turnstileAtom)
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

function Messages() {
	const messages = useAtomValue(messagesAtom)
	return (
		<div>
			<p>Messages:</p>
			<div>
				{messages.map((m, i) => (
					<div key={String(i)}>{m}</div>
				))}
			</div>
		</div>
	)
}

function Effects() {
	const [pay] = useState(() => localCached('now', payment))
	useMachineEffects(
		turnstileAtom,
		useMemo(
			() => ({
				payment: (e, send) => pay(e, send),
			}),
			[pay],
		),
	)
	return null
}

export default function App() {
	return (
		<>
			<Effects />
			<div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
				<div>
					<Pay id="123" />
					<Push />
				</div>
				<Json store={turnstileAtom} />
				<Messages />
			</div>
		</>
	)
}
