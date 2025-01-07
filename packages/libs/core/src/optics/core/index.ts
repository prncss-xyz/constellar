/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	apply,
	fromInit,
	id,
	Init,
	isFunction,
	isNever,
	isUndefined,
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

export function forbidden<Part, Whole>(_part: Part, _whole: Whole): Whole {
	throw new Error('forbidden')
}

// S (setter) extends void | unknown; use `void` to represent a prism, `never` otherwise
export type PRISM = void
export type NON_PRISM = never
type Setter<Part, Whole, S> = (p: Part, w: S | Whole) => Whole

type Mapper<Part, Whole> = (mod: (p: Part) => Part, w: Whole) => Whole
type Com<Part, Whole> = (p: Part, w: Whole) => Whole
type Getter<Part, Whole, Fail> = (w: Whole) => Fail | Part

export interface IOptic<Part, Whole, Fail, Command, S> {
	com: Com<Command, Whole>
	getter?: Getter<Part, Whole, Fail>
	isCommand: (v: unknown) => v is Command
	isFailure: (v: unknown) => v is Fail
	mapper: Mapper<Part, Whole>
	refold: <Acc>(fold: FoldFn<Part, Acc, Ctx>) => FoldFn<Whole, Acc, Ctx>
	setter?: Setter<Part, Whole, S>
}

export class COptic<Part, Whole, Fail, Command, S>
	implements IOptic<Part, Whole, Fail, Command, S>
{
	com: Com<Command, Whole>
	getter?: Getter<Part, Whole, Fail>
	isCommand: (v: unknown) => v is Command
	isFailure: (v: unknown) => v is Fail
	mapper: Mapper<Part, Whole>
	refold: <Acc>(fold: FoldFn<Part, Acc, Ctx>) => FoldFn<Whole, Acc, Ctx>
	setter?: Setter<Part, Whole, S>
	constructor(opts: {
		com: Com<Command, Whole>
		getter?: Getter<Part, Whole, Fail>
		isCommand: (v: unknown) => v is Command
		isFailure: (v: unknown) => v is Fail
		mapper: Mapper<Part, Whole>
		refold: <Acc>(fold: FoldFn<Part, Acc, Ctx>) => FoldFn<Whole, Acc, Ctx>
		setter?: Setter<Part, Whole, S>
	}) {
		this.com = opts.com
		this.getter = opts.getter
		this.isCommand = opts.isCommand
		this.isFailure = opts.isFailure
		this.mapper = opts.mapper
		this.refold = opts.refold
		this.setter = opts.setter
	}
	static eq<Whole>() {
		return new COptic({
			com: id,
			getter: id<Whole>,
			isCommand: isNever,
			isFailure: isNever,
			mapper: apply,
			refold: id,
			setter: id,
		})
	}
	command(token: Command, whole: Whole) {
		return this.com(token, whole)
	}
	fold<Acc>(form: FoldForm<Part, Acc, Ctx>, whole: Whole) {
		return this.refold(form.foldFn)(whole, fromInit(form.init), ctxNull)
	}
	modify(mod: Modify<Part>, whole: Whole) {
		return this.mapper(mod, whole)
	}
	put(part: Part, whole: S | Whole) {
		if (this.setter) return this.setter!(part, whole)
		return this.mapper(() => part, whole as Whole)
	}
	update(arg: ((p: Part) => Part) | Command | Part) {
		if (this.isCommand(arg)) return (whole: Whole) => this.com(arg, whole)
		if (isFunction(arg)) return (whole: Whole) => this.modify(arg, whole)
		return (whole: Whole) => this.put(arg, whole)
	}
	view<A = undefined>(
		whole: Whole,
		or?: Init<A, Fail>,
	): (Fail extends never ? never : A) | Part {
		const res = this.getter
			? this.getter(whole)
			: this.fold(toFirst<Part, Fail, Ctx>(undefined as Fail), whole)
		if (this.isFailure(res)) {
			if (isFunction(or)) return or(res)
			return or as any
		}
		return res
	}
}

export type Focus<Part, Whole, Fail, Command, T> = (
	eq: COptic<Whole, Whole, never, never, void>,
) => COptic<Part, Whole, Fail, Command, T>

