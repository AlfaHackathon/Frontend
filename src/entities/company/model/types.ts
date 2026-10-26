export interface Company {
  id: string
  name: string
  isCreator: boolean
}

export interface CompanyMember {
  userId: string
  joinedAt: string
  isCreator: boolean
}

export interface CompanyGroup {
  current: Company
  parent: Company | null
  children: Company[]
}
