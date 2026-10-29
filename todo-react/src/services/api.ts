// Shared fetch for every backend call: adds the access token and refreshes it when it expires.

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

// Kept in memory only. After a reload the session comes back through the
// httpOnly refresh cookie (see refreshAccessToken).
let accessToken: string | null = null

export const setAccessToken = (token: string | null) => {
  accessToken = token
}

// Called when the session can't be refreshed, so the app can show the sign-in screen
let onSessionExpired = () => {}
export const setSessionExpiredHandler = (handler: () => void) => {
  onSessionExpired = handler
}

// Use the backend's validation message when it sends one, e.g.
// { "message": ["email must be an email"] }
export async function errorFrom(res: Response, fallback: string) {
  try {
    const data = await res.json()
    const message = Array.isArray(data.message) ? data.message.join('. ') : data.message
    return new Error(message || fallback)
  } catch {
    return new Error(fallback)
  }
}

// The backend rotates the refresh token on every use and treats a reused one as stolen
// (it logs the user out everywhere). So concurrent callers must share one request,
// e.g. React StrictMode running the startup effect twice, or several calls hitting 401 at once.
let refreshing: Promise<string | null> | null = null

export function refreshAccessToken(): Promise<string | null> {
  refreshing ??= fetch(`${API_URL}/auth/refresh`, { method: 'POST', credentials: 'include' })
    .then(async (res) => (res.ok ? ((await res.json()) as { accessToken: string }).accessToken : null))
    .catch(() => null)
    .then((token) => {
      setAccessToken(token)
      return token
    })
    .finally(() => {
      refreshing = null
    })
  return refreshing
}

// fetch() for protected routes. On 401 it refreshes the access token once and retries.
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const send = () =>
    fetch(`${API_URL}${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...init.headers,
      },
    })

  const res = await send()
  if (res.status !== 401) return res

  if (await refreshAccessToken()) return send()
  onSessionExpired()
  return res
}
