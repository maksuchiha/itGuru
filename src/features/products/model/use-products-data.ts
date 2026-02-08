import { useGetProductsQuery } from '@entities/product/api/products-api'
import { mapProductDto } from '@entities/product/model/mappers'
import type { ProductColumnKey, SortState } from '@entities/product/model/types'
import { handleApiError } from '@shared/api/handle-api-error'
import { useCallback, useMemo } from 'react'

const DEFAULT_LIMIT = Number(import.meta.env.VITE_PRODUCTS_LIMIT ?? '20')
const DEFAULT_SELECT =
	import.meta.env.VITE_PRODUCTS_SELECT ?? 'title,category,price,brand,sku,rating,stock'
const limit = Number.isFinite(DEFAULT_LIMIT) && DEFAULT_LIMIT > 0 ? DEFAULT_LIMIT : 20

function mapSortKey(key: ProductColumnKey) {
	switch (key) {
		case 'name':
			return 'title'
		case 'vendor':
			return 'brand'
		case 'sku':
			return 'sku'
		case 'rating':
			return 'rating'
		case 'price':
			return 'price'
		default:
			return undefined
	}
}

export function useProductsData(query: string, page: number, sort: SortState) {
	const safePage = Math.max(1, page)
	const skip = (safePage - 1) * limit
	const sortBy = sort ? mapSortKey(sort.key) : undefined
	const order = sort?.direction
	const trimmedQuery = query.trim()
	const { data, error, isLoading, isFetching, refetch } = useGetProductsQuery({
		query: trimmedQuery.length > 0 ? trimmedQuery : undefined,
		limit,
		skip,
		select: DEFAULT_SELECT,
		sortBy,
		order
	})

	const products = useMemo(() => (data ? data.products.map(mapProductDto) : []), [data])
	const errorMessage = handleApiError(error)
	const total = data?.total ?? 0
	const refresh = useCallback(() => refetch(), [refetch])

	return {
		products,
		errorMessage,
		isLoading,
		isValidating: isFetching,
		total,
		limit,
		skip,
		refresh
	}
}
