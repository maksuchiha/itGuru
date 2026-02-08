export type ProductColumnKey = 'name' | 'vendor' | 'sku' | 'rating' | 'price'

export type ProductEditableField = 'name' | 'price' | 'vendor' | 'sku'

export type Product = {
	id: string
	name: string
	category: string
	price: number
	vendor: string
	sku: string
	rating: number
}

export type ProductDraft = {
	name: string
	price: string
	vendor: string
	sku: string
}

export type ProductDraftPayload = {
	name: string
	price: number
	vendor: string
	sku: string
}

export type SortDirection = 'asc' | 'desc'

export type SortState = {
	key: ProductColumnKey
	direction: SortDirection
} | null

export type ColumnWidthMap = Record<ProductColumnKey, number>
