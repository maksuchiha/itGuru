import { useAuthCard } from '@features/auth/login/model/use-auth-card'
import type { FC } from 'react'

import { AuthCardView } from './auth-card.view'

export const AuthCard: FC = () => {
	const viewProps = useAuthCard()

	return <AuthCardView {...viewProps} />
}
