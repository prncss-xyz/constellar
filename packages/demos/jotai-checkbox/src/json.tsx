import { Atom, useAtomValue } from 'jotai'

export function Json({ store }: { store: Atom<unknown> }) {
	const json = useAtomValue(store)
	return <div>{JSON.stringify(json)}</div>
}
