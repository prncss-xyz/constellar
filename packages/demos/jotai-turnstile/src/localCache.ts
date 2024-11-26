const init = Symbol('INIT')
// TODO: abort signal
export function localCached<Key extends keyof Obj, Obj extends object, Res>(
	key: Key,
	get: (obj: Obj) => Promise<Res>,
) {
	let cachedVal: Obj[Key] | typeof init = init
	let cachedRes: Res | typeof init = init
	return function (obj: Obj, cb: (r: Res) => void) {
		const val = obj[key]
		if (cachedVal === val) {
			if (cachedRes === init) throw new Error('not initialized')
			cb(cachedRes)
			return () => {}
		}
		let canceled = false
		get(obj).then((res) => {
			cachedVal = val
			cachedRes = res
			if (canceled) return
			cb(res)
		})
		return () => {
			canceled = true
		}
	}
}
