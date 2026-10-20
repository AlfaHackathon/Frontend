import { Link, NavLink } from 'react-router'
import { useSession } from '@/entities/session'
import { getFullName, useUser } from '@/entities/user'
import { LogoutButton } from '@/features/logout'
import { routes } from '@/shared/config'
import { cn } from '@/shared/lib'
import { Logo } from '@/shared/ui'
import styles from './Header.module.css'

const navItems = [
  { to: routes.feed, label: 'Лента' },
  { to: routes.insights, label: 'Сводка' },
  { to: routes.company, label: 'Компания' },
  { to: routes.howItWorks, label: 'Как это работает' },
]

export function Header() {
  const session = useSession()
  const { data: user } = useUser(session?.userId)

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to={routes.feed} className={styles.logo}>
          <Logo />
        </Link>
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) => cn(styles.link, isActive && styles.active)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.user}>
          {user && <span className={styles.name}>{getFullName(user)}</span>}
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
