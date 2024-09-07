import { IMachine } from './core'

export function objectMachineFactory<Event, State, Transformed, Final>(
	machine: IMachine<Event, State, Transformed, Final>,
) {
	let transformed = machine.transform(machine.init)
	const send = (event: Event) => {
		const state = machine.reducer(event, transformed)
		if (state !== undefined) transformed = machine.transform(state)
	}
	return {
		send,
		peek: () => transformed,
		getFinal: () => machine.getFinal(transformed),
		getState: (event: Event) => {
			const nextState = machine.reducer(event, transformed)
			if (nextState === undefined) return transformed
			return machine.transform(nextState)
		},
		isDisabled: (event: Event) =>
			machine.reducer(event, transformed) === undefined,
	}
}
