import { env } from '@/shared/config'
import { tokenStorage } from './token'

export class ApiError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(status: number, body: unknown) {
    super(`API error ${status}`)
    this.status = status
    this.body = body
  }
}

export class AgentApiError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(status: number, body: unknown) {
    super(`AgentService error ${status}`)
    this.status = status
    this.body = body
  }
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export function buildHeaders(extra?: HeadersInit, tokenOverride?: string): Headers {
  const headers = new Headers(extra)
  headers.set('Content-Type', 'application/json')
  const token = tokenOverride ?? tokenStorage.get()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  return headers
}

async function request<T>(
  method: Method,
  path: string,
  body?: unknown,
  baseUrl = env.apiUrl,
  token?: string,
  agentService = false,
): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: buildHeaders(undefined, token),
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const data: unknown = response.status === 204 ? null : await response.json().catch(() => null)
  if (!response.ok) {
    throw agentService
      ? new AgentApiError(response.status, data)
      : new ApiError(response.status, data)
  }
  return data as T
}

export const apiClient = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
}

// Login and registration must not send a stale access token to AuthGateway.
export const authApiClient = {
  post: <T>(path: string, body: unknown) => request<T>('POST', path, body, env.apiUrl, ''),
}

export const agentApiClient = {
  get: <T>(path: string, token: string) => request<T>('GET', path, undefined, env.agentServiceUrl, token, true),
  post: <T>(path: string, body: unknown, token: string) =>
    request<T>('POST', path, body, env.agentServiceUrl, token, true),
  patch: <T>(path: string, body: unknown, token: string) =>
    request<T>('PATCH', path, body, env.agentServiceUrl, token, true),
}
