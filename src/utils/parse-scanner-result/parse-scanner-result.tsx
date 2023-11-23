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
  return parseInt(
    value
      .replace(/\u00a0/g, '')
      .replace(' ', '')
      .replace('.', '')
      .replace(',', ''),
  )
}

const getOreTypeFromName = (value: string): OreType => {
  if (!oreNames.includes(value)) {
    const baseOre = oreNames.find((item) => item.includes(value))
    if (baseOre) {
      value = baseOre
    }
  }
  return value as OreType
}

export const parseScannerResult = (input: string) => {
  const output: ScannerResultType[] = []
  for (const row of input.split('\n')) {
    const parts = row.split('\t')
    if (parts.length != 4) {
      continue
    }
    const oreType = parts[0].split(' ').slice(-1)[0]
    const mappedOreType = getOreTypeFromName(oreType)
    if (!oreNames.includes(mappedOreType)) {
      continue
    }
    output.push({
      id: uuidv4(),
      name: `${parts[0]} - ${parts[3]}`.replace(/\u00a0/g, ' '),
      distance: stringToNumber(parts[3]),
      oreType: getOreTypeFromName(mappedOreType),
      oreAmount: stringToNumber(parts[1]),
    })
  }
  return output
}
