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

export function inert<T, U>(_: T, u: U) {
	return u
}

export function cmpFailable<P, Q, R, F>(
	f: (p: P) => Q | F,
	g: (q: Q) => R,
	isFaillure: (v: unknown) => v is F,
): (p: P) => R | F {
	if (isFaillure === isNever) return compose2(f as any, g)
	return function (p: P) {
		const q = f(p)
		if (isFaillure(q)) return q
		return g(q)
	}
}

type Fold<Value, Acc> = (v: Value, acc: Acc) => Acc
type Mapper<Part, Whole> = (f: (v: Part) => Part, b: Whole) => Whole
type Setter<Part, Whole> = (p: Part, w: Whole) => Whole
type Getter<Part, Whole, Fail> = (w: Whole) => Part | Fail

export interface IOptic<Part, Whole, Fail, Command> {
	refold: <Acc>(f: Fold<Part, Acc>) => Fold<Whole, Acc>
	mapper: Mapper<Part, Whole>
	isFaillure: (v: unknown) => v is Fail
	isCommand: (v: unknown) => v is Command
	command: Setter<Command, Whole>
	getter?: Getter<Part, Whole, Fail>
	setter?: Setter<Part, Whole>
}

export interface IOpticL<Part, Whole, Fail, Command>
	extends IOptic<Part, Whole, Fail, Command> {
	getter: Getter<Part, Whole, Fail>
	setter: Setter<Part, Whole>
}

function cmpFaillure<F1, F2>(
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

function cmpMapper<B, Part, Whole>(
	thisMapper: Mapper<Part, Whole>,
	oMapper: Mapper<B, Part>,
): Mapper<B, Whole> {
	if (thisMapper === apply) return oMapper as any
	return (f, w) => thisMapper((p) => oMapper(f, p), w)
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

export function update<Part, Whole, Fail, Command>(
	focus: IOptic<Part, Whole, Fail, Command>,
	arg: Command | Part | ((p: Part) => Part),
) {
	if (focus.isCommand(arg)) return (whole: Whole) => focus.command(arg, whole)
	if (isFunction(arg)) return (whole: Whole) => focus.mapper(arg, whole)
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

function foldFirst<V>(v: V, acc: V | undefined) {
	return acc ?? (v as V | undefined)
}

export function traversal<P2, Part>({
	refold,
	mapper,
}: {
	refold: <Acc>(fold: Fold<P2, Acc>) => Fold<Part, Acc>
	mapper: Mapper<P2, Part>
}) {
	return function <Whole, Fail, Command>(
		l: IOptic<Part, Whole, Fail, Command>,
	): IOptic<P2, Whole, undefined, never> {
		return {
			getter: undefined,
			setter: undefined,
			refold: compose2(refold, l.refold),
			mapper: cmpMapper(l.mapper, mapper),
			isFaillure: isUndefined,
			isCommand: isNever,
			command: inert,
		}
	}
}

function mkMapper<Part, Whole>(
	setter: (part: Part, whole: Whole) => Whole,
	getter: (whole: Whole) => Part,
): (f: (v: Part) => Part, v: Whole) => Whole {
	if (setter === id && getter === id) return id as any
	if (setter === id) return (f, v) => f(getter(v)) as any
	if (getter === id) return (f, v) => setter(f(v as any), v) as any
	return (f: (v: Part) => Part, v: Whole) => {
		return setter(f(getter(v)), v)
	}
}

export function lens<Part, Whole>({
	getter,
	setter,
}: {
	getter: (whole: Whole) => Part
	setter: (part: Part, whole: Whole) => Whole
}) {
	return function <A, F, C>(
		o: IOptic<Whole, A, F, C>,
	): IOptic<Part, A, F, never> {
		const refold = <Acc>(fold: Fold<Part, Acc>): Fold<Whole, Acc> =>
			getter === id
				? (fold as any)
				: (v: Whole, acc: Acc) => fold(getter(v), acc)
		return {
			refold: compose2(refold, o.refold),
			mapper: cmpMapper(o.mapper, mkMapper(setter, getter)),
			isFaillure: o.isFaillure,
			isCommand: isNever,
			command: inert,
			getter: o.getter
				? cmpFailable(o.getter!, getter, o.isFaillure)
				: undefined,
			setter:
				o.setter && o.getter
					? (b, w) => {
							const t = o.getter!(w)
							if (o.isFaillure(t)) return w
							return o.setter!(setter(b, t), w)
						}
					: undefined,
		}
	}
}

function opt<Part, Whole, Command>({
	getter,
	setter,
	mapper,
	isCommand,
	command,
}: {
	getter: Getter<Part, Whole, undefined>
	setter: Setter<Part, Whole>
	mapper?: Mapper<Part, Whole>
	isCommand: (v: unknown) => v is Command
	command: (c: Command, w: Whole) => Whole
}) {
	return function <A, F, C>(
		o: IOptic<Whole, A, F, C>,
	): IOptic<Part, A, F | undefined, Command> {
		const refold =
			<Acc>(fold: Fold<Part, Acc>) =>
			(v: Whole, acc: Acc) => {
				const b = getter(v)
				if (b === undefined) return acc
				return fold(b, acc)
			}
		const mapper_ =
			mapper ??
			((f, v) => {
				const b = getter(v)
				if (b === undefined) return v
				return setter(f(b), v)
			})
		return {
			refold: compose2(refold, o.refold),
			mapper: cmpMapper(o.mapper, mapper_),
			isFaillure: cmpFaillure(o.isFaillure, isUndefined),
			isCommand: isCommand,
			command: (c: Command, w: A) => o.mapper((p) => command(c, p), w),
			getter: o.getter
				? cmpFailable(o.getter!, getter, o.isFaillure)
				: undefined,
			setter:
				o.getter && o.setter
					? (b, w) => {
							const t = o.getter!(w)
							if (o.isFaillure(t)) return w
							return o.setter!(setter(b, t), w)
						}
					: undefined,
		}
	}
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
	return opt({ getter, setter, mapper, isCommand: isNever, command: inert })
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
	return opt({
		getter,
		setter,
		mapper,
		isCommand: isRemove,
		command: (_, a) => remover(a),
	})
}

// optics modifier

// TODO: memoize ?
// FIXME: type inferance is problematic when value can be command
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
				mapper: mkMapper(setter, getter),
				refold: (fold) => (v, acc) => fold(getter(v), acc),
				isFaillure: isNever,
				isCommand: isNever,
				command: id,
			}
		}
	}
}

// TODO: make work with traversals
export function valueOr<Part>(value: Init<Part>) {
	return function <Whole, Fail, Command>(
		o: IOptic<Part, Whole, Fail, Command>,
	): IOptic<Part, Whole, never, Command> {
		if (!(o.getter && o.setter)) throw new Error('expected optic')
		const getter = (whole: Whole) => {
			const part = o.getter!(whole)
			if (o.isFaillure(part)) return fromInit(value)
			return part
		}
		return {
			getter,
			setter: (p, w) => o.setter!(p, w),
			mapper: mkMapper(o.setter, getter),
			refold: (fold) => {
				const lastFold = o.refold(fold)
				return (whole, acc) => {
					if (o.isFaillure(o.getter!(whole))) return fold(getter(whole), acc)
					return lastFold(whole, acc)
				}
			},
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
