import { Input } from '@shared/ui/input/input'
import cn from 'clsx'
import { memo, useEffect, useId, useRef, type ChangeEvent, type FC } from 'react'

import styles from './editable-cell.module.scss'

type EditableCellProps = {
	value: string | number
	type?: 'text' | 'number'
	placeholder?: string
	error?: string
	onCommit?: (value: string | number) => void
	onChange?: (value: string) => void
	className?: string
	inputClassName?: string
}

const EditableCellComponent: FC<EditableCellProps> = ({
	value,
	type = 'text',
	placeholder,
	error,
	onCommit,
	onChange,
	className,
	inputClassName
}) => {
	const isControlled = Boolean(onChange)
	const inputRef = useRef<HTMLInputElement>(null)
	const errorId = useId()

	useEffect(() => {
		if (!isControlled && inputRef.current) {
			inputRef.current.value = String(value)
		}
	}, [isControlled, value])

	const handleBlur = () => {
		if (!onCommit || isControlled) {
			return
		}
		const currentValue = inputRef.current?.value ?? ''
		const nextValue = type === 'number' ? Number(currentValue) : currentValue.trim()
		onCommit(nextValue)
	}

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		if (isControlled) {
			onChange?.(event.target.value)
		}
	}

	return (
		<div className={cn(styles.editableCell, className)}>
			<Input
				type={type}
				value={isControlled ? String(value) : undefined}
				defaultValue={!isControlled ? String(value) : undefined}
				placeholder={placeholder}
				hasError={Boolean(error)}
				aria-describedby={error ? errorId : undefined}
				className={inputClassName}
				onChange={handleChange}
				onBlur={handleBlur}
				inputRef={inputRef}
			/>
			{error ? (
				<span
					id={errorId}
					className={styles.errorText}
				>
					{error}
				</span>
			) : null}
		</div>
	)
}

export const EditableCell = memo(EditableCellComponent)
