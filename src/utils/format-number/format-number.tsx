export type FormatNumberOptions = {
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  asPercent?: boolean
  currency?: string | null
  fallback?: string | null
}

export const formatNumber = (
  value: number | string | null | undefined,
  { currency, asPercent, minimumFractionDigits, maximumFractionDigits = 2, fallback = '' }: FormatNumberOptions = {},
): string => {
  if (typeof value === 'undefined' || value === null) {
    return fallback || ''
  }

  if (typeof value === 'string') {
    value = parseFloat(value)
  }
  value = parseFloat(value.toPrecision(12))

  let temp = new Intl.NumberFormat('en-US', {
    minimumFractionDigits,
    style: asPercent ? 'percent' : 'decimal',
    maximumFractionDigits,
  }).format(value)

  if (typeof currency !== 'undefined') {
    temp += `\u00a0${currency}`
  }

  return temp
}
