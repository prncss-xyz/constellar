import { Atom, atom, WritableAtom } from 'jotai'

function insideAtom<Value, Args extends unknown[], Result>(
	resolvedAtomAtom: Atom<WritableAtom<Value, Args, Result>>,
) {
	return atom(
		(get) => get(get(resolvedAtomAtom)),
		(get, set, ...params: Args) => set(get(resolvedAtomAtom), ...params),
	)
}

export function resolvedAtom<Reference, Value, Args extends unknown[], Result>(
	referenceAtom: Atom<Reference>,
	valueFactory: (reference: Reference) => WritableAtom<Value, Args, Result>,
) {
	return insideAtom(atom((get) => valueFactory(get(referenceAtom))))
}
