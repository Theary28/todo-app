import { CheckCheck, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import IconTip from '@/components/IconTip'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { initials } from '@/constants'
import type { Profile } from '@/types'

interface HeaderProps {
  profile: Profile
  onProfileClick: () => void
}

export default function Header({ profile, onProfileClick }: HeaderProps) {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="grid size-9 place-items-center rounded-xl bg-linear-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30">
            <CheckCheck className="size-5" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold tracking-tight">Todo List</span>
        </div>

        <div className="flex items-center gap-1.5">
          <IconTip label="Toggle theme">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
            >
              <Sun className="dark:hidden" />
              <Moon className="hidden dark:block" />
            </Button>
          </IconTip>

          <button
            onClick={onProfileClick}
            className="flex items-center gap-2.5 rounded-full py-1 pr-3 pl-1 transition-colors hover:bg-accent"
            aria-label="Edit profile"
          >
            <Avatar className="size-8">
              <AvatarFallback className="bg-linear-to-br from-violet-500 to-fuchsia-500 text-xs font-semibold text-white">
                {initials(profile.displayName)}
              </AvatarFallback>
            </Avatar>
            {profile.username && (
              <span className="hidden text-left leading-tight sm:block">
                <span className="block text-sm font-semibold">{profile.displayName}</span>
                <span className="block text-xs text-muted-foreground">@{profile.username}</span>
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
