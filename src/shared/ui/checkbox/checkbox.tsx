import cn from 'clsx'
import { memo, type FC, type InputHTMLAttributes, type Ref } from 'react'

import styles from './checkbox.module.scss'

type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
	label?: string
	inputRef?: Ref<HTMLInputElement>
}

const CheckboxComponent: FC<CheckboxProps> = ({ label, className, inputRef, ...props }) => {
	const classes = cn(styles.checkbox, className)
	return (
		<label className={classes}>
			<input
				ref={inputRef}
				type='checkbox'
				{...props}
			/>
			{label ? <span>{label}</span> : null}
		</label>
	)
}

export const Checkbox = memo(CheckboxComponent)
