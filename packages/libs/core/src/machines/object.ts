import { Typed } from '../utils'
import { IMachine, MessageCtx, Sendable } from './core'
import { EffectsHandlers, MachineEffects } from './effects'
import { Listener, toListener } from './listener'
import { isDisabled, nextState } from './utils'

class ObjectMachine<
	Event,
	State,
	Message extends Typed,
	Transformed,
	SubState,
	Final,
> {
	private effects: MachineEffects<Event, SubState> | undefined
	private onFinal?: (final: Final) => void
	private onMessage: (event: Sendable<Message>) => void
	private queue: Event[] = []
	public final: Final | undefined
	public state: Transformed
	constructor(
		private machine: IMachine<
			Event,
			State,
			MessageCtx<Message>,
			Transformed,
			SubState,
			Final
		>,
		opts?: {
			events?: EffectsHandlers<Event, SubState>
			onFinal?: (final: Final) => void
			onMessage?: Listener<Message>
		},
	) {
		this.onMessage = opts?.onMessage ? toListener(opts.onMessage) : () => {}
		this.onFinal = opts?.onFinal
		this.state = machine.transform(machine.init())
		this.final = machine.getFinal(this.state)
		if (opts?.events) {
			this.effects = new MachineEffects(opts.events)
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
		const state = this.machine.reducer(event, this.state, this.onMessage)
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
	Message extends Typed,
	Transformed,
	SubState,
	Final,
>(
	machine: IMachine<
		Event,
		State,
		MessageCtx<Message>,
		Transformed,
		SubState,
		Final
	>,
	opts?: {
		events?: EffectsHandlers<Event, SubState>
		onFinal?: (final: Final) => void
		onMessage?: Listener<Message>
	},
) {
	return new ObjectMachine(machine, opts)
}

export function promiseMachine<Event, State, Transformed, SubState, Final>(
	machine: IMachine<
		Event,
		State,
		MessageCtx<{ type: never }>,
		Transformed,
		SubState,
		Final
	>,
	events: EffectsHandlers<Event, SubState>,
) {
	return new Promise<Final>((resolve) => {
		new ObjectMachine(machine, { events: events, onFinal: resolve })
	})
}
