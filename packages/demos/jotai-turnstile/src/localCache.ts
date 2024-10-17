const init = Symbol('INIT')
// TODO: abort signal
export function localCached<Key extends keyof Obj, Obj extends object, Res>(
	key: Key,
	get: (obj: Obj) => Promise<Res>,
	cb: (r: Res) => void,
) {
	let cachedVal: Obj[Key] | typeof init = init
	let cachedRes: Res | typeof init = init
	return function (obj: Obj) {
		const val = obj[key]
		if (cachedVal === val) {
			cb(cachedRes as Res)
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
