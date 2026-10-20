import { useMyCompany } from '@/entities/company'
import { Card, Spinner } from '@/shared/ui'

export function CompanyPage() {
  const { data: company, isPending, isError } = useMyCompany()

  if (isPending) return <Spinner />
  if (isError) return <p>Не удалось загрузить компанию</p>

  return (
    <>
      <h1 className="page-title">{company.name}</h1>
      <p className="page-subtitle">{company.industry}</p>
      <Card>
        <h2>Участники</h2>
        <ul>
          {company.members.map((member) => (
            <li key={member.userId}>
              {member.fullName} — {member.position}
            </li>
          ))}
        </ul>
      </Card>
    </>
  )
}
