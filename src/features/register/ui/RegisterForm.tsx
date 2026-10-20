import { useMutation } from '@tanstack/react-query'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { sessionApi, sessionStore } from '@/entities/session'
import { routes } from '@/shared/config'
import { Button, Input } from '@/shared/ui'
import styles from './RegisterForm.module.css'

interface RegisterFormProps {
  inviteToken?: string
}

export function RegisterForm({ inviteToken }: RegisterFormProps) {
  const navigate = useNavigate()
  const register = useMutation({
    mutationFn: sessionApi.register,
    onSuccess: (session) => {
      sessionStore.set(session)
      navigate(routes.feed)
    },
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const field = (name: string) => String(form.get(name) ?? '')

    register.mutate({
      lastName: field('lastName'),
      firstName: field('firstName'),
      email: field('email'),
      password: field('password'),
      companyName: inviteToken ? undefined : field('companyName'),
      inviteToken,
    })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.row}>
        <Input name="firstName" label="Имя" autoComplete="given-name" required />
        <Input name="lastName" label="Фамилия" autoComplete="family-name" required />
      </div>
      {!inviteToken && <Input name="companyName" label="Компания" required />}
      <Input name="email" type="email" label="Рабочая почта" autoComplete="email" required />
      <Input
        name="password"
        type="password"
        label="Пароль"
        autoComplete="new-password"
        minLength={8}
        required
      />
      {register.isError && <p className={styles.error}>Не удалось зарегистрироваться</p>}
      <Button type="submit" fullWidth disabled={register.isPending}>
        {register.isPending ? 'Создаём аккаунт…' : 'Зарегистрироваться'}
      </Button>
    </form>
  )
}
