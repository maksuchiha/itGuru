import type {
	ColumnWidthMap,
	Product,
	ProductDraft,
	ProductDraftPayload,
	ProductEditableField,
	ProductColumnKey
} from '@entities/product/model/types'
import { parsePrice, validateDraft } from '@entities/product/model/validators'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const DEFAULT_COLUMN_WIDTHS: ColumnWidthMap = {
	name: 320,
	vendor: 180,
	sku: 160,
	rating: 120,
	price: 150
}

const MIN_COLUMN_WIDTH = 110
const MAX_COLUMN_WIDTH = 520
const COLUMN_KEYS = Object.keys(DEFAULT_COLUMN_WIDTHS) as ProductColumnKey[]

function clampColumnWidth(value: number) {
	return Math.min(MAX_COLUMN_WIDTH, Math.max(MIN_COLUMN_WIDTH, Math.round(value)))
}

function resolveColumnWidths(overrides?: Partial<ColumnWidthMap> | null): ColumnWidthMap {
	const next: ColumnWidthMap = { ...DEFAULT_COLUMN_WIDTHS }
	if (!overrides) {
		return next
	}
	COLUMN_KEYS.forEach(key => {
		const value = overrides[key]
		if (typeof value === 'number' && Number.isFinite(value)) {
			next[key] = clampColumnWidth(value)
		}
	})
	return next
}

function areColumnWidthsEqual(a: ColumnWidthMap, b: ColumnWidthMap) {
	return COLUMN_KEYS.every(key => a[key] === b[key])
}

function isDraftDirty(draft: ProductDraft | null, original: Product | null) {
	if (!draft || !original) {
		return false
	}
	return (
		draft.name.trim() !== original.name ||
		draft.vendor.trim() !== original.vendor ||
		draft.sku.trim() !== original.sku ||
		parsePrice(draft.price) !== original.price
	)
}

type ResizeState = {
	key: ProductColumnKey
	startX: number
	startWidth: number
} | null

type TableOptions = {
	includeLocal?: boolean
	initialColumnWidths?: Partial<ColumnWidthMap> | null
	onColumnWidthsChange?: (widths: ColumnWidthMap) => void
}

