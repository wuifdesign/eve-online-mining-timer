import { MiningStats } from './mining-types.ts'
import { ShipType } from './use-ship-store.ts'

// 1x for every module and Type A/B crystal, Type C crystals raise it
const BASE_RESIDUE_MULTIPLIER = 1
const BASE_CRIT_BONUS_MULTIPLIER = 2

const clamp = (value: number, min: number, max: number) => {
  return Math.min(max, Math.max(min, value))
}

export const getMiningStats = (
  ship: ShipType,
): MiningStats & {
  baseYieldPerCycle: number
  baseCycleDuration: number
  yieldPerCycle: number
  cycleDuration: number
  residueChance: number
  residueMultiplier: number
  expectedResiduePerCycle: number
  asteroidDepletionPerCycle: number
  critChance: number
  critBonusMultiplier: number
  expectedCritBonusPerCycle: number
  expectedCargoPerCycle: number
  depletionPerSecond: number
  cargoPerSecond: number
} => {
  const baseYieldPerCycle = ship.yieldPerTurret
  const baseCycleDuration = ship.turretCycleDuration

  const yieldPerCycle = baseYieldPerCycle
  const cycleDuration = baseCycleDuration

  const residueChance = clamp((ship.residueChancePercent ?? 0) / 100, 0, 1)
  // ships saved before the field existed fall back to the base value
  const residueMultiplier = Math.max(0, ship.residueMultiplier ?? BASE_RESIDUE_MULTIPLIER)

  const expectedResiduePerCycle = yieldPerCycle * residueChance * residueMultiplier
  const asteroidDepletionPerCycle = yieldPerCycle + expectedResiduePerCycle

  const critChance = clamp((ship.critChancePercent ?? 0) / 100, 0, 1)
  const critBonusMultiplier = Math.max(
    0,
    typeof ship.critBonusYieldPercent === 'number' ? ship.critBonusYieldPercent / 100 : BASE_CRIT_BONUS_MULTIPLIER,
  )
  const expectedCritBonusPerCycle = yieldPerCycle * critChance * critBonusMultiplier
  const expectedCargoPerCycle = yieldPerCycle + expectedCritBonusPerCycle

  const depletionPerSecond = cycleDuration > 0 ? asteroidDepletionPerCycle / cycleDuration : 0
  const cargoPerSecond = cycleDuration > 0 ? expectedCargoPerCycle / cycleDuration : 0

  return {
    baseYieldPerCycle,
    baseCycleDuration,
    yieldPerCycle,
    cycleDuration,
    residueChance,
    residueMultiplier,
    expectedResiduePerCycle,
    asteroidDepletionPerCycle,
    critChance,
    critBonusMultiplier,
    expectedCritBonusPerCycle,
    expectedCargoPerCycle,
    depletionPerSecond,
    cargoPerSecond,
  }
}
