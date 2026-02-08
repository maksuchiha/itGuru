import { memo, useEffect, useId, useRef, type FC, type ReactNode } from 'react'

import styles from './modal.module.scss'

type ModalProps = {
	isOpen: boolean
	onClose: () => void
	title: string
	description?: string
	children?: ReactNode
}

let openModalsCount = 0
let scrollLockTarget: HTMLElement | null = null
let previousOverflow = ''
let previousPaddingRight = ''

function lockScroll() {
	if (typeof document === 'undefined') {
		return
	}
	const html = document.documentElement
	const body = document.body
	const target = (document.scrollingElement as HTMLElement | null) ?? body
	scrollLockTarget = target
	html.classList.add('modal-open')
	body.classList.add('modal-open')
	previousOverflow = target.style.overflow
	previousPaddingRight = target.style.paddingRight
	target.style.overflow = 'hidden'
	const supportsGutter = typeof CSS !== 'undefined' && CSS.supports?.('scrollbar-gutter: stable')
	if (!supportsGutter) {
		const scrollbarWidth = window.innerWidth - html.clientWidth
		if (scrollbarWidth > 0) {
			const computedPadding = Number.parseFloat(window.getComputedStyle(target).paddingRight)
			const resolvedPadding = Number.isFinite(computedPadding) ? computedPadding : 0
			target.style.paddingRight = `${resolvedPadding + scrollbarWidth}px`
		}
	}
}

function unlockScroll() {
	if (typeof document === 'undefined') {
		return
	}
	const html = document.documentElement
	const body = document.body
	html.classList.remove('modal-open')
	body.classList.remove('modal-open')
	if (scrollLockTarget) {
		scrollLockTarget.style.overflow = previousOverflow
		scrollLockTarget.style.paddingRight = previousPaddingRight
		scrollLockTarget = null
	}
}

const ModalComponent: FC<ModalProps> = ({ isOpen, onClose, title, description, children }) => {
	const titleId = useId()
	const descriptionId = useId()
	const modalRef = useRef<HTMLDivElement>(null)
	const lastFocusedRef = useRef<HTMLElement | null>(null)

	useEffect(() => {
		if (!isOpen) {
			return undefined
		}
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				onClose()
			}
		}
		window.addEventListener('keydown', handleKeyDown)
		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [isOpen, onClose])

	useEffect(() => {
		if (!isOpen || typeof document === 'undefined') {
			return undefined
		}
		lastFocusedRef.current =
			document.activeElement instanceof HTMLElement ? document.activeElement : null
		const frameId = window.requestAnimationFrame(() => {
			modalRef.current?.focus()
		})
		return () => {
			window.cancelAnimationFrame(frameId)
			lastFocusedRef.current?.focus()
			lastFocusedRef.current = null
		}
	}, [isOpen])

	useEffect(() => {
		if (!isOpen) {
			return undefined
		}
		openModalsCount += 1
		if (openModalsCount === 1) {
			lockScroll()
		}
		return () => {
			openModalsCount = Math.max(0, openModalsCount - 1)
			if (openModalsCount === 0) {
				unlockScroll()
			}
		}
	}, [isOpen])

	if (!isOpen) {
		return null
	}

	return (
		<div
			className={styles.overlay}
			onMouseDown={onClose}
		>
			<div
				className={styles.modal}
				role='dialog'
				aria-modal='true'
				aria-labelledby={titleId}
				aria-describedby={description ? descriptionId : undefined}
				tabIndex={-1}
				ref={modalRef}
				onMouseDown={event => event.stopPropagation()}
			>
				<div
					id={titleId}
					className={styles.title}
				>
					{title}
				</div>
				{description ? (
					<div
						id={descriptionId}
						className={styles.description}
					>
						{description}
					</div>
				) : null}
				{children}
			</div>
		</div>
	)
}

export const Modal = memo(ModalComponent)
