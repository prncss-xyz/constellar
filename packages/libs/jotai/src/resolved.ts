import { Atom, atom, WritableAtom } from 'jotai'

// TODO: support async atom ?
export function flattenedAtom<Value, Args extends unknown[], Result>(
	atomAtom: Atom<WritableAtom<Value, Args, Result>>,
) {
	return atom(
		(get) => get(get(atomAtom)),
		(get, set, ...params: Args) => set(get(atomAtom), ...params),
	)
}

export function resolvedAtom<Reference, Value, Args extends unknown[], Result>(
	referenceAtom: Atom<Reference>,
	valueFactory: (reference: Reference) => WritableAtom<Value, Args, Result>,
) {
	return flattenedAtom(atom((get) => valueFactory(get(referenceAtom))))
}
