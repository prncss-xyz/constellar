import { atom, useSetAtom } from 'jotai'
import { useEffect } from 'react'

export const clockAtom = atom(0)

export function useSetupClock(period = 100) {
	const setClock = useSetAtom(clockAtom)
	useEffect(() => {
		const timer = setInterval(() => {
			setClock(Date.now())
		}, period)
		return () => clearInterval(timer)
	}, [period, setClock])
}
