import { Button } from '@shared/ui/button/button'
import { IconButton } from '@shared/ui/icon-button/icon-button'
import { Icon } from '@shared/ui/icon/icon'
import cn from 'clsx'
import { memo, type FC } from 'react'

import styles from './products-toolbar.module.scss'

type ProductsToolbarProps = {
	onAdd: () => void
	onSave: () => void
	onCancel: () => void
	isAdding: boolean
	onRefresh: () => void
	isRefreshing: boolean
}

const ProductsToolbarComponent: FC<ProductsToolbarProps> = ({
	onAdd,
	onSave,
	onCancel,
	isAdding,
	onRefresh,
	isRefreshing
}) => {
	const refreshIconClass = cn(styles.refreshIcon, isRefreshing && styles.refreshIconSpinning)

	return (
		<div className={styles.toolbar}>
			<div className={styles.sectionTitle}>Все позиции</div>
			<div className={styles.actions}>
				<IconButton
					type='button'
					size={40}
					onClick={onRefresh}
					aria-label='Обновить'
					aria-busy={isRefreshing}
					className={styles.refreshButton}
				>
					<Icon
						name='refresh'
						className={refreshIconClass}
					/>
				</IconButton>
				{isAdding ? (
					<>
						<Button
							type='button'
							variant='secondary'
							onClick={onCancel}
						>
							Отмена
						</Button>
						<Button
							type='button'
							onClick={onSave}
						>
							Сохранить
						</Button>
					</>
				) : (
					<Button
						type='button'
						onClick={onAdd}
						className={styles.addButton}
					>
						<span
							className={styles.addIcon}
							aria-hidden='true'
						>
							<Icon name='plus-wide' />
						</span>
						Добавить
					</Button>
				)}
			</div>
		</div>
	)
}

export const ProductsToolbar = memo(ProductsToolbarComponent)
