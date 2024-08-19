import { Json } from '@/json'
import { createFocus, createState, useAtom } from '@constellar/atoms'
import { active, filter, includes, prop } from '@constellar/optics'
import { flow } from '@constellar/utils'
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
const atom = createState<State>({ fields: { contents: [] } })
const activateLength = active((a, b) => a.length === b.length)

/* const items = flow(eq<State>(), prop('fields'), prop('contents')) */

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

// FIX: chekbox is undefined then true
function ItemCheckbox({ name }: { name: string }) {
	const focus = useMemo(
		() =>
			createFocus(atom, (eq) =>
				flow(eq, prop('fields'), prop('contents'), includes(name)),
			),
		[name],
	)
	/*
	const _focus = useMemo(
		() =>
			createFocus(atom, (eq) =>
				flow(eq, prop('fields'), prop('contents'), includes(name)),
			),
		[name],
	)
  */
	/* const focus = useMemo(() => flow(items, includes(name)), [name]) */

	const [value, setValue] = useAtom(focus)
	return <Checkbox name={name} value={value} setValue={setValue} />
}

/* const clearVoyels = flow(items, filter(isVoyel), activateLength([] as string[])) */
const clearVoyels = createFocus(atom, (eq) =>
	flow(
		eq,
		prop('fields'),
		prop('contents'),
		filter(isVoyel),
		activateLength([] as string[]),
	),
)

function ClearVoyels() {
	const [disabled, clear] = useAtom(clearVoyels, true)
	return (
		<button disabled={disabled} onClick={clear}>
			Clear voyels
		</button>
	)
}

export default function Checkboxes() {
	return (
		<>
			<div>
				{names.map((name) => (
					<ItemCheckbox key={name} name={name} />
				))}
			</div>
			<ClearVoyels />
			<Json store={atom} />
		</>
	)
}
