import { env } from '@/shared/config'

export async function enableMocks() {
  if (!env.useMocks) {
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations()
        await Promise.all(registrations
          .filter((registration) => registration.active?.scriptURL.endsWith('/mockServiceWorker.js'))
          .map((registration) => registration.unregister()))
      } catch { /* Service worker cleanup must not block the app. */ }
    }
    return
  }
  const { worker } = await import('./browser')
  await worker.start({ onUnhandledFrame: 'bypass', quiet: true })
}
