import { EffectsHandlers, MachineEffects } from '@constellar/core'
import { useAtom, WritableAtom } from 'jotai'
import { useEffect, useRef } from 'react'

import { Spiced } from './jotai-machine'

export function useMachineEffects<Event, Transformed, SubState, Final, R>(
	machineAtom:
		| WritableAtom<
				Promise<Spiced<Event, Transformed, SubState, Final>>,
				[Event],
				R
		  >
		| WritableAtom<Spiced<Event, Transformed, SubState, Final>, [Event], R>,
	effects: EffectsHandlers<Event, SubState>,
) {
	const [subState, send] = useAtom(machineAtom)
	const machineEffects = useRef<MachineEffects<Event, SubState>>()
	useEffect(() => {
		machineEffects.current = new MachineEffects<Event, SubState>(effects)
		return () => machineEffects.current!.flush()
	}, [effects])
	useEffect(
		() => machineEffects.current!.update(subState.visit, send),
		[subState, send, effects],
	)
}

// this will only be useful after react compiler's stable release
/*
export function Handler<Event, Transformed, SubState, Final, R>({
	effects,
	machineAtom,
}: {
	effects: Interpreter<Event, SubState>
	machineAtom:
		| WritableAtom<
				Promise<Spiced<Event, Transformed, SubState, Final>>,
				[Event],
				R
		  >
		| WritableAtom<Spiced<Event, Transformed, SubState, Final>, [Event], R>
}) {
	useMachineEffects(machineAtom, effects)
	return null
}
*/
