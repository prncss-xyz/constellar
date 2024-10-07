---
---

# Consuming

A state machine created with either `simpleStateMachine` or `multipleStateMachine` is a function receiving the initial parameter (if any) and returning some low level object (will eventually be documented). This object needs a consumer to be actually useful. The `@constellar/core` provides `objectMachine` and `promiseMachine` as consumers, while `@constellar/jotai` provides `machineAtom`. The consumer also provides means to implement messages and effects.

## Effects and Interpreter

Effects semantics works much like React's `useEffect` hook, with each `state.type` being considered as its own component.

Derived state can have an `effects` field:

```typescript
{
    effects: {
        [Key]: params
    }
}
```

A corresponding interpreter is an object of type:

```typescript
{
    [Key]: (params, send: (e: Event)) => (() => void) | void
}
```

Whenever `state.type` or params changes, last cleaup function (if any) is called, then the corresponding effect function is called, optionally returning the next effect function. The provided `send` function can be used to send further events. This can be use for exemple to provide result of a fetching operation to the state machine.

## Messages as Listener

A listener function can also be provided to consumer. It recieve an object of type `Message` and is responible to do interpret the message meaningfuly.

## objectMachine

`objectMachine` is the basic way to implement a state machine for backend or testing purposes.

```typescript
const m = objectMachine(someMachine(param), {
    interpreter?: {[Key]: (param, send) => (() => void) | void},
    listener?: (e: Message) => void,
    onFinal: (s: Final) => void
})
```

The second parameter is optional. `onFinal` is called when machine reaches a final state. `interpreter` and `listener` works as described above.

`m.state` represents the current state of machine.

`m.final` represents the current state if this state is final, undefined otherwise.

`m.isDisabled(e: Event) boolean` returns true if the event whould trigger a state transition or emit a message.

`m.next(e: Event) State` returns the state the machine would have after sending this event.

`m.send(event: Event)` actually send the event and updates machine state accordingly.

(`visit` and `flush` are currently undocumented)

## promiseMachine

`promiseMachine` is used when you want to spawn a state machine and only manage it's final state. Interpreter is optional.

```typescript
const res = await promiseMachine(someMachine(), interpreter)
```
