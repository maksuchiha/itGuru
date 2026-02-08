import {
	useAddProductMutation,
	useUpdateProductMutation,
	useDeleteProductMutation
} from '@entities/product/api/products-api'
import { mapProductDto } from '@entities/product/model/mappers'
import type {
	ColumnWidthMap,
	ProductDraftPayload,
	SortDirection,
	SortState,
	ProductColumnKey
} from '@entities/product/model/types'
import { useProductsData } from '@features/products/model/use-products-data'
import { useProductsTable } from '@features/products/model/use-products-table'
import { handleApiError } from '@shared/api/handle-api-error'
import { useDebouncedValue } from '@shared/lib/debounce'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

const SEARCH_DEBOUNCE_MS = Number(import.meta.env.VITE_SEARCH_DEBOUNCE_MS ?? '700')
const debounceMs = Number.isFinite(SEARCH_DEBOUNCE_MS) ? SEARCH_DEBOUNCE_MS : 700
const SORT_KEY_PARAM = 'sort'
const SORT_DIR_PARAM = 'dir'
const COLUMN_WIDTHS_STORAGE_VERSION = 'v1'
const COLUMN_WIDTHS_STORAGE_KEY = `products:columns:${COLUMN_WIDTHS_STORAGE_VERSION}`
const COLUMN_KEYS: ProductColumnKey[] = ['name', 'vendor', 'sku', 'rating', 'price']

function isSortDirection(value: string | null): value is SortDirection {
	return value === 'asc' || value === 'desc'
}

function isColumnKey(value: string | null): value is ProductColumnKey {
	return Boolean(value && COLUMN_KEYS.includes(value as ProductColumnKey))
}

function parseSortState(params: URLSearchParams): SortState {
	const key = params.get(SORT_KEY_PARAM)
	if (!isColumnKey(key)) {
		return null
	}
	const direction = params.get(SORT_DIR_PARAM)
	return { key, direction: isSortDirection(direction) ? direction : 'asc' }
}

function loadColumnWidths(): Partial<ColumnWidthMap> | null {
	if (typeof window === 'undefined') {
		return null
	}
	try {
		const raw = localStorage.getItem(COLUMN_WIDTHS_STORAGE_KEY)
		if (!raw) {
			return null
		}
		const parsed = JSON.parse(raw) as Record<string, unknown>
		if (!parsed || typeof parsed !== 'object') {
			return null
		}
		const next: Partial<ColumnWidthMap> = {}
		COLUMN_KEYS.forEach(key => {
			const value = parsed[key]
			if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
				next[key] = value
			}
		})
		return Object.keys(next).length > 0 ? next : null
	} catch {
		return null
	}
}

function saveColumnWidths(widths: ColumnWidthMap) {
	if (typeof window === 'undefined') {
		return
	}
	try {
		const payload: Partial<ColumnWidthMap> = {}
		COLUMN_KEYS.forEach(key => {
			payload[key] = Math.round(widths[key])
		})
		localStorage.setItem(COLUMN_WIDTHS_STORAGE_KEY, JSON.stringify(payload))
	} catch {
		// Ignore storage errors.
	}
}

