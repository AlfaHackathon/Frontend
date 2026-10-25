import { Navigate, Outlet, useLocation } from 'react-router'
import { useSession } from '@/entities/session'
import { routes } from '@/shared/config'

export function RequireAuth() {
  const session = useSession()
  const location = useLocation()
  if (!session) return <Navigate to={routes.login} replace state={{ from: location }} />
  return <Outlet />
}

export function GuestOnly() {
  const session = useSession()
  if (session) return <Navigate to={routes.bank} replace />
  return <Outlet />
}
