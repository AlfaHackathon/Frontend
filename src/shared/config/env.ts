export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? '/api',
  useMocks: import.meta.env.VITE_USE_MOCKS === 'true',
} as const
