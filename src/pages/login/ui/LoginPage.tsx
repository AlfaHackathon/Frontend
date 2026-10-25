import { Link } from 'react-router'
import { LoginForm } from '@/features/login'
import { routes } from '@/shared/config'
import styles from './LoginPage.module.css'

export function LoginPage() {
  return (
    <main className={styles.page}>
      <svg className={styles.background} viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="login-warm" x1="0" y1="0" x2=".75" y2="1"><stop stopColor="#ff9d85"/><stop offset=".58" stopColor="#f44e3e"/><stop offset="1" stopColor="#df2d31"/></linearGradient>
          <linearGradient id="login-cool" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#ff6754"/><stop offset="1" stopColor="#dc1d38"/></linearGradient>
        </defs>
        <path d="M0 162 C240 136 565 194 743 320 C842 390 893 477 864 586 C818 770 594 887 365 934 C230 962 100 945 0 933 Z" fill="url(#login-warm)" />
        <path d="M1505 0 H1920 V217 C1711 144 1577 86 1505 0 Z" fill="url(#login-cool)" />
        <path d="M469 1080 C603 984 691 928 765 923 C852 917 922 990 991 1080 Z" fill="url(#login-warm)" />
        <path d="M1135 1080 C1155 994 1169 895 1240 861 C1369 795 1567 942 1749 1080 Z" fill="url(#login-cool)" />
      </svg>
      <section className={styles.promo}>
        <Link className={styles.brand} to={routes.bank}><span className={styles.brandMark}>А</span>Альфа-Бизнес</Link>
        <div className={styles.promoBody}>
          <h1>Больше времени<br />на ваш бизнес.</h1>
          <p>Финансы и ежедневные задачи —<br />в одном интернет-банке.</p>
          <ol>
            <li><span>1</span>Платежи и счета под вашим контролем</li>
            <li><span>2</span>От зарплат до документов — в одном окне</li>
            <li><span>3</span>Доступы и роли для вашей команды</li>
          </ol>
        </div>
        <p className={styles.tagline}>Банк для тех, кто делает дело.</p>
      </section>
      <section className={styles.formSide}>
        <div className={styles.loginCard}>
          <h2>Вход</h2>
          <p>Нет аккаунта? <Link to={routes.register}>Зарегистрируйте компанию</Link></p>
          <LoginForm />
        </div>
      </section>
    </main>
  )
}
