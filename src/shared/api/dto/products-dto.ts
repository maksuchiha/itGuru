export type ProductDto = {
	id: number
	title: string
	category?: string
	price: number
	rating?: number
	stock?: number
	brand?: string
	sku?: string
}

export type ProductCreateDto = {
	title: string
	price?: number
	brand?: string
	sku?: string
	stock?: number
	rating?: number
}

export type ProductUpdateDto = Partial<ProductCreateDto>

export type ProductsResponseDto = {
	products: ProductDto[]
	total: number
	skip: number
	limit: number
}
