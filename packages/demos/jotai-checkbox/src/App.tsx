import { Json } from '@/json'
import { findMany, includes, pipe, prop } from '@constellar/core'
import { disabledFocusAtom, focusAtom } from '@constellar/jotai'
import { atom, useAtom } from 'jotai'
import { Dispatch, SetStateAction, useCallback, useMemo } from 'react'

function isVowel(s: string) {
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
	setValue,
	value,
}: {
	name: string
	setValue: Dispatch<SetStateAction<boolean>>
	value: boolean
}) {
	const onChange = useCallback(() => setValue(toggle), [setValue])
	return (
		<div>
			<label>{name}</label>
			<input checked={value} onChange={onChange} type="checkbox" />
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
	return <Checkbox name={name} setValue={setValue} value={value} />
}

const clearVowelsAtom = disabledFocusAtom(
	stateAtom,
	pipe(prop('fields'), prop('contents'), findMany(isVowel)),
	[],
)

function ClearVowels() {
	const [disabled, clear] = useAtom(clearVowelsAtom)
	return (
		<button disabled={disabled} onClick={() => clear()}>
			Clear vowels
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
			<ClearVowels />
			<Json store={stateAtom} />
		</>
	)
}
