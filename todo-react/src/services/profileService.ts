import { apiFetch, errorFrom } from '@/services/api'
import type { Profile } from '@/types'

// Load the signed-in user's profile
export async function getProfile(): Promise<Profile> {
  const res = await apiFetch('/profile')
  if (!res.ok) throw await errorFrom(res, 'Could not load profile')
  return res.json()
}

// Save only the fields that changed
export async function updateProfile(changes: Partial<Profile>): Promise<Profile> {
  const res = await apiFetch('/profile', {
    method: 'PATCH',
    body: JSON.stringify(changes),
  })
  if (!res.ok) throw await errorFrom(res, 'Could not save profile')
  return res.json()
}
