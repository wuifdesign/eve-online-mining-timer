import { describe, expect, it } from 'vitest'
import { getCompressionRatio } from '../config/ores.ts'
import { getMiningStats } from './mining-math.ts'
import { ShipType } from './use-ship-store.ts'

const ship: ShipType = {
  name: 'Test Ship',
  cargoSize: 10000,
  yieldPerTurret: 100,
  turretCycleDuration: 45,
  numberOfTurrets: 2,
  splitTurrets: true,
  residueChancePercent: 20,
  residueMultiplier: 1,
  critChancePercent: 10,
  critBonusYieldPercent: 200,
}

describe('getMiningStats', () => {
  it('applies the ship crit chance', () => {
    const stats = getMiningStats(ship)
    expect(stats.critChance).toBeCloseTo(0.1)
    expect(stats.expectedCargoPerCycle).toBeCloseTo(120)
  })

  it('scales residue by the residue multiplier', () => {
    const stats = getMiningStats({ ...ship, residueMultiplier: 2.5 })
    expect(stats.expectedResiduePerCycle).toBeCloseTo(50)
    expect(stats.asteroidDepletionPerCycle).toBeCloseTo(150)
  })

  it('falls back to 1x residue for ships saved without a multiplier', () => {
    const { residueMultiplier: _, ...oldShip } = ship
    expect(getMiningStats(oldShip as ShipType).residueMultiplier).toBe(1)
  })
})

describe('getCompressionRatio', () => {
  it('compresses ice 10x and ore 100x', () => {
    expect(getCompressionRatio('Blue Ice')).toBe(10)
    expect(getCompressionRatio('Veldspar')).toBe(100)
    expect(getCompressionRatio('Bitumens')).toBe(100)
    expect(getCompressionRatio('Prismaticite')).toBe(100)
  })
})