export function focus<Whole>() {
	return function <Part, Fail, Command, S>(
		o: Focus<Part, Whole, Fail, Command, S>,
	) {
		return o(COptic.eq<Whole>())
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
	setter: Setter<Part, Whole, NON_PRISM>,
	getter: Getter<Part, Whole, never>,
): (mod: (p: Part) => Part, w: Whole) => Whole {
	if (setter === id && getter === id) return id as any
	if (setter === id) return (f, w) => f(getter(w)) as any
	if (getter === id) return (f, w) => setter(f(w as any), w) as any
	return (mod: (v: Part) => Part, w: Whole) => {
		return setter(mod(getter(w)), w)
	}
}

function composeSetter<Whole, Mega, Fail, Part, SL>(
	lGetter: Getter<Whole, Mega, Fail> | undefined,
	lSetter: Setter<Whole, Mega, SL> | undefined,
	rIsFailure: (v: unknown) => v is Fail,
	rSetter: Setter<Part, Whole, NON_PRISM> | undefined,
): Setter<Part, Mega, NON_PRISM & SL> | undefined {
	if (!lGetter || !lSetter || !rSetter) return undefined
	const set: (p: Part, w: NON_PRISM | Whole, m: Mega | SL) => Mega =
		lSetter === id
			? (b, t) => rSetter(b, t) as any
			: (b, t, w) => lSetter(rSetter(b, t), w)
	return (b, w) => {
		const t = lGetter(w)
		if (rIsFailure(t)) return w
		return set(b, t, w)
	}
}

function composePrismSetter<Whole, Mega, Fail, Part, SL>(
	lGetter: Getter<Whole, Mega, Fail> | undefined,
	lSetter: Setter<Whole, Mega, SL> | undefined,
	rSetter: Setter<Part, Whole, PRISM>,
): Setter<Part, Mega, PRISM & SL> | undefined {
	if (!lGetter || !lSetter || !rSetter) return undefined
	const set: (p: Part, m: Mega | SL) => Mega =
		lSetter === id ? (b) => rSetter(b) as any : (b, w) => lSetter(rSetter(b), w)
	return (b, w) => set(b, w)
}

interface IOpticBase<Part, Whole, Fail, Command, S> {
	command: Com<Command, Whole>
	getter?: Getter<Part, Whole, Fail>
	isCommand: (v: unknown) => v is Command
	isFailure: (v: unknown) => v is Fail
	mapper?: Mapper<Part, Whole>
	refold?: <Acc>(mod: FoldFn<Part, Acc, Ctx>) => FoldFn<Whole, Acc, Ctx>
	setter?: Setter<Part, Whole, S>
}

interface IOptional<Part, Whole, Fail, Command, S>
	extends IOpticBase<Part, Whole, Fail, Command, S> {
	getter: Getter<Part, Whole, Fail>
	setter: Setter<Part, Whole, S>
}
interface ITraversal<Part, Whole, Fail, Command>
	extends IOpticBase<Part, Whole, Fail, Command, NON_PRISM> {
	mapper: Mapper<Part, Whole>
	refold: <Acc>(foldPart: FoldFn<Part, Acc, Ctx>) => FoldFn<Whole, Acc, Ctx>
}

type IOpticArgs<Part, Whole, Fail, Command, S> =
	| IOptional<Part, Whole, Fail, Command, S>
	| ITraversal<Part, Whole, Fail, Command>

export function opticPrism<Part, Whole, Fail, Command>(
	r: IOptional<Part, Whole, Fail, Command, PRISM>,
) {
	return function <Mega, FL, CL, SL>(l: IOptic<Whole, Mega, FL, CL, SL>) {
		return new COptic<Part, Mega, Fail | FL, Command, PRISM & SL>({
			com: (c, a) => l.mapper((p) => r.command(c, p), a),
			getter: composeGetter(l.isFailure, l.getter, r.getter),
			isCommand: r.isCommand,
			isFailure: composeFailure(l.isFailure, r.isFailure),
			mapper: composeMapper(
				l.mapper,
				(r.mapper as any) ??
					((mod: Modify<Part>, v) => {
						const b = r.getter!(v)
						if (r.isFailure(b)) return v
						return r.setter(mod(b))
					}),
			),
			refold: pipe2(
				r.refold ??
					(<Acc>(foldPart: FoldFn<Part, Acc, Ctx>): FoldFn<Whole, Acc, Ctx> =>
						(v, acc, ctx) => {
							const b = r.getter(v)
							if (r.isFailure(b)) return acc
							return foldPart(b, acc, ctx)
						}),
				l.refold,
			),
			setter: composePrismSetter(l.getter, l.setter, r.setter),
		})
	}
}

export function opticNonPrism<Part, Whole, Fail, Command>(
	r: IOpticArgs<Part, Whole, Fail, Command, NON_PRISM>,
) {
	return function <Mega, FL, CL, SL>(l: IOptic<Whole, Mega, FL, CL, SL>) {
		return new COptic<Part, Mega, Fail | FL, Command, NON_PRISM & SL>({
			com: (c, a) => l.mapper((p) => r.command(c, p), a),
			getter: composeGetter(l.isFailure, l.getter, r.getter),
			isCommand: r.isCommand,
			isFailure: composeFailure(l.isFailure, r.isFailure),
			mapper: composeMapper(
				l.mapper,
				(r.mapper as any) ??
					((mod: Modify<Part>, v) => {
						const b = r.getter!(v)
						if (r.isFailure(b)) return v
						return r.setter!(mod(b), v)
					}),
			),
			refold: pipe2(
				r.refold ??
					(<Acc>(foldPart: FoldFn<Part, Acc, Ctx>): FoldFn<Whole, Acc, Ctx> =>
						(v, acc, ctx) => {
							const b = r.getter!(v)
							if (r.isFailure(b)) return acc
							return foldPart(b, acc, ctx)
						}),
				l.refold,
			),
			setter: composeSetter(l.getter, l.setter, l.isFailure, r.setter),
		})
	}
}

export function iso<Part, Whole>({
	getter,
	mapper,
	setter,
}: {
	getter: (whole: Whole) => Part
	mapper?: Mapper<Part, Whole>
	setter: (part: Part) => Whole
}) {
	return opticPrism({
		command: forbidden,
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

export function lens<Part, Whole>({
	getter,
	mapper,
	setter,
}: {
	getter: (whole: Whole) => Part
	mapper?: Mapper<Part, Whole>
	setter: (part: Part, whole: Whole) => Whole
}) {
	return opticNonPrism({
		command: forbidden,
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

export function prism<Part, Whole>({
	getter,
	mapper,
	setter,
}: {
	getter: Getter<Part, Whole, undefined>
	mapper?: Mapper<Part, Whole>
	setter: Setter<Part, Whole, PRISM>
}) {
	return opticPrism({
		command: forbidden,
		getter,
		isCommand: isNever,
		isFailure: isUndefined,
		mapper,
		setter,
	})
}

// TODO: merge optional and removable

export function optional<Part, Whole>({
	getter,
	mapper,
	setter,
}: {
	getter: Getter<Part, Whole, undefined>
	mapper?: Mapper<Part, Whole>
	setter: Setter<Part, Whole, NON_PRISM>
}) {
	return opticNonPrism<Part, Whole, undefined, never>({
		command: forbidden,
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
	setter: Setter<Part, Whole, never>
}) {
	return opticNonPrism({
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
	return opticNonPrism<Part, Whole, undefined, never>({
		command: forbidden,
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
	return function <Whole, Fail, Command, S>(
		o: COptic<Part, Whole, Fail, Command, S>,
	) {
		const getter = (whole: Whole) => Object.is(o.update(value)(whole), whole)
		const setter: Setter<boolean, Whole, NON_PRISM> = (
			d: boolean,
			whole: Whole,
		) => {
			if (d && !getter(whole)) return o.update(value)(whole)
			return whole
		}
		return new COptic<boolean, Whole, never, never, NON_PRISM>({
			com: id,
			getter,
			isCommand: isNever,
			isFailure: isNever,
			mapper: makeMapper(setter, getter),
			refold: (fold) => (v, acc, ctx) => fold(getter(v), acc, ctx),
			setter,
		})
	}
}

// TODO: exclude traversals by type
// prism in prism out
export function valueOr<Part>(value: Init<Part>) {
	return function <Whole, Fail, Command, S>(
		o: IOptic<Part, Whole, Fail, Command, S>,
	) {
		if (!(o.getter && o.setter))
			throw new Error("valueOr don't work with traversals")
		const getter = (whole: Whole) => {
			const part = o.getter!(whole)
			if (o.isFailure(part)) return fromInit(value)
			return part
		}
		return new COptic<Part, Whole, never, Command, S>({
			com: o.com,
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
		})
	}
}
