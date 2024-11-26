---
---

# Machine

To use jotai integration, you will need to use `simpleStateJotaiMachine` and `multiStateJotaiMachine` (provided by `@constellar/jotai`) instead of `simpleStateMachine` and `multiStateMachine`. The difference is that in place of a `emit` function, you have instead access to a `get` and a `set` argument. The get argument lets you read from an atom, the `set` argument lets you write to an atom, but do not let you access to the return value provided by the atom's setter.

## machineAtom

```typescript
function machineAtom(
	machine: IMachine,
	opts?: {
		atomFactory?: (init: State) => WritableAtom
		listener?: (event: Message, get: Getter, set: Setter) => void
	},
)
```

Creates an atom representing a given machine.

Optional `atomFactory` function creates an atom which will store the core (non-derived) part of the atom. This is useful for persistence or transport of the machine. Since only the core is stored, you don't have to worry about derived state being unserializable.

`listener` is a function being called to interpret messages send inside the machine. It can use get and set to read from and write to atoms.

## useMachineEffects

```typescript
function useMachineEffects(
	transformed: Transformed,
	send: (event: Event) => void,
	interpreter: Interpreter<Event, Transformed>,
)
```

## disabledEventAtom

```typescript
function disabledEventAtom(
	machineAtom: WritableAtom,
	event: { [Key]: (params, send: (e: Event)) => (() => void) | void },
): Atom
```

Reading the atom will return `true` if sending the event has any effect on the machine. Writing to the atom (without parameters) will send the event.

This is useful for binding an event with a button-like element, hence the name.

## nextStateAtom

```typescript
function nextStateAtom(machineAtom: Atom, event: Event): Atom
```

## valueEventAtom

```typescript
function valueEventAtom(
	machineAtom: WritableAtom,
	select: (state: State) => Value,
	put: (value: Value, send: (event: Event) => void) => void,
): Atom
```

When some event updates a specific part of a machine state, you can create a `WritableAtom` focusing on that part of the machine. (And you can further manipulate that state with focusAtom).
