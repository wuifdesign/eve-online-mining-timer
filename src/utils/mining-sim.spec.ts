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
  it('produces stable quantile bands for mining depletion', () => {
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
    expect(bandsA.cyclesBands.p10).toBeCloseTo(bandsB.cyclesBands.p10, 6)
    expect(bandsA.cyclesBands.p50).toBeCloseTo(bandsB.cyclesBands.p50, 6)
    expect(bandsA.cyclesBands.p90).toBeCloseTo(bandsB.cyclesBands.p90, 6)
    expect(bandsA.timeBands.p10).toBeLessThanOrEqual(bandsA.timeBands.p50)
    expect(bandsA.timeBands.p50).toBeLessThanOrEqual(bandsA.timeBands.p90)
    expect(bandsA.timeBands.p50).toBeCloseTo(bandsA.deterministicTime, 6)
    expect(bandsA.critBonusTotalBands.p50).toBeGreaterThanOrEqual(0)
  })

  it('produces stable quantile bands for cargo fill', () => {
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
    expect(bandsA.cargoFullTimeBands.p10).toBeCloseTo(bandsB.cargoFullTimeBands.p10, 6)
    expect(bandsA.cargoFullTimeBands.p50).toBeCloseTo(bandsB.cargoFullTimeBands.p50, 6)
    expect(bandsA.cargoFullTimeBands.p90).toBeCloseTo(bandsB.cargoFullTimeBands.p90, 6)
    expect(bandsA.cargoPerSecondBands.p10).toBeLessThanOrEqual(bandsA.cargoPerSecondBands.p50)
    expect(bandsA.cargoPerSecondBands.p50).toBeLessThanOrEqual(bandsA.cargoPerSecondBands.p90)
  })
})
