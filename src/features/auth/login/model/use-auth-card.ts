import { useLogin } from '@features/auth/login/model/use-login'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

const loginSchema = z.object({
	username: z.string().trim().min(1, 'Обязательное поле'),
	password: z.string().min(1, 'Обязательное поле'),
	remember: z.boolean()
})

export type LoginFormValues = z.infer<typeof loginSchema>

const DEFAULT_LOGIN_VALUES: LoginFormValues = {
	username: '',
	password: '',
	remember: false
}

export function useAuthCard() {
	const navigate = useNavigate()
	const [showPassword, setShowPassword] = useState(false)
	const { login, errorMessage, isLoading, resetError } = useLogin()

	const {
		control,
		register,
		handleSubmit,
		formState: { errors },
		setValue
	} = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: DEFAULT_LOGIN_VALUES,
		mode: 'onSubmit'
	})

	const usernameValue = useWatch({ control, name: 'username' }) ?? ''

	const usernameRegistration = useMemo(() => register('username'), [register])
	const passwordRegistration = useMemo(() => register('password'), [register])
	const rememberRegistration = useMemo(() => register('remember'), [register])
	const { ref: usernameRef, ...usernameField } = usernameRegistration
	const { ref: passwordRef, ...passwordField } = passwordRegistration
	const { ref: rememberRef, ...rememberField } = rememberRegistration

	const handleSubmitForm = useCallback(
		async (values: LoginFormValues) => {
			resetError()
			const success = await login(values)
			if (success) {
				navigate('/')
			}
		},
		[login, navigate, resetError]
	)
	const onSubmit = useMemo(() => handleSubmit(handleSubmitForm), [handleSubmit, handleSubmitForm])

	const handleClearUsername = useCallback(() => {
		setValue('username', '')
	}, [setValue])

	const handleTogglePassword = useCallback(() => {
		setShowPassword(prev => !prev)
	}, [])

	return {
		usernameValue,
		showPassword,
		isLoading,
		errorMessage,
		errors,
		usernameField,
		usernameRef,
		passwordField,
		passwordRef,
		rememberField,
		rememberRef,
		onSubmit,
		onClearUsername: handleClearUsername,
		onTogglePassword: handleTogglePassword
	}
}
