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
    expect(bandsA.timeBands.low).toBeLessThanOrEqual(bandsA.timeBands.avg)
    expect(bandsA.timeBands.avg).toBeLessThanOrEqual(bandsA.timeBands.high)
    expect(bandsA.timeBands.avg).toBeCloseTo(bandsA.deterministicTime, 6)
    expect(bandsA.critBonusTotalBands.avg).toBeGreaterThanOrEqual(0)
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
})
