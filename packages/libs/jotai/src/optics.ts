// based on https://github.com/jotaijs/jotai-optics/blob/main/src/focusAtom.ts
import {
	active,
	Ctx,
	eq,
	Focus,
	fold,
	FoldForm,
	put,
	update,
	view,
} from '@constellar/optics'
import { AreEqual, shallowEqual, Updater } from '@constellar/utils'
import { atom, Atom, WritableAtom } from 'jotai'

import { selectAtom } from './shared'
import { NonFunction, unwrap } from './utils'

export function viewAtom<Part, Whole, Fail, Command>(
	wholeAtom: Atom<Promise<Whole>>,
	focus: Focus<Part, Whole, Fail, Command>,
): Atom<Promise<Part | Fail>>
export function viewAtom<Part, Whole, Fail, Command>(
	wholeAtom: Atom<Whole>,
	focus: Focus<Part, Whole, Fail, Command>,
): Atom<Part | Fail>
export function viewAtom<Part, Whole, Fail, Command>(
	wholeAtom: Atom<Whole>,
	focus: Focus<Part, Whole, Fail, Command>,
) {
	return selectAtom(wholeAtom, (whole) => view(focus(eq<Whole>()))(whole))
}

export function foldAtom<Part, Whole, Fail, Command>(
	wholeAtom: Atom<Promise<Whole>>,
	focus: Focus<Part, Whole, Fail, Command>,
): <Acc>(form: FoldForm<Part, Acc, Ctx>) => Atom<Promise<Acc>>
export function foldAtom<Part, Whole, Fail, Command>(
	wholeAtom: Atom<Whole>,
	focus: Focus<Part, Whole, Fail, Command>,
): <Acc>(form: FoldForm<Part, Acc, Ctx>) => Atom<Acc>
export function foldAtom<Part, Whole, Fail, Command>(
	wholeAtom: Atom<Whole>,
	focus: Focus<Part, Whole, Fail, Command>,
) {
	return function <Acc>(form: FoldForm<Part, Acc, Ctx>) {
		return selectAtom(wholeAtom, (whole) =>
			fold(focus(eq<Whole>()))(form, whole),
		) as Atom<Acc | Promise<Acc>>
	}
}

export function focusAtom<Part, Whole, Fail, Command, R>(
	wholeAtom: WritableAtom<Promise<Whole>, [Promise<Whole>], R>,
	focus: Focus<Part, Whole, Fail, Command>,
): WritableAtom<Promise<Part | Fail>, [Updater<Part, Command>], void>
export function focusAtom<Part, Whole, Fail, Command, R>(
	wholeAtom: WritableAtom<Promise<Whole>, [Whole], R>,
	focus: Focus<Part, Whole, Fail, Command>,
): WritableAtom<Promise<Part | Fail>, [Updater<Part, Command>], void>
export function focusAtom<Part, Whole, Fail, Command, R>(
	wholeAtom: WritableAtom<Whole, [NonFunction<Whole>], R>,
	focus: Focus<Part, Whole, Fail, Command>,
): WritableAtom<Part | Fail, [Updater<Part, Command>], void>
export function focusAtom<Part, Whole, Fail, Command, R>(
	wholeAtom: WritableAtom<Whole, [NonFunction<Whole>], R>,
	focus: Focus<Part, Whole, Fail, Command>,
) {
	const optic = focus(eq<Whole>())
	return atom(
		(get) => unwrap(get(wholeAtom), view(optic)),
		(get, set, arg: Updater<Part, Command>) =>
			set(
				wholeAtom,
				unwrap(get(wholeAtom), update(optic, arg)) as NonFunction<Whole>,
			),
	)
}

export function disabledFocusAtom<Part, Whole, Fail, Command, R>(
	wholeAtom: WritableAtom<Promise<Whole>, [Promise<Whole>], R>,
	focus: Focus<Part, Whole, Fail, Command>,
	part: Part,
	areEqual?: AreEqual<unknown>,
): WritableAtom<Promise<boolean>, [], R>
export function disabledFocusAtom<Part, Whole, Fail, Command, R>(
	wholeAtom: WritableAtom<Promise<Whole>, [Whole], R>,
	focus: Focus<Part, Whole, Fail, Command>,
	part: Part,
	areEqual?: AreEqual<unknown>,
): WritableAtom<Promise<boolean>, [], R>
export function disabledFocusAtom<Part, Whole, Fail, Command, R>(
	wholeAtom: WritableAtom<Whole, [NonFunction<Whole>], R>,
	focus: Focus<Part, Whole, Fail, Command>,
	part: Part,
	areEqual?: AreEqual<unknown>,
): WritableAtom<boolean, [], R>
export function disabledFocusAtom<Part, Whole, Fail, Command, R>(
	wholeAtom: WritableAtom<Whole, [NonFunction<Whole>], R>,
	focus: Focus<Part, Whole, Fail, Command>,
	part: Part,
	areEqual: AreEqual<unknown> = shallowEqual,
) {
	const optic = active(part, areEqual)(focus(eq<Whole>()))
	return atom(
		(get) => unwrap(get(wholeAtom), view(optic)),
		(get, set) =>
			set(
				wholeAtom,
				unwrap(get(wholeAtom), put(optic, true)) as NonFunction<Whole>,
			),
	)
}