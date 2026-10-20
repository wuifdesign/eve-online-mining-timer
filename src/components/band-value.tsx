import type { FunctionComponent } from 'preact'
import { formatNumber, FormatNumberOptions } from '../utils/format-number/format-number.tsx'
import type { StatBands } from '../utils/mining-sim.ts'
import { cx } from './ui/cx.ts'

export type BandValueProps = {
  band: StatBands
  unit?: string
  options?: FormatNumberOptions
  format?: (value: number) => string
  // inline: average and range on one line, used in dense rows
  inline?: boolean
  className?: string
}

// shows the average prominently and the low–high range quietly next to or below it
export const BandValue: FunctionComponent<BandValueProps> = ({ band, unit, options, format, inline, className }) => {
  const fmt = (value: number) => (format ? format(value) : formatNumber(value, options))
  const avg = fmt(band.avg)
  const low = fmt(band.low)
  const high = fmt(band.high)
  const hasRange = low !== high
  const suffix = unit ? ` ${unit}` : ''

  if (inline) {
    return (
      <span className={cx('tabular', className)}>
        <span className="text-muted">
          {avg}
          {suffix}
        </span>
        {hasRange && (
          <span className="text-subtle">
            {' '}
            ({low}–{high})
          </span>
        )}
      </span>
    )
  }

  return (
    <span className={cx('flex flex-col tabular', className)}>
      <span className="text-sm font-semibold">
        {avg}
        {suffix}
      </span>
      {hasRange && (
        <span className="text-xs text-subtle">
          {low} – {high}
        </span>
      )}
    </span>
  )
}
