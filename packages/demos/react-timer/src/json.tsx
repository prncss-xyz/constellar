import { IRAtom, useAtomValue } from '@constellar/atoms'

export function Json({ store }: { store: IRAtom<unknown> }) {
	const json = useAtomValue(store, JSON.stringify)
	return <div>{json}</div>
}
