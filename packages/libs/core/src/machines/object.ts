import { IMachine } from './core'
import { Interpreter, MachineEffects } from './effects'
import { isDisabled, nextState } from './utils'

class ObjectMachine<Event, State, Message, Transformed, SubState, Final> {
	private effects: MachineEffects<Event, SubState> | undefined
	private listener: (event: Message) => void
	private onFinal?: (final: Final) => void
	private queue: Event[] = []
	public final: Final | undefined
	public state: Transformed
	constructor(
		private machine: IMachine<
			Event,
			State,
			Message,
			Transformed,
			SubState,
			Final
		>,
		opts?: {
			interpreter?: Interpreter<Event, SubState>
			listener?: (event: Message) => void
			onFinal?: (final: Final) => void
		},
	) {
		this.listener = opts?.listener ?? (() => {})
		this.onFinal = opts?.onFinal
		this.state = machine.transform(machine.init)
		this.final = machine.getFinal(this.state)
		if (opts?.interpreter) {
			this.effects = new MachineEffects(opts.interpreter)
			this.effects.update(this.visit.bind(this), this.send.bind(this))
		}
	}
	private onChange() {
		if (!this.effects) return
		const run = this.queue.length === 0
		this.effects.update(this.visit.bind(this), this.send.bind(this))
		if (!run) return
		while (true) {
			const event = this.queue.shift()
			if (event === undefined) break
			this.send(event)
		}
	}
	flush() {
		this.effects?.flush()
	}
	isDisabled(event: Event) {
		return isDisabled(this.machine, this.state, event)
	}
	next(event: Event) {
		return nextState(this.machine, this.state, event)
	}
	send(event: Event) {
		const state = this.machine.reducer(event, this.state, this.listener)
		if (state !== undefined) {
			this.state = this.machine.transform(state)
			this.final = this.machine.getFinal(this.state)
			this.onChange()
			if (this.onFinal && this.final !== undefined) this.onFinal(this.final)
		}
	}
	visit<Acc>(
		fold: (subState: SubState, acc: Acc, index: string) => Acc,
		acc: Acc,
	) {
		return this.machine.visit(acc, fold, this.state)
	}
}

export function objectMachine<
	Event,
	State,
	Message,
	Transformed,
	SubState,
	Final,
>(
	machine: IMachine<Event, State, Message, Transformed, SubState, Final>,
	opts?: {
		interpreter?: Interpreter<Event, SubState>
		listener?: (event: Message) => void
		onFinal?: (final: Final) => void
	},
) {
	return new ObjectMachine(machine, opts)
}

export function promiseMachine<
	Event,
	State,
	Message,
	Transformed,
	SubState,
	Final,
>(
	machine: IMachine<Event, State, Message, Transformed, SubState, Final>,
	interpreter: Interpreter<Event, SubState>,
) {
	return new Promise<Final>((resolve) => {
		new ObjectMachine(machine, { interpreter, onFinal: resolve })
	})
}
