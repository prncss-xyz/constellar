import { atom, useSetAtom } from 'jotai'
import { useEffect } from 'react'

export const nowAtom = atom(0)

export function useSetupNow(period = 100) {
	const setClock = useSetAtom(nowAtom)
	useEffect(() => {
		const timer = setInterval(() => {
			setClock(Date.now())
		}, period)
		return () => clearInterval(timer)
	}, [period, setClock])
}
