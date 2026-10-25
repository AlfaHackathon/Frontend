import { sessionStore } from '@/entities/session'
import { env } from '@/shared/config'

export async function enableMocks() {
  if (!env.useMocks) return
  const [{ worker }, { mockUser }] = await Promise.all([import('./browser'), import('./data')])
  await worker.start({ onUnhandledFrame: 'bypass', quiet: true })
  if (!sessionStore.getSnapshot()) sessionStore.set({ token: 'mock-token', userId: mockUser.id })
}
