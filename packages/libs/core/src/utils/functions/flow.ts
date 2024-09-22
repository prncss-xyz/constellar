export function flow<TArgs, R1, R2, R3, R4, R5, R6, R7>(
	args: TArgs,
	f1: (args: TArgs) => R1,
	f2: (a: R1) => R2,
	f3: (a: R2) => R3,
	f4: (a: R3) => R4,
	f5: (a: R4) => R5,
	f6: (a: R5) => R6,
	f7: (a: R6) => R7,
): R7
export function flow<TArgs, R1, R2, R3, R4, R5, R6>(
	args: TArgs,
	f1: (args: TArgs) => R1,
	f2: (a: R1) => R2,
	f3: (a: R2) => R3,
	f4: (a: R3) => R4,
	f5: (a: R4) => R5,
	f6: (a: R5) => R6,
): R6
export function flow<TArgs, R1, R2, R3, R4, R5>(
	args: TArgs,
	f1: (args: TArgs) => R1,
	f2: (a: R1) => R2,
	f3: (a: R2) => R3,
	f4: (a: R3) => R4,
	f5: (a: R4) => R5,
): R5
export function flow<TArgs, R1, R2, R3, R4>(
	args: TArgs,
	f1: (args: TArgs) => R1,
	f2: (a: R1) => R2,
	f3: (a: R2) => R3,
	f4: (a: R3) => R4,
): R4
export function flow<TArgs, R1, R2, R3>(
	args: TArgs,
	f1: (args: TArgs) => R1,
	f2: (a: R1) => R2,
	f3: (a: R2) => R3,
): R3
export function flow<TArgs, R1, R2>(
	args: TArgs,
	f1: (args: TArgs) => R1,
	f2: (a: R1) => R2,
): R2
export function flow<TArgs, R1>(args: TArgs, f1: (args: TArgs) => R1): R1

// definition here: https://blog.logrocket.com/how-to-create-compose-function-typescript
export function flow<T>(args: T, ...fns: Array<(a: T) => T>) {
	return fns.reduce((acc, cb) => cb(acc), args)
}
