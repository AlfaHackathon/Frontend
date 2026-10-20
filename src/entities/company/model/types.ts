export interface Company {
  id: string
  name: string
  industry: string
  members: CompanyMember[]
}

export interface CompanyMember {
  userId: string
  fullName: string
  position: string
}
