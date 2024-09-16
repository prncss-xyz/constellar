---
---

# Finite State Machines

## Use cases

- replace multiple flags that do not freely combine
- express a succession idea
- regroup the logic that was dispersed in handlers at one place
- think state then event

## Roadmap

- child states
- parallel states

## Prior art

- [XState](https://stately.ai/docs/xstate) is the most popular implementation of finite state machines in TypeScript. One core idea in XState is to have the machine trigger effects on state change. We are aiming for just the opposite, letting an outside observer (such as react `useEfect`) react to state changes.
