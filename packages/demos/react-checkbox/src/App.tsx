import { Json } from '@/json'
import { activeFocusAtom, focusAtom } from '@constellar/jotai'
import { filter, includes, prop } from '@constellar/optics'
import { pipe } from '@constellar/utils'
import { atom, useAtom } from 'jotai'
import { Dispatch, SetStateAction, useCallback, useMemo } from 'react'

function isVoyel(s: string) {
	return 'aeiouy'.includes(s)
}
const names = ['a', 'b', 'c', 'd', 'e']
type State = {
	fields: {
		contents: string[]
	}
}
const stateAtom = atom<State>({ fields: { contents: [] } })

const toggle = (v: boolean) => !v
function Checkbox({
	name,
	value,
	setValue,
}: {
	name: string
	value: boolean
	setValue: Dispatch<SetStateAction<boolean>>
}) {
	const onChange = useCallback(() => setValue(toggle), [setValue])
	return (
		<div>
			<label>{name}</label>
			<input type="checkbox" checked={value} onChange={onChange} />
		</div>
	)
}

function ItemCheckbox({ name }: { name: string }) {
	const valueAtom = useMemo(
		() =>
			focusAtom(
				stateAtom,
				pipe(prop('fields'), prop('contents'), includes(name)),
			),
		[name],
	)
	const [value, setValue] = useAtom(valueAtom)
	return <Checkbox name={name} value={value} setValue={setValue} />
}

const clearVoyelsAtom = activeFocusAtom(
	stateAtom,
	pipe(prop('fields'), prop('contents'), filter(isVoyel)),
	[],
)

function ClearVoyels() {
	const [disabled, clear] = useAtom(clearVoyelsAtom)
	return (
		<button disabled={disabled} onClick={() => clear()}>
			Clear voyels
		</button>
	)
}

export default function App() {
	return (
		<>
			<div>
				{names.map((name) => (
					<ItemCheckbox key={name} name={name} />
				))}
			</div>
			<ClearVoyels />
			<Json store={stateAtom} />
		</>
	)
}
