import { useState } from 'react'
import { useQueries } from '@tanstack/react-query'
import { ChevronDown, LockKeyhole } from 'lucide-react'
import { useCompanyMembers, useMyCompany } from '@/entities/company'
import { useSession } from '@/entities/session'
import { userApi, userKeys } from '@/entities/user'
import { BankShell } from '@/pages/bank/ui/BankShell'
import { env } from '@/shared/config'
import { mockCompanyProfile as profile } from '../model/mock-company'
import { KnowledgeSection } from './KnowledgeSection'
import styles from './CompanyPage.module.css'

const amountFormatter = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 })
const countFormatter = new Intl.NumberFormat('ru-RU')

export function CompanyPage() {
  const companyQuery = useMyCompany()
  const company = companyQuery.data
  const session = useSession()
  const membersQuery = useCompanyMembers()
  const members = membersQuery.data ?? []
  const memberProfiles = useQueries({
    queries: members.map((member) => ({
      queryKey: userKeys.byId(member.userId),
      queryFn: () => userApi.getById(member.userId),
      retry: false,
    })),
  })
  const [openDirection, setOpenDirection] = useState<string | null>(null)
  const companyDetails = [
    { label: 'ИНН', value: company?.inn || 'Не указан' },
    { label: 'Регион', value: company?.region || 'Не указан' },
    { label: 'Выручка', value: typeof company?.revenue === 'number' ? amountFormatter.format(company.revenue) : 'Не указана' },
    { label: 'Численность сотрудников', value: typeof company?.countOfEmployees === 'number' ? countFormatter.format(company.countOfEmployees) : 'Не указана' },
  ]

  return <BankShell>
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1>{company?.name ?? 'Компания'}</h1>
      </header>

      {company && <aside className={styles.accessNotice} aria-label="Права доступа">
        <span className={styles.lockIcon}><LockKeyhole size={19} strokeWidth={1.9} /></span>
        <div>
          <strong>{company.isCreator ? 'Вы создатель компании' : 'Вы участник кабинета'}</strong>
        </div>
      </aside>}

      <div className={`${styles.columns} ${!env.useMocks ? styles.columnsSingle : ''}`}>
        <div className={styles.primary}>
          <section className={styles.card} id="company-about">
            <h2>О компании</h2>
            {companyQuery.isPending && <p className={styles.memberState} role="status">Загружаем профиль компании…</p>}
            {companyQuery.isError && <p className={styles.memberState} role="alert">Не удалось загрузить профиль компании. <button type="button" onClick={() => void companyQuery.refetch()}>Повторить</button></p>}
            {companyQuery.isSuccess && <dl className={styles.details}>
              {companyDetails.map((detail) => <div key={detail.label} className={styles.detail}>
                <dt>{detail.label}</dt>
                <dd>{detail.value}</dd>
              </div>)}
            </dl>}
            <div className={styles.employeeField}>
              <span className={styles.fieldLabel}>Пользователей кабинета</span>
              <div className={styles.employeeValue}>{membersQuery.isPending ? 'Загружаем…' : membersQuery.isError ? 'Недоступно' : members.length}</div>
            </div>
          </section>

          <section className={styles.card} id="company-managers">
            <h2>Сотрудники с доступом к кабинету</h2>
            {membersQuery.isPending && <p className={styles.memberState} role="status">Загружаем сотрудников…</p>}
            {membersQuery.isError && <p className={styles.memberState} role="alert">Не удалось загрузить сотрудников. <button type="button" onClick={() => void membersQuery.refetch()}>Повторить</button></p>}
            {membersQuery.isSuccess && members.length === 0 && <p className={styles.memberState}>У компании пока нет участников кабинета.</p>}
            <div className={styles.managerList}>
              {members.map((member, index) => {
                const profileQuery = memberProfiles[index]
                const user = profileQuery?.data
                const name = user ? [user.lastName, user.firstName, user.middleName].filter(Boolean).join(' ') : 'Участник кабинета'
                const initials = user ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() : '•'
                return <div className={styles.manager} key={member.userId}>
                  <span className={styles.avatar}>{initials}</span>
                  <div className={styles.managerInfo}>
                    <div className={styles.managerName}>{profileQuery?.isPending ? 'Загружаем профиль…' : name}{member.userId === session?.userId && <span> · это вы</span>}</div>
                    <div className={styles.managerRole}>{user?.roleName || (member.isCreator ? 'Создатель компании' : 'Участник кабинета')}</div>
                    {user?.email && <p>{user.email}</p>}
                    {profileQuery?.isError && <p>Профиль недоступен · ID {member.userId}</p>}
                  </div>
                  {member.isCreator && <span className={styles.memberBadge}>Создатель</span>}
                </div>
              })}
            </div>
          </section>

          <section className={styles.card} id="company-documents">
            <h2>База знаний</h2>
            <KnowledgeSection />
          </section>

          {env.useMocks && <section className={styles.card} id="company-directions">
            <h2>За чем следить</h2>
            <div className={styles.directionList}>
              {profile.directions.map((direction) => <div className={styles.direction} key={direction.name}>
                <div className={styles.directionRow}>
                  <div><strong>{direction.name}</strong><span>Отвечает: {direction.owner}</span></div>
                  {'isCurrent' in direction && direction.isCurrent
                    ? <button type="button" className={styles.reasonButton} aria-expanded={openDirection === direction.name} onClick={() => setOpenDirection(openDirection === direction.name ? null : direction.name)}>Зачем следить</button>
                    : <ChevronDown size={17} className={styles.chevron} aria-hidden="true" />}
                </div>
                {openDirection === direction.name && <p className={styles.reason}>{direction.reason}</p>}
              </div>)}
            </div>
          </section>}
        </div>

        {env.useMocks && <aside className={styles.sourcesCard} id="company-sources">
          <h2>Источники</h2>
          <ul>{profile.sources.map((source) => <li key={source}><span>{source}</span><span className={styles.sourceStatus}>Да</span></li>)}</ul>
        </aside>}
      </div>
    </div>
  </BankShell>
}
