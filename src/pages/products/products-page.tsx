import { useProductsPage } from '@features/products/model/use-products-page'
import type { FC } from 'react'

import { ProductsPageView } from './products-page.view'

export const ProductsPage: FC = () => {
	const { query, onQueryChange, onSignOut, toolbarProps, tableProps } = useProductsPage()

	return (
		<ProductsPageView
			query={query}
			onQueryChange={onQueryChange}
			onSignOut={onSignOut}
			toolbarProps={toolbarProps}
			tableProps={tableProps}
		/>
	)
}
