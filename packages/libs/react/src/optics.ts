// based on https://github.com/jotaijs/jotai-optics/blob/main/src/focusAtom.ts
import {
	AreEqual,
	Ctx,
	enabled,
	eq,
	Focus,
	fold,
	FoldForm,
	put,
	shallowEqual,
	update,
	Updater,
	view,
} from '@constellar/core'

export function viewValue<Part, Whole, Fail, Command>(
	whole: Whole,
	focus: Focus<Part, Whole, Fail, Command>,
) {
	return view(focus(eq<Whole>()))(whole)
}

export function foldValue<Part, Whole, Fail, Command>(
	whole: Whole,
	focus: Focus<Part, Whole, Fail, Command>,
) {
	return function <Acc>(form: FoldForm<Part, Acc, Ctx>) {
		return fold(focus(eq<Whole>()))(form, whole)
	}
}

export function focusValue<Part, Whole, Fail, Command>(
	whole: Whole,
	setWhole: (whole: Whole) => void,
	focus: Focus<Part, Whole, Fail, Command>,
) {
	const optic = focus(eq<Whole>())
	return [
		view(optic),
		(arg: Updater<Part, Command>) => {
			setWhole(update(optic, arg)(whole))
		},
	] as const
}

export function disabledFocusValue<Part, Whole, Fail, Command>(
	whole: Whole,
	setWhole: (whole: Whole) => void,
	focus: Focus<Part, Whole, Fail, Command>,
	part: Updater<Part, Command>,
	areEqual: AreEqual<unknown> = shallowEqual,
) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const optic = enabled(part as any, areEqual)(focus(eq<Whole>()))
	return [
		view(optic)(whole),
		() => {
			setWhole(put(optic, true)(whole))
		},
	] as const
}
