import type {
	ColumnWidthMap,
	Product,
	ProductColumnKey,
	ProductDraft,
	ProductEditableField,
	SortState
} from '@entities/product/model/types'
import { Button } from '@shared/ui/button/button'
import { Checkbox } from '@shared/ui/checkbox/checkbox'
import { EditableCell } from '@shared/ui/editable-cell/editable-cell'
import { Icon } from '@shared/ui/icon/icon'
import { Modal } from '@shared/ui/modal/modal'
import { ProgressBar } from '@shared/ui/progress/progress'
import cn from 'clsx'
import {
	memo,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	type FC,
	type RefObject
} from 'react'

import styles from './products-table.module.scss'

export type ProductsTableProps = {
	products: Product[]
	total: number
	page: number
	onPageChange: (page: number) => void
	sort: SortState
	onSort: (key: ProductColumnKey) => void
	columnWidths: ColumnWidthMap
	onResizeStart: (key: ProductColumnKey, startX: number, startWidth: number) => void
	draft: ProductDraft | null
	draftErrors: Partial<Record<ProductEditableField, string>>
	onDraftChange: (field: ProductEditableField, value: string) => void
	editingId: string | null
	editingDraft: ProductDraft | null
	editingErrors: Partial<Record<ProductEditableField, string>>
	isEditingDirty: boolean
	onStartEdit: (product: Product) => void
	onEditChange: (field: ProductEditableField, value: string) => void
	onEditCancel: () => void
	onEditSave: () => Promise<{ ok: boolean; error?: string }>
	onDeleteRow: (id: string) => Promise<{ ok: boolean; error?: string }>
	onToggleSelect: (id: string) => void
	onToggleSelectAll: (ids: string[]) => void
	onRowAdd: (productName: string) => void
	isLoading: boolean
	isValidating: boolean
	errorMessage: string | null
	pageIds: string[]
	pages: number[]
	totalPages: number
	allSelected: boolean
	selectedIdSet: ReadonlySet<string>
	selectAllRef: RefObject<HTMLInputElement | null>
	shownFrom: number
	shownTo: number
	formatPrice: (value: number) => string
	skeletonCount?: number
}

type ColumnConfig = {
	key: ProductColumnKey
	label: string
	editable: boolean
	type?: 'text' | 'number'
}

type PendingAction = {
	type: 'open-menu' | 'edit' | 'delete'
	productId: string
}

const EDITABLE_PLACEHOLDER = 'Введите значение'
const EMPTY_ERRORS: Partial<Record<ProductEditableField, string>> = {}
const DEFAULT_SKELETON_COUNT = 8
const sanitizePriceInput = (value: string) => value.replace(/\D/g, '')

const columns: ColumnConfig[] = [
	{ key: 'name', label: 'Наименование', editable: true },
	{ key: 'vendor', label: 'Вендор', editable: true },
	{ key: 'sku', label: 'Артикул', editable: true },
	{ key: 'rating', label: 'Оценка', editable: false },
	{ key: 'price', label: 'Цена, ₽', editable: true, type: 'text' }
]

const cellClassMap: Record<ProductColumnKey, string> = {
	name: styles.cellName,
	vendor: styles.cellVendor,
	sku: styles.cellSku,
	rating: styles.cellRating,
	price: styles.cellPrice
}

function getSortDirection(sort: SortState, key: ProductColumnKey) {
	if (!sort || sort.key !== key) {
		return null
	}
	return sort.direction
}

type TableHeaderProps = {
	sort: SortState
	columnWidths: ColumnWidthMap
	onSort: (key: ProductColumnKey) => void
	onResizeStart: (key: ProductColumnKey, startX: number, startWidth: number) => void
	allSelected: boolean
	pageIds: string[]
	onToggleSelectAll: (ids: string[]) => void
	selectAllRef: RefObject<HTMLInputElement | null>
}

