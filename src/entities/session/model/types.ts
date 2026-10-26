export interface Session {
  token: string
  userId: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterPayload extends LoginCredentials {
  lastName: string
  firstName: string
  middleName?: string
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}
