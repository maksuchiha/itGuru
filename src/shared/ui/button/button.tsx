import cn from 'clsx'
import { memo, type ButtonHTMLAttributes, type FC } from 'react'

import styles from './button.module.scss'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: 'primary' | 'secondary' | 'ghost'
}

const ButtonComponent: FC<ButtonProps> = ({ variant = 'primary', className, ...props }) => {
	const classes = cn(
		styles.button,
		{
			[styles.primary]: variant === 'primary',
			[styles.secondary]: variant === 'secondary',
			[styles.ghost]: variant === 'ghost'
		},
		className
	)
	return (
		<button
			className={classes}
			{...props}
		/>
	)
}

export const Button = memo(ButtonComponent)
