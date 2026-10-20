import { useSyncExternalStore } from 'react'
import { tokenStorage } from '@/shared/api'
import type { Session } from './types'

const listeners = new Set<() => void>()
const USER_KEY = 'alfa-briefing:user-id'

function readSession(): Session | null {
  const token = tokenStorage.get()
  const userId = localStorage.getItem(USER_KEY)
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
    localStorage.setItem(USER_KEY, session.userId)
    emit()
  },
  clear() {
    tokenStorage.clear()
    localStorage.removeItem(USER_KEY)
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
