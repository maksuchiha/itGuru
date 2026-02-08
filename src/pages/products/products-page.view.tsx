import { Button } from '@shared/ui/button/button'
import { Icon } from '@shared/ui/icon/icon'
import { Input } from '@shared/ui/input/input'
import { ProductsTable } from '@widgets/products-table/products-table'
import { ProductsToolbar } from '@widgets/products-toolbar/products-toolbar'
import { memo, type ChangeEvent, type ComponentProps, type FC } from 'react'

import styles from './products-page.module.scss'

type ProductsPageViewProps = {
	query: string
	onQueryChange: (event: ChangeEvent<HTMLInputElement>) => void
	onSignOut: () => void
	toolbarProps: ComponentProps<typeof ProductsToolbar>
	tableProps: ComponentProps<typeof ProductsTable>
}

const ProductsPageViewComponent: FC<ProductsPageViewProps> = ({
	query,
	onQueryChange,
	onSignOut,
	toolbarProps,
	tableProps
}) => {
	return (
		<div className={styles.page}>
			<header className={styles.header}>
				<div className={styles.headerInner}>
					<div className={styles.topBar}>
						<h1 className={styles.pageTitle}>Товары</h1>
						<div className={styles.searchShell}>
							<span
								className={styles.searchIcon}
								aria-hidden='true'
							>
								<Icon name='search' />
							</span>
							<Input
								type='search'
								value={query}
								placeholder='Найти'
								aria-label='Поиск товаров'
								className={styles.searchInput}
								onChange={onQueryChange}
							/>
						</div>
						<Button
							type='button'
							variant='ghost'
							onClick={onSignOut}
							className={styles.logoutButton}
						>
							Выйти
						</Button>
					</div>
				</div>
			</header>
			<div className={styles.content}>
				<div className={styles.contentInner}>
					<ProductsToolbar {...toolbarProps} />
					<ProductsTable {...tableProps} />
				</div>
			</div>
		</div>
	)
}

export const ProductsPageView = memo(ProductsPageViewComponent)
