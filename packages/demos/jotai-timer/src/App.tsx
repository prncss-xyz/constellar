import { prop } from '@constellar/core'
import { machineAtom, nextStateAtom, viewAtom } from '@constellar/jotai'
import { atom, useAtomValue, useSetAtom } from 'jotai'

import { Json } from './json'
import { timerMachine } from './machine'
import { nowAtom, useSetupNow } from './now'

const timerAtom = machineAtom(timerMachine())

const toggledAtom = nextStateAtom(timerAtom, { type: 'toggle' })
const toggledTypeAtom = viewAtom(toggledAtom, prop('type'))
const toStateNames = {
	running: 'Start',
	stopped: 'Stop',
}
function Toggle() {
	const send = useSetAtom(timerAtom)
	const toggledType = useAtomValue(toggledTypeAtom)
	return (
		<button onClick={() => send({ type: 'toggle' })}>
			{toStateNames[toggledType]}
		</button>
	)
}

function Reset() {
	const send = useSetAtom(timerAtom)
	return <button onClick={() => send({ type: 'reset' })}>Reset</button>
}

const secondsAtom = atom((get) => Math.floor(get(get(timerAtom).count) / 1000))
function Counter() {
	const seconds = useAtomValue(secondsAtom)
	return <div>{seconds}</div>
}

export default function App() {
	useSetupNow()
	return (
		<div>
			<Toggle />
			<Reset />
			<Counter />
			<Json store={timerAtom} />
			<Json store={nowAtom} />
		</div>
	)
}
