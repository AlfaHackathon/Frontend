export const routes = {
  login: '/login',
  register: '/register',
  invite: '/invite/:token',
  feed: '/',
  insights: '/insights',
  insight: (id: string) => `/insights/${id}`,
  company: '/company',
  howItWorks: '/how-it-works',
} as const
