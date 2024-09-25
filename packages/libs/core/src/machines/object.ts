import { IMachine } from './core'
import { Interpreter, MachineEffects } from './effects'

class ObjectMachine<Event, State, Transformed, Substate, Final> {
	private effects: MachineEffects<Event, Substate> | undefined
	private queue: Event[] = []
	public final: Final | undefined
	public state: Transformed
	constructor(
		private machine: IMachine<Event, State, Transformed, Substate, Final>,
		private opts?: {
			interpreter?: Interpreter<Event, Substate>
			onFinal?: (final: Final) => void
		},
	) {
		this.state = machine.transform(machine.init)
		this.final = machine.getFinal(this.state)
		if (opts?.interpreter) {
			this.effects = new MachineEffects(this.send, opts.interpreter)
			this.effects.update(this.visit.bind(this))
		}
	}
	private onChange() {
		if (!this.effects) return
		const run = this.queue.length === 0
		this.effects.update(this.visit.bind(this))
		while (run) {
			const event = this.queue.shift()
			if (event === undefined) break
			this.send(event)
		}
	}
	flush() {
		this.effects?.flush()
	}
	isDisabled(event: Event) {
		return this.machine.reducer(event, this.state) === undefined
	}
	next(event: Event) {
		const nextState = this.machine.reducer(event, this.state)
		if (nextState === undefined) return this.state
		return this.machine.transform(nextState)
	}
	send(event: Event) {
		const state = this.machine.reducer(event, this.state)
		if (state !== undefined) {
			this.state = this.machine.transform(state)
			this.final = this.machine.getFinal(this.state)
			this.onChange()
			if (this.opts?.onFinal && this.final !== undefined)
				this.opts.onFinal(this.final)
		}
	}
	visit<Acc>(
		fold: (substate: Substate, acc: Acc, index: string) => Acc,
		acc: Acc,
	) {
		return this.machine.visit(acc, fold, this.state)
	}
}

export function objectMachine<Event, State, Transformed, Substate, Final>(
	machine: IMachine<Event, State, Transformed, Substate, Final>,
	opts?: {
		interpreter?: Interpreter<Event, Substate>
		onFinal?: (final: Final) => void
	},
) {
	return new ObjectMachine(machine, opts)
}

export function promiseMachine<Event, State, Transformed, Substate, Final>(
	machine: IMachine<Event, State, Transformed, Substate, Final>,
	interpreter: Interpreter<Event, Substate>,
) {
	return new Promise<Final>((resolve) => {
		new ObjectMachine(machine, { interpreter, onFinal: resolve })
	})
}
