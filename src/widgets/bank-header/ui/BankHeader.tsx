import { BriefcaseGearMIcon } from '@alfalab/icons-glyph/BriefcaseGearMIcon'
import { BurgerMIcon } from '@alfalab/icons-glyph/BurgerMIcon'
import { CalendarMIcon } from '@alfalab/icons-glyph/CalendarMIcon'
import { DoorOpenMIcon } from '@alfalab/icons-glyph/DoorOpenMIcon'
import { MagnifierMIcon } from '@alfalab/icons-glyph/MagnifierMIcon'
import { MailMIcon } from '@alfalab/icons-glyph/MailMIcon'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { useCompanyGroup, useCompanyMembers, useMyCompany } from '@/entities/company'
import { sessionStore, useSession } from '@/entities/session'
import { useUser } from '@/entities/user'
import { MegaphoneMIcon } from '@/shared/ui/icons'
import { routes } from '@/shared/config'
import styles from './BankHeader.module.css'

interface BankHeaderProps {
  onMenuClick?: () => void
}

export function BankHeader({ onMenuClick }: BankHeaderProps) {
  const session = useSession()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: user } = useUser(session?.userId)
  const { data: company } = useMyCompany(!!session)
  const { data: group } = useCompanyGroup(!!session)
  const { data: members } = useCompanyMembers(!!session)
  const position = members?.find((member) => member.userId === session?.userId)?.position

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <button type="button" className={styles.menuButton} onClick={onMenuClick} aria-label="Меню">
          <BurgerMIcon />
        </button>
        <span className={styles.mark}>А</span>
        <span className={styles.name}>Альфа-Бизнес</span>
      </div>

      <div className={styles.toolbar}>
        <label className={styles.search}>
          <MagnifierMIcon />
          <input placeholder="Поиск" aria-label="Поиск" />
        </label>

        <div className={styles.divider} />

        <div className={styles.actions}>
          <button type="button" className={styles.iconButton} aria-label="Календарь">
            <CalendarMIcon />
          </button>
          <button type="button" className={styles.iconButton} aria-label="Письма">
            <MailMIcon />
          </button>
          <button type="button" className={styles.iconButton} aria-label="Новости">
            <MegaphoneMIcon />
          </button>
        </div>

        <div className={styles.divider} />

        <div className={styles.company}>
          <span className={styles.companyName}>{group?.name ?? company?.name}</span>
          <span className={styles.userName}>
            {[user?.firstName, position].filter(Boolean).join(' · ')}
          </span>
        </div>
        <button type="button" className={styles.iconButton} aria-label="Профиль компании">
          <BriefcaseGearMIcon />
        </button>

        <div className={styles.divider} />

        <button type="button" className={styles.iconButton} aria-label="Выйти" onClick={() => {
          sessionStore.clear()
          queryClient.clear()
          navigate(routes.login)
        }}>
          <DoorOpenMIcon />
        </button>
      </div>
    </header>
  )
}
