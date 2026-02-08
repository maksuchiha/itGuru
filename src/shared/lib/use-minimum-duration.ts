import { useEffect, useRef, useState } from 'react'

export function useMinimumDuration(active: boolean, minDurationMs: number) {
	const [visible, setVisible] = useState(active)
	const startRef = useRef<number | null>(null)
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	useEffect(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current)
			timeoutRef.current = null
		}

		if (active) {
			if (!visible) {
				timeoutRef.current = setTimeout(() => {
					timeoutRef.current = null
					setVisible(true)
				}, 0)
			}
			startRef.current = performance.now()
			return undefined
		}

		if (!visible) {
			startRef.current = null
			return undefined
		}

		const start = startRef.current ?? performance.now()
		const elapsed = performance.now() - start
		const remaining = Math.max(0, minDurationMs - elapsed)
		if (remaining === 0) {
			timeoutRef.current = setTimeout(() => {
				timeoutRef.current = null
				setVisible(false)
			}, 0)
			startRef.current = null
			return undefined
		}

		timeoutRef.current = setTimeout(() => {
			timeoutRef.current = null
			startRef.current = null
			setVisible(false)
		}, remaining)

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
				timeoutRef.current = null
			}
		}
	}, [active, minDurationMs, visible])

	return visible
}
