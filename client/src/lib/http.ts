import type { ApiError } from "./types"
import { getToken, clearToken } from "./tokenStorage"

function onUnauthorized() {
    clearToken();
    window.location.href = "/login";
}

export async function api<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`/api${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers,
    },
  })
  if (res.status === 204) return null as T
  const data = await res.json().catch(() => ({ code: 'INTERNAL', message: 'Erro' }))
  if (!res.ok) {
    if (res.status === 401) onUnauthorized()
    throw data as ApiError
  }
  return data as T
}