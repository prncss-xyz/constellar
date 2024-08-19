import { Json } from '@/json'
import { createReducer, useAtomValue } from '@constellar/atoms'
import { id } from '@constellar/utils'
import { useCallback } from 'react'

import { clock, useSetupClock } from './clock'
import { machine } from './machine'

const timer = createReducer(machine, id)()

// not doing anything, just showing the shortcut
timer.send({ type: 'bye' })
timer.send('bye')

function Toggle() {
	const toggle = useCallback(
		() =>
			timer.send({
				type: 'toggle',
				now: clock.peek(),
			}),
		[],
	)
	const running = useAtomValue(timer, ({ type }) => type === 'running')
	/* const running = timer.peek().type === 'running' */
	return <button onClick={toggle}>{running ? 'Stop' : 'Start'}</button>
}

function Reset() {
	const reset = useCallback(
		() => timer.send({ type: 'reset', now: clock.peek() }),
		[],
	)
	return <button onClick={reset}>Reset</button>
}

function Counter() {
	const count = useAtomValue(timer, ({ count }) => count)
	const seconds = useAtomValue(clock, (now) => Math.floor(count(now) / 1000))
	return <div>{seconds}</div>
}

export default function Timer() {
	useSetupClock()
	return (
		<div>
			<Toggle />
			<Reset />
			<Counter />
			<Json store={timer} />
			<Json store={clock} />
		</div>
	)
}