const TableHeader = memo<TableHeaderProps>(
	({
		sort,
		columnWidths,
		onSort,
		onResizeStart,
		allSelected,
		pageIds,
		onToggleSelectAll,
		selectAllRef
	}) => {
		return (
			<div className={cn(styles.tableRow, styles.tableHeader)}>
				<div className={cn(styles.tableCell, styles.cellCheck)}>
					<Checkbox
						inputRef={selectAllRef}
						type='checkbox'
						aria-label='Выбрать все'
						checked={allSelected}
						onChange={() => onToggleSelectAll(pageIds)}
					/>
				</div>
				{columns.map(column => {
					const direction = getSortDirection(sort, column.key)
					const width = columnWidths[column.key]
					const cellClass = cellClassMap[column.key]
					return (
						<div
							key={column.key}
							className={cn(styles.tableCell, styles.headerCell, cellClass)}
							style={{ width }}
						>
							<button
								type='button'
								className={styles.sortButton}
								onClick={() => onSort(column.key)}
							>
								<span>{column.label}</span>
								{direction ? (
									<span className={styles.sortIndicator}>{direction === 'asc' ? '↑' : '↓'}</span>
								) : (
									<span className={styles.sortIndicator}>↕</span>
								)}
							</button>
							<span
								className={styles.resizeHandle}
								onMouseDown={event => {
									event.preventDefault()
									onResizeStart(column.key, event.clientX, width)
								}}
								role='presentation'
							/>
						</div>
					)
				})}
				<div className={cn(styles.tableCell, styles.cellActions)} />
			</div>
		)
	}
)

type TableFooterProps = {
	shownFrom: number
	shownTo: number
	total: number
	page: number
	pages: number[]
	totalPages: number
	onPageChange: (page: number) => void
}

const TableFooter = memo<TableFooterProps>(
	({ shownFrom, shownTo, total, page, pages, totalPages, onPageChange }) => {
		return (
			<div className={styles.tableFooter}>
				<div className={styles.tableMeta}>
					<span className={styles.metaLabel}>Показано </span>
					<span className={styles.metaValue}>
						{shownFrom}-{shownTo}
					</span>
					<span className={styles.metaLabel}> из </span>
					<span className={styles.metaValue}>{total}</span>
					<span className={styles.metaLabel}>.</span>
				</div>
				<div className={styles.pagination}>
					<button
						type='button'
						className={styles.pageNav}
						onClick={() => onPageChange(Math.max(1, page - 1))}
						disabled={page <= 1}
						aria-label='Назад'
					>
						‹
					</button>
					{pages.map(value => (
						<button
							key={value}
							type='button'
							className={cn(styles.pageButton, value === page && styles.pageActive)}
							onClick={() => onPageChange(value)}
							aria-current={value === page ? 'page' : undefined}
						>
							{value}
						</button>
					))}
					<button
						type='button'
						className={styles.pageNav}
						onClick={() => onPageChange(Math.min(totalPages, page + 1))}
						disabled={page >= totalPages}
						aria-label='Вперед'
					>
						›
					</button>
				</div>
			</div>
		)
	}
)

type DraftRowProps = {
	draft: ProductDraft
	draftErrors: Partial<Record<ProductEditableField, string>>
	columnWidths: ColumnWidthMap
	onDraftChange: (field: ProductEditableField, value: string) => void
}

