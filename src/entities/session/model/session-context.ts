import type { Session } from '@entities/session/model/types'
import { createContext } from 'react'

export type SessionContextValue = {
	token: string | null
	isAuthenticated: boolean
	signIn: (session: Session) => void
	signOut: () => void
}

export const SessionContext = createContext<SessionContextValue | null>(null)
