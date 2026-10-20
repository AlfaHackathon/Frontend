import { Outlet } from 'react-router'
import { Logo } from '@/shared/ui'
import styles from './AuthLayout.module.css'

const benefits = [
  'Риски и возможности с учётом контекста вашей компании',
  'Влияние каждого события на выручку, маржу и долг',
  'Общий кабинет для всех руководителей компании',
]

export function AuthLayout() {
  return (
    <div className={styles.layout}>
      <section className={styles.promo}>
        <Logo inverted />
        <h2 className={styles.headline}>
          Новости и аналитика Альфа-Банка — в выводы для вашей компании
        </h2>
        <ol className={styles.benefits}>
          {benefits.map((text, index) => (
            <li key={text}>
              <span className={styles.number}>{index + 1}</span>
              {text}
            </li>
          ))}
        </ol>
      </section>
      <main className={styles.form}>
        <div className={styles.formInner}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
