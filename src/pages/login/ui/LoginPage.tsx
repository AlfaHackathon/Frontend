import { Link } from 'react-router'
import { LoginForm } from '@/features/login'
import { routes } from '@/shared/config'

export function LoginPage() {
  return (
    <>
      <h1 className="page-title">Вход</h1>
      <p className="page-subtitle">
        Нет аккаунта? <Link to={routes.register}>Зарегистрироваться</Link>
      </p>
      <LoginForm />
    </>
  )
}
