// based on https://github.com/jotaijs/jotai-optics/blob/main/src/focusAtom.ts
import {
	Ctx,
	disabled,
	focus as foc,
	Focus,
	FoldForm,
	Updater,
} from '@constellar/core'

export function viewValue<Part, Whole, Fail, Command, S>(
	whole: Whole,
	focus: Focus<Part, Whole, Fail, Command, S>,
) {
	const o = foc<Whole>()(focus)
	return o.view(whole)
}

export function foldValue<Part, Whole, Fail, Command, S>(
	whole: Whole,
	focus: Focus<Part, Whole, Fail, Command, S>,
) {
	return function <Acc>(form: FoldForm<Part, Acc, Ctx>) {
		const o = foc<Whole>()(focus)
		return o.fold(form, whole)
	}
}

export function focusValue<Part, Whole, Fail, Command, S>(
	whole: Whole,
	setWhole: (whole: Whole) => void,
	focus: Focus<Part, Whole, Fail, Command, S>,
) {
	const o = foc<Whole>()(focus)
	return [
		o.view.bind(o),
		(arg: Updater<Part, Command>) => {
			setWhole(o.update(arg)(whole))
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
	const o = disabled(part as any)(foc<Whole>()(focus))
	return [o.view(whole), () => setWhole(o.put(true, whole))] as const
}
