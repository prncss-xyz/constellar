/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	apply,
	AreEqual,
	fromInit,
	id,
	Init,
	isFunction,
	isNever,
	isUndefined,
	memo1,
	Modify,
	noop,
	pipe2,
} from '@constellar/utils'

import {
	Ctx,
	ctxNull,
	FoldFn,
	FoldForm,
	ICtx,
	Refold,
	toFirst,
	Unfolder,
} from '../collections'

function foldFrom<Part, Whole, Acc, Index>(
	acc: Acc,
	foldPart: (w: Part, acc: Acc, ctx: Ctx) => Acc,
	whole: Whole,
	unfolder: Unfolder<Part, Whole, Index>,
	onClose: () => void,
) {
	const unfold = unfolder(whole)
	let alive = true
	const ctx: ICtx<Whole, Index> = {
		close: () => {
			onClose()
			alive = false
		},
		whole,
		index: undefined as Index,
	}
	while (alive) {
		const r = unfold()
		if (r === undefined) break
		ctx.index = r.index
		acc = foldPart(r.part, acc, ctx)
	}
	return acc
}

export const REMOVE = Symbol('REMOVE')
function isRemove(v: unknown) {
	return v === REMOVE
}

export function inert<Part, Whole>(_: Part, whole: Whole) {
	return whole
}

type Mapper<Part, Whole> = (mod: (p: Part) => Part, w: Whole) => Whole
type Setter<Part, Whole> = (p: Part, w: Whole) => Whole
type Getter<Part, Whole, Fail> = (w: Whole) => Part | Fail

export interface IOptic<Part, Whole, Fail, Command> {
	refold: <Acc>(fold: FoldFn<Part, Acc, Ctx>) => FoldFn<Whole, Acc, Ctx>
	mapper: Mapper<Part, Whole>
	isFaillure: (v: unknown) => v is Fail
	isCommand: (v: unknown) => v is Command
	command: Setter<Command, Whole>
	getter?: Getter<Part, Whole, Fail>
	setter?: Setter<Part, Whole>
}

export function view<Part, Whole, Fail, Command>(
	focus: IOptic<Part, Whole, Fail, Command>,
) {
	if (focus.getter) return focus.getter
	const f = fold(focus)
	return (whole: Whole) => f(toFirst<Part, Fail, Ctx>(undefined as Fail), whole)
}

export function fold<Part, Whole, Fail, Command>(
	focus: IOptic<Part, Whole, Fail, Command>,
) {
	return function <Acc>(form: FoldForm<Part, Acc, Ctx>, whole: Whole) {
		return focus.refold(form.foldFn)(whole, fromInit(form.init), ctxNull)
	}
}

export function put<Part, Whole, Fail, Command>(
	focus: IOptic<Part, Whole, Fail, Command>,
	value: Part,
) {
	if (focus.getter) return (whole: Whole) => focus.setter!(value, whole)
	return (whole: Whole) => focus.mapper(() => value, whole)
}

export function modify<Part, Whole, Fail, Command>(
	focus: IOptic<Part, Whole, Fail, Command>,
	mod: Modify<Part>,
) {
	return (whole: Whole) => focus.mapper(mod, whole)
}

export function command<Part, Whole, Fail, Command>(
	focus: IOptic<Part, Whole, Fail, Command>,
	command: Command,
) {
	return (whole: Whole) => focus.command(command, whole)
}

export function update<Part, Whole, Fail, Command>(
	focus: IOptic<Part, Whole, Fail, Command>,
	arg: Command | Part | ((p: Part) => Part),
) {
	if (focus.isCommand(arg)) return command(focus, arg)
	if (isFunction(arg)) return modify(focus, arg)
	return put(focus, arg)
}

export type Focus<Part, Whole, Fail, Command> = (
	eq: IOptic<Whole, Whole, never, never>,
) => IOptic<Part, Whole, Fail, Command>
export function eq<T>(): IOptic<T, T, never, never> {
	return {
		getter: id<T>,
		refold: id,
		mapper: apply,
		setter: id,
		isFaillure: isNever,
		isCommand: isNever,
		command: id,
	}
}

function composeGetter<P, Q, R, F>(
	isFaillure: (v: unknown) => v is F,
	f?: (p: P) => Q | F,
	g?: (q: Q) => R,
): ((p: P) => R | F) | undefined {
	if (!f || !g) return undefined
	if (isFaillure === isNever) return pipe2(f as any, g)
	return function (p: P) {
		const q = f(p)
		if (isFaillure(q)) return q
		return g(q)
	}
}

function composeFaillure<F1, F2>(
	f1: (v: unknown) => v is F1,
	f2: (v: unknown) => v is F2,
): (v: unknown) => v is F1 | F2 {
	if (f1 === isNever) return f2
	if (f2 === isNever) return f1
	if ((f1 as unknown) === f2) return f1
	/* c8 ignore start */
	throw new Error('unexpected faillure value')
}
/* c8 ignore stop */

