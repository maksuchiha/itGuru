import { api } from '@shared/api/api'
import type {
	ProductCreateDto,
	ProductDto,
	ProductsResponseDto,
	ProductUpdateDto
} from '@shared/api/dto/products-dto'

type ProductsQuery = {
	query?: string
	limit?: number
	skip?: number
	select?: string
	sortBy?: string
	order?: 'asc' | 'desc'
}

function buildQuery(params: Record<string, string | number | undefined>) {
	const searchParams = new URLSearchParams()
	Object.entries(params).forEach(([key, value]) => {
		if (value === undefined || value === null || value === '') {
			return
		}
		searchParams.set(key, String(value))
	})
	const query = searchParams.toString()
	return query ? `?${query}` : ''
}

export const productsApi = api.injectEndpoints({
	endpoints: build => ({
		getProducts: build.query<ProductsResponseDto, ProductsQuery>({
			query: ({ query, ...params } = {}) => {
				const trimmedQuery = query?.trim()
				const path = trimmedQuery ? '/products/search' : '/products'
				return `${path}${buildQuery({ ...params, q: trimmedQuery })}`
			},
			providesTags: ['Products']
		}),
		addProduct: build.mutation<ProductDto, ProductCreateDto>({
			query: payload => ({
				url: '/products/add',
				method: 'POST',
				body: payload
			}),
			invalidatesTags: ['Products']
		}),
		updateProduct: build.mutation<ProductDto, { id: number; payload: ProductUpdateDto }>({
			query: ({ id, payload }) => ({
				url: `/products/${id}`,
				method: 'PUT',
				body: payload
			}),
			invalidatesTags: ['Products']
		}),
		deleteProduct: build.mutation<ProductDto, number>({
			query: id => ({
				url: `/products/${id}`,
				method: 'DELETE'
			}),
			invalidatesTags: ['Products']
		})
	})
})

export const {
	useGetProductsQuery,
	useAddProductMutation,
	useUpdateProductMutation,
	useDeleteProductMutation
} = productsApi
