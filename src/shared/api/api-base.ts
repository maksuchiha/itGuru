import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? 'https://dummyjson.com').replace(/\/$/, '')

export const baseQuery = fetchBaseQuery({
	baseUrl: API_BASE,
	prepareHeaders: headers => {
		if (!headers.has('Content-Type')) {
			headers.set('Content-Type', 'application/json')
		}
		return headers
	}
})