function composeMapper<Micro, Part, Whole>(
	thisMapper: Mapper<Part, Whole>,
	oMapper: Mapper<Micro, Part>,
): Mapper<Micro, Whole> {
	if (thisMapper === apply) return oMapper as any
	return (f, w) => thisMapper((p) => oMapper(f, p), w)
}

function makeMapper<Part, Whole>(
	setter: Setter<Part, Whole>,
	getter: Getter<Part, Whole, never>,
): (mod: (p: Part) => Part, w: Whole) => Whole {
	if (setter === id && getter === id) return id as any
	if (setter === id) return (f, w) => f(getter(w)) as any
	if (getter === id) return (f, w) => setter(f(w as any), w) as any
	return (mod: (v: Part) => Part, w: Whole) => {
		return setter(mod(getter(w)), w)
	}
}

function composeSetter<Whole, Mega, Fail, Part>(
	oGetter: Getter<Whole, Mega, Fail> | undefined,
	oSetter: Setter<Whole, Mega> | undefined,
	isFaillure: (v: unknown) => v is Fail,
	setter: Setter<Part, Whole> | undefined,
): Setter<Part, Mega> | undefined {
	if (!oGetter || !oSetter || !setter) return undefined
	const set: (p: Part, w: Whole, m: Mega) => Mega =
		oSetter === id
			? (b, t) => setter(b, t) as any
			: (b, t, w) => oSetter(setter(b, t), w)
	return (b, w) => {
		const t = oGetter(w)
		if (isFaillure(t)) return w
		return set(b, t, w)
	}
}

interface IOpticBase<Part, Whole, Fail, Command> {
	isFaillure: (v: unknown) => v is Fail
	isCommand: (v: unknown) => v is Command
	command: Setter<Command, Whole>
	mapper?: Mapper<Part, Whole>
	refold?: <Acc>(mod: FoldFn<Part, Acc, Ctx>) => FoldFn<Whole, Acc, Ctx>
	getter?: Getter<Part, Whole, Fail>
	setter?: Setter<Part, Whole>
}

interface IOptional<Part, Whole, Fail, Command>
	extends IOpticBase<Part, Whole, Fail, Command> {
	getter: Getter<Part, Whole, Fail>
	setter: Setter<Part, Whole>
}
interface ITraversal<Part, Whole, Fail, Command>
	extends IOpticBase<Part, Whole, Fail, Command> {
	mapper: Mapper<Part, Whole>
	refold: <Acc>(foldPart: FoldFn<Part, Acc, Ctx>) => FoldFn<Whole, Acc, Ctx>
}

type IOpticArgs<Part, Whole, Fail, Command> =
	| IOptional<Part, Whole, Fail, Command>
	| ITraversal<Part, Whole, Fail, Command>

export function optic<Part, Whole, Fail, Command>({
	getter,
	setter,
	mapper,
	refold,
	isCommand,
	command,
	isFaillure,
}: IOpticArgs<Part, Whole, Fail, Command>) {
	return function <Mega, F2, C2>(
		o: IOptic<Whole, Mega, F2, C2>,
	): IOptic<Part, Mega, F2 | Fail, Command> {
		return {
			refold: pipe2(
				refold ??
					(<Acc>(foldPart: FoldFn<Part, Acc, Ctx>): FoldFn<Whole, Acc, Ctx> =>
						(v, acc, ctx) => {
							const b = getter!(v)
							if (isFaillure(b)) return acc
							return foldPart(b, acc, ctx)
						}),
				o.refold,
			),
			mapper: composeMapper(
				o.mapper,
				mapper ??
					((mod: Modify<Part>, v) => {
						const b = getter!(v)
						if (isFaillure(b)) return v
						return setter!(mod(b), v)
					}),
			),
			isFaillure: composeFaillure(o.isFaillure, isFaillure),
			isCommand: isCommand,
			command: (c, a) => o.mapper((p) => command(c, p), a),
			getter: composeGetter(o.isFaillure, o.getter, getter),
			setter: composeSetter(o.getter, o.setter, o.isFaillure, setter),
		}
	}
}

export function focused<Whole>() {
	return function <Part, Fail, Command>(
		focus: Focus<Part, Whole, Fail, Command>,
	) {
		return focus(eq<Whole>())
	}
}

export function lens<Part, Whole>({
	getter,
	setter,
	mapper,
}: {
	getter: (whole: Whole) => Part
	setter: (part: Part, whole: Whole) => Whole
	mapper?: Mapper<Part, Whole>
}) {
	return optic({
		getter,
		setter,
		refold:
			getter === id
				? (id as any)
				: <Acc, Ctx>(fold: FoldFn<Part, Acc, Ctx>) =>
						(v: Whole, acc: Acc, ctx: Ctx) =>
							fold(getter(v) as any, acc, ctx),
		mapper: mapper ?? makeMapper(setter, getter),
		isCommand: isNever,
		command: inert,
		isFaillure: isNever,
	})
}

