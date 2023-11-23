import { formatNumber } from './format-number'

describe('formatNumber', () => {
  it('should render', () => {
    expect(formatNumber(1220.001)).toBe('1,220')
  })
  it('should render zero value', () => {
    expect(formatNumber(0)).toBe('0')
  })

  it('should handle string', () => {
    expect(formatNumber('1220.001')).toBe('1,220')
  })

  it('should render respect minimumFractionDigits', () => {
    expect(formatNumber(1220.001, { minimumFractionDigits: 2 })).toBe('1,220.00')
  })

  it('should render respect maximumFractionDigits', () => {
    expect(formatNumber(1220.12389, { maximumFractionDigits: 3 })).toBe('1,220.124')
  })

  it('should render currency', () => {
    expect(formatNumber(1220.12389, { currency: 'EUR' })).toBe('1,220.12\u00a0EUR')
  })

  it('should render percentage', () => {
    expect(formatNumber(1220.12389, { asPercent: true })).toBe('122,012.39%')
  })

  it('should render fallback', () => {
    expect(formatNumber(null, { fallback: 'MyFallback' })).toBe('MyFallback')
  })
})
