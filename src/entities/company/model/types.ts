export interface Company {
  id: string
  name: string
  isCreator: boolean
  inn?: string | null
  region?: string | null
  revenue?: number | null
  countOfEmployees?: number | null
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
