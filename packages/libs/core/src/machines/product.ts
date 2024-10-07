/* eslint-disable @typescript-eslint/no-explicit-any */
import { IMachine } from './core'

type AnyMachine = IMachine<any, any, any, any, any, any>
type AnyM = (p: any) => IMachine<any, any, any, any, any, any>

function prod<M extends Record<PropertyKey, AnyM>>(m: M) {
	return function (p: Record<PropertyKey, any>) {
		const init: any = {}
		for (const [k, v] of Object.entries(m)) {
			init[k] = (v as any)(p[k])
		}
		return { init }
	}
}

export function product<M extends Record<PropertyKey, AnyMachine>>(
	m: M,
): (t: any) => IMachine<
	any,
	{
		[K in keyof M]: M[K] extends IMachine<any, infer S, any, any, any, any>
			? S
			: never
	},
	any,
	any,
	any,
	any
> {
	return function (t) {
		const init: any = {}
		for (const [k, v] of Object.entries(t)) {
			init[k] = m[k]!.init(v)
		}
		return {
			getFinal: function (t: any) {
				for (const [k, v] of Object.entries(t)) {
					if (m[k]!.getFinal(v) === undefined) return undefined
				}
				return t
			},
			init,
			reducer: function (e: any, t: any, send: (e: any) => void) {
				const r: any = {}
				let matched = false
				for (const [k, v] of Object.entries(t)) {
					const res = m[k]!.reducer(e, v, send)
					if (res === undefined) {
						r[k] = v
						continue
					}
					r[k] = res
					matched = true
				}
				return matched ? r : undefined
			},
			transform: function (t: any) {
				const r: any = {}
				for (const [k, v] of Object.entries(t)) {
					r[k] = m[k]!.transform(v)
				}
				return r
			},
			visit: function (
				acc: any,
				fold: (s: any, acc: any, k: string) => any,
				t: any,
			) {
				for (const [k, v] of Object.entries(t)) {
					acc = m[k]!.visit(
						acc,
						function (s: any, acc: any, k_: string) {
							return fold(s, acc, `${k}/${k_}`)
						},
						v,
					)
				}
				return acc
			},
		}
	}
}
