import { eq, IOptic, update, view } from '@constellar/optics'
import { isFunction, Modify, Updater } from '@constellar/utils'

import { DerivedAtom, IRAtom, IRWAtom, SelectAtom } from './atoms'

type IStateAtom<Value, Fail> = IRWAtom<Modify<Value>, Value | Fail>

export function createView<Part, Whole, Fail, Command>(
	source: IRAtom<Whole>,
	focus:
		| IOptic<Part, Whole, Fail, Command>
		| ((
				o: IOptic<Whole, Whole, never, never>,
		  ) => IOptic<Part, Whole, Fail, Command>),
): IRAtom<Part | Fail> {
	const f = isFunction(focus) ? focus(eq<Whole>()) : focus
	return new SelectAtom(source, view(f))
}

export function createFocus<Part, Whole, Fail, Command>(
	source: IStateAtom<Whole, never>,
	focus:
		| IOptic<Part, Whole, Fail, Command>
		| ((
				o: IOptic<Whole, Whole, never, never>,
		  ) => IOptic<Part, Whole, Fail, Command>),
) {
	const f = isFunction(focus) ? focus(eq<Whole>()) : focus
	return new DerivedAtom(source, view(f), (arg: Updater<Part, Command>) =>
		update(f, arg),
	) satisfies IStateAtom<Part, Fail>
}
