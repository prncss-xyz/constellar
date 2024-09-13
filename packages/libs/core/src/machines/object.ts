import { IMachine } from './core'
import { Interpreter, ManchineEffects } from './effects'

class ObjectMachine<Event, State, Transformed, Substate, Final> {
	private queue: Event[] = []
	private effects: ManchineEffects<Event, Substate> | undefined
	public state: Transformed
	public final: Final | undefined
	constructor(
		private machine: IMachine<Event, State, Transformed, Substate, Final>,
		private opts?: {
			onFinal?: (final: Final) => void
			interpreter?: Interpreter<Event, Substate>
		},
	) {
		this.state = machine.transform(machine.init)
		this.final = machine.getFinal(this.state)
		if (opts?.interpreter) {
			this.effects = new ManchineEffects(this.send, opts.interpreter)
			this.effects.update(this.visit.bind(this))
		}
	}
	visit<Acc>(
		fold: (substate: Substate, acc: Acc, index: string) => Acc,
		acc: Acc,
	) {
		return this.machine.visit(acc, fold, this.state)
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
	next(event: Event) {
		const nextState = this.machine.reducer(event, this.state)
		if (nextState === undefined) return this.state
		return this.machine.transform(nextState)
	}
	isDisabled(event: Event) {
		return this.machine.reducer(event, this.state) === undefined
	}
}

export function objectMachine<Event, State, Transformed, Substate, Final>(
	machine: IMachine<Event, State, Transformed, Substate, Final>,
	opts?: {
		onFinal?: (final: Final) => void
		interpreter?: Interpreter<Event, Substate>
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
