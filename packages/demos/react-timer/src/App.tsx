import { Json } from '@/json'
import { machineAtom, selectAtom } from '@constellar/jotai'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useAtomCallback } from 'jotai/utils'
import { useCallback } from 'react'

import { clockAtom, useSetupClock } from './clock'
import { timerMachine } from './machine'

const timerAtom = machineAtom(timerMachine())
const toggleAtom = atom(null, (get, set) =>
	set(timerAtom, { type: 'toggle', now: get(clockAtom) }),
)
const toggledAtom = selectAtom(
	timerAtom,
	({ next }) =>
		next({
			type: 'toggle',
			now: 0,
		}).type,
)
const toStateNames = {
	stopped: 'Stop',
	running: 'Start',
}
function Toggle() {
	const toggle = useSetAtom(toggleAtom)
	const toggled = useAtomValue(toggledAtom)
	return <button onClick={toggle}>{toStateNames[toggled]}</button>
}

function Reset() {
	const send = useSetAtom(timerAtom)
	const reset = useAtomCallback(
		useCallback(
			(get) => {
				send({
					type: 'reset',
					now: get(clockAtom),
				})
			},
			[send],
		),
	)
	return <button onClick={reset}>Reset</button>
}

const secondsAtom = atom((get) =>
	Math.floor(get(timerAtom).count(get(clockAtom)) / 1000),
)
function Counter() {
	const seconds = useAtomValue(secondsAtom)
	return <div>{seconds}</div>
}

export default function Timer() {
	useSetupClock()
	return (
		<div>
			<Toggle />
			<Reset />
			<Counter />
			<Json store={timerAtom} />
			<Json store={clockAtom} />
		</div>
	)
}
