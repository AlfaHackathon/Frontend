export const routes = {
  bankHome: '/',
  home: '/briefing',
  feed: '/briefing/feed',
  insight: (id: string) => `/briefing/insights/${id}`,
  agent: '/briefing/agent',
  analytics: '/briefing/analytics',
} as const
