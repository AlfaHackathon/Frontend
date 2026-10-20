import { env } from '@/shared/config'

export async function enableMocks() {
  if (!env.useMocks) return
  const { worker } = await import('./browser')
  await worker.start({ onUnhandledFrame: 'bypass', quiet: true })
}
