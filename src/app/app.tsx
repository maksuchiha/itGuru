import { AppProviders } from '@app/providers/app-providers'
import { AppRoutes } from '@app/routes/app-routes'
import type { FC } from 'react'
import { HashRouter } from 'react-router-dom'

import styles from './app.module.scss'

export const App: FC = () => {
	return (
		<HashRouter>
			<AppProviders>
				<div className={styles.appShell}>
					<AppRoutes />
				</div>
			</AppProviders>
		</HashRouter>
	)
}
