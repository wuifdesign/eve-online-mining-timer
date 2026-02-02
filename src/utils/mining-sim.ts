import { MiningStats } from './mining-types.ts'

export type StatBands = {
  low: number
  avg: number
  high: number
}

export type MiningBands = {
  residueTotalBands: StatBands
  critBonusTotalBands: StatBands
  cyclesBands: StatBands
  timeBands: StatBands
  deterministicCycles: number
  deterministicTime: number
}

export type CargoBands = {
  cargoPerSecondBands: StatBands
  cargoFullTimeBands: StatBands
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

const getBands = (values: number[], clampMin = 0): StatBands => {
  if (values.length === 0) {
    return {
      low: 0,
      avg: 0,
      high: 0,
    }
  }
  const avg = values.reduce((sum, value) => sum + value, 0) / values.length
  const variance = values.reduce((sum, value) => sum + (value - avg) ** 2, 0) / values.length
  const stdDev = Math.sqrt(variance)
  const low = Math.max(clampMin, avg - stdDev)
  const high = Math.max(clampMin, avg + stdDev)
  return {
    low,
    avg,
    high,
  }
}

const clampBandsToAvg = (bands: StatBands, avg: number): StatBands => {
  return {
    low: Math.min(bands.low, avg),
    avg,
    high: Math.max(bands.high, avg),
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
      residueTotalBands: { low: 0, avg: 0, high: 0 },
      critBonusTotalBands: { low: 0, avg: 0, high: 0 },
      cyclesBands: { low: 0, avg: 0, high: 0 },
      timeBands: { low: 0, avg: 0, high: 0 },
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

  const deterministic = getDeterministicCycles({ oreAmount, oreUnitSize, stats, turrets })
  const expectedCritTotal = stats.expectedCritBonusPerCycle * turrets * deterministic.cycles
  const expectedResidueTotal = stats.expectedResiduePerCycle * turrets * deterministic.cycles
  const residueTotalBands = clampBandsToAvg(getBands(residueTotals), expectedResidueTotal)
  const critBonusTotalBands = clampBandsToAvg(getBands(critTotals), expectedCritTotal)
  const cyclesBands = clampBandsToAvg(getBands(cycleTotals), deterministic.cycles)
  const timeBands = {
    low: cyclesBands.low * stats.cycleDuration,
    avg: deterministic.time,
    high: cyclesBands.high * stats.cycleDuration,
  }

  return {
    residueTotalBands,
    critBonusTotalBands,
    cyclesBands,
    timeBands: clampBandsToAvg(timeBands, deterministic.time),
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
      cargoPerSecondBands: { low: 0, avg: 0, high: 0 },
      cargoFullTimeBands: { low: 0, avg: 0, high: 0 },
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
    cargoPerSecondBands: {
      low: Math.min(cargoPerSecondBands.low, expectedCargoPerSecond),
      avg: expectedCargoPerSecond,
      high: Math.max(cargoPerSecondBands.high, expectedCargoPerSecond),
    },
    cargoFullTimeBands: {
      low: Math.min(cargoFullTimeBands.low, expectedCargoFullTime),
      avg: expectedCargoFullTime,
      high: Math.max(cargoFullTimeBands.high, expectedCargoFullTime),
    },
  }
}
