import { createContext } from 'react'

import type { ToastTone } from './toast'

type ToastContextValue = {
	addToast: (title: string, tone?: ToastTone, description?: string) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)
