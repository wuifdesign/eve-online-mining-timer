import { describe, expect, it } from 'vitest'
import { migrateShip, ShipType } from './use-ship-store.ts'

const ship: ShipType = {
  name: 'Test Ship',
  cargoSize: 10000,
  yieldPerTurret: 100,
  turretCycleDuration: 45,
  numberOfTurrets: 2,
  splitTurrets: true,
  residueChancePercent: 0,
  residueMultiplier: 1,
  critChancePercent: 1,
  critBonusYieldPercent: 200,
}

describe('migrateShip', () => {
  it('keeps a current ship as it is', () => {
    expect(migrateShip(ship)).toEqual(ship)
  })

  it('moves the old cycle field to the new name', () => {
    const { turretCycleDuration: _, ...rest } = ship
    const stored = { ...rest, turretCircleDuration: 37.5 } as unknown as ShipType
    const migrated = migrateShip(stored)
    expect(migrated.turretCycleDuration).toBe(37.5)
    expect(migrated).not.toHaveProperty('turretCircleDuration')
  })

  it('replaces the untouched pre-Catalyst default', () => {
    const { turretCycleDuration: _, ...rest } = ship
    const stored = { ...rest, yieldPerTurret: 1300, turretCircleDuration: 180 } as unknown as ShipType
    const migrated = migrateShip(stored)
    expect(migrated.yieldPerTurret).toBe(325)
    expect(migrated.turretCycleDuration).toBe(45)
  })
})
