import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
	return Boolean(error && typeof error === 'object' && 'status' in error)
}

function getMessageFromData(data: unknown) {
	if (typeof data === 'string' && data.trim()) {
		return data
	}
	if (data && typeof data === 'object' && 'message' in data) {
		if (typeof data.message === 'string' && data.message.trim()) {
			return data.message
		}
	}
	return null
}

export function handleApiError(error: unknown, fallback = 'Request failed.') {
	if (!error) {
		return null
	}
	if (isFetchBaseQueryError(error)) {
		const message = getMessageFromData(error.data)
		if (message) {
			return message
		}
		if ('error' in error && error.error.trim()) {
			return error.error
		}
		return `Request failed: ${error.status}`
	}
	if (typeof error === 'string' && error.trim()) {
		return error
	}
	if (typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
		if (error.message.trim()) {
			return error.message
		}
	}
	return fallback
}
