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

// touched

/*
function compose2opt<Fail, P, Q, R>(
	isFaillure: (v: unknown) => v is Fail,
	f: (p: P) => Q | Fail,
	g: (q: Q, x: R) => R,
): (p: P, x: R) => R {
	if (f === id) return g as unknown as (p: P, x: R) => R
	if (g === id) return f as unknown as (p: P, x: R) => R
	if (isFaillure === isNever) return (p: P, x: R) => g(f(p) as Q, x)
	return (p: P, x: R) => {
		const q = f(p)
		if (isFaillure(q)) return x
		return g(q, x)
	}
}
*/

export const REMOVE = Symbol('REMOVE')
function isRemove(v: unknown) {
	return v === REMOVE
}

function forbidden<T, U>(_: T, _u: U): U {
	throw new Error('this is a getter only optic, don not use a setter')
}

function notImplemented(): any {
	throw new Error('not implemented')
}

function inert<T, U>(_: T, u: U) {
	return u
}

type Fold<Value, Acc> = (v: Value, acc: Acc) => Acc
type Mapper<Part, Whole> = (f: (v: Part) => Part, b: Whole) => Whole
type Setter<Part, Whole> = (p: Part, w: Whole) => Whole
type Getter<Part, Whole, Fail> = (w: Whole) => Part | Fail

