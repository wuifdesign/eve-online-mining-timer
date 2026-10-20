import type { FunctionComponent } from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'
import { parseScannerResult, ScannerResultType } from '../utils/parse-scanner-result/parse-scanner-result.tsx'
import { modKey } from '../utils/mod-key.ts'
import { cx } from './ui/cx.ts'
import { Icon } from './ui/icon.tsx'

export type ScannerResultPasteInputProps = {
  onPaste: (result: ScannerResultType[]) => void
  // large drop zone for the empty state, slim bar once rows exist
  prominent?: boolean
}

type PasteFeedback = { tone: 'success' | 'error'; message: string }

const FEEDBACK_DURATION = 6000

export const ScannerResultPasteInput: FunctionComponent<ScannerResultPasteInputProps> = ({ onPaste, prominent }) => {
  const [feedback, setFeedback] = useState<PasteFeedback | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  const showFeedback = (next: PasteFeedback) => {
    clearTimeout(timeoutRef.current)
    setFeedback(next)
    timeoutRef.current = setTimeout(() => setFeedback(null), FEEDBACK_DURATION)
  }

  return (
    <div>
      <label
        className={cx(
          'group relative flex cursor-text items-center gap-3 rounded-lg border border-dashed bg-canvas/60 px-4 text-muted transition-colors duration-150 focus-within:border-accent focus-within:bg-canvas hover:border-subtle',
          prominent ? 'flex-col justify-center py-10 text-center' : 'py-3',
          feedback?.tone === 'error' ? 'border-warn' : 'border-field',
        )}
      >
        <Icon
          name="clipboard-text"
          className={cx('shrink-0 text-subtle group-focus-within:text-accent', prominent ? 'size-7' : 'size-5')}
        />
        <span className={cx('flex flex-col', prominent && 'items-center')}>
          <span className="text-sm font-medium text-fg">
            Paste survey scanner results here{' '}
            <kbd className="ml-1 rounded border border-line-strong px-1.5 py-0.5 font-sans text-xs whitespace-nowrap text-muted">
              {modKey} + V
            </kbd>
          </span>
          {prominent && (
            <span className="mt-1.5 text-xs text-subtle">
              Select rows in the survey scanner, copy them with {modKey} + C, then click here and paste.
            </span>
          )}
        </span>
        <textarea
          value=""
          aria-label="Survey scanner result"
          autoComplete="off"
          rows={1}
          className="absolute inset-0 cursor-text resize-none bg-transparent text-transparent caret-transparent outline-none"
          onInput={(event) => {
            const text = event.currentTarget.value
            // the pasted content is consumed right away, keep the textarea empty
            event.currentTarget.value = ''
            const rows = parseScannerResult(text)
            if (rows.length > 0) {
              onPaste(rows)
              showFeedback({
                tone: 'success',
                message: rows.length === 1 ? 'Added 1 asteroid.' : `Added ${rows.length} asteroids.`,
              })
            } else if (text.trim().length > 1) {
              // a single typed character isn't a paste attempt, stay quiet for those
              showFeedback({
                tone: 'error',
                message:
                  'No ore recognised. Copy rows from the survey scanner window, with the ore name and quantity columns.',
              })
            }
          }}
        />
      </label>
      {/* the live region stays mounted so screen readers pick up each new message */}
      <p role="status" className={cx('px-1 text-xs', feedback?.tone === 'error' ? 'text-warn' : 'text-muted')}>
        {feedback && <span className="mt-2 block">{feedback.message}</span>}
      </p>
    </div>
  )
}
