import { AreEqual, id } from '@constellar/utils'
import { useMemo, useRef, useSyncExternalStore } from 'react'

import { IRAtom, IRWAtom } from './atoms'

function useSyncSelect<Snapshot, Selected>(
	select: (v: Snapshot) => Selected,
	areEqual: (a: Selected, b: Selected) => unknown,
	subscribe: (onStoreChange: () => void) => () => void,
	getSnapshot: () => Snapshot,
	getServerSnapshot?: () => Snapshot,
): Selected {
	const acc = useRef(select(getSnapshot()))
	return useSyncExternalStore(
		(nofity) =>
			subscribe(() => {
				const next = select(getSnapshot())
				if (!areEqual(acc.current, next)) {
					acc.current = next
					nofity()
				}
			}),
		() => acc.current,
		getServerSnapshot ? () => select(getServerSnapshot()) : undefined,
	)
}

export function useAtomValue<Acc, Selected = Acc>(
	store: IRAtom<Acc>,
	select?: (t: Acc) => Selected,
	areEqual: AreEqual<Selected> = Object.is,
) {
	select = select ?? (id as (a: Acc) => Selected)
	return useSyncSelect(
		select,
		areEqual,
		store.subscribe.bind(store),
		store.peek.bind(store),
		store.peek.bind(store),
	)
}

// this will be removed after React 19
export function useAtom<Event, Acc>(
	store: IRWAtom<Event, Acc>,
	event?: undefined,
): readonly [Acc, (v: Event) => void]
export function useAtom<Event, Acc>(
	store: IRWAtom<Event, Acc>,
	event: Event,
): readonly [Acc, () => void]
export function useAtom<Event, Acc>(
	store: IRWAtom<Event, Acc>,
	event?: Event,
): readonly [Acc, (v: Event) => void | (() => void)]
export function useAtom<Event, Acc>(store: IRWAtom<Event, Acc>, event?: Event) {
	return [
		useAtomValue(store),
		useMemo(
			() =>
				event ? () => store.send(event) : (event: Event) => store.send(event),
			[event, store],
		),
	] as const
}
