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
	Monoid,
} from '@constellar/utils'

export const REMOVE = Symbol('REMOVE')
function isRemove(v: unknown) {
	return v === REMOVE
}

function notImplemented(): any {
	throw new Error('not implemented')
}

export function inert<T, U>(_: T, u: U) {
	return u
}

type Fold<Value, Acc> = (v: Value, acc: Acc) => Acc
type Mapper<Part, Whole> = (f: (v: Part) => Part, b: Whole) => Whole
type Setter<Part, Whole> = (p: Part, w: Whole) => Whole
type Getter<Part, Whole, Fail> = (w: Whole) => Part | Fail

export interface IOptic<Part, Whole, Fail, Command> {
	getter: Getter<Part, Whole, Fail>
	refold: <Acc>(f: Fold<Part, Acc>) => Fold<Whole, Acc>
	mapper: Mapper<Part, Whole>
	isFaillure: (v: unknown) => v is Fail
	setter: Setter<Part, Whole>
	isCommand: (v: unknown) => v is Command
	exec: Setter<Command, Whole>
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

function _compose<Part, Whole, Fail, Command, P2, F2, C2>(
	l: IOptic<Part, Whole, Fail, Command>,
	r: IOptic<P2, Part, F2, C2>,
): IOptic<P2, Whole, Fail | F2, C2> {
	const isFaillure = cmpFaillure(l.isFaillure, r.isFaillure)
	const refold = compose2(r.refold, l.refold)
	return {
		getter: (w: Whole) => {
			const p = l.getter(w)
			if (l.isFaillure(p)) return p
			return r.getter(p)
		},
		refold,
		mapper: cmpMapper(l.mapper, r.mapper),
		isFaillure,
		setter: (b, w) => {
			const t = l.getter(w)
			if (l.isFaillure(t)) return w
			return l.setter(r.setter(b, t), w)
		},
		isCommand: r.isCommand,
		exec: (c: C2, w: Whole) => l.mapper((p) => r.exec(c, p), w),
	}
}

export function view<Part, Whole, Fail, Command>(
	focus: IOptic<Part, Whole, Fail, Command>,
) {
	return focus.getter
}

export function fold<Acc, Part, Whole, Fail, Command>(
	focus: IOptic<Part, Whole, Fail, Command>,
	monoid: Monoid<Part, Acc>,
) {
	const fold = focus.refold(monoid.fold)
	return (whole: Whole) => fold(whole, fromInit(monoid.init))
}

export function update<Part, Whole, Fail, Command>(
	focus: IOptic<Part, Whole, Fail, Command>,
	arg: Command | Part | ((p: Part) => Part),
) {
	if (focus.isCommand(arg)) return (whole: Whole) => focus.exec(arg, whole)
	if (isFunction(arg)) return (whole: Whole) => focus.mapper(arg, whole)
	return (whole: Whole) => focus.setter(arg, whole)
}

export function eq<T>(): IOptic<T, T, never, never> {
	return {
		getter: id<T>,
		refold: id,
		mapper: apply,
		setter: id,
		isFaillure: isNever,
		isCommand: isNever,
		exec: id,
	}
}

export function traversal<B, V>({
	refold,
	mapper,
}: {
	refold: <Acc>(fold: Fold<B, Acc>) => Fold<V, Acc>
	mapper: Mapper<B, V>
}) {
	return function <A, F, C>(o: IOptic<V, A, F, C>) {
		return _compose<V, A, F, C, B, F, never>(o, {
			getter: notImplemented,
			setter: notImplemented,
			refold,
			mapper,
			isFaillure: isNever,
			isCommand: isNever,
			exec: inert,
		})
	}
}

function mkMapper<Part, Whole>(
	setter: (part: Part, whole: Whole) => Whole,
	getter: (whole: Whole) => Part,
): (f: (v: Part) => Part, v: Whole) => Whole {
	if (setter === id && getter === id) return id as any
	if (setter === id) return (f, v) => f(getter(v)) as any
	if (getter === id) return (f, v) => setter(f(v as any), v) as any
	return (f: (v: Part) => Part, v: Whole) => setter(f(getter(v)), v)
}

export function lens<Part, Whole>({
	getter,
	setter,
}: {
	getter: (whole: Whole) => Part
	setter: (part: Part, whole: Whole) => Whole
}) {
	return function <A, F, C>(o: IOptic<Whole, A, F, C>) {
		return _compose<Whole, A, F, C, Part, F, never>(o, {
			getter,
			// TODO: optimize for getter === id and setter === id
			refold: (fold) =>
				getter === id ? (fold as any) : (v, acc) => fold(getter(v), acc),
			mapper: mkMapper(setter, getter),
			isFaillure: isNever,
			setter,
			isCommand: isNever,
			exec: inert,
		})
	}
}

export function optional<Part, Whole>({
	getter,
	setter,
}: {
	getter: (v: Whole) => Part | undefined
	setter: Setter<Part, Whole>
}) {
	return function <A, F, C>(o: IOptic<Whole, A, F, C>) {
		return _compose(o, {
			getter,
			refold:
				<Acc>(fold: Fold<Part, Acc>) =>
				(v, acc: Acc) => {
					const b = getter(v)
					if (b === undefined) return acc
					return fold(b, acc)
				},
			mapper: (f, v) => {
				const b = getter(v)
				if (b === undefined) return v
				return setter(f(b), v)
			},
			isFaillure: isUndefined,
			setter,
			isCommand: isNever,
			exec: inert,
		})
	}
}

export function removable<Whole, Part>({
	getter,
	setter,
	remover,
	mapper,
}: {
	getter: (v: Part) => Whole | undefined
	setter: Setter<Whole, Part>
	remover: (v: Part) => Part
	mapper?: Mapper<Whole, Part>
}) {
	return function <A, F, C>(o: IOptic<Part, A, F, C>) {
		return _compose(o, {
			getter,
			refold:
				<Acc>(fold: Fold<Whole, Acc>) =>
				(v, acc: Acc) => {
					const b = getter(v)
					if (b === undefined) return acc
					return fold(b, acc)
				},
			mapper:
				mapper ??
				((f, v) => {
					const b = getter(v)
					if (b === undefined) return v
					return setter(f(b), v)
				}),
			isFaillure: isUndefined,
			setter,
			isCommand: isRemove,
			exec: (_, a) => remover(a),
		})
	}
}

// optics modifiers

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
			const getter = (whole: Whole) => {
				return areEqual(o.getter(update_(value)(whole)), o.getter(whole))
			}
			const setter = (b: boolean, whole: Whole) => {
				if (!b) return whole
				return update(o, value)(whole)
			}
			return {
				getter,
				setter,
				mapper: mkMapper(setter, getter),
				refold: id as any, // TODO:
				isFaillure: isNever,
				isCommand: isNever,
				exec: id,
			}
		}
	}
}

export function valueOr<Part>(value: Init<Part>) {
	return function <Whole, Fail, Command>(
		o: IOptic<Part, Whole, Fail, Command>,
	) {
		const getter = (whole: Whole) => {
			const part = o.getter(whole)
			if (o.isFaillure(part)) return fromInit(value)
			return part
		}
		return {
			getter,
			setter: (p: Part, w: Whole) => o.setter(p, w),
			mapper: mkMapper(o.setter, getter),
			refold: id as any, // TODO:
			isFaillure: isNever,
			isCommand: o.isCommand,
			exec: o.exec,
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
		exec: (c, whole) => resolved(whole).exec(c, whole),
	})
}
*/
