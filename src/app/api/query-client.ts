import { QueryClient } from '@tanstack/react-query'
import { sessionStore } from '@/entities/session'
import { ApiError } from '@/shared/api'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: (failureCount, error) =>
        !(error instanceof ApiError && error.status < 500) && failureCount < 2,
    },
  },
})

queryClient.getQueryCache().subscribe((event) => {
  const error = event.query.state.error
  if (error instanceof ApiError && error.status === 401) sessionStore.clear()
})
