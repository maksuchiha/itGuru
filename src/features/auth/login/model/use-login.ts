import { useLoginMutation } from '@entities/session/api/auth-api'
import type { LoginInput } from '@entities/session/model/types'
import { useSession } from '@entities/session/model/use-session'
import { handleApiError } from '@shared/api/handle-api-error'
import { useCallback, useState } from 'react'

export function useLogin() {
	const { signIn } = useSession()
	const [triggerLogin, { isLoading }] = useLoginMutation()
	const [errorMessage, setErrorMessage] = useState<string | null>(null)

	const resetError = useCallback(() => {
		setErrorMessage(null)
	}, [])

	const handleLogin = useCallback(
		async (values: LoginInput) => {
			setErrorMessage(null)
			try {
				const response = await triggerLogin({
					username: values.username,
					password: values.password
				}).unwrap()
				const token = response.accessToken ?? response.token
				if (!token) {
					setErrorMessage('Токен не получен. Проверьте ответ сервера.')
					return false
				}
				const fallbackMinutes = Number(import.meta.env.VITE_AUTH_EXPIRES_MIN ?? '60')
				const expiresInMins =
					response.expiresInMins ?? (Number.isFinite(fallbackMinutes) ? fallbackMinutes : 60)
				const expiresAt = Date.now() + expiresInMins * 60 * 1000
				signIn({ token, expiresAt, remember: values.remember })
				return true
			} catch (error) {
				setErrorMessage(handleApiError(error) ?? 'Не удалось выполнить вход. Попробуйте снова.')
				return false
			}
		},
		[signIn, triggerLogin]
	)

	return {
		login: handleLogin,
		isLoading,
		errorMessage,
		resetError
	}
}
