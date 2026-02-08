import { AuthCard } from '@widgets/auth-card/auth-card'
import type { FC } from 'react'

import styles from './login-page.module.scss'

export const LoginPage: FC = () => {
	return (
		<div className={styles.page}>
			<AuthCard />
		</div>
	)
}
