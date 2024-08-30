/* eslint-disable @typescript-eslint/no-explicit-any */
import { Json } from '@/json'
import {
	atomWithReducer,
	selectAtom,
	useMachineInterperter,
} from '@constellar/jotai'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { machine } from './machine'

const machineAtom = atomWithReducer(machine())
const typeAtom = selectAtom(machineAtom, (s) => s?.type)

function Effects() {
	useMachineInterperter(machineAtom, {
		timeout: ({ delay, event }, send) => {
			const t = setTimeout(() => send({ type: event }), delay)
			return () => clearTimeout(t)
		},
	})
	return null
}

function Light() {
	const color = useAtomValue(typeAtom)
	return <div style={{ color }}>{color}</div>
}

function Next() {
	const send = useSetAtom(machineAtom)
	const next = useCallback(() => send('next'), [send])
	return <button onClick={next}>Next</button>
}
function Main() {
	return (
		<div>
			<Effects />
			<Light />
			<Next />
			<Json store={machineAtom} />
		</div>
	)
}

export default function App() {
	return <Main />
}
