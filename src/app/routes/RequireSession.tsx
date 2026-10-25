import { Navigate, Outlet, useLocation } from 'react-router'
import { useSession } from '@/entities/session'
import { routes } from '@/shared/config'

export function RequireSession() {
  const session = useSession()
  const location = useLocation()

  return session
    ? <Outlet />
    : <Navigate to={routes.login} state={{ from: location }} replace />
}
