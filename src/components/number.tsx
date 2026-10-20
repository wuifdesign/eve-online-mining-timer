import type { FunctionComponent } from 'preact'
import { formatNumber, FormatNumberOptions } from '../utils/format-number/format-number.tsx'

export type NumberProps = FormatNumberOptions & {
  value?: number | string | null
}

export const Number: FunctionComponent<NumberProps> = ({ value, ...options }) => <>{formatNumber(value, options)}</>
