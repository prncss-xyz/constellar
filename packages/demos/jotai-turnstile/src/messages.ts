import { queue } from '@constellar/core'
import { focusAtom } from '@constellar/jotai'
import { atom } from 'jotai'

export const messagesAtom = atom<string[]>([])
export const messageQueueAtom = focusAtom(messagesAtom, queue())