const DraftRow = memo<DraftRowProps>(({ draft, draftErrors, columnWidths, onDraftChange }) => {
	return (
		<div className={cn(styles.tableRow, styles.tableRowBody, styles.tableRowDraft)}>
			<div className={cn(styles.tableCell, styles.cellCheck)}>
				<Checkbox
					type='checkbox'
					disabled
					aria-label='Новая позиция'
				/>
			</div>
			<div
				className={cn(styles.tableCell, styles.cellName, styles.nameCell)}
				style={{ width: columnWidths.name }}
			>
				<div className={styles.thumb} />
				<div className={styles.nameStack}>
					<EditableCell
						value={draft.name}
						placeholder={EDITABLE_PLACEHOLDER}
						error={draftErrors.name}
						onChange={value => onDraftChange('name', value)}
						className={styles.cellContent}
						inputClassName={styles.tableInput}
					/>
					<span className={styles.nameSub}>Без категории</span>
				</div>
			</div>
			<div
				className={cn(styles.tableCell, styles.cellVendor)}
				style={{ width: columnWidths.vendor }}
			>
				<EditableCell
					value={draft.vendor}
					placeholder={EDITABLE_PLACEHOLDER}
					error={draftErrors.vendor}
					onChange={value => onDraftChange('vendor', value)}
					className={styles.cellContent}
					inputClassName={styles.tableInput}
				/>
			</div>
			<div
				className={cn(styles.tableCell, styles.cellSku)}
				style={{ width: columnWidths.sku }}
			>
				<EditableCell
					value={draft.sku}
					placeholder={EDITABLE_PLACEHOLDER}
					error={draftErrors.sku}
					onChange={value => onDraftChange('sku', value)}
					className={styles.cellContent}
					inputClassName={styles.tableInput}
				/>
			</div>
			<div
				className={cn(styles.tableCell, styles.cellRating)}
				style={{ width: columnWidths.rating }}
			>
				<span className={styles.cellValue}>—</span>
			</div>
			<div
				className={cn(styles.tableCell, styles.cellPrice)}
				style={{ width: columnWidths.price }}
			>
				<EditableCell
					value={draft.price}
					placeholder={EDITABLE_PLACEHOLDER}
					error={draftErrors.price}
					onChange={value => onDraftChange('price', sanitizePriceInput(value))}
					className={styles.cellContent}
					inputClassName={styles.tableInput}
					type='text'
				/>
			</div>
			<div className={cn(styles.tableCell, styles.cellActions)} />
		</div>
	)
})

type SkeletonRowProps = {
	columnWidths: ColumnWidthMap
}

const SkeletonRow = memo<SkeletonRowProps>(({ columnWidths }) => {
	return (
		<div
			className={cn(styles.tableRow, styles.tableRowBody, styles.tableRowSkeleton)}
			aria-hidden='true'
		>
			<div className={cn(styles.tableCell, styles.cellCheck)}>
				<span className={cn(styles.skeletonBase, styles.skeletonCheckbox)} />
			</div>
			<div
				className={cn(styles.tableCell, styles.cellName, styles.nameCell)}
				style={{ width: columnWidths.name }}
			>
				<div className={cn(styles.skeletonBase, styles.skeletonThumb)} />
				<div className={styles.nameStack}>
					<span
						className={cn(styles.skeletonBase, styles.skeletonLine)}
						style={{ width: '70%' }}
					/>
					<span
						className={cn(styles.skeletonBase, styles.skeletonLine)}
						style={{ width: '45%' }}
					/>
				</div>
			</div>
			<div
				className={cn(styles.tableCell, styles.cellVendor)}
				style={{ width: columnWidths.vendor }}
			>
				<span
					className={cn(styles.skeletonBase, styles.skeletonLine)}
					style={{ width: '60%' }}
				/>
			</div>
			<div
				className={cn(styles.tableCell, styles.cellSku)}
				style={{ width: columnWidths.sku }}
			>
				<span
					className={cn(styles.skeletonBase, styles.skeletonLine)}
					style={{ width: '55%' }}
				/>
			</div>
			<div
				className={cn(styles.tableCell, styles.cellRating)}
				style={{ width: columnWidths.rating }}
			>
				<span
					className={cn(styles.skeletonBase, styles.skeletonLine)}
					style={{ width: '35%' }}
				/>
			</div>
			<div
				className={cn(styles.tableCell, styles.cellPrice)}
				style={{ width: columnWidths.price }}
			>
				<span
					className={cn(styles.skeletonBase, styles.skeletonLine)}
					style={{ width: '50%' }}
				/>
			</div>
			<div className={cn(styles.tableCell, styles.cellActions)}>
				<span
					className={cn(styles.skeletonBase, styles.skeletonLine)}
					style={{ width: '40%' }}
				/>
			</div>
		</div>
	)
})

