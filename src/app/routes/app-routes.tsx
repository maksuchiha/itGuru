import { useSession } from '@entities/session/model/use-session'
import { LoginPage } from '@pages/login/login-page'
import { ProductsPage } from '@pages/products/products-page'
import type { FC } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

export const AppRoutes: FC = () => {
	const { isAuthenticated } = useSession()

	return (
		<Routes>
			<Route
				path='/'
				element={
					isAuthenticated ? (
						<ProductsPage />
					) : (
						<Navigate
							to='/login'
							replace
						/>
					)
				}
			/>
			<Route
				path='/login'
				element={
					isAuthenticated ? (
						<Navigate
							to='/'
							replace
						/>
					) : (
						<LoginPage />
					)
				}
			/>
			<Route
				path='*'
				element={
					<Navigate
						to='/'
						replace
					/>
				}
			/>
		</Routes>
	)
}
