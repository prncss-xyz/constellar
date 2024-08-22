/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	apply,
	AreEqual,
	compose2,
	fromInit,
	id,
	Init,
	isFunction,
	isNever,
	isUndefined,
	memo1,
	Modify,
	Monoid,
} from '@constellar/utils'

export const REMOVE = Symbol('REMOVE')
function isRemove(v: unknown) {
	return v === REMOVE
}

export function inert<Part, Whole>(_: Part, whole: Whole) {
	return whole
}

type Fold<Value, Acc> = (p: Value, acc: Acc) => Acc
type Mapper<Part, Whole> = (f: (p: Part) => Part, w: Whole) => Whole
type Setter<Part, Whole> = (p: Part, w: Whole) => Whole
type Getter<Part, Whole, Fail> = (w: Whole) => Part | Fail

export interface IOptic<Part, Whole, Fail, Command> {
	refold: <Acc>(fold: Fold<Part, Acc>) => Fold<Whole, Acc>
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
	if (focus.getter) {
		return focus.getter
	}
	// TODO: should stop after first result
	const fold = focus.refold(foldFirst<Part>)
	return (whole: Whole) => fold(whole, undefined) as Part | Fail
}

export function fold<Acc, Part, Whole, Fail, Command>(
	focus: IOptic<Part, Whole, Fail, Command>,
	monoid: Monoid<Part, Acc>,
) {
	const fold = focus.refold(monoid.fold)
	return (whole: Whole) => fold(whole, fromInit(monoid.init))
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
	f: Modify<Part>,
) {
	return (whole: Whole) => focus.mapper(f, whole)
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
	if (isFaillure === isNever) return compose2(f as any, g)
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
): (f: (p: Part) => Part, w: Whole) => Whole {
	if (setter === id && getter === id) return id as any
	if (setter === id) return (f, w) => f(getter(w)) as any
	if (getter === id) return (f, w) => setter(f(w as any), w) as any
	return (f: (v: Part) => Part, w: Whole) => {
		return setter(f(getter(w)), w)
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

interface IOptic0<Part, Whole, Fail, Command> {
	isFaillure: (v: unknown) => v is Fail
	isCommand: (v: unknown) => v is Command
	command: Setter<Command, Whole>
	mapper?: Mapper<Part, Whole>
	refold?: <Acc>(f: Fold<Part, Acc>) => Fold<Whole, Acc>
	getter?: Getter<Part, Whole, Fail>
	setter?: Setter<Part, Whole>
}
interface IOptic1<Part, Whole, Fail, Command>
	extends IOptic0<Part, Whole, Fail, Command> {
	getter: Getter<Part, Whole, Fail>
	setter: Setter<Part, Whole>
}
interface IOptic2<Part, Whole, Fail, Command>
	extends IOptic0<Part, Whole, Fail, Command> {
	mapper: Mapper<Part, Whole>
	refold: <Acc>(f: Fold<Part, Acc>) => Fold<Whole, Acc>
}
type IOpticArgs<Part, Whole, Fail, Command> =
	| IOptic1<Part, Whole, Fail, Command>
	| IOptic2<Part, Whole, Fail, Command>

function optic<Part, Whole, Command, Fail>({
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
			refold: compose2(
				refold ??
					(<Acc>(fold: Fold<Part, Acc>): Fold<Whole, Acc> =>
						(v, acc) => {
							const b = getter!(v)
							if (isFaillure(b)) return acc
							return fold(b, acc)
						}),
				o.refold,
			),
			mapper: composeMapper(
				o.mapper,
				mapper ??
					((f: Modify<Part>, v) => {
						const b = getter!(v)
						if (isFaillure(b)) return v
						return setter!(f(b), v)
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
				: <Acc>(fold: Fold<Part, Acc>) =>
						(v: Whole, acc: Acc) =>
							fold(getter(v) as any, acc),
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

function foldFirst<Value>(v: Value, acc: Value | undefined) {
	return acc ?? (v as Value | undefined)
}

export function traversal<Part, Whole>({
	refold,
	mapper,
}: {
	refold: <Acc>(fold: Fold<Part, Acc>) => Fold<Whole, Acc>
	mapper: Mapper<Part, Whole>
}) {
	return optic({
		getter: undefined,
		setter: undefined,
		refold,
		mapper,
		isFaillure: isUndefined,
		isCommand: isNever,
		command: inert,
	})
}

// optics modifier

// TODO: memoize ?
// FIXME: type inference is problematic when value can be command
// we need to cast is as any

export function active(areEqual: AreEqual<any> = Object.is) {
	return function <Part>(value: Part | ((p: Part) => Part)) {
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
				refold: (fold) => (v, acc) => fold(getter(v), acc),
				isFaillure: isNever,
				isCommand: isNever,
				command: id,
			}
		}
	}
}

// do not affect traversals
export function valueOr<Part>(value: Init<Part>) {
	return function <Whole, Fail, Command>(
		o: IOptic<Part, Whole, Fail, Command>,
	): IOptic<Part, Whole, never, Command> {
		const getter = o.getter
			? (whole: Whole) => {
					const part = o.getter!(whole)
					if (o.isFaillure(part)) return fromInit(value)
					return part
				}
			: undefined
		return {
			getter,
			setter: o.setter,
			mapper: o.setter && getter ? makeMapper(o.setter, getter) : o.mapper,
			refold:
				o.getter && getter
					? (fold) => {
							const lastFold = o.refold(fold)
							return (whole, acc) => {
								if (o.isFaillure(o.getter!(whole)))
									return fold(getter(whole), acc)
								return lastFold(whole, acc)
							}
						}
					: o.refold,
			isFaillure: isNever,
			isCommand: o.isCommand,
			command: o.command,
		}
	}
}

// TODO: resover should be an optic
/*
export function resolved<Index, Part, Whole, Fail, Command>(
	reference: (whole: Whole) => Index,
	resolver: (index: Index) => Optic<Part, Whole, Fail, Command>,
	isFaillure: (v: unknown) => v is Fail,
	isCommand: (v: unknown) => v is Command,
) {
	const resolved = memo1((whole: Whole) => resolver(reference(whole)))
	return new Optic<Part, Whole, Fail, Command>({
		getter: (whole: Whole) => resolved(whole).getter(whole),
		setter: (part, whole) => resolved(whole).setter(part, whole),
		mapper: (f, whole) => resolved(whole).mapper(f, whole),
		refold:
			<Acc>(fold: Fold<Part, Acc>) =>
			(v, acc) =>
				fold(resolved(v).getter(v), acc),
		isCommand,
		isFaillure,
		command: (c, whole) => resolved(whole).command(c, whole),
	})
}
*/
