import { describe, expect, it } from 'vitest'
import { simulateCargoBands, simulateMiningBands } from './mining-sim.ts'

const stats = {
  yieldPerCycle: 100,
  cycleDuration: 60,
  residueChance: 0.2,
  residueMultiplier: 1,
  expectedResiduePerCycle: 20,
  critChance: 0.1,
  critBonusMultiplier: 2,
  expectedCritBonusPerCycle: 20,
  expectedCargoPerCycle: 120,
}

describe('mining-sim', () => {
  it('produces stable mean/std bands for mining depletion', () => {
    const bandsA = simulateMiningBands({
      oreAmount: 1000,
      oreUnitSize: 1,
      stats,
      turrets: 2,
      iterations: 300,
      seed: 'test-mining',
    })
    const bandsB = simulateMiningBands({
      oreAmount: 1000,
      oreUnitSize: 1,
      stats,
      turrets: 2,
      iterations: 300,
      seed: 'test-mining',
    })
    expect(bandsA.cyclesBands.low).toBeCloseTo(bandsB.cyclesBands.low, 6)
    expect(bandsA.cyclesBands.avg).toBeCloseTo(bandsB.cyclesBands.avg, 6)
    expect(bandsA.cyclesBands.high).toBeCloseTo(bandsB.cyclesBands.high, 6)
    expect(bandsA.cyclesBands.low).toBeLessThanOrEqual(bandsA.cyclesBands.avg)
    expect(bandsA.cyclesBands.avg).toBeLessThanOrEqual(bandsA.cyclesBands.high)
    expect(bandsA.timeBands.low).toBeLessThanOrEqual(bandsA.timeBands.avg)
    expect(bandsA.timeBands.avg).toBeLessThanOrEqual(bandsA.timeBands.high)
    expect(bandsA.timeBands.avg).toBeCloseTo(bandsA.deterministicTime, 6)
    expect(bandsA.critBonusTotalBands.avg).toBeGreaterThanOrEqual(0)
  })

  it('rolls crit and residue per turret, narrowing bands versus one big turret', () => {
    const singleTurret = simulateMiningBands({
      oreAmount: 20000,
      oreUnitSize: 1,
      stats: { ...stats, yieldPerCycle: 400, expectedResiduePerCycle: 80, expectedCritBonusPerCycle: 80 },
      turrets: 1,
      iterations: 300,
      seed: 'test-per-turret',
    })
    const fourTurrets = simulateMiningBands({
      oreAmount: 20000,
      oreUnitSize: 1,
      stats,
      turrets: 4,
      iterations: 300,
      seed: 'test-per-turret',
    })
    const spread = (bands: { low: number; high: number }) => bands.high - bands.low
    expect(fourTurrets.deterministicCycles).toBeCloseTo(singleTurret.deterministicCycles, 6)
    expect(spread(fourTurrets.residueTotalBands)).toBeLessThan(spread(singleTurret.residueTotalBands))
    expect(spread(fourTurrets.critBonusTotalBands)).toBeLessThan(spread(singleTurret.critBonusTotalBands))
  })

  it('produces stable mean/std bands for cargo fill', () => {
    const bandsA = simulateCargoBands({
      cargoSize: 10000,
      stats,
      turrets: 2,
      iterations: 300,
      seed: 'test-cargo',
    })
    const bandsB = simulateCargoBands({
      cargoSize: 10000,
      stats,
      turrets: 2,
      iterations: 300,
      seed: 'test-cargo',
    })
    expect(bandsA.cargoFullTimeBands.low).toBeCloseTo(bandsB.cargoFullTimeBands.low, 6)
    expect(bandsA.cargoFullTimeBands.avg).toBeCloseTo(bandsB.cargoFullTimeBands.avg, 6)
    expect(bandsA.cargoFullTimeBands.high).toBeCloseTo(bandsB.cargoFullTimeBands.high, 6)
    expect(bandsA.cargoPerSecondBands.low).toBeLessThanOrEqual(bandsA.cargoPerSecondBands.avg)
    expect(bandsA.cargoPerSecondBands.avg).toBeLessThanOrEqual(bandsA.cargoPerSecondBands.high)
    expect(bandsA.cargoFullTimeBands.low).toBeLessThanOrEqual(bandsA.cargoFullTimeBands.avg)
    expect(bandsA.cargoFullTimeBands.avg).toBeLessThanOrEqual(bandsA.cargoFullTimeBands.high)
  })

  it('collapses the bands onto the average when nothing is random', () => {
    const noRng = {
      ...stats,
      residueChance: 0,
      expectedResiduePerCycle: 0,
      critChance: 0,
      expectedCritBonusPerCycle: 0,
      expectedCargoPerCycle: 100,
    }
    // 1050 m³ at 200 m³ per cycle: 5.25 cycles, not 6
    const mining = simulateMiningBands({ oreAmount: 1050, oreUnitSize: 1, stats: noRng, turrets: 2, iterations: 10 })
    expect(mining.cyclesBands.low).toBeCloseTo(5.25, 6)
    expect(mining.cyclesBands.high).toBeCloseTo(5.25, 6)
    expect(mining.timeBands.high).toBeCloseTo(mining.deterministicTime, 6)

    const cargo = simulateCargoBands({ cargoSize: 1050, stats: noRng, turrets: 2, iterations: 10 })
    expect(cargo.cargoFullTimeBands.low).toBeCloseTo(cargo.cargoFullTimeBands.avg, 6)
    expect(cargo.cargoFullTimeBands.high).toBeCloseTo(cargo.cargoFullTimeBands.avg, 6)
  })
})
