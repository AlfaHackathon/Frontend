import { useParams } from 'react-router'
import { RegisterForm } from '@/features/register'

export function InvitePage() {
  const { token } = useParams<{ token: string }>()

  return (
    <>
      <h1 className="page-title">Присоединиться к компании</h1>
      <p className="page-subtitle">Вас пригласили в общий кабинет компании</p>
      <RegisterForm inviteToken={token} />
    </>
  )
}
