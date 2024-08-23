import { createDerivedAtom, createState, useAtomValue } from '@constellar/atoms'
import { Suspense } from 'react'

const p = new Promise<number>((resolve) => setTimeout(() => resolve(3), 2000))

const valueAtom = createState(p)
const selectAtom = createDerivedAtom(
	valueAtom,
	(v: number) => v * 2,
	(_: void) => (v) => v + 1,
)

function Resolved() {
	const select = useAtomValue(selectAtom)
	return <div>{select}</div>
}

export default function App() {
	const onClick = () => selectAtom.send()
	return (
		<div>
			<h1>Async</h1>
			<Suspense>
				<Resolved />
			</Suspense>
			<button onClick={onClick}>Click</button>
		</div>
	)
}
