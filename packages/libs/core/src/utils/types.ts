export type Prettify<Type> = {
	[Key in keyof Type]: Type[Key]
} & {}

export type Init<T, P = void> = ((p: P) => T) | T

export type Reducer<Event, Acc> = (t: Event, acc: Acc) => Acc
export type Updater<Value, Command> =
	| ((value: Value) => Value)
	| Command
	| Value
export type Modify<Value> = (value: Value) => Value
export type AreEqual<T> = (a: T, b: T) => boolean
export type Typed = {
	type: string
}
