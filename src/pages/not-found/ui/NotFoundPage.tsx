import { Link } from 'react-router'
import { routes } from '@/shared/config'

export function NotFoundPage() {
  return (
    <>
      <h1 className="page-title">Страница не найдена</h1>
      <Link to={routes.bankHome}>На главную</Link>
    </>
  )
}
