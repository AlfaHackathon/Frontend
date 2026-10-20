import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { sessionStore } from '@/entities/session'
import { routes } from '@/shared/config'
import { Button } from '@/shared/ui'

export function LogoutButton() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const handleLogout = () => {
    sessionStore.clear()
    queryClient.clear()
    navigate(routes.login)
  }

  return (
    <Button variant="ghost" onClick={handleLogout}>
      Выйти
    </Button>
  )
}