export function useProductsTable(baseProducts: Product[], options?: TableOptions) {
	const includeLocal = options?.includeLocal ?? true
	const onColumnWidthsChange = options?.onColumnWidthsChange
	const [columnWidths, setColumnWidths] = useState<ColumnWidthMap>(() =>
		resolveColumnWidths(options?.initialColumnWidths)
	)
	const [draft, setDraft] = useState<ProductDraft | null>(null)
	const [draftErrors, setDraftErrors] = useState<Partial<Record<ProductEditableField, string>>>(
		() => ({})
	)
	const [editingId, setEditingId] = useState<string | null>(null)
	const [editingDraft, setEditingDraft] = useState<ProductDraft | null>(null)
	const [editingOriginal, setEditingOriginal] = useState<Product | null>(null)
	const [editingErrors, setEditingErrors] = useState<Partial<Record<ProductEditableField, string>>>(
		() => ({})
	)
	const [addedProducts, setAddedProducts] = useState<Product[]>([])
	const [edits, setEdits] = useState<Record<string, Partial<Product>>>(() => ({}))
	const [selectedIds, setSelectedIds] = useState<string[]>([])
	const [deletedIds, setDeletedIds] = useState<string[]>([])
	const editingStateRef = useRef<{
		editingId: string | null
		editingDraft: ProductDraft | null
		editingOriginal: Product | null
	}>({ editingId: null, editingDraft: null, editingOriginal: null })

	const resizeStateRef = useRef<ResizeState>(null)
	const moveHandlerRef = useRef<((event: MouseEvent) => void) | null>(null)
	const upHandlerRef = useRef<(() => void) | null>(null)
	const columnWidthsRef = useRef(columnWidths)

	useEffect(() => {
		columnWidthsRef.current = columnWidths
	}, [columnWidths])

	const applyEdits = useCallback(
		(product: Product) => {
			const patch = edits[product.id]
			return patch ? { ...product, ...patch } : product
		},
		[edits]
	)

	const mergedProducts = useMemo(() => {
		const deletedSet = new Set(deletedIds)
		const base = baseProducts.map(applyEdits)
		if (!includeLocal) {
			return base.filter(product => !deletedSet.has(product.id))
		}
		return [...addedProducts.map(applyEdits), ...base].filter(
			product => !deletedSet.has(product.id)
		)
	}, [addedProducts, applyEdits, baseProducts, deletedIds, includeLocal])

	const startAdding = useCallback(() => {
		setDraft(current => {
			if (current) {
				return current
			}
			return { name: '', price: '', vendor: '', sku: '' }
		})
		setDraftErrors({})
	}, [])

	const cancelAdding = useCallback(() => {
		setDraft(null)
		setDraftErrors({})
	}, [])

	const updateDraft = useCallback((field: ProductEditableField, value: string) => {
		setDraft(current => {
			if (!current) {
				return current
			}
			return { ...current, [field]: value }
		})
		setDraftErrors(current => ({ ...current, [field]: undefined }))
	}, [])

	const prepareDraft = useCallback((): ProductDraftPayload | null => {
		if (!draft) {
			return null
		}
		const errors = validateDraft(draft)
		setDraftErrors(errors)
		if (Object.keys(errors).length > 0) {
			return null
		}
		return {
			name: draft.name.trim(),
			price: parsePrice(draft.price),
			vendor: draft.vendor.trim(),
			sku: draft.sku.trim()
		}
	}, [draft])

	const appendProduct = useCallback((product: Product) => {
		setAddedProducts(current => [product, ...current])
		setDraft(null)
		setDraftErrors({})
	}, [])

	const applyRowEdits = useCallback((id: string, changes: Partial<Product>) => {
		setEdits(current => ({
			...current,
			[id]: { ...current[id], ...changes }
		}))
	}, [])

	const cancelEditing = useCallback(() => {
		setEditingId(null)
		setEditingDraft(null)
		setEditingErrors({})
		setEditingOriginal(null)
		editingStateRef.current = {
			editingId: null,
			editingDraft: null,
			editingOriginal: null
		}
	}, [])

	const startEditing = useCallback((product: Product) => {
		setEditingId(product.id)
		const nextDraft = {
			name: product.name,
			vendor: product.vendor,
			sku: product.sku,
			price: String(product.price)
		}
		setEditingDraft(nextDraft)
		setEditingErrors({})
		setEditingOriginal(product)
		editingStateRef.current = {
			editingId: product.id,
			editingDraft: nextDraft,
			editingOriginal: product
		}
	}, [])

	const updateEditingDraft = useCallback((field: ProductEditableField, value: string) => {
		setEditingDraft(current => {
			if (!current) {
				return current
			}
			const nextDraft = { ...current, [field]: value }
			editingStateRef.current = {
				...editingStateRef.current,
				editingDraft: nextDraft
			}
			return nextDraft
		})
		setEditingErrors(current => ({ ...current, [field]: undefined }))
	}, [])

	const isEditingDirty = isDraftDirty(editingDraft, editingOriginal)

	const prepareEditing = useCallback(() => {
		const {
			editingId: currentId,
			editingDraft: currentDraft,
			editingOriginal: currentOriginal
		} = editingStateRef.current
		if (!currentId || !currentDraft || !currentOriginal) {
			return { ok: false, error: 'not-editing' } as const
		}
		const errors = validateDraft(currentDraft)
		setEditingErrors(errors)
		if (Object.keys(errors).length > 0) {
			return { ok: false, error: 'validation' } as const
		}
		const normalized = {
			name: currentDraft.name.trim(),
			vendor: currentDraft.vendor.trim(),
			sku: currentDraft.sku.trim(),
			price: parsePrice(currentDraft.price)
		}
		const original = currentOriginal
		const changes: Partial<Product> = {}
		if (normalized.name !== original.name) {
			changes.name = normalized.name
		}
		if (normalized.vendor !== original.vendor) {
			changes.vendor = normalized.vendor
		}
		if (normalized.sku !== original.sku) {
			changes.sku = normalized.sku
		}
		if (normalized.price !== original.price) {
			changes.price = normalized.price
		}
		return {
			ok: true,
			id: currentId,
			changes,
			normalized
		} as const
	}, [])

	const setColumnWidthsFromParams = useCallback((overrides: Partial<ColumnWidthMap> | null) => {
		setColumnWidths(current => {
			const next = resolveColumnWidths(overrides)
			if (areColumnWidthsEqual(current, next)) {
				return current
			}
			columnWidthsRef.current = next
			return next
		})
	}, [])

	const toggleSelect = useCallback((id: string) => {
		setSelectedIds(current => {
			if (current.includes(id)) {
				return current.filter(item => item !== id)
			}
			return [...current, id]
		})
	}, [])

	const toggleSelectAll = useCallback((ids: string[]) => {
		setSelectedIds(current => {
			const currentSet = new Set(current)
			const idsSet = new Set(ids)
			const allSelected = ids.every(id => currentSet.has(id))
			if (allSelected) {
				return current.filter(id => !idsSet.has(id))
			}
			const next = current.slice()
			ids.forEach(id => {
				if (!currentSet.has(id)) {
					next.push(id)
				}
			})
			return next
		})
	}, [])

	const removeProduct = useCallback(
		(id: string) => {
			setDeletedIds(current => (current.includes(id) ? current : [...current, id]))
			setSelectedIds(current => current.filter(item => item !== id))
			setEdits(current => {
				if (!current[id]) {
					return current
				}
				const next = { ...current }
				delete next[id]
				return next
			})
			if (editingId === id) {
				cancelEditing()
			}
		},
		[cancelEditing, editingId]
	)

	const clearResizeListeners = useCallback(() => {
		const moveHandler = moveHandlerRef.current
		const upHandler = upHandlerRef.current
		if (moveHandler) {
			window.removeEventListener('mousemove', moveHandler)
		}
		if (upHandler) {
			window.removeEventListener('mouseup', upHandler)
			window.removeEventListener('blur', upHandler)
			window.removeEventListener('mouseleave', upHandler)
		}
		moveHandlerRef.current = null
		upHandlerRef.current = null
	}, [])

	const startResize = useCallback(
		(key: ProductColumnKey, startX: number, startWidth: number) => {
			clearResizeListeners()
			resizeStateRef.current = { key, startX, startWidth }

			const handleMouseMove = (event: MouseEvent) => {
				const state = resizeStateRef.current
				if (!state) {
					return
				}
				const nextWidth = clampColumnWidth(state.startWidth + event.clientX - state.startX)
				setColumnWidths(current => {
					const next = { ...current, [state.key]: nextWidth }
					columnWidthsRef.current = next
					return next
				})
			}

			const handleResizeEnd = () => {
				resizeStateRef.current = null
				clearResizeListeners()
				if (onColumnWidthsChange) {
					onColumnWidthsChange(columnWidthsRef.current)
				}
			}

			moveHandlerRef.current = handleMouseMove
			upHandlerRef.current = handleResizeEnd
			window.addEventListener('mousemove', handleMouseMove)
			window.addEventListener('mouseup', handleResizeEnd)
			window.addEventListener('blur', handleResizeEnd)
			window.addEventListener('mouseleave', handleResizeEnd)
		},
		[clearResizeListeners, onColumnWidthsChange]
	)

	useEffect(() => {
		return () => {
			clearResizeListeners()
		}
	}, [clearResizeListeners])

	return {
		products: mergedProducts,
		columnWidths,
		startResize,
		setColumnWidthsFromParams,
		draft,
		draftErrors,
		startAdding,
		cancelAdding,
		updateDraft,
		prepareDraft,
		appendProduct,
		selectedIds,
		toggleSelect,
		toggleSelectAll,
		editingId,
		editingDraft,
		editingErrors,
		isEditingDirty,
		startEditing,
		cancelEditing,
		updateEditingDraft,
		prepareEditing,
		applyRowEdits,
		removeProduct
	}
}
