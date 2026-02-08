import { useSession } from '@entities/session/model/use-session'
import { useProductsController } from '@features/products/model/use-products-controller'
import { useMinimumDuration } from '@shared/lib/use-minimum-duration'
import { useToast } from '@shared/ui/toast/use-toast'
import { useProductsTableView } from '@widgets/products-table/model/use-products-table-view'
import { useCallback, useMemo, type ChangeEvent } from 'react'

const MIN_REFRESH_DURATION_MS = 500
const MIN_LOADING_DURATION_MS = 500

export function useProductsPage() {
	const {
		query,
		setQuery,
		errorMessage,
		isLoading,
		isValidating,
		refresh,
		products,
		total,
		limit,
		skip,
		page,
		setPage,
		sort,
		toggleSort,
		columnWidths,
		startResize,
		draft,
		draftErrors,
		startAdding,
		cancelAdding,
		updateDraft,
		saveDraft,
		editingId,
		editingDraft,
		editingErrors,
		isEditingDirty,
		startEditing,
		cancelEditing,
		updateEditingDraft,
		saveEditingRow,
		deleteRow,
		selectedIds,
		toggleSelect,
		toggleSelectAll
	} = useProductsController()
	const { signOut } = useSession()
	const { addToast } = useToast()

	const handleSaveDraft = useCallback(async () => {
		const result = await saveDraft()
		if (result.ok) {
			addToast('Товар добавлен', 'success', 'Новая позиция сохранена.')
			return
		}
		if (result.error && result.error !== 'validation' && result.error !== 'not-editing') {
			addToast('Ошибка добавления', 'error', result.error)
		}
	}, [addToast, saveDraft])

	const handleRowAdd = useCallback(
		(productName: string) => {
			addToast('Добавлено', 'success', productName)
		},
		[addToast]
	)

	const handleEditSave = useCallback(async () => {
		const result = await saveEditingRow()
		if (result.ok) {
			addToast('Данные сохранены', 'success', 'Изменения применены.')
			return result
		}
		if (result.error && result.error !== 'validation') {
			addToast('Ошибка сохранения', 'error', result.error)
		}
		return result
	}, [addToast, saveEditingRow])

	const handleDeleteRow = useCallback(
		async (id: string) => {
			const result = await deleteRow(id)
			if (result.ok) {
				addToast('Позиция удалена', 'success', 'Товар убран из списка.')
				return result
			}
			addToast('Ошибка удаления', 'error', result.error ?? 'Не удалось удалить.')
			return result
		},
		[addToast, deleteRow]
	)

	const handleQueryChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			setQuery(event.target.value)
		},
		[setQuery]
	)

	const {
		totalPages,
		pageIds,
		pages,
		allSelected,
		selectedIdSet,
		selectAllRef,
		shownFrom,
		shownTo,
		formatPrice
	} = useProductsTableView({
		products,
		total,
		limit,
		skip,
		page,
		selectedIds
	})

	const isRefreshing = useMinimumDuration(isLoading || isValidating, MIN_REFRESH_DURATION_MS)
	const isTableLoading = useMinimumDuration(isLoading, MIN_LOADING_DURATION_MS)
	const isTableValidating = useMinimumDuration(isValidating, MIN_LOADING_DURATION_MS)

	const toolbarProps = useMemo(
		() => ({
			onAdd: startAdding,
			onSave: handleSaveDraft,
			onCancel: cancelAdding,
			isAdding: Boolean(draft),
			onRefresh: refresh,
			isRefreshing
		}),
		[startAdding, handleSaveDraft, cancelAdding, draft, refresh, isRefreshing]
	)

	const tableProps = useMemo(
		() => ({
			products,
			total,
			page,
			onPageChange: setPage,
			sort,
			onSort: toggleSort,
			columnWidths,
			onResizeStart: startResize,
			draft,
			draftErrors,
			onDraftChange: updateDraft,
			editingId,
			editingDraft,
			editingErrors,
			isEditingDirty,
			onStartEdit: startEditing,
			onEditChange: updateEditingDraft,
			onEditCancel: cancelEditing,
			onEditSave: handleEditSave,
			onDeleteRow: handleDeleteRow,
			onToggleSelect: toggleSelect,
			onToggleSelectAll: toggleSelectAll,
			onRowAdd: handleRowAdd,
			isLoading: isTableLoading,
			isValidating: isTableValidating,
			errorMessage,
			totalPages,
			pageIds,
			pages,
			allSelected,
			selectedIdSet,
			selectAllRef,
			shownFrom,
			shownTo,
			formatPrice,
			skeletonCount: limit
		}),
		[
			products,
			total,
			page,
			setPage,
			sort,
			toggleSort,
			columnWidths,
			startResize,
			draft,
			draftErrors,
			updateDraft,
			editingId,
			editingDraft,
			editingErrors,
			isEditingDirty,
			startEditing,
			updateEditingDraft,
			cancelEditing,
			handleEditSave,
			handleDeleteRow,
			toggleSelect,
			toggleSelectAll,
			handleRowAdd,
			isTableLoading,
			isTableValidating,
			errorMessage,
			totalPages,
			pageIds,
			pages,
			allSelected,
			selectedIdSet,
			selectAllRef,
			shownFrom,
			shownTo,
			formatPrice,
			limit
		]
	)

	return {
		query,
		toolbarProps,
		tableProps,
		onQueryChange: handleQueryChange,
		onSignOut: signOut
	}
}
