import { useMutation } from '@tanstack/react-query'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { sessionApi, sessionStore } from '@/entities/session'
import { ApiError } from '@/shared/api'
import { routes } from '@/shared/config'
import { Button, Input } from '@/shared/ui'
import styles from './LoginForm.module.css'

export function LoginForm() {
  const navigate = useNavigate()
  const login = useMutation({
    mutationFn: sessionApi.login,
    onSuccess: (session) => {
      sessionStore.set(session)
      navigate(routes.bank)
    },
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    login.mutate({ email: String(form.get('email')), password: String(form.get('password')) })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Input
        name="email"
        type="email"
        label="Рабочая почта"
        placeholder="name@company.ru"
        autoComplete="email"
        required
      />
      <Input
        name="password"
        type="password"
        label="Пароль"
        placeholder="••••••••"
        autoComplete="current-password"
        required
      />
      {login.isError && <p className={styles.error} role="alert">{login.error instanceof ApiError && login.error.status === 401
        ? 'Неверная почта или пароль'
        : 'Не удалось войти. Попробуйте ещё раз позже.'}</p>}
      <Button type="submit" fullWidth disabled={login.isPending}>
        {login.isPending ? 'Входим…' : 'Войти'}
      </Button>
    </form>
  )
}
