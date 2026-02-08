import cn from 'clsx'
import { memo, type ButtonHTMLAttributes, type CSSProperties, type FC } from 'react'

import styles from './icon-button.module.scss'

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	size?: number
	variant?: 'default' | 'primary'
}

const IconButtonComponent: FC<IconButtonProps> = ({
	size = 36,
	variant = 'default',
	className,
	style,
	...props
}) => {
	const classes = cn(styles.iconButton, { [styles.primary]: variant === 'primary' }, className)
	const mergedStyle = {
		...style,
		'--icon-button-size': `${size}px`
	} as CSSProperties

	return (
		<button
			className={classes}
			style={mergedStyle}
			{...props}
		/>
	)
}

export const IconButton = memo(IconButtonComponent)
