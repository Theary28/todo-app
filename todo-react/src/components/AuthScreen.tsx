import { useState, type FormEvent } from 'react'
import { CheckCheck, CircleAlert, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Mode = 'login' | 'register'

const COPY: Record<Mode, { title: string; subtitle: string; submit: string; switchText: string; switchAction: string }> = {
  login: {
    title: 'Welcome back',
    subtitle: 'Sign in to see your tasks.',
    submit: 'Sign in',
    switchText: "Don't have an account?",
    switchAction: 'Create one',
  },
  register: {
    title: 'Create your account',
    subtitle: 'Start organising your tasks in seconds.',
    submit: 'Create account',
    switchText: 'Already have an account?',
    switchAction: 'Sign in',
  },
}

interface AuthScreenProps {
  onSubmit: (mode: Mode, email: string, password: string) => Promise<void>
}

export default function AuthScreen({ onSubmit }: AuthScreenProps) {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const copy = COPY[mode]

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(mode, email.trim(), password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSubmitting(false)
    }
  }

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
    setError(null)
  }

  return (
    <div className="grid min-h-screen place-items-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="grid size-12 place-items-center rounded-2xl bg-linear-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30">
            <CheckCheck className="size-6" strokeWidth={2.5} />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight">{copy.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{copy.subtitle}</p>
        </div>

        <Card className="p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="auth-email">Email</Label>
              <Input
                id="auth-email"
                type="email"
                required
                maxLength={254}
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="auth-password">Password</Label>
              {/* Same limits as the backend's SignupDto */}
              <Input
                id="auth-password"
                type="password"
                required
                minLength={mode === 'register' ? 8 : undefined}
                maxLength={72}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
              />
              {mode === 'register' && (
                <p className="text-xs text-muted-foreground">At least 8 characters</p>
              )}
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

            <Button type="submit" className="w-full rounded-xl" disabled={submitting}>
              {submitting && <Loader2 className="animate-spin" />}
              {copy.submit}
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {copy.switchText}{' '}
          <button
            type="button"
            onClick={switchMode}
            disabled={submitting}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {copy.switchAction}
          </button>
        </p>
      </div>
    </div>
  )
}
