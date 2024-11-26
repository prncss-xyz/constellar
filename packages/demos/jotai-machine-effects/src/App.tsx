import { machineAtom, selectAtom, useMachineEffects } from '@constellar/jotai'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import { Json } from './json'
import { lightsMachine } from './machine'

const lightsAtom = machineAtom(lightsMachine())
const typeAtom = selectAtom(lightsAtom, (s) => s?.type)

function Effects() {
	useMachineEffects(
		lightsAtom,
		useMemo(
			() => ({
				timeout: ({ delay }, send) => {
					const t = setTimeout(() => send('next'), delay)
					return () => clearTimeout(t)
				},
			}),
			[],
		),
	)
	return null
}

function Light() {
	const color = useAtomValue(typeAtom)
	return <div style={{ color }}>{color}</div>
}

function Next() {
	const send = useSetAtom(lightsAtom)
	const next = useCallback(() => send('next'), [send])
	return <button onClick={next}>Next</button>
}
export default function App() {
	return (
		<div>
			<Effects />
			<Light />
			<Next />
			<Json store={lightsAtom} />
		</div>
	)
}
