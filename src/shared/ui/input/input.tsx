import cn from 'clsx'
import { memo, type FC, type InputHTMLAttributes, type Ref } from 'react'

import styles from './input.module.scss'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
	hasError?: boolean
	inputRef?: Ref<HTMLInputElement>
}

const InputComponent: FC<InputProps> = ({ hasError = false, className, inputRef, ...props }) => {
	const classes = cn(styles.input, hasError && styles.error, className)
	const ariaInvalid = hasError ? true : props['aria-invalid']
	return (
		<input
			ref={inputRef}
			className={classes}
			data-error={hasError ? 'true' : undefined}
			{...props}
			aria-invalid={ariaInvalid}
		/>
	)
}

export const Input = memo(InputComponent)
