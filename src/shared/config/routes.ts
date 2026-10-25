export const routes = {
  login: '/login',
  register: '/register',
  invite: '/invite/:token',
  feed: '/feed',
  insights: '/insights',
  insight: (id: string) => `/insights/${id}`,
  company: '/company',
  howItWorks: '/how-it-works',
  chat: '/chat',
  chatById: (id: string) => `/chat/${encodeURIComponent(id)}`,
  bank: '/',
  briefing: '/briefing',
} as const
