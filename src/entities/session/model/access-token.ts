export function userIdFromAccessToken(token: string): string | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const encoded = payload.replace(/-/g, '+').replace(/_/g, '/')
    const claims: unknown = JSON.parse(atob(encoded.padEnd(Math.ceil(encoded.length / 4) * 4, '=')))
    if (!claims || typeof claims !== 'object') return null
    const { UserId, token_type } = claims as Record<string, unknown>
    return token_type === 'access' && typeof UserId === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(UserId)
      ? UserId
      : null
  } catch {
    return null
  }
}
