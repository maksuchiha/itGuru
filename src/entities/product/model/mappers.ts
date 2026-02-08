import type { ProductDto } from '@shared/api/dto/products-dto'

import type { Product } from './types'

export function mapProductDto(dto: ProductDto): Product {
	return {
		id: String(dto.id),
		name: dto.title,
		category: dto.category ?? '',
		price: dto.price,
		vendor: dto.brand ?? '',
		sku: dto.sku ?? String(dto.id),
		rating: dto.rating ?? 0
	}
}
