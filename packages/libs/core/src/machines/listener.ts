/* eslint-disable @typescript-eslint/no-explicit-any */

import { isFunction, Typed } from '../utils'
import { fromSendable, Sendable } from './core'

export type Listener<Message extends Typed, Args extends any[]> =
	| ((message: Message, ...args: Args) => void)
	| {
			[K in Message['type']]: (
				message: { type: K } & Message,
				...args: Args
			) => void
	  }

export function toListener<Message extends Typed, Args extends any[]>(
	listener: Listener<Message, Args>,
): (message: Sendable<Message>, ...args: Args) => void {
	if (isFunction(listener))
		return (message: Sendable<Message>, ...args) =>
			listener(fromSendable(message), ...args)
	return (message, ...args) => {
		const m = fromSendable(message)
		;(listener as any)[m.type](m, ...args)
	}
}
