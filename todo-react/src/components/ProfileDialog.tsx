import { useEffect, useState, type ComponentProps, type FormEvent } from 'react'
import { CircleAlert, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Profile } from '@/types'

// Same rules as the backend's UpdateProfileDto, so most mistakes are caught before sending
const FIELDS: {
  key: keyof Profile
  label: string
  hint?: string
  inputProps: ComponentProps<'input'>
}[] = [
  {
    key: 'displayName',
    label: 'Display name',
    inputProps: { required: true, maxLength: 50, autoComplete: 'name' },
  },
  {
    key: 'username',
    label: 'Username',
    hint: '3–30 letters, numbers or underscores',
    inputProps: {
      required: true,
      minLength: 3,
      maxLength: 30,
      pattern: '[A-Za-z0-9_]+',
      title: 'Use 3–30 letters, numbers or underscores',
      autoComplete: 'username',
    },
  },
  {
    key: 'email',
    label: 'Email',
    inputProps: { type: 'email', required: true, maxLength: 254, autoComplete: 'email' },
  },
]

interface ProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: Profile
  onSave: (changes: Partial<Profile>) => Promise<void>
}

export default function ProfileDialog({ open, onOpenChange, profile, onSave }: ProfileDialogProps) {
  const [draft, setDraft] = useState<Profile>(profile)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Start from the saved profile every time the dialog opens
  useEffect(() => {
    if (open) {
      setDraft(profile)
      setError(null)
    }
  }, [open, profile])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const cleaned: Profile = {
      displayName: draft.displayName.trim(),
      username: draft.username.trim().replace(/^@/, ''),
      email: draft.email.trim(),
    }
    // Only send what changed
    const changes = Object.fromEntries(
      Object.entries(cleaned).filter(([key, value]) => profile[key as keyof Profile] !== value)
    ) as Partial<Profile>

    if (Object.keys(changes).length === 0) {
      onOpenChange(false)
      return
    }

    setSaving(true)
    setError(null)
    try {
      await onSave(changes)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !saving && onOpenChange(next)}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="space-y-5">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>Update how your name appears across the app.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {FIELDS.map(({ key, label, hint, inputProps }) => (
              <div key={key} className="space-y-1.5">
                <Label htmlFor={`profile-${key}`}>{label}</Label>
                <Input
                  id={`profile-${key}`}
                  {...inputProps}
                  value={draft[key]}
                  onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                  disabled={saving}
                />
                {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
              </div>
            ))}
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              <CircleAlert className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="animate-spin" />}
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
