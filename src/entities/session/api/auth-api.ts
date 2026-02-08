import { api } from '@shared/api/api'
import type { LoginResponseDto } from '@shared/api/dto/auth-dto'

const DEFAULT_EXPIRES_MIN = Number(import.meta.env.VITE_AUTH_EXPIRES_MIN ?? '60')
const expiresInMins = Number.isFinite(DEFAULT_EXPIRES_MIN) ? DEFAULT_EXPIRES_MIN : 60
const DEFAULT_CREDENTIALS: RequestCredentials = 'omit'

function resolveCredentials(value: string | undefined): RequestCredentials {
	if (value === 'omit' || value === 'same-origin' || value === 'include') {
		return value
	}
	return DEFAULT_CREDENTIALS
}

const AUTH_CREDENTIALS = resolveCredentials(import.meta.env.VITE_AUTH_CREDENTIALS)

export const authApi = api.injectEndpoints({
	endpoints: build => ({
		login: build.mutation<LoginResponseDto, { username: string; password: string }>({
			query: ({ username, password }) => ({
				url: '/auth/login',
				method: 'POST',
				body: { username, password, expiresInMins },
				credentials: AUTH_CREDENTIALS
			})
		})
	})
})

export const { useLoginMutation } = authApi
