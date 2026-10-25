import { authApiClient } from '@/shared/api'
import { userIdFromAccessToken } from '../model/access-token'
import type { LoginCredentials, RegisterPayload, Session, TokenPair } from '../model/types'

function sessionFromTokens(pair: TokenPair): Session {
  const userId = typeof pair.accessToken === 'string' && userIdFromAccessToken(pair.accessToken)
  if (!userId || typeof pair.refreshToken !== 'string') {
    throw new Error('AuthService вернул некорректный токен')
  }
  return { token: pair.accessToken, userId }
}

export const sessionApi = {
  async login(credentials: LoginCredentials): Promise<Session> {
    return sessionFromTokens(await authApiClient.post<TokenPair>('/auth-service/login', credentials))
  },
  async register(payload: RegisterPayload): Promise<Session> {
    return sessionFromTokens(await authApiClient.post<TokenPair>('/auth-service/register', payload))
  },
}
