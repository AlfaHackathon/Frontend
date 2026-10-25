export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? '/api',
  agentServiceUrl: import.meta.env.VITE_AGENT_SERVICE_URL ?? '/agent-service',
  useMocks: import.meta.env.VITE_USE_MOCKS === 'true',
} as const
