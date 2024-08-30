/* eslint-disable @typescript-eslint/no-explicit-any */
import { eq, fold, IOptic, update, view } from '@constellar/optics'
import { fromInit, id, Monoid, Updater } from '@constellar/utils'
import { atom, Atom, WritableAtom } from 'jotai'

import { NonFunction, unwrap } from './utils'

export function selectAtom<Part, Whole>(
	sourceAtom: Atom<Promise<Whole>>,
	select: (w: Whole) => Part,
): Atom<Promise<Part>>
export function selectAtom<Part, Whole>(
	sourceAtom: Atom<Whole>,
	select: (w: Whole) => Part,
): Atom<Part>
export function selectAtom<Part, Whole>(
	sourceAtom: Atom<Whole | Promise<Whole>>,
	select: (w: Whole) => Part,
) {
	return atom((get) => unwrap(get(sourceAtom), select))
}

export function viewAtom<Part, Whole, Fail, Command>(
	wholeAtom: Atom<Promise<Whole>>,
	focus: (
		o: IOptic<Whole, Whole, never, never>,
	) => IOptic<Part, Whole, Fail, Command>,
): Atom<Promise<Part | Fail>>
export function viewAtom<Part, Whole, Fail, Command>(
	wholeAtom: Atom<Whole>,
	focus: (
		o: IOptic<Whole, Whole, never, never>,
	) => IOptic<Part, Whole, Fail, Command>,
): Atom<Part | Fail>
export function viewAtom<Part, Whole, Fail, Command>(
	wholeAtom: Atom<Whole>,
	focus: (
		o: IOptic<Whole, Whole, never, never>,
	) => IOptic<Part, Whole, Fail, Command>,
) {
	return selectAtom(wholeAtom, view(focus(eq<Whole>())))
}

export function foldAtom<Part, Whole, Fail, Command, Acc>(
	wholeAtom: Atom<Promise<Whole>>,
	focus: (
		o: IOptic<Whole, Whole, never, never>,
	) => IOptic<Part, Whole, Fail, Command>,
	monoid: Monoid<Part, Acc>,
): Atom<Promise<Acc>>
export function foldAtom<Part, Whole, Fail, Command, Acc>(
	wholeAtom: Atom<Whole>,
	focus: (
		o: IOptic<Whole, Whole, never, never>,
	) => IOptic<Part, Whole, Fail, Command>,
	monoid: Monoid<Part, Acc>,
): Atom<Acc>
export function foldAtom<Part, Whole, Fail, Command, Acc>(
	wholeAtom: Atom<Whole>,
	focus: (
		o: IOptic<Whole, Whole, never, never>,
	) => IOptic<Part, Whole, Fail, Command>,
	monoid: Monoid<Part, Acc>,
) {
	return selectAtom(wholeAtom, fold(focus(eq<Whole>()), monoid))
}

export function focusAtom<Part, Whole, Fail, Command, R>(
	wholeAtom: WritableAtom<Promise<Whole>, [Promise<Whole>], R>,
	focus: (
		o: IOptic<Whole, Whole, never, never>,
	) => IOptic<Part, Whole, Fail, Command>,
): WritableAtom<Promise<Part | Fail>, [Updater<Part, Command>], void>
export function focusAtom<Part, Whole, Fail, Command, R>(
	wholeAtom: WritableAtom<Whole, [NonFunction<Whole>], R>,
	focus: (
		o: IOptic<Whole, Whole, never, never>,
	) => IOptic<Part, Whole, Fail, Command>,
): WritableAtom<Part | Fail, [Updater<Part, Command>], void>
export function focusAtom<Part, Whole, Fail, Command, R>(
	wholeAtom: WritableAtom<Whole, [NonFunction<Whole>], R>,
	focus: (
		o: IOptic<Whole, Whole, never, never>,
	) => IOptic<Part, Whole, Fail, Command>,
) {
	const resolved = focus(eq<Whole>())
	return atom(
		(get) => unwrap(get(wholeAtom), view(resolved)),
		(get, set, arg: Updater<Part, Command>) =>
			set(
				wholeAtom,
				unwrap(get(wholeAtom), update(resolved, arg)) as NonFunction<Whole>,
			),
	)
}
