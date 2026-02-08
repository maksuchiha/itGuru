import { App } from '@app/app'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@app/styles/global.scss'
import '@app/styles/tokens.scss'

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<App />
	</StrictMode>
)
