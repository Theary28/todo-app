import type { Ref } from 'react'
import { Search, Star, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Kbd } from '@/components/ui/kbd'
import { cn } from '@/lib/utils'

interface ToolbarProps {
  search: string
  onSearch: (value: string) => void
  starredOnly: boolean
  onStarredOnly: (value: boolean) => void
  starredCount: number
  searchRef?: Ref<HTMLInputElement>
}

export default function Toolbar({
  search,
  onSearch,
  starredOnly,
  onStarredOnly,
  starredCount,
  searchRef,
}: ToolbarProps) {
  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={searchRef}
          type="text"
          className="h-10 rounded-xl bg-card pr-10 pl-9 shadow-xs"
          placeholder="Search tasks…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Escape' && onSearch('')}
          aria-label="Search todos"
        />
        <div className="absolute top-1/2 right-2 -translate-y-1/2">
          {search ? (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onSearch('')}
              aria-label="Clear search"
            >
              <X />
            </Button>
          ) : (
            <Kbd className="hidden sm:inline-flex">/</Kbd>
          )}
        </div>
      </div>
      <Button
        variant="outline"
        className={cn(
          'h-10 rounded-xl bg-card shadow-xs',
          starredOnly &&
            'border-amber-400/60 bg-amber-500/10 text-amber-700 hover:bg-amber-500/15 dark:bg-amber-500/10 dark:text-amber-300'
        )}
        onClick={() => onStarredOnly(!starredOnly)}
        aria-pressed={starredOnly}
      >
        <Star className={cn(starredOnly && 'fill-amber-400 text-amber-500')} />
        <span className="hidden sm:inline">Starred</span>
        <span className="text-xs tabular-nums opacity-60">{starredCount}</span>
      </Button>
    </div>
  )
}
