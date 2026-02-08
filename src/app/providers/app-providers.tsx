import { store } from '@app/store/store'
import { SessionProvider } from '@entities/session/model/session-provider'
import { ToastProvider } from '@shared/ui/toast/toast-provider'
import type { FC, ReactNode } from 'react'
import { Provider } from 'react-redux'

type AppProvidersProps = {
	children: ReactNode
}

export const AppProviders: FC<AppProvidersProps> = ({ children }) => {
	return (
		<Provider store={store}>
			<SessionProvider>
				<ToastProvider>{children}</ToastProvider>
			</SessionProvider>
		</Provider>
	)
}
