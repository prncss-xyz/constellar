import { eq, fold, IOptic, update, view } from '@constellar/optics'
import { isFunction, Modify, Monoid, Updater } from '@constellar/utils'

import { createDerivedAtom, createSelectAtom, IRAtom, IRWAtom } from './atoms'

type IStateAtom<Value, Fail> = IRWAtom<Modify<Value>, Value | Fail>

function resolve<Part, Whole, Fail, Command>(
	focus:
		| IOptic<Part, Whole, Fail, Command>
		| ((
				o: IOptic<Whole, Whole, never, never>,
		  ) => IOptic<Part, Whole, Fail, Command>),
) {
	return isFunction(focus) ? focus(eq<Whole>()) : focus
}

export function createView<Part, Whole, Fail, Command>(
	source: IRAtom<Whole>,
	focus:
		| IOptic<Part, Whole, Fail, Command>
		| ((
				o: IOptic<Whole, Whole, never, never>,
		  ) => IOptic<Part, Whole, Fail, Command>),
): IRAtom<Part | Fail> {
	return createSelectAtom(source, view(resolve(focus)))
}

export function createFold<Part, Whole, Fail, Command, Acc>(
	source: IRAtom<Whole>,
	focus:
		| IOptic<Part, Whole, Fail, Command>
		| ((
				o: IOptic<Whole, Whole, never, never>,
		  ) => IOptic<Part, Whole, Fail, Command>),
	monoid: Monoid<Part, Acc>,
) {
	return createSelectAtom(source, fold(resolve(focus), monoid))
}

export function createFocus<Part, Whole, Fail, Command>(
	source: IStateAtom<Whole, never>,
	focus:
		| IOptic<Part, Whole, Fail, Command>
		| ((
				o: IOptic<Whole, Whole, never, never>,
		  ) => IOptic<Part, Whole, Fail, Command>),
) {
	const resolved = resolve(focus)
	return createDerivedAtom(
		source,
		view(resolved),
		(arg: Updater<Part, Command>) => update(resolved, arg),
	) satisfies IStateAtom<Part, Fail>
}
