export type Prettify<Type> = {
	[Key in keyof Type]: Type[Key]
} & {}

export type Init<T, P = void> = T | ((p: P) => T)
export type Reducer<Event, Acc> = (t: Event, acc: Acc) => Acc
export type Updater<Value, Command> =
	| Command
	| Value
	| ((value: Value) => Value)
export type Modify<Value> = (value: Value) => Value
export type AreEqual<T> = (a: T, b: T) => boolean
export type Typed = {
	type: string
}