export function optional<Part, Whole>({
	getter,
	setter,
	mapper,
}: {
	getter: Getter<Part, Whole, undefined>
	setter: Setter<Part, Whole>
	mapper?: Mapper<Part, Whole>
}) {
	return optic({
		getter,
		setter,
		mapper,
		isCommand: isNever,
		command: inert,
		isFaillure: isUndefined,
	})
}

export function removable<Part, Whole>({
	getter,
	setter,
	mapper,
	remover,
}: {
	getter: Getter<Part, Whole, undefined>
	setter: Setter<Part, Whole>
	mapper?: Mapper<Part, Whole>
	remover: Modify<Whole>
}) {
	return optic({
		getter,
		setter,
		mapper,
		isCommand: isRemove,
		command: (_, a) => remover(a),
		isFaillure: isUndefined,
	})
}

export function traversal<Part, Whole, Index>({
	coll,
	form,
}: {
	coll: Unfolder<Part, Whole, Index>
	form: () => FoldForm<Part, Whole, Ctx>
}) {
	return optic({
		refold: <Acc>(foldPart: (p: Part, acc: Acc, ctx: Ctx) => Acc) => {
			return function (whole: Whole, acc: Acc, { close }: Ctx) {
				return foldFrom(acc, foldPart, whole, coll, close)
			}
		},
		mapper: (mod, whole: Whole) => {
			const { init, foldFn } = form()
			const acc = fromInit(init)
			return foldFrom(
				acc,
				(p, acc, ctx) => foldFn(mod(p), acc, ctx),
				whole,
				coll,
				noop,
			)
		},
		isFaillure: isUndefined,
		isCommand: isNever,
		command: inert,
	})
}

// optics modifier

// TODO: memoize ?
// FIXME: type inference is problematic when value can be command
// we need to cast is as any

export function active<Part>(
	value: Part | ((p: Part) => Part),
	areEqual: AreEqual<any> = Object.is,
) {
	return function <Whole, Fail, Command>(
		o: IOptic<Part, Whole, Fail, Command>,
	): IOptic<boolean, Whole, never, never> {
		const update_ = memo1((value: Part | ((p: Part) => Part)) =>
			update(o, value),
		)
		const v = view(o)
		const getter = (whole: Whole) => {
			return areEqual(v(update_(value)(whole)), v(whole))
		}
		const setter = (b: boolean, whole: Whole) => {
			if (!b) return whole
			return update(o, value)(whole)
		}
		return {
			getter,
			setter,
			mapper: makeMapper(setter, getter),
			refold: (fold) => (v, acc, ctx) => fold(getter(v), acc, ctx),
			isFaillure: isNever,
			isCommand: isNever,
			command: id,
		}
	}
}

// TODO: exclude traversals by type
export function valueOr<Part>(value: Init<Part>) {
	return function <Whole, Fail, Command>(
		o: IOptic<Part, Whole, Fail, Command>,
	): IOptic<Part, Whole, never, Command> {
		if (!(o.getter && o.setter))
			throw new Error("valueOr don't work with traversals")
		const getter = (whole: Whole) => {
			const part = o.getter!(whole)
			if (o.isFaillure(part)) return fromInit(value)
			return part
		}
		return {
			getter,
			setter: o.setter,
			mapper: makeMapper(o.setter, getter),
			refold: (foldPart) => {
				const lastFold = o.refold(foldPart)
				return (whole, acc, ctx) =>
					o.isFaillure(o.getter!(whole))
						? foldPart(getter(whole), acc, ctx)
						: lastFold(whole, acc, ctx)
			},
			isFaillure: isNever,
			isCommand: o.isCommand,
			command: o.command,
		}
	}
}

export function whenFrom<Whole, Part>(
	p: (whole: Whole, part: Part) => unknown,
) {
	return function <Fail, Command>(
		o: IOptic<Part, Whole, Fail, Command>,
	): IOptic<Part, Whole, Fail | undefined, Command> {
		return {
			refold:
				<Acc>(foldPart: FoldFn<Part, Acc, Ctx>) =>
				(whole, acc: Acc, ctx) =>
					o.refold((part, acc: Acc, ctx) =>
						p(whole, part) ? foldPart(part, acc, ctx) : acc,
					)(whole, acc, ctx),
			mapper: (mod, whole) =>
				o.mapper((part) => (p(whole, part) ? mod(part) : part), whole),
			isFaillure: composeFaillure(o.isFaillure, isUndefined),
			isCommand: o.isCommand,
			command: o.command,
		}
	}
}
