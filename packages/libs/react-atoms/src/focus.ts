import { eq, Optic } from '@constellar/optics'
import { Modify, Updater } from '@constellar/utils'

import { Atom, IRAtom, IRWAtom } from './atoms'

type IStateAtom<Value, Fail> = IRWAtom<Modify<Value>, Value | Fail>

export class ViewAtom<Part, Whole, Fail, Command> extends Atom<Part | Fail> {
	source
	getter
	constructor(source: IRAtom<Whole>, focus: Optic<Part, Whole, Fail, Command>) {
		super()
		this.source = source
		this.getter = focus.getter
	}
	read() {
		return this.getter(this.source.peek())
	}
	onMount() {
		return this.source.subscribe(() => {
			this.invalidate()
		})
	}
}

export function createView<Part, Whole, Fail, Command>(
	source: IRAtom<Whole>,
	focus:
		| Optic<Part, Whole, Fail, Command>
		| ((
				o: Optic<Whole, Whole, never, never>,
		  ) => Optic<Part, Whole, Fail, Command>),
) {
	return new ViewAtom(
		source,
		focus instanceof Optic ? focus : focus(eq<Whole>()),
	)
}

export class FocusAtom<Part, Whole, Fail, Command>
	extends Atom<Part | Fail>
	implements IRWAtom<Updater<Part, Command>, Part | Fail>
{
	source
	getter
	sender
	constructor(
		source: IRWAtom<Modify<Whole>, Whole>,
		focus: Optic<Part, Whole, Fail, Command>,
	) {
		super()
		this.source = source
		this.getter = focus.getter
		this.sender = (part: Updater<Part, Command>) =>
			source.send(focus.update(part))
	}
	read() {
		return this.getter(this.source.peek())
	}
	onMount() {
		return this.source.subscribe(() => {
			this.invalidate()
		})
	}
	send(part: Updater<Part, Command>) {
		this.sender(part)
	}
}

export function createFocus<Part, Whole, Fail, Command>(
	source: IRWAtom<Modify<Whole>, Whole>,
	focus:
		| Optic<Part, Whole, Fail, Command>
		| ((
				o: Optic<Whole, Whole, never, never>,
		  ) => Optic<Part, Whole, Fail, Command>),
) {
	return new FocusAtom(
		source,
		focus instanceof Optic ? focus : focus(eq<Whole>()),
	) satisfies IStateAtom<Part, Fail>
}