type TableRowProps = {
	product: Product
	columnWidths: ColumnWidthMap
	isSelected: boolean
	isEditing: boolean
	editingDraft: ProductDraft | null
	editingErrors: Partial<Record<ProductEditableField, string>>
	onToggleSelect: (id: string) => void
	onMenuOpen: (id: string) => void
	onEditChange: (field: ProductEditableField, value: string) => void
	onEditCancel: () => void
	onEditSave: () => Promise<{ ok: boolean; error?: string }>
	onRowAdd: (productName: string) => void
	formatPrice: (value: number) => string
}

const TableRow = memo<TableRowProps>(
	({
		product,
		columnWidths,
		isSelected,
		isEditing,
		editingDraft,
		editingErrors,
		onToggleSelect,
		onMenuOpen,
		onEditChange,
		onEditCancel,
		onEditSave,
		onRowAdd,
		formatPrice
	}) => {
		const rowClasses = cn(styles.tableRow, styles.tableRowBody, {
			[styles.tableRowSelected]: isSelected,
			[styles.tableRowEditing]: isEditing
		})
		const nameValue = editingDraft?.name ?? product.name
		const vendorValue = editingDraft?.vendor ?? product.vendor
		const skuValue = editingDraft?.sku ?? product.sku
		const priceValue = editingDraft?.price ?? String(product.price)
		const categoryLabel = product.category?.trim() ? product.category : 'Без категории'

		return (
			<div
				className={rowClasses}
				data-row-id={product.id}
			>
				<div className={cn(styles.tableCell, styles.cellCheck)}>
					<Checkbox
						type='checkbox'
						aria-label='Выбрать позицию'
						checked={isSelected}
						onChange={() => onToggleSelect(product.id)}
					/>
				</div>
				<div
					className={cn(styles.tableCell, styles.cellName, styles.nameCell)}
					style={{ width: columnWidths.name }}
				>
					<div className={styles.thumb} />
					<div className={styles.nameStack}>
						{isEditing ? (
							<EditableCell
								value={nameValue}
								placeholder={EDITABLE_PLACEHOLDER}
								error={editingErrors.name}
								onChange={value => onEditChange('name', value)}
								className={styles.cellContent}
								inputClassName={styles.tableInput}
							/>
						) : (
							<span className={styles.cellValue}>{product.name}</span>
						)}
						<span className={styles.nameSub}>{categoryLabel}</span>
					</div>
				</div>
				<div
					className={cn(styles.tableCell, styles.cellVendor)}
					style={{ width: columnWidths.vendor }}
				>
					{isEditing ? (
						<EditableCell
							value={vendorValue}
							placeholder={EDITABLE_PLACEHOLDER}
							error={editingErrors.vendor}
							onChange={value => onEditChange('vendor', value)}
							className={styles.cellContent}
							inputClassName={styles.tableInput}
						/>
					) : (
						<span className={styles.cellValue}>{product.vendor || '—'}</span>
					)}
				</div>
				<div
					className={cn(styles.tableCell, styles.cellSku)}
					style={{ width: columnWidths.sku }}
				>
					{isEditing ? (
						<EditableCell
							value={skuValue}
							placeholder={EDITABLE_PLACEHOLDER}
							error={editingErrors.sku}
							onChange={value => onEditChange('sku', value)}
							className={styles.cellContent}
							inputClassName={styles.tableInput}
						/>
					) : (
						<span className={styles.cellValue}>{product.sku || '—'}</span>
					)}
				</div>
				<div
					className={cn(styles.tableCell, styles.cellRating)}
					style={{ width: columnWidths.rating }}
				>
					<span className={cn(styles.cellValue, product.rating < 3 && styles.ratingLow)}>
						{product.rating}
					</span>
				</div>
				<div
					className={cn(styles.tableCell, styles.cellPrice)}
					style={{ width: columnWidths.price }}
				>
					{isEditing ? (
						<EditableCell
							value={priceValue}
							placeholder={EDITABLE_PLACEHOLDER}
							error={editingErrors.price}
							onChange={value => onEditChange('price', sanitizePriceInput(value))}
							className={styles.cellContent}
							inputClassName={styles.tableInput}
							type='text'
						/>
					) : (
						<span className={styles.cellValue}>{formatPrice(product.price)}</span>
					)}
				</div>
				<div className={cn(styles.tableCell, styles.cellActions)}>
					{isEditing ? (
						<div className={styles.actionsGroup}>
							<Button
								type='button'
								className={styles.actionButton}
								onClick={() => void onEditSave()}
							>
								Сохранить
							</Button>
							<Button
								type='button'
								variant='secondary'
								className={styles.actionButton}
								onClick={onEditCancel}
							>
								Отмена
							</Button>
						</div>
					) : (
						<div className={styles.actionsGroup}>
							<button
								type='button'
								className={cn(styles.actionMenuButton, styles.actionMenuButtonAdd)}
								onClick={() => onRowAdd(product.name)}
								aria-label='Добавить'
							>
								<Icon name='plus' />
							</button>
							<button
								type='button'
								className={cn(styles.actionMenuButton, styles.actionMenuButtonActions)}
								onClick={() => onMenuOpen(product.id)}
								aria-label='Действия'
								data-editing-guard='menu'
							>
								<Icon name='more' />
							</button>
						</div>
					)}
				</div>
			</div>
		)
	}
)

