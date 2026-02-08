import type { LoginFormValues } from '@features/auth/login/model/use-auth-card'
import { Button } from '@shared/ui/button/button'
import { Checkbox } from '@shared/ui/checkbox/checkbox'
import { Icon } from '@shared/ui/icon/icon'
import { Input } from '@shared/ui/input/input'
import { memo, useId, type BaseSyntheticEvent, type FC } from 'react'
import type { FieldErrors, UseFormRegisterReturn } from 'react-hook-form'

import styles from './auth-card.module.scss'

type AuthCardViewProps = {
	usernameValue: string
	showPassword: boolean
	isLoading: boolean
	errorMessage: string | null
	errors: FieldErrors<LoginFormValues>
	usernameField: Omit<UseFormRegisterReturn, 'ref'>
	usernameRef: UseFormRegisterReturn['ref']
	passwordField: Omit<UseFormRegisterReturn, 'ref'>
	passwordRef: UseFormRegisterReturn['ref']
	rememberField: Omit<UseFormRegisterReturn, 'ref'>
	rememberRef: UseFormRegisterReturn['ref']
	onSubmit: (event?: BaseSyntheticEvent) => void
	onClearUsername: () => void
	onTogglePassword: () => void
}

const AuthCardViewComponent: FC<AuthCardViewProps> = ({
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
	onClearUsername,
	onTogglePassword
}) => {
	const usernameErrorId = useId()
	const passwordErrorId = useId()

	return (
		<div className={styles.card}>
			<div
				className={styles.logo}
				aria-hidden='true'
			>
				<Icon
					name='logo'
					width={35}
					height={34}
				/>
			</div>
			<div className={styles.header}>
				<h1 className={styles.title}>Добро пожаловать!</h1>
				<p className={styles.subtitle}>Пожалуйста, авторизируйтесь</p>
			</div>
			<form
				className={styles.form}
				onSubmit={onSubmit}
			>
				<label className={styles.field}>
					<span>Логин</span>
					<div className={styles.inputShell}>
						<span
							className={styles.inputIcon}
							aria-hidden='true'
						>
							<Icon name='user' />
						</span>
						<Input
							type='text'
							placeholder='Логин'
							hasError={Boolean(errors.username)}
							aria-describedby={errors.username ? usernameErrorId : undefined}
							className={styles.inputWithIcon}
							autoComplete='username'
							{...usernameField}
							inputRef={usernameRef}
						/>
						{usernameValue ? (
							<button
								type='button'
								className={styles.inputAction}
								onClick={onClearUsername}
								aria-label='Очистить'
							>
								<Icon name='close' />
							</button>
						) : null}
					</div>
					{errors.username ? (
						<span
							id={usernameErrorId}
							className={styles.fieldError}
						>
							{errors.username.message}
						</span>
					) : null}
				</label>
				<label className={styles.field}>
					<span>Пароль</span>
					<div className={styles.inputShell}>
						<span
							className={styles.inputIcon}
							aria-hidden='true'
						>
							<Icon name='lock' />
						</span>
						<Input
							type={showPassword ? 'text' : 'password'}
							placeholder='Пароль'
							hasError={Boolean(errors.password)}
							aria-describedby={errors.password ? passwordErrorId : undefined}
							className={styles.inputWithIcon}
							autoComplete='current-password'
							{...passwordField}
							inputRef={passwordRef}
						/>
						<button
							type='button'
							className={styles.inputAction}
							onClick={onTogglePassword}
							aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
						>
							<Icon name={showPassword ? 'eye' : 'eye-off'} />
						</button>
					</div>
					{errors.password ? (
						<span
							id={passwordErrorId}
							className={styles.fieldError}
						>
							{errors.password.message}
						</span>
					) : null}
				</label>
				<div className={styles.row}>
					<Checkbox
						label='Запомнить данные'
						{...rememberField}
						inputRef={rememberRef}
					/>
				</div>
				{errorMessage ? <div className={styles.formError}>{errorMessage}</div> : null}
				<Button
					type='submit'
					disabled={isLoading}
					className={styles.formButton}
				>
					{isLoading ? 'Входим...' : 'Войти'}
				</Button>
			</form>
			<div className={styles.divider}>
				<span>или</span>
			</div>
			<div className={styles.footer}>
				<span className={styles.subtitle}>Нет аккаунта?</span>
				<button
					type='button'
					className={styles.linkButton}
				>
					Создать
				</button>
			</div>
		</div>
	)
}

export const AuthCardView = memo(AuthCardViewComponent)
