import cn from 'clsx'
import { memo, type FC } from 'react'

import styles from './toast.module.scss'

export type ToastTone = 'success' | 'error' | 'info'

export type ToastItem = {
	id: string
	title: string
	description?: string
	tone: ToastTone
}

type ToastViewportProps = {
	toasts: ToastItem[]
	onDismiss: (id: string) => void
}

const ToastViewportComponent: FC<ToastViewportProps> = ({ toasts, onDismiss }) => {
	return (
		<div
			className={styles.viewport}
			role='region'
			aria-live='polite'
		>
			{toasts.map(toast => (
				<div
					key={toast.id}
					className={cn(styles.toast, styles[toast.tone])}
				>
					<div className={styles.body}>
						<div className={styles.title}>{toast.title}</div>
						{toast.description ? <div className={styles.desc}>{toast.description}</div> : null}
					</div>
					<button
						className={styles.close}
						type='button'
						onClick={() => onDismiss(toast.id)}
						aria-label='Close'
					>
						x
					</button>
				</div>
			))}
		</div>
	)
}

export const ToastViewport = memo(ToastViewportComponent)
