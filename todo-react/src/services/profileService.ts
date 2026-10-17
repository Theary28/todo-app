import type { Profile } from '@/types'

const API = 'http://localhost:3000/api/profile'

// Use the backend's validation message when it sends one, e.g.
// { "message": ["email must be an email"] }
async function errorFrom(res: Response, fallback: string) {
  try {
    const data = await res.json()
    const message = Array.isArray(data.message) ? data.message.join('. ') : data.message
    return new Error(message || fallback)
  } catch {
    return new Error(fallback)
  }
}

// Load the profile
export async function getProfile(): Promise<Profile> {
  const res = await fetch(API)
  if (!res.ok) throw await errorFrom(res, 'Could not load profile')
  return res.json()
}

// Save only the fields that changed
export async function updateProfile(changes: Partial<Profile>): Promise<Profile> {
  const res = await fetch(API, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(changes),
  })
  if (!res.ok) throw await errorFrom(res, 'Could not save profile')
  return res.json()
}
