// based on https://github.com/jotaijs/jotai-optics/blob/main/src/focusAtom.ts
import {
	Ctx,
	disabled,
	eq,
	Focus,
	fold,
	FoldForm,
	put,
	update,
	Updater,
	view,
} from '@constellar/core'

export function viewValue<Part, Whole, Fail, Command, S>(
	whole: Whole,
	focus: Focus<Part, Whole, Fail, Command, S>,
) {
	return view(focus(eq<Whole>()))(whole)
}

export function foldValue<Part, Whole, Fail, Command, S>(
	whole: Whole,
	focus: Focus<Part, Whole, Fail, Command, S>,
) {
	return function <Acc>(form: FoldForm<Part, Acc, Ctx>) {
		return fold(focus(eq<Whole>()))(form, whole)
	}
}

export function focusValue<Part, Whole, Fail, Command, S>(
	whole: Whole,
	setWhole: (whole: Whole) => void,
	focus: Focus<Part, Whole, Fail, Command, S>,
) {
	const optic = focus(eq<Whole>())
	return [
		view(optic),
		(arg: Updater<Part, Command>) => {
			setWhole(update(optic, arg)(whole))
		},
	] as const
}

export function disabledFocusValue<Part, Whole, Fail, Command, S>(
	whole: Whole,
	setWhole: (whole: Whole) => void,
	focus: Focus<Part, Whole, Fail, Command, S>,
	part: Updater<Part, Command>,
) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const optic = disabled(part as any)(focus(eq<Whole>()))
	return [
		view(optic)(whole),
		() => {
			setWhole(put(optic, true)(whole))
		},
	] as const
}
