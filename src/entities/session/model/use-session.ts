import { SessionContext } from '@entities/session/model/session-context'
import { useContext } from 'react'

export function useSession() {
	const context = useContext(SessionContext)
	if (!context) {
		throw new Error('useSession must be used within SessionProvider')
	}
	return context
}
