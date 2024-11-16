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
} from '../../utils'
import {
	Ctx,
	ctxNull,
	FoldFn,
	FoldForm,
	ICtx,
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
		index: undefined as Index,
		whole,
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
type Getter<Part, Whole, Fail> = (w: Whole) => Fail | Part

export interface IOptic<Part, Whole, Fail, Command> {
	command: Setter<Command, Whole>
	getter?: Getter<Part, Whole, Fail>
	isCommand: (v: unknown) => v is Command
	isFailure: (v: unknown) => v is Fail
	mapper: Mapper<Part, Whole>
	refold: <Acc>(fold: FoldFn<Part, Acc, Ctx>) => FoldFn<Whole, Acc, Ctx>
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
	arg: ((p: Part) => Part) | Command | Part,
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
		command: id,
		getter: id<T>,
		isCommand: isNever,
		isFailure: isNever,
		mapper: apply,
		refold: id,
		setter: id,
	}
}

function composeGetter<P, Q, R, F>(
	isFailure: (v: unknown) => v is F,
	f?: (p: P) => F | Q,
	g?: (q: Q) => R,
): ((p: P) => F | R) | undefined {
	if (!f || !g) return undefined
	if (isFailure === isNever) return pipe2(f as any, g)
	return function (p: P) {
		const q = f(p)
		if (isFailure(q)) return q
		return g(q)
	}
}

function composeFailure<F1, F2>(
	f1: (v: unknown) => v is F1,
	f2: (v: unknown) => v is F2,
): (v: unknown) => v is F1 | F2 {
	if (f1 === isNever) return f2
	if (f2 === isNever) return f1
	if ((f1 as unknown) === f2) return f1
	/* c8 ignore start */
	throw new Error('unexpected failure value')
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
	isFailure: (v: unknown) => v is Fail,
	setter: Setter<Part, Whole> | undefined,
): Setter<Part, Mega> | undefined {
	if (!oGetter || !oSetter || !setter) return undefined
	const set: (p: Part, w: Whole, m: Mega) => Mega =
		oSetter === id
			? (b, t) => setter(b, t) as any
			: (b, t, w) => oSetter(setter(b, t), w)
	return (b, w) => {
		const t = oGetter(w)
		if (isFailure(t)) return w
		return set(b, t, w)
	}
}

interface IOpticBase<Part, Whole, Fail, Command> {
	command: Setter<Command, Whole>
	getter?: Getter<Part, Whole, Fail>
	isCommand: (v: unknown) => v is Command
	isFailure: (v: unknown) => v is Fail
	mapper?: Mapper<Part, Whole>
	refold?: <Acc>(mod: FoldFn<Part, Acc, Ctx>) => FoldFn<Whole, Acc, Ctx>
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
	command,
	getter,
	isCommand,
	isFailure,
	mapper,
	refold,
	setter,
}: IOpticArgs<Part, Whole, Fail, Command>) {
	return function <Mega, F2, C2>(
		o: IOptic<Whole, Mega, F2, C2>,
	): IOptic<Part, Mega, F2 | Fail, Command> {
		return {
			command: (c, a) => o.mapper((p) => command(c, p), a),
			getter: composeGetter(o.isFailure, o.getter, getter),
			isCommand: isCommand,
			isFailure: composeFailure(o.isFailure, isFailure),
			mapper: composeMapper(
				o.mapper,
				mapper ??
					((mod: Modify<Part>, v) => {
						const b = getter!(v)
						if (isFailure(b)) return v
						return setter!(mod(b), v)
					}),
			),
			refold: pipe2(
				refold ??
					(<Acc>(foldPart: FoldFn<Part, Acc, Ctx>): FoldFn<Whole, Acc, Ctx> =>
						(v, acc, ctx) => {
							const b = getter!(v)
							if (isFailure(b)) return acc
							return foldPart(b, acc, ctx)
						}),
				o.refold,
			),
			setter: composeSetter(o.getter, o.setter, o.isFailure, setter),
		}
	}
}

export function lens<Part, Whole>({
	getter,
	mapper,
	setter,
}: {
	getter: (whole: Whole) => Part
	mapper?: Mapper<Part, Whole>
	setter: (part: Part, whole: Whole) => Whole
}) {
	return optic({
		command: inert,
		getter,
		isCommand: isNever,
		isFailure: isNever,
		mapper: mapper ?? makeMapper(setter, getter),
		refold:
			getter === id
				? (id as any)
				: <Acc, Ctx>(fold: FoldFn<Part, Acc, Ctx>) =>
						(v: Whole, acc: Acc, ctx: Ctx) =>
							fold(getter(v) as any, acc, ctx),
		setter,
	})
}

export function optional<Part, Whole>({
	getter,
	mapper,
	setter,
}: {
	getter: Getter<Part, Whole, undefined>
	mapper?: Mapper<Part, Whole>
	setter: Setter<Part, Whole>
}) {
	return optic({
		command: inert,
		getter,
		isCommand: isNever,
		isFailure: isUndefined,
		mapper,
		setter,
	})
}

export function removable<Part, Whole>({
	getter,
	mapper,
	remover,
	setter,
}: {
	getter: Getter<Part, Whole, undefined>
	mapper?: Mapper<Part, Whole>
	remover: Modify<Whole>
	setter: Setter<Part, Whole>
}) {
	return optic({
		command: (_, a) => remover(a),
		getter,
		isCommand: isRemove,
		isFailure: isUndefined,
		mapper,
		setter,
	})
}

export function traversal<Part, Whole, Index>({
	coll,
	form,
}: {
	coll: Unfolder<Part, Whole, Index>
	form: () => FoldForm<Part, Whole, Ctx>
}) {
	return optic<Part, Whole, undefined, never>({
		command: inert,
		isCommand: isNever,
		isFailure: isUndefined,
		mapper: (mod, whole: Whole) => {
			const { foldFn, init } = form()
			const acc = fromInit(init)
			return foldFrom(
				acc,
				(p, acc, ctx) => foldFn(mod(p), acc, ctx),
				whole,
				coll,
				noop,
			)
		},
		refold: <Acc>(foldPart: (p: Part, acc: Acc, ctx: Ctx) => Acc) => {
			return function (whole: Whole, acc: Acc, { close }: Ctx) {
				return foldFrom(acc, foldPart, whole, coll, close)
			}
		},
	})
}

// optics modifier

// FIXME: type inference is problematic when value can be command
// we need to cast is as any

export function disabled<Part>(value: ((p: Part) => Part) | Part) {
	return function <Whole, Fail, Command>(
		o: IOptic<Part, Whole, Fail, Command>,
	): IOptic<boolean, Whole, never, never> {
		const getter = (whole: Whole) => Object.is(update(o, value)(whole), whole)
		const setter = (d: boolean, whole: Whole) => {
			if (d) return update(o, value)(whole)
			return whole
		}
		return {
			command: id,
			getter,
			isCommand: isNever,
			isFailure: isNever,
			mapper: makeMapper(setter, getter),
			refold: (fold) => (v, acc, ctx) => fold(getter(v), acc, ctx),
			setter,
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
			if (o.isFailure(part)) return fromInit(value)
			return part
		}
		return {
			command: o.command,
			getter,
			isCommand: o.isCommand,
			isFailure: isNever,
			mapper: makeMapper(o.setter, getter),
			refold: (foldPart) => {
				const lastFold = o.refold(foldPart)
				return (whole, acc, ctx) =>
					o.isFailure(o.getter!(whole))
						? foldPart(getter(whole), acc, ctx)
						: lastFold(whole, acc, ctx)
			},
			setter: o.setter,
		}
	}
}
