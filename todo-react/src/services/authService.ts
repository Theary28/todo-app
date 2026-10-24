import { API_URL, errorFrom, refreshAccessToken, setAccessToken } from '@/services/api'

type Credentials = { email: string; password: string }

async function signIn(path: 'login' | 'register', credentials: Credentials, fallback: string) {
  const res = await fetch(`${API_URL}/auth/${path}`, {
    method: 'POST',
    credentials: 'include', // lets the backend set the refresh cookie
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })
  if (!res.ok) throw await errorFrom(res, fallback)
  const { accessToken } = (await res.json()) as { accessToken: string }
  setAccessToken(accessToken)
}

export const login = (credentials: Credentials) =>
  signIn('login', credentials, 'Could not sign in')

export const register = (credentials: Credentials) =>
  signIn('register', credentials, 'Could not create your account')

// On page load: true if the refresh cookie still holds a valid session
export const restoreSession = async () => (await refreshAccessToken()) !== null

// Ends this session on the server; signs out locally even if the server can't be reached
export async function logout() {
  try {
    await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' })
  } finally {
    setAccessToken(null)
  }
}
