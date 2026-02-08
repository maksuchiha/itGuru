export type LoginInput = {
	username: string
	password: string
	remember: boolean
}

export type Session = {
	token: string
	expiresAt: number
	remember: boolean
}
