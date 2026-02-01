import { v4 as uuidv4 } from 'uuid'
import { OreType } from '../../@types/ore.type.ts'
import { oreNames } from '../../config/ores.ts'

export type ScannerResultType = {
  id: string
  name: string
  oreType: OreType
  distance: number
  oreAmount: number
}

const stringToNumber = (value: string) => {
  const cleaned = value.replace(/\u00a0/g, '').replace(/[^\d]/g, '')
  return parseInt(cleaned || '0')
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
    if (!oreNames.includes(mappedOreType)) {
      continue
    }
    output.push({
      id: uuidv4(),
      name: `${parts[0]} - ${parts[parts.length - 1]}`.replace(/\u00a0/g, ' '),
      distance: stringToNumber(parts[parts.length - 1]),
      oreType: getOreTypeFromName(mappedOreType),
      oreAmount: stringToNumber(parts[1]),
    })
  }
  return output
}
