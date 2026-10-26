import { useState } from 'react'
import { ChevronDown, LockKeyhole } from 'lucide-react'
import { useMyCompany } from '@/entities/company'
import { BankShell } from '@/pages/bank/ui/BankShell'
import { mockCompanyProfile as profile } from '../model/mock-company'
import { KnowledgeSection } from './KnowledgeSection'
import styles from './CompanyPage.module.css'

export function CompanyPage() {
  const { data: company } = useMyCompany()
  const [openDirection, setOpenDirection] = useState<string | null>(null)

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

      <div className={styles.columns}>
        <div className={styles.primary}>
          <section className={styles.card} id="company-about">
            <h2>О компании</h2>
            <dl className={styles.details}>
              {profile.details.map((detail) => <div key={detail.label} className={styles.detail}>
                <dt>{detail.label}</dt>
                <dd>{detail.value}</dd>
              </div>)}
            </dl>
            <div className={styles.employeeField}>
              <span className={styles.fieldLabel}>Численность сотрудников</span>
              <div className={styles.employeeValue}>{profile.employeeCount}<ChevronDown size={16} aria-hidden="true" /></div>
            </div>
          </section>

          <section className={styles.card} id="company-managers">
            <h2>Руководители</h2>
            <div className={styles.managerList}>
              {profile.managers.map((manager) => <div className={styles.manager} key={manager.name}>
                <span className={styles.avatar}>{manager.initials}</span>
                <div className={styles.managerInfo}>
                  <div className={styles.managerName}>{manager.name}{'isCurrent' in manager && manager.isCurrent && <span> · это вы</span>}</div>
                  <div className={styles.managerRole}>{manager.role}</div>
                  <p>Показатели: {manager.metrics} <span aria-hidden="true">·</span> Направления: {manager.directions}</p>
                </div>
                {'isCurrent' in manager && manager.isCurrent && <a className={styles.outlineButton} href="#company-directions">Настроить</a>}
              </div>)}
            </div>
          </section>

          <section className={styles.card} id="company-documents">
            <h2>База знаний</h2>
            <KnowledgeSection />
          </section>

          <section className={styles.card} id="company-directions">
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
          </section>
        </div>

        <aside className={styles.sourcesCard} id="company-sources">
          <h2>Источники</h2>
          <ul>{profile.sources.map((source) => <li key={source}><span>{source}</span><span className={styles.sourceStatus}>Да</span></li>)}</ul>
        </aside>
      </div>
    </div>
  </BankShell>
}
