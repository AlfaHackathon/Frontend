import { agentApiClient } from '@/shared/api'

export interface Chat {
  id: string
  title?: string | null
  archived?: boolean
  createdAt?: string
  updatedAt?: string
}

type ChatListResponse = Chat[] | { items?: Chat[]; chats?: Chat[]; data?: Chat[] }

export const chatApi = {
  async status(): Promise<'ready'> {
    await Promise.all([
      agentApiClient.get('/health', ''),
      agentApiClient.get('/ready', ''),
    ])
    return 'ready'
  },
  async list(token: string, archive: 'active' | 'archived' = 'active'): Promise<Chat[]> {
    const result = await agentApiClient.get<ChatListResponse>(
      `/chats?archive=${archive}&limit=20`,
      token,
    )
    if (Array.isArray(result)) return result
    return result.items ?? result.chats ?? result.data ?? []
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
