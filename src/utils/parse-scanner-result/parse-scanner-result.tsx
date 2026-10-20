import { OreType } from '../../@types/ore.type.ts'
import { oreNames } from '../../config/ores.ts'

export type ScannerResultType = {
  id: string
  name: string
  // an OreType, or the pasted name of an ore missing from the table (then unitVolume is set)
  oreType: OreType | string
  distance: number
  oreAmount: number
  // unit volume read from the paste, only kept for ores missing from the table
  unitVolume?: number
}

const stringToNumber = (value: string) => {
  const cleaned = value.replace(/\u00a0/g, '').replace(/[^\d]/g, '')
  return parseInt(cleaned || '0')
}

// "18,000 m3" / "6 250 m3" / "6.420 m3": separators are thousands, a trailing 1-2 digit group is a fraction
const parseVolume = (value: string | undefined) => {
  if (!value || !/m3|m³/i.test(value)) {
    return 0
  }
  const cleaned = value
    .replace(/\u00a0/g, '')
    .replace(/\s*m(3|³)\s*$/i, '')
    .replace(/\s/g, '')
  const fraction = cleaned.match(/[.,](\d{1,2})$/)
  const whole = stringToNumber(fraction ? cleaned.slice(0, -fraction[0].length) : cleaned)
  return fraction ? whole + parseInt(fraction[1]) / 10 ** fraction[1].length : whole
}

const getOreTypeFromName = (value: string): OreType => {
  if (!oreNames.includes(value)) {
    let baseOre = oreNames.find((item) => value.includes(item))
    if (!baseOre) {
      const lastWord = value.trim().split(' ').slice(-1)[0]
      const matches = oreNames.filter((item) => item.endsWith(` ${lastWord}`) || item === lastWord)
      if (matches.length === 1) {
        baseOre = matches[0]
      }
    }
    if (baseOre) {
      value = baseOre
    }
  }
  return value as OreType
}

export const parseScannerResult = (input: string) => {
  const output: ScannerResultType[] = []
  for (const row of input.split('\n')) {
    if (!row.trim()) {
      continue
    }
    let parts = row.split('\t').filter(Boolean)
    if (parts.length < 4) {
      parts = row.trim().split(/\s{2,}/)
    }
    if (parts.length < 4) {
      continue
    }
    const oreName = parts[0].trim()
    const mappedOreType = getOreTypeFromName(oreName)
    const oreAmount = stringToNumber(parts[1])
    let unitVolume: number | undefined
    if (!oreNames.includes(mappedOreType)) {
      // an ore missing from the table still works when the paste has its volume column
      const volume = parseVolume(parts[2])
      if (volume <= 0 || oreAmount <= 0) {
        continue
      }
      unitVolume = volume / oreAmount
    }
    output.push({
      id: crypto.randomUUID(),
      name: `${parts[0]} - ${parts[parts.length - 1]}`.replace(/\u00a0/g, ' '),
      distance: stringToNumber(parts[parts.length - 1]),
      oreType: unitVolume ? oreName : mappedOreType,
      oreAmount,
      ...(unitVolume ? { unitVolume } : {}),
    })
  }
  return output
}
