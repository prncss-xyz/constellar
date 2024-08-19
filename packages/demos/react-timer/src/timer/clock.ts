import { createState } from '@constellar/atoms'
import { useEffect } from 'react'

export const clock = createState(0)

export function useSetupClock(period = 100) {
	useEffect(() => {
		const timer = setInterval(() => {
			clock.send(Date.now())
		}, period)
		return () => clearInterval(timer)
	}, [period])
}
