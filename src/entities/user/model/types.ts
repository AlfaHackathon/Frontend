export interface User {
  id: string
  lastName: string
  firstName: string
  middleName: string | null
  email: string
  createdAt: string
  roleId: string | null
  roleName: string | null
}

export const getFullName = (user: Pick<User, 'firstName' | 'lastName'>) =>
  `${user.firstName} ${user.lastName}`
