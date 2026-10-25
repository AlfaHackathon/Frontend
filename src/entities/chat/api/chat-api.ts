import { agentApiClient } from '@/shared/api'

export interface Chat {
  id: string
  agentKey: 'client-assistant'
  title: string
  createdAt: string
  updatedAt: string
  archivedAt: string | null
}

export interface ChatPage {
  items: Chat[]
  nextCursor: string | null
}

export type ChatArchiveFilter = 'active' | 'archived' | 'all'

export const chatApi = {
  async status(): Promise<'ready'> {
    await Promise.all([
      agentApiClient.get('/health', ''),
      agentApiClient.get('/ready', ''),
    ])
    return 'ready'
  },
  list(token: string, archive: ChatArchiveFilter = 'active', cursor?: string): Promise<ChatPage> {
    const query = new URLSearchParams({ archive, limit: '20' })
    if (cursor) query.set('cursor', cursor)
    return agentApiClient.get<ChatPage>(`/chats?${query}`, token)
  },
  get: (id: string, token: string) =>
    agentApiClient.get<Chat>(`/chats/${encodeURIComponent(id)}`, token),
  create: (token: string, title?: string) =>
    agentApiClient.post<Chat>('/chats', title ? { title } : {}, token),
  rename: (id: string, title: string, token: string) =>
    agentApiClient.patch<Chat>(`/chats/${encodeURIComponent(id)}`, { title }, token),
  archive: (id: string, archived: boolean, token: string) =>
    agentApiClient.patch<Chat>(`/chats/${encodeURIComponent(id)}`, { archived }, token),
}
