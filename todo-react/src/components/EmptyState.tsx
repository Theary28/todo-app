import { ClipboardList, SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  filtered: boolean
  onClearFilters: () => void
}

export default function EmptyState({ filtered, onClearFilters }: EmptyStateProps) {
  const Icon = filtered ? SearchX : ClipboardList
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed bg-card/50 px-6 py-14 text-center animate-in fade-in-0">
      <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="size-7" />
      </div>
      <h3 className="mt-4 font-semibold">{filtered ? 'No matching tasks' : 'Nothing here yet'}</h3>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        {filtered
          ? 'Try a different search or filter to find what you are looking for.'
          : 'Add your first task above and start getting things done.'}
      </p>
      {filtered && (
        <Button variant="outline" size="sm" className="mt-4 rounded-full" onClick={onClearFilters}>
          Clear filters
        </Button>
      )}
    </div>
  )
}
