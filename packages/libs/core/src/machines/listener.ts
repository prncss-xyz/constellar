/* eslint-disable @typescript-eslint/no-explicit-any */

import { isFunction, Typed } from '../utils'
import { fromSendable, Sendable } from './core'

export type Listener<Message extends Typed> =
	| ((message: Message) => void)
	| {
			[K in Message['type']]: (message: { type: K } & Message) => void
	  }

export function toListener<Message extends Typed>(
	listener: Listener<Message>,
): (message: Sendable<Message>) => void {
	if (isFunction(listener))
		return (message: Sendable<Message>) => listener(fromSendable(message))
	return (message) => {
		const m = fromSendable(message)
		;(listener as any)[m.type](m)
	}
}
