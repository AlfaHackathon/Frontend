import { useSyncExternalStore } from 'react'
import { tokenStorage } from '@/shared/api'
import { userIdFromAccessToken } from './access-token'
import type { Session } from './types'

const listeners = new Set<() => void>()

function readSession(): Session | null {
  const token = tokenStorage.get()
  const userId = token && userIdFromAccessToken(token)
  return token && userId ? { token, userId } : null
}

let snapshot: Session | null = readSession()

function emit() {
  snapshot = readSession()
  listeners.forEach((listener) => listener())
}

export const sessionStore = {
  set(session: Session) {
    tokenStorage.set(session.token)
    emit()
  },
  clear() {
    tokenStorage.clear()
    localStorage.removeItem('alfa-briefing:user-id')
    emit()
  },
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
  getSnapshot: () => snapshot,
}

export const useSession = () =>
  useSyncExternalStore(sessionStore.subscribe, sessionStore.getSnapshot)
