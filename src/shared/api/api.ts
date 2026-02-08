import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQuery } from '@shared/api/api-base'

export const api = createApi({
	reducerPath: 'api',
	baseQuery,
	tagTypes: ['Products'],
	endpoints: () => ({})
})
