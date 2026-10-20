import { Link } from 'react-router'
import { RegisterForm } from '@/features/register'
import { routes } from '@/shared/config'

export function RegisterPage() {
  return (
    <>
      <h1 className="page-title">Регистрация</h1>
      <p className="page-subtitle">
        Уже есть аккаунт? <Link to={routes.login}>Войти</Link>
      </p>
      <RegisterForm />
    </>
  )
}
