import { SessionContext } from '@entities/session/model/session-context'
import { clearSession, loadSession, saveSession } from '@entities/session/model/session-storage'
import type { Session } from '@entities/session/model/types'
import { useCallback, useMemo, useState, type FC, type ReactNode } from 'react'

type SessionProviderProps = {
	children: ReactNode
}

export const SessionProvider: FC<SessionProviderProps> = ({ children }) => {
	const [token, setToken] = useState<string | null>(() => loadSession()?.token ?? null)

	const signIn = useCallback((session: Session) => {
		saveSession(session)
		setToken(session.token)
	}, [])

	const signOut = useCallback(() => {
		clearSession()
		setToken(null)
	}, [])

	const value = useMemo(
		() => ({
			token,
			isAuthenticated: Boolean(token),
			signIn,
			signOut
		}),
		[token, signIn, signOut]
	)

	return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
