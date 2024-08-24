import { linear } from '@constellar/optics'
import { flow } from '@constellar/utils'
import { act, renderHook } from '@testing-library/react'

import { createFocus, createState, createView, useAtom, useAtomValue } from '.'

test.skip('focus', async () => {
	const num = createState(4)
	const double = createFocus(num, (eq) => flow(eq, linear(2)))
	const { result: r1 } = renderHook(() => useAtom(double))
	expect(r1.current[0]).toEqual(8)
	act(() => r1.current[1]((num) => num + 2))
	expect(r1.current[0]).toEqual(10)
	const { result: r2 } = renderHook(() => useAtomValue(num))
	expect(r2.current).toEqual(5)
})

test.skip('view', async () => {
	const num = createState(4)
	const double = createView(num, (eq) => flow(eq, linear(2)))
	const { result: r1 } = renderHook(() => useAtomValue(double))
	expect(r1.current).toEqual(8)
})
