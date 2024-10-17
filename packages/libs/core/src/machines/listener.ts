/* eslint-disable @typescript-eslint/no-explicit-any */

import { isFunction, Typed } from '../utils'

export type Listener<Message extends Typed, Args extends any[]> =
	| ((event: Message, ...args: Args) => void)
	| {
			[K in Message['type']]: (
				event: { type: K } & Message,
				...args: Args
			) => void
	  }

export function toListener<Message extends Typed, Args extends any[]>(
	listener: Listener<Message, Args>,
): (event: Message, ...args: Args) => void {
	if (isFunction(listener)) return listener
	return (message, ...args) => {
		;(listener as any)[message.type](message, ...args)
	}
}
