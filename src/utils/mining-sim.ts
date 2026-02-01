import { MiningStats } from './mining-types.ts'

export type QuantileBands = {
  p10: number
  p50: number
  p90: number
}

export type MiningBands = {
  residueTotalBands: QuantileBands
  critBonusTotalBands: QuantileBands
  cyclesBands: QuantileBands
  timeBands: QuantileBands
  deterministicCycles: number
  deterministicTime: number
}

export type CargoBands = {
  cargoPerSecondBands: QuantileBands
  cargoFullTimeBands: QuantileBands
}

const mulberry32 = (seed: number) => {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const seedFromString = (value: string) => {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

const getQuantile = (values: number[], quantile: number) => {
  if (values.length === 0) {
    return 0
  }
  const sorted = [...values].sort((a, b) => a - b)
  const position = (sorted.length - 1) * quantile
  const base = Math.floor(position)
  const rest = position - base
  const baseValue = sorted[base]
  const nextValue = sorted[base + 1] ?? baseValue
  return baseValue + rest * (nextValue - baseValue)
}

const getBands = (values: number[]): QuantileBands => {
  return {
    p10: getQuantile(values, 0.1),
    p50: getQuantile(values, 0.5),
    p90: getQuantile(values, 0.9),
  }
}

type SimCycleResult = {
  residueVolume: number
  critBonusVolume: number
}

const simulateCycle = (stats: MiningStats, turrets: number, rand: () => number): SimCycleResult => {
  const cycleYield = stats.yieldPerCycle * turrets
  const residueVolume = rand() < stats.residueChance ? cycleYield * stats.residueMultiplier : 0
  const critBonusVolume = rand() < stats.critChance ? cycleYield * stats.critBonusMultiplier : 0
  return {
    residueVolume,
    critBonusVolume,
  }
}

export const getDeterministicCycles = (options: {
  oreAmount: number
  oreUnitSize: number
  stats: MiningStats
  turrets: number
}) => {
  const { oreAmount, oreUnitSize, stats, turrets } = options
  const totalOreVolume = Math.max(0, oreAmount) * oreUnitSize
  const depletionPerCycle = stats.yieldPerCycle * turrets + stats.expectedResiduePerCycle * turrets
  if (totalOreVolume === 0 || depletionPerCycle <= 0 || stats.cycleDuration <= 0) {
    return {
      cycles: 0,
      time: 0,
    }
  }
  const cycles = totalOreVolume / depletionPerCycle
  return {
    cycles,
    time: cycles * stats.cycleDuration,
  }
}

export const simulateMiningBands = (options: {
  oreAmount: number
  oreUnitSize: number
  stats: MiningStats
  turrets: number
  iterations?: number
  seed?: string
}): MiningBands => {
  const { oreAmount, oreUnitSize, stats, turrets, iterations = 2000, seed = 'mining' } = options
  const totalOreVolume = Math.max(0, oreAmount) * oreUnitSize
  if (totalOreVolume === 0 || stats.cycleDuration <= 0 || stats.yieldPerCycle <= 0) {
    return {
      residueTotalBands: { p10: 0, p50: 0, p90: 0 },
      critBonusTotalBands: { p10: 0, p50: 0, p90: 0 },
      cyclesBands: { p10: 0, p50: 0, p90: 0 },
      timeBands: { p10: 0, p50: 0, p90: 0 },
      deterministicCycles: 0,
      deterministicTime: 0,
    }
  }

  const rng = mulberry32(seedFromString(seed))
  const residueTotals: number[] = []
  const critTotals: number[] = []
  const cycleTotals: number[] = []

  for (let i = 0; i < iterations; i += 1) {
    let remainingVolume = totalOreVolume
    let cycles = 0
    let residueTotal = 0
    let critTotal = 0
    while (remainingVolume > 0 && cycles < 100000) {
      const result = simulateCycle(stats, turrets, rng)
      residueTotal += result.residueVolume
      critTotal += result.critBonusVolume
      const depletion = stats.yieldPerCycle * turrets + result.residueVolume
      remainingVolume -= depletion
      cycles += 1
    }
    residueTotals.push(residueTotal)
    critTotals.push(critTotal)
    cycleTotals.push(cycles)
  }

  const residueTotalBands = getBands(residueTotals)
  const critBonusTotalBands = getBands(critTotals)
  const cyclesBands = getBands(cycleTotals)
  const deterministic = getDeterministicCycles({ oreAmount, oreUnitSize, stats, turrets })
  const expectedCritTotal = stats.expectedCritBonusPerCycle * turrets * deterministic.cycles
  const expectedResidueTotal = stats.expectedResiduePerCycle * turrets * deterministic.cycles
  const timeBands = {
    p10: cyclesBands.p10 * stats.cycleDuration,
    p50: deterministic.time,
    p90: cyclesBands.p90 * stats.cycleDuration,
  }

  return {
    residueTotalBands: { ...residueTotalBands, p50: expectedResidueTotal },
    critBonusTotalBands: { ...critBonusTotalBands, p50: expectedCritTotal },
    cyclesBands: { ...cyclesBands, p50: deterministic.cycles },
    timeBands,
    deterministicCycles: deterministic.cycles,
    deterministicTime: deterministic.time,
  }
}

export const simulateCargoBands = (options: {
  cargoSize: number
  stats: MiningStats
  turrets: number
  iterations?: number
  seed?: string
}): CargoBands => {
  const { cargoSize, stats, turrets, iterations = 2000, seed = 'cargo' } = options
  if (cargoSize <= 0 || stats.cycleDuration <= 0 || stats.yieldPerCycle <= 0) {
    return {
      cargoPerSecondBands: { p10: 0, p50: 0, p90: 0 },
      cargoFullTimeBands: { p10: 0, p50: 0, p90: 0 },
    }
  }

  const rng = mulberry32(seedFromString(seed))
  const cargoRates: number[] = []
  const cargoFullTimes: number[] = []

  for (let i = 0; i < iterations; i += 1) {
    let cargo = 0
    let cycles = 0
    while (cargo < cargoSize && cycles < 100000) {
      const result = simulateCycle(stats, turrets, rng)
      cargo += stats.yieldPerCycle * turrets + result.critBonusVolume
      cycles += 1
    }
    const time = cycles * stats.cycleDuration
    cargoFullTimes.push(time)
    cargoRates.push(time > 0 ? cargo / time : 0)
  }

  const cargoPerSecondBands = getBands(cargoRates)
  const cargoFullTimeBands = getBands(cargoFullTimes)
  const expectedCargoPerSecond = (stats.expectedCargoPerCycle * turrets) / stats.cycleDuration
  const expectedCargoFullTime = expectedCargoPerSecond > 0 ? cargoSize / expectedCargoPerSecond : 0

  return {
    cargoPerSecondBands: { ...cargoPerSecondBands, p50: expectedCargoPerSecond },
    cargoFullTimeBands: { ...cargoFullTimeBands, p50: expectedCargoFullTime },
  }
}
