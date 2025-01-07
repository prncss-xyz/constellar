// based on https://github.com/jotaijs/jotai-optics/blob/main/src/focusAtom.ts
import {
	Ctx,
	disabled,
	focus as foc,
	Focus,
	FoldForm,
	Updater,
} from '@constellar/core'
import { atom, Atom, WritableAtom } from 'jotai'

import { mappedAtom } from './shared'
import { NonFunction, unwrap } from './utils'

export function viewAtom<Part, Whole, Fail, Command, S>(
	wholeAtom: Atom<Promise<Whole>>,
	focus: Focus<Part, Whole, Fail, Command, S>,
): Atom<Promise<Fail | Part>>
export function viewAtom<Part, Whole, Fail, Command, S>(
	wholeAtom: Atom<Whole>,
	focus: Focus<Part, Whole, Fail, Command, S>,
): Atom<Fail | Part>
export function viewAtom<Part, Whole, Fail, Command, S>(
	wholeAtom: Atom<Whole>,
	focus: Focus<Part, Whole, Fail, Command, S>,
) {
	const o = foc<Whole>()(focus)
	return mappedAtom(wholeAtom, (whole) => o.view(whole))
}

export function foldAtom<Part, Whole, Fail, Command, S>(
	wholeAtom: Atom<Promise<Whole>>,
	focus: Focus<Part, Whole, Fail, Command, S>,
): <Acc>(form: FoldForm<Part, Acc, Ctx>) => Atom<Promise<Acc>>
export function foldAtom<Part, Whole, Fail, Command, S>(
	wholeAtom: Atom<Whole>,
	focus: Focus<Part, Whole, Fail, Command, S>,
): <Acc>(form: FoldForm<Part, Acc, Ctx>) => Atom<Acc>
export function foldAtom<Part, Whole, Fail, Command, S>(
	wholeAtom: Atom<Whole>,
	focus: Focus<Part, Whole, Fail, Command, S>,
) {
	return function <Acc>(form: FoldForm<Part, Acc, Ctx>) {
		const o = foc<Whole>()(focus)
		return mappedAtom(wholeAtom, (whole) => o.fold(form, whole)) as Atom<
			Acc | Promise<Acc>
		>
	}
}

export function focusAtom<Part, Whole, Fail, Command, R, S>(
	wholeAtom: WritableAtom<Promise<Whole>, [Promise<Whole>], R>,
	focus: Focus<Part, Whole, Fail, Command, S>,
): WritableAtom<Promise<Fail | Part>, [Updater<Part, Command>], void>
export function focusAtom<Part, Whole, Fail, Command, R, S>(
	wholeAtom: WritableAtom<Promise<Whole>, [Whole], R>,
	focus: Focus<Part, Whole, Fail, Command, S>,
): WritableAtom<Promise<Fail | Part>, [Updater<Part, Command>], void>
export function focusAtom<Part, Whole, Fail, Command, R, S>(
	wholeAtom: WritableAtom<Whole, [NonFunction<Whole>], R>,
	focus: Focus<Part, Whole, Fail, Command, S>,
): WritableAtom<Fail | Part, [Updater<Part, Command>], void>
export function focusAtom<Part, Whole, Fail, Command, R, S>(
	wholeAtom: WritableAtom<Whole, [NonFunction<Whole>], R>,
	focus: Focus<Part, Whole, Fail, Command, S>,
) {
	const o = foc<Whole>()(focus)
	return atom(
		(get) => unwrap(get(wholeAtom), o.view.bind(o)),
		(get, set, arg: Updater<Part, Command>) =>
			set(
				wholeAtom,
				unwrap(get(wholeAtom), o.update(arg)) as NonFunction<Whole>,
			),
	)
}

export function disabledFocusAtom<Part, Whole, Fail, Command, R, S>(
	wholeAtom: WritableAtom<Promise<Whole>, [Promise<Whole>], R>,
	focus: Focus<Part, Whole, Fail, Command, S>,
	part: Part,
): WritableAtom<Promise<boolean>, [], R>
export function disabledFocusAtom<Part, Whole, Fail, Command, R, S>(
	wholeAtom: WritableAtom<Promise<Whole>, [Whole], R>,
	focus: Focus<Part, Whole, Fail, Command, S>,
	part: Part,
): WritableAtom<Promise<boolean>, [], R>
export function disabledFocusAtom<Part, Whole, Fail, Command, R, S>(
	wholeAtom: WritableAtom<Whole, [NonFunction<Whole>], R>,
	focus: Focus<Part, Whole, Fail, Command, S>,
	part: Part,
): WritableAtom<boolean, [], R>
export function disabledFocusAtom<Part, Whole, Fail, Command, R, S>(
	wholeAtom: WritableAtom<Whole, [NonFunction<Whole>], R>,
	focus: Focus<Part, Whole, Fail, Command, S>,
	part: Updater<Part, Command>,
) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const o = disabled(part as any)(foc<Whole>()(focus))
	return atom(
		(get) => unwrap(get(wholeAtom), o.view.bind(o)),
		(get, set) =>
			set(
				wholeAtom,
				unwrap(get(wholeAtom), o.update(true)) as NonFunction<Whole>,
			),
	)
}
