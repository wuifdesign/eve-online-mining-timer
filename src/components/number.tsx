import React, { memo } from 'react'
import { formatNumber, FormatNumberOptions } from '../utils/format-number/format-number.tsx'

export type NumberProps = FormatNumberOptions & {
  value?: number | string | null
}

export const Number: React.FC<NumberProps> = memo(({ value, ...options }) => formatNumber(value, options))
Number.displayName = 'Number'
