import type { ComponentChildren, FunctionComponent } from 'preact'
import { useId, useState } from 'preact/hooks'
import { cx } from './cx.ts'

export type TooltipProps = {
  label: ComponentChildren
  children: ComponentChildren
}

// CSS-only tooltip, shown on hover and on keyboard focus of the trigger; Escape hides it until the next hover or focus
export const Tooltip: FunctionComponent<TooltipProps> = ({ label, children }) => {
  const id = useId()
  const [dismissed, setDismissed] = useState(false)
  return (
    <span className="group relative inline-block max-w-full" onMouseLeave={() => setDismissed(false)}>
      <span
        tabIndex={0}
        aria-describedby={id}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setDismissed(true)
          }
        }}
        onBlur={() => setDismissed(false)}
        className="cursor-help rounded-sm underline decoration-line-strong decoration-dotted underline-offset-4"
      >
        {children}
      </span>
      <span
        id={id}
        role="tooltip"
        className={cx(
          'pointer-events-none absolute bottom-full left-0 z-20 mb-2 hidden w-max max-w-[min(20rem,calc(100vw-2rem))] rounded-md border border-line-strong bg-raised px-2.5 py-1.5 text-left text-xs leading-relaxed font-normal tracking-normal text-fg normal-case shadow-[0_6px_20px_rgb(0_0_0/0.45)]',
          !dismissed && 'group-focus-within:block group-hover:block',
        )}
      >
        {label}
        <span
          aria-hidden="true"
          className="absolute top-full left-4 border-4 border-transparent border-t-line-strong"
        />
      </span>
    </span>
  )
}