interface IOptic<Part, Whole, Fail, Command> {
	getter: (a: Whole) => Part | Fail
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

function newSetter<B, Part, Whole>(
	thisSetter: Setter<Part, Whole>,
	oSetter: Setter<B, Part>,
): (b: B, part: Part, w: Whole) => Whole {
	if (thisSetter === id) {
		if (oSetter === id) return id as any
		return (b, p) => oSetter(b, p) as any
	}
	if (oSetter === id) return (b, _p, w) => oSetter(b, w as any) as any
	return (b, p, w) => thisSetter(oSetter(b, p), w)
}

function cmpSetter<B, Part, Whole>(
	thisGetter: Getter<Part, Whole, never>,
	thisSetter: Setter<Part, Whole>,
	oSetter: Setter<B, Part>,
): Setter<B, Whole> {
	if (thisSetter === id) {
		if (oSetter === id) return id as any
		if (thisGetter === id) return (b, w) => oSetter(b, w as any) as any
		if (thisSetter === id)
			return (b, w) => oSetter(b, thisGetter(w) as Part) as any
	}
	if (oSetter === id) return (b, w) => thisSetter(b as any, w) as any
	if (thisGetter === id)
		return (b, w) => thisSetter(oSetter(b, w as any), w) as any
	return (b: B, w: Whole) => thisSetter(oSetter(b, thisGetter(w) as Part), w)
}

function cmpMapper<B, Part, Whole>(
	thisMapper: Mapper<Part, Whole>,
	oMapper: Mapper<B, Part>,
): Mapper<B, Whole> {
	if (thisMapper === apply) return oMapper as any
	return (f, w) => thisMapper((p) => oMapper(f, p), w)
}

export class Optic<Part, Whole, Fail, Command>
	implements IOptic<Part, Whole, Fail, Command>
{
	getter
	refold
	mapper
	isFaillure
	setter
	isCommand
	exec
	constructor(o: IOptic<Part, Whole, Fail, Command>) {
		this.getter = o.getter
		this.refold = o.refold
		this.mapper = o.mapper
		this.isFaillure = o.isFaillure
		this.setter = o.setter
		this.isCommand = o.isCommand
		this.exec = o.exec
	}
	_compose<Part2, F2, C2>(o: IOptic<Part2, Part, F2, C2>) {
		const exec: Setter<C2, Whole> =
			o.exec === inert
				? (inert as any)
				: (c: C2, w: Whole) => this.mapper((p) => o.exec(c, p), w)
		if (this.isFaillure === isNever) {
			return new Optic<Part2, Whole, Fail | F2, C2>({
				getter: compose2(this.getter as (w: Whole) => Part, o.getter),
				refold: compose2(o.refold, this.refold),
				mapper: cmpMapper(this.mapper, o.mapper),
				isFaillure: cmpFaillure(this.isFaillure, o.isFaillure),
				setter: cmpSetter(this.getter as any, this.setter, o.setter),
				isCommand: o.isCommand,
				exec,
			})
		}
		const isFaillure = cmpFaillure(this.isFaillure, o.isFaillure)
		const refold = compose2(o.refold, this.refold)
		const ns = newSetter(this.setter, o.setter)
		return new Optic<Part2, Whole, Fail | F2, C2>({
			getter:
				o.getter === id
					? (this.getter as any)
					: (w: Whole) => {
							const p = this.getter(w)
							if (this.isFaillure(p)) return p
							return o.getter(p)
						},
			refold,
			mapper: cmpMapper(this.mapper, o.mapper),
			isFaillure,
			setter: (b, w) => {
				const t = this.getter(w)
				if (this.isFaillure(t)) return w
				return ns(b, t, w)
			},
			isCommand: o.isCommand,
			exec,
		})
	}
	/*
	view(a: Whole) {
		return this.getter(a)
	}
	put(v: Part) {
		return (a: Whole) => this.setter(v, a)
	}
	fold<Acc>(monoid: Monoid<Part, Acc>) {
		const fold = this.refold(monoid.fold)
		return (w: Whole) => fold(w, fromInit(monoid.init))
	}
	command(c: Command) {
		return (w: Whole) => this.exec(c, w)
	}
	modify(f: (p: Part) => Part) {
		return (w: Whole) => this.mapper(f, w)
	}
	update(arg: Command | Part | ((p: Part) => Part)) {
		if (this.isCommand(arg)) return this.command(arg)
		if (isFunction(arg)) return this.modify(arg)
		return this.put(arg)
	}
  */
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

export function eq<T>() {
	return new Optic({
		getter: id<T>,
		refold: id,
		mapper: apply,
		setter: id,
		isFaillure: isNever,
		isCommand: isNever,
		exec: id,
	})
}

export function withCommand<Whole, Command>({
	isCommand,
	exec,
}: {
	isCommand: (v: unknown) => v is Command
	exec: (c: Command, w: Whole) => Whole
}) {
	return function <Fail, C>(o: Optic<Whole, Whole, Fail, C>) {
		return o._compose<Whole, Fail, Command>({
			getter: o.getter,
			refold: o.refold,
			isFaillure: o.isFaillure,
			mapper: o.mapper,
			setter: o.setter,
			isCommand,
			exec,
		})
	}
}

export function traversal<B, V>({
	refold,
	mapper,
}: {
	refold: <Acc>(fold: Fold<B, Acc>) => Fold<V, Acc>
	mapper: Mapper<B, V>
}) {
	return function <A, F, C>(o: Optic<V, A, F, C>) {
		return o._compose<B, F, never>({
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
	return function <A, F, C>(o: Optic<Whole, A, F, C>) {
		return o._compose<Part, F, never>({
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
	return function <A, F, C>(o: Optic<Whole, A, F, C>) {
		return o._compose({
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
	return function <A, F, C>(o: Optic<Part, A, F, C>) {
		return o._compose({
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

export function getter<Part, Whole>({
	getter,
}: {
	getter: (v: Whole) => Part
}) {
	return lens<Part, Whole>({
		getter,
		setter: forbidden,
	})
}

export function getterOpt<Part, Whole>({
	getter,
}: {
	getter: (v: Whole) => Part | undefined
}) {
	return optional<Part, Whole>({
		getter,
		setter: forbidden,
	})
}

// optics modifiers

// TODO: memoize ?
// FIXME: type inferance is problematic when value can be command
// we need to cast is as any
export function active(areEqual: AreEqual<any> = Object.is) {
	return function <Part>(value: Part | ((p: Part) => Part)) {
		return function <Whole, Fail, Command>(
			o: Optic<Part, Whole, Fail, Command>,
		) {
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
			return new Optic<boolean, Whole, never, never>({
				getter,
				setter,
				mapper: mkMapper(setter, getter),
				refold: id as any, // TODO:
				isFaillure: isNever,
				isCommand: isNever,
				exec: id,
			})
		}
	}
}

export function valueOr<Part>(value: Init<Part>) {
	return function <Whole, Fail, Command>(o: Optic<Part, Whole, Fail, Command>) {
		const getter = (whole: Whole) => {
			const part = o.getter(whole)
			if (o.isFaillure(part)) return fromInit(value)
			return part
		}
		return new Optic({
			getter,
			setter: (p, w) => o.setter(p, w),
			mapper: mkMapper(o.setter, getter),
			refold: id as any, // TODO:
			isFaillure: isNever,
			isCommand: o.isCommand,
			exec: o.exec,
		})
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
