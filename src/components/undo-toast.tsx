import type { FunctionComponent } from 'preact'
import { useEffect } from 'preact/hooks'
import { useRemovedRows } from '../utils/use-global-store.ts'
import { Button, IconButton } from './ui/button.tsx'
import { Icon } from './ui/icon.tsx'

const UNDO_DURATION = 8000

// deleting a row is one click, so it is reversible for a few seconds instead of asking for confirmation
export const UndoToast: FunctionComponent = () => {
  const { removed, undoRemove, dismissRemoved } = useRemovedRows()

  useEffect(() => {
    if (!removed) {
      return
    }
    const timeout = setTimeout(dismissRemoved, UNDO_DURATION)
    return () => clearTimeout(timeout)
  }, [removed, dismissRemoved])

  const getMessage = () => {
    if (!removed) {
      return ''
    }
    const count = removed.entries.length
    if (count === 1) {
      return `Removed ${removed.entries[0].row.name}`
    }
    return removed.reason === 'depleted' ? `Removed ${count} depleted asteroids` : `Removed all ${count} asteroids`
  }

  return (
    // the live region stays mounted so screen readers announce each removal
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
    >
      {removed && (
        <div className="pointer-events-auto flex max-w-full animate-[toast-in_200ms_cubic-bezier(0.16,1,0.3,1)] items-center gap-3 rounded-lg border border-line-strong bg-raised py-1.5 pr-1.5 pl-4 text-sm shadow-[0_12px_32px_rgb(0_0_0/0.5)] motion-reduce:animate-none">
          <span className="min-w-0 truncate text-fg">{getMessage()}</span>
          <div className="flex shrink-0 items-center gap-0.5">
            <Button size="sm" variant="accent" onClick={undoRemove}>
              Undo
            </Button>
            <IconButton title="Dismiss" onClick={dismissRemoved}>
              <Icon name="x" />
            </IconButton>
          </div>
        </div>
      )}
    </div>
  )
}
