import { useCallback, useEffect, useMemo, useRef, useState, type FC, type ReactNode } from 'react'

import { ToastViewport } from './toast'
import type { ToastItem, ToastTone } from './toast'
import { ToastContext } from './toast-context'

type ToastProviderProps = {
	children: ReactNode
}

function createToastId() {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID()
	}
	return `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export const ToastProvider: FC<ToastProviderProps> = ({ children }) => {
	const [toasts, setToasts] = useState<ToastItem[]>([])
	const timeoutsRef = useRef<Map<string, number>>(new Map())
	const autoDismissMs = 3200

	const dismissToast = useCallback((id: string) => {
		const timeoutId = timeoutsRef.current.get(id)
		if (timeoutId !== undefined) {
			window.clearTimeout(timeoutId)
			timeoutsRef.current.delete(id)
		}
		setToasts(current => current.filter(toast => toast.id !== id))
	}, [])

	const addToast = useCallback((title: string, tone: ToastTone = 'info', description?: string) => {
		const id = createToastId()
		const newToast: ToastItem = { id, title, description, tone }
		setToasts(current => [newToast, ...current])
	}, [])

	const value = useMemo(() => ({ addToast }), [addToast])

	useEffect(() => {
		const timeouts = timeoutsRef.current
		const activeIds = new Set(toasts.map(toast => toast.id))

		toasts.forEach(toast => {
			if (timeouts.has(toast.id)) {
				return
			}
			const timeoutId = window.setTimeout(() => dismissToast(toast.id), autoDismissMs)
			timeouts.set(toast.id, timeoutId)
		})

		timeouts.forEach((timeoutId, id) => {
			if (!activeIds.has(id)) {
				window.clearTimeout(timeoutId)
				timeouts.delete(id)
			}
		})
	}, [autoDismissMs, dismissToast, toasts])

	useEffect(() => {
		const timeouts = timeoutsRef.current
		return () => {
			timeouts.forEach(timeoutId => window.clearTimeout(timeoutId))
			timeouts.clear()
		}
	}, [])

	return (
		<ToastContext.Provider value={value}>
			{children}
			<ToastViewport
				toasts={toasts}
				onDismiss={dismissToast}
			/>
		</ToastContext.Provider>
	)
}
