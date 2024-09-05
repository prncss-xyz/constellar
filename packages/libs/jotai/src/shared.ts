import { Atom, atom } from 'jotai'

import { unwrap } from './utils'

export function selectAtom<Part, Whole>(
	sourceAtom: Atom<Promise<Whole>>,
	select: (w: Whole) => Part,
): Atom<Promise<Part>>
export function selectAtom<Part, Whole>(
	sourceAtom: Atom<Whole>,
	select: (w: Whole) => Part,
): Atom<Part>
export function selectAtom<Part, Whole>(
	sourceAtom: Atom<Whole>,
	select: (w: Whole) => Part,
) {
	return atom((get) => unwrap(get(sourceAtom), select))
}
