import type { Product } from '@entities/product/model/types'
import { useCallback, useEffect, useMemo, useRef } from 'react'

const priceFormatter = new Intl.NumberFormat('ru-RU', {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2
})

type UseProductsTableViewParams = {
	products: Product[]
	total: number
	limit: number
	skip: number
	page: number
	selectedIds: string[]
}

export function useProductsTableView({
	products,
	total,
	limit,
	skip,
	page,
	selectedIds
}: UseProductsTableViewParams) {
	const totalPages = Math.max(1, Math.ceil(total / limit))
	const pageIds = useMemo(() => products.map(product => product.id), [products])
	const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds])
	const selectedOnPage = useMemo(
		() => pageIds.filter(id => selectedIdSet.has(id)),
		[pageIds, selectedIdSet]
	)
	const allSelected = pageIds.length > 0 && selectedOnPage.length === pageIds.length
	const someSelected = selectedOnPage.length > 0 && !allSelected
	const selectAllRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		if (selectAllRef.current) {
			selectAllRef.current.indeterminate = someSelected
		}
	}, [someSelected])

	const pages = useMemo(() => {
		const maxButtons = 5
		const half = Math.floor(maxButtons / 2)
		let start = Math.max(1, page - half)
		const end = Math.min(totalPages, start + maxButtons - 1)
		start = Math.max(1, end - maxButtons + 1)
		const range: number[] = []
		for (let current = start; current <= end; current += 1) {
			range.push(current)
		}
		return range
	}, [page, totalPages])

	const shownFrom = total === 0 ? 0 : skip + 1
	const shownTo = Math.min(skip + limit, total)
	const formatPrice = useCallback(
		(value: number) => priceFormatter.format(Number(value)).replace(/[\u00A0\u202F]/g, ' '),
		[]
	)

	return {
		totalPages,
		pageIds,
		pages,
		allSelected,
		selectedIdSet,
		selectAllRef,
		shownFrom,
		shownTo,
		formatPrice
	}
}
