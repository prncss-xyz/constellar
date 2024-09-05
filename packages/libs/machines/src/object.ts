import { IMachine } from './core'

export function objectMachineFactory<Event, State, Transformed>(
	machine: IMachine<Event, State, Transformed>,
) {
	let transformed = machine.transform(machine.init)
	const send = (event: Event) => {
		const state = machine.reducer(event, transformed)
		if (state !== undefined) transformed = machine.transform(state)
	}
	return {
		send,
		peek: () => transformed,
		isFinal: () => machine.isFinal(transformed),
		getState: (event: Event) => {
			const nextState = machine.reducer(event, transformed)
			if (nextState === undefined) return transformed
			return machine.transform(nextState)
		},
		isDisabled: (event: Event) =>
			machine.reducer(event, transformed) === undefined,
	}
}