export function useProductsController() {
	const [addProduct] = useAddProductMutation()
	const [updateProduct] = useUpdateProductMutation()
	const [deleteProduct] = useDeleteProductMutation()
	const [searchParams, setSearchParams] = useSearchParams()
	const [query, setQuery] = useState('')
	const [page, setPage] = useState(1)
	const parsedSort = useMemo(() => parseSortState(searchParams), [searchParams])
	const [storedColumnWidths] = useState<Partial<ColumnWidthMap> | null>(() => loadColumnWidths())
	const updateSearchParams = useCallback(
		(next: { sort?: SortState }) => {
			const updated = new URLSearchParams(searchParams)
			if (next.sort !== undefined) {
				if (next.sort) {
					updated.set(SORT_KEY_PARAM, next.sort.key)
					updated.set(SORT_DIR_PARAM, next.sort.direction)
				} else {
					updated.delete(SORT_KEY_PARAM)
					updated.delete(SORT_DIR_PARAM)
				}
			}
			if (updated.toString() !== searchParams.toString()) {
				setSearchParams(updated, { replace: true })
			}
		},
		[searchParams, setSearchParams]
	)
	const handleColumnWidthsChange = useCallback((widths: ColumnWidthMap) => {
		saveColumnWidths(widths)
	}, [])
	const debouncedQuery = useDebouncedValue(query, debounceMs)
	const sort = parsedSort
	const { products, errorMessage, isLoading, isValidating, refresh, total, limit, skip } =
		useProductsData(debouncedQuery, page, sort)
	const totalPages = Math.max(1, Math.ceil(total / limit))
	const table = useProductsTable(products, {
		includeLocal: debouncedQuery.length === 0 && !sort,
		initialColumnWidths: storedColumnWidths,
		onColumnWidthsChange: handleColumnWidthsChange
	})
	const {
		prepareDraft,
		appendProduct,
		prepareEditing,
		applyRowEdits,
		cancelEditing,
		removeProduct
	} = table

	useEffect(() => {
		if (!searchParams.has('cols')) {
			return
		}
		const updated = new URLSearchParams(searchParams)
		updated.delete('cols')
		setSearchParams(updated, { replace: true })
	}, [searchParams, setSearchParams])

	useEffect(() => {
		if (page <= totalPages) {
			return undefined
		}
		const timeoutId = window.setTimeout(() => {
			setPage(totalPages)
		}, 0)
		return () => {
			window.clearTimeout(timeoutId)
		}
	}, [page, totalPages, setPage])

	const updateQuery = useCallback((value: string) => {
		setQuery(value)
		setPage(1)
	}, [])

	const toggleSort = useCallback(
		(key: ProductColumnKey) => {
			setPage(1)
			const current = parsedSort
			let nextSort: SortState = null
			if (!current || current.key !== key) {
				nextSort = { key, direction: 'asc' }
			} else if (current.direction === 'asc') {
				nextSort = { key, direction: 'desc' }
			}
			updateSearchParams({ sort: nextSort })
		},
		[parsedSort, updateSearchParams]
	)

	const persistDraft = useCallback(
		async (draft: ProductDraftPayload) => {
			const created = await addProduct({
				title: draft.name,
				price: draft.price,
				brand: draft.vendor,
				sku: draft.sku,
				stock: 1,
				rating: 0
			}).unwrap()
			return mapProductDto(created)
		},
		[addProduct]
	)

	const saveDraft = useCallback(async () => {
		const draftPayload = prepareDraft()
		if (!draftPayload) {
			return { ok: false, error: 'validation' }
		}
		try {
			const product = await persistDraft(draftPayload)
			appendProduct(product)
			return { ok: true }
		} catch (error) {
			return {
				ok: false,
				error: handleApiError(error) ?? 'Не удалось добавить товар.'
			}
		}
	}, [appendProduct, persistDraft, prepareDraft])

	const saveEditingRow = useCallback(async () => {
		const prepared = prepareEditing()
		if (!prepared.ok) {
			return { ok: false, error: prepared.error }
		}
		const { id, changes, normalized } = prepared
		if (Object.keys(changes).length === 0) {
			cancelEditing()
			return { ok: true }
		}
		if (!id.startsWith('local-')) {
			const payload: Record<string, string | number> = {}
			if (changes.name !== undefined) {
				payload.title = normalized.name
			}
			if (changes.vendor !== undefined) {
				payload.brand = normalized.vendor
			}
			if (changes.sku !== undefined) {
				payload.sku = normalized.sku
			}
			if (changes.price !== undefined) {
				payload.price = normalized.price
			}
			try {
				await updateProduct({ id: Number(id), payload }).unwrap()
			} catch (error) {
				return {
					ok: false,
					error: handleApiError(error) ?? 'Не удалось сохранить изменения.'
				}
			}
		}
		applyRowEdits(id, changes)
		cancelEditing()
		return { ok: true }
	}, [applyRowEdits, cancelEditing, prepareEditing, updateProduct])

	const deleteRow = useCallback(
		async (id: string) => {
			if (!id.startsWith('local-')) {
				try {
					await deleteProduct(Number(id)).unwrap()
				} catch (error) {
					return {
						ok: false,
						error: handleApiError(error) ?? 'Не удалось удалить позицию.'
					}
				}
			}
			removeProduct(id)
			return { ok: true }
		},
		[deleteProduct, removeProduct]
	)
	return {
		query,
		setQuery: updateQuery,
		errorMessage,
		isLoading,
		isValidating,
		refresh,
		total,
		limit,
		skip,
		page,
		setPage,
		sort,
		toggleSort,
		...table,
		saveDraft,
		saveEditingRow,
		deleteRow
	}
}
