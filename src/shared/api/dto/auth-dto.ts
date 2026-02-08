export type LoginResponseDto = {
	id: number
	username: string
	email?: string
	firstName?: string
	lastName?: string
	gender?: string
	image?: string
	token?: string
	accessToken?: string
	refreshToken?: string
	expiresInMins?: number
}