const ProductsTableComponent: FC<ProductsTableProps> = ({
	products,
	total,
	page,
	onPageChange,
	sort,
	onSort,
	columnWidths,
	onResizeStart,
	draft,
	draftErrors,
	onDraftChange,
	editingId,
	editingDraft,
	editingErrors,
	isEditingDirty,
	onStartEdit,
	onEditChange,
	onEditCancel,
	onEditSave,
	onDeleteRow,
	onToggleSelect,
	onToggleSelectAll,
	onRowAdd,
	isLoading,
	isValidating,
	errorMessage,
	pageIds,
	pages,
	totalPages,
	allSelected,
	selectedIdSet,
	selectAllRef,
	shownFrom,
	shownTo,
	formatPrice,
	skeletonCount
}) => {
	const tableRef = useRef<HTMLDivElement>(null)
	const [menuRowId, setMenuRowId] = useState<string | null>(null)
	const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null)
	const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
	const [unsavedDialogOpen, setUnsavedDialogOpen] = useState(false)
	const pendingActionRef = useRef<PendingAction | null>(null)
	const editingStateRef = useRef<{ editingId: string | null; isEditingDirty: boolean }>({
		editingId: null,
		isEditingDirty: false
	})

	useEffect(() => {
		editingStateRef.current = { editingId, isEditingDirty }
	}, [editingId, isEditingDirty])

	const productById = useMemo(
		() => new Map(products.map(product => [product.id, product])),
		[products]
	)
	const deleteTarget = deleteDialogId ? (productById.get(deleteDialogId) ?? null) : null
	const isMenuOpen = Boolean(menuRowId) && !editingId

	const openEditPrompt = useCallback(
		(pendingAction: PendingAction | null) => {
			if (unsavedDialogOpen || cancelDialogOpen) {
				return
			}
			pendingActionRef.current = pendingAction
			const { isEditingDirty: dirty } = editingStateRef.current
			if (dirty) {
				setUnsavedDialogOpen(true)
				setCancelDialogOpen(false)
				return
			}
			setCancelDialogOpen(true)
			setUnsavedDialogOpen(false)
		},
		[cancelDialogOpen, unsavedDialogOpen]
	)

	const handleMenuClose = useCallback(() => {
		setMenuRowId(null)
	}, [])

	const handleMenuOpen = useCallback(
		(productId: string) => {
			if (editingId && editingId !== productId) {
				openEditPrompt({ type: 'open-menu', productId })
				return
			}
			setMenuRowId(productId)
		},
		[editingId, openEditPrompt]
	)

	const handleMenuEdit = useCallback(
		(productId: string) => {
			if (editingId && editingId !== productId) {
				openEditPrompt({ type: 'edit', productId })
				return
			}
			const target = productById.get(productId)
			setMenuRowId(null)
			if (!target) {
				return
			}
			onStartEdit(target)
		},
		[editingId, onStartEdit, openEditPrompt, productById]
	)

	const handleMenuDelete = useCallback(
		(productId: string) => {
			if (editingId && editingId !== productId) {
				openEditPrompt({ type: 'delete', productId })
				return
			}
			setMenuRowId(null)
			setDeleteDialogId(productId)
		},
		[editingId, openEditPrompt]
	)

	const performPendingAction = useCallback(
		(pending: PendingAction | null) => {
			if (!pending) {
				return
			}
			pendingActionRef.current = null
			if (pending.type === 'open-menu') {
				setMenuRowId(pending.productId)
				return
			}
			if (pending.type === 'delete') {
				setDeleteDialogId(pending.productId)
				return
			}
			const target = productById.get(pending.productId)
			if (target) {
				onStartEdit(target)
			}
		},
		[onStartEdit, productById]
	)

	const closeCancelDialog = useCallback(() => {
		setCancelDialogOpen(false)
		pendingActionRef.current = null
	}, [])

	const handleCancelConfirm = useCallback(() => {
		setCancelDialogOpen(false)
		onEditCancel()
		performPendingAction(pendingActionRef.current)
	}, [onEditCancel, performPendingAction])

	const handleUnsavedStay = useCallback(() => {
		setUnsavedDialogOpen(false)
		pendingActionRef.current = null
	}, [])

	const handleUnsavedDiscard = useCallback(() => {
		setUnsavedDialogOpen(false)
		onEditCancel()
		performPendingAction(pendingActionRef.current)
	}, [onEditCancel, performPendingAction])

	const handleUnsavedSave = useCallback(async () => {
		const result = await onEditSave()
		if (!result.ok) {
			setUnsavedDialogOpen(false)
			pendingActionRef.current = null
			return
		}
		setUnsavedDialogOpen(false)
		performPendingAction(pendingActionRef.current)
	}, [onEditSave, performPendingAction])

	const handleDeleteClose = useCallback(() => {
		setDeleteDialogId(null)
	}, [])

	const handleDeleteConfirm = useCallback(async () => {
		if (!deleteDialogId) {
			return
		}
		const result = await onDeleteRow(deleteDialogId)
		if (result.ok) {
			setDeleteDialogId(null)
		}
	}, [deleteDialogId, onDeleteRow])

	useEffect(() => {
		if (!editingId) {
			return undefined
		}
		const handlePointerDown = (event: PointerEvent) => {
			if (unsavedDialogOpen || cancelDialogOpen) {
				return
			}
			const container = tableRef.current
			if (!container) {
				return
			}
			const target = event.target as Node
			if (target instanceof Element && target.closest('[data-editing-guard]')) {
				return
			}
			const activeRow = container.querySelector(`[data-row-id="${editingId}"]`)
			if (activeRow && activeRow.contains(target)) {
				return
			}
			event.preventDefault()
			event.stopPropagation()
			openEditPrompt(null)
		}
		document.addEventListener('pointerdown', handlePointerDown, true)
		return () => {
			document.removeEventListener('pointerdown', handlePointerDown, true)
		}
	}, [editingId, cancelDialogOpen, unsavedDialogOpen, openEditPrompt])

	const showEmptyState = !draft && products.length === 0
	const showSkeletons = isLoading && products.length === 0
	const emptyLabel = 'Нет данных'
	const resolvedSkeletonCount = Math.max(1, skeletonCount ?? DEFAULT_SKELETON_COUNT)
	const skeletonRows = useMemo(
		() => Array.from({ length: resolvedSkeletonCount }, (_, index) => index),
		[resolvedSkeletonCount]
	)

	return (
		<div className={styles.tableCard}>
			<ProgressBar isVisible={isLoading || isValidating} />
			{errorMessage ? <div className={styles.tableError}>{errorMessage}</div> : null}
			<div className={styles.tableScroll}>
				<div
					className={styles.table}
					ref={tableRef}
				>
					<TableHeader
						sort={sort}
						columnWidths={columnWidths}
						onSort={onSort}
						onResizeStart={onResizeStart}
						allSelected={allSelected}
						pageIds={pageIds}
						onToggleSelectAll={onToggleSelectAll}
						selectAllRef={selectAllRef}
					/>
					{draft ? (
						<DraftRow
							draft={draft}
							draftErrors={draftErrors}
							columnWidths={columnWidths}
							onDraftChange={onDraftChange}
						/>
					) : null}
					{showSkeletons
						? skeletonRows.map(index => (
								<SkeletonRow
									key={`skeleton-${index}`}
									columnWidths={columnWidths}
								/>
							))
						: products.map(product => {
								const isEditing = editingId === product.id
								return (
									<TableRow
										key={product.id}
										product={product}
										columnWidths={columnWidths}
										isSelected={selectedIdSet.has(product.id)}
										isEditing={isEditing}
										editingDraft={isEditing ? editingDraft : null}
										editingErrors={isEditing ? editingErrors : EMPTY_ERRORS}
										onToggleSelect={onToggleSelect}
										onMenuOpen={handleMenuOpen}
										onEditChange={onEditChange}
										onEditCancel={onEditCancel}
										onEditSave={onEditSave}
										onRowAdd={onRowAdd}
										formatPrice={formatPrice}
									/>
								)
							})}
					{showEmptyState && !showSkeletons ? (
						<div className={styles.tableEmpty}>{emptyLabel}</div>
					) : null}
				</div>
			</div>
			<TableFooter
				shownFrom={shownFrom}
				shownTo={shownTo}
				total={total}
				page={page}
				pages={pages}
				totalPages={totalPages}
				onPageChange={onPageChange}
			/>
			<Modal
				isOpen={isMenuOpen}
				onClose={handleMenuClose}
				title='Действия'
			>
				<div className={styles.actionMenuList}>
					<button
						type='button'
						className={styles.actionMenuItem}
						onClick={() => (menuRowId ? handleMenuEdit(menuRowId) : handleMenuClose())}
					>
						Редактировать
					</button>
					<button
						type='button'
						className={cn(styles.actionMenuItem, styles.actionMenuItemDanger)}
						onClick={() => (menuRowId ? handleMenuDelete(menuRowId) : handleMenuClose())}
					>
						Удалить
					</button>
				</div>
			</Modal>
			<Modal
				isOpen={cancelDialogOpen}
				onClose={closeCancelDialog}
				title='Отменить редактирование?'
				description='Вы действительно хотите отменить редактирование?'
			>
				<div className={styles.modalActions}>
					<Button
						type='button'
						variant='secondary'
						onClick={handleCancelConfirm}
					>
						Отменить редактирование
					</Button>
					<Button
						type='button'
						variant='ghost'
						onClick={closeCancelDialog}
					>
						Остаться
					</Button>
				</div>
			</Modal>
			<Modal
				isOpen={unsavedDialogOpen}
				onClose={handleUnsavedStay}
				title='Несохраненные изменения'
				description='Есть несохраненные изменения. Что сделать?'
			>
				<div className={styles.modalActions}>
					<Button
						type='button'
						onClick={() => void handleUnsavedSave()}
					>
						Сохранить изменения
					</Button>
					<Button
						type='button'
						variant='secondary'
						onClick={handleUnsavedDiscard}
					>
						Сбросить изменения
					</Button>
					<Button
						type='button'
						variant='ghost'
						onClick={handleUnsavedStay}
					>
						Остаться
					</Button>
				</div>
			</Modal>
			<Modal
				isOpen={Boolean(deleteDialogId)}
				onClose={handleDeleteClose}
				title={deleteTarget ? `Удалить "${deleteTarget.name}"?` : 'Удалить позицию?'}
				description='Это действие нельзя отменить.'
			>
				<div className={styles.modalActions}>
					<Button
						type='button'
						variant='secondary'
						onClick={handleDeleteClose}
					>
						Отмена
					</Button>
					<Button
						type='button'
						onClick={() => void handleDeleteConfirm()}
					>
						Удалить
					</Button>
				</div>
			</Modal>
		</div>
	)
}

export const ProductsTable = memo(ProductsTableComponent)
