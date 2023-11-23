import { expect } from 'vitest'
import { parseScannerResult } from './parse-scanner-result.tsx'

describe('parseScannerResult', () => {
  it('should parse standard ores', () => {
    expect(
      parseScannerResult(
        `
Veldspar\t100\t10 m3\t1,234 m
Dark Ochre\t100\t10 m3\t1,234 m
White Glaze\t100\t10 m3\t1,234 m
Concentrated Veldspar\t100\t10 m3\t1,234 m
Dense Veldspar\t100\t10 m3\t1,234 m
Scordite\t100\t15 m3\t1,234 m
Condensed Scordite\t100\t15 m3\t1,234 m
Massive Scordite\t100\t15 m3\t1,234 m
Pyroxeres\t100\t30 m3\t1,234 m
Solid Pyroxeres\t100\t30 m3\t1,234 m
Viscous Pyroxeres\t100\t30 m3\t1,234 m
Plagioclase\t100\t35 m3\t1,234 m
Azure Plagioclase\t100\t35 m3\t1,234 m
Rich Plagioclase\t100\t35 m3\t1,234 m
Omber\t100\t60 m3\t1,234 m
Silvery Omber\t100\t60 m3\t1,234 m
Golden Omber\t100\t60 m3\t1,234 m
Kernite\t100\t120 m3\t1,234 m
Luminous Kernite\t100\t120 m3\t1,234 m
Fiery Kernite\t100\t120 m3\t1,234 m
Jaspet\t100\t200 m3\t1,234 m
Pure Jaspet\t100\t200 m3\t1,234 m
Pristine Jaspet\t100\t200 m3\t1,234 m
Hemorphite\t100\t300 m3\t1,234 m
Vivid Hemorphite\t100\t300 m3\t1,234 m
Radiant Hemorphite\t100\t300 m3\t1,234 m
Hedbergite\t100\t300 m3\t1,234 m
Vitric Hedbergite\t100\t300 m3\t1,234 m
Glazed Hedbergite\t100\t300 m3\t1,234 m
Gneiss\t100\t500 m3\t1,234 m
Iridescent Gneiss\t100\t500 m3\t1,234 m
Prismatic Gneiss\t100\t500 m3\t1,234 m
Dark Ochre\t100\t800 m3\t1,234 m
Onyx Ochre\t100\t800 m3\t1,234 m
Obsidian Ochre\t100\t800 m3\t1,234 m
Spodumain\t100\t1600 m3\t1,234 m
Bright Spodumain\t100\t1600 m3\t1,234 m
Gleaming Spodumain\t100\t1600 m3\t1,234 m
Crokite\t100\t1600 m3\t1,234 m
Sharp Crokite\t100\t1600 m3\t1,234 m
Crystalline Crokite\t100\t1600 m3\t1,234 m
Bistot\t100\t1600 m3\t1,234 m
Triclinic Bistot\t100\t1600 m3\t1,234 m
Monoclinic Bistot\t100\t1600 m3\t1,234 m
Arkonor\t100\t1600 m3\t1,234 m
Crimson Arkonor\t100\t1600 m3\t1,234 m
Prime Arkonor\t100\t1600 m3\t1,234 m
Mercoxit\t100\t4000 m3\t1,234 m
Magma Mercoxit\t100\t4000 m3\t1,234 m
Vitreous Mercoxit\t100\t4000 m3\t1,234 m
      `,
      ),
    ).toEqual([
      /* eslint-disable */
      { id: expect.any(String), name: 'Veldspar - 1,234 m', distance: 1234, oreType: 'Veldspar', oreAmount: 100 },
      { id: expect.any(String), name: 'Dark Ochre - 1,234 m', distance: 1234, oreType: 'Dark Ochre', oreAmount: 100 },
      { id: expect.any(String), name: 'White Glaze - 1,234 m', distance: 1234, oreType: 'White Glaze', oreAmount: 100 },
      { id: expect.any(String),  name: 'Concentrated Veldspar - 1,234 m',  distance: 1234,  oreType: 'Veldspar',  oreAmount: 100 },
      { id: expect.any(String), name: 'Dense Veldspar - 1,234 m', distance: 1234, oreType: 'Veldspar', oreAmount: 100 },
      { id: expect.any(String), name: 'Scordite - 1,234 m', distance: 1234, oreType: 'Scordite', oreAmount: 100 },
      { id: expect.any(String), name: 'Condensed Scordite - 1,234 m', distance: 1234, oreType: 'Scordite', oreAmount: 100 },
      { id: expect.any(String), name: 'Massive Scordite - 1,234 m', distance: 1234, oreType: 'Scordite', oreAmount: 100 },
      { id: expect.any(String), name: 'Pyroxeres - 1,234 m', distance: 1234, oreType: 'Pyroxeres', oreAmount: 100 },
      { id: expect.any(String), name: 'Solid Pyroxeres - 1,234 m', distance: 1234, oreType: 'Pyroxeres', oreAmount: 100 },
      { id: expect.any(String), name: 'Viscous Pyroxeres - 1,234 m', distance: 1234, oreType: 'Pyroxeres', oreAmount: 100 },
      { id: expect.any(String), name: 'Plagioclase - 1,234 m', distance: 1234, oreType: 'Plagioclase', oreAmount: 100 },
      { id: expect.any(String), name: 'Azure Plagioclase - 1,234 m', distance: 1234, oreType: 'Plagioclase', oreAmount: 100 },
      { id: expect.any(String), name: 'Rich Plagioclase - 1,234 m', distance: 1234, oreType: 'Plagioclase', oreAmount: 100 },
      { id: expect.any(String), name: 'Omber - 1,234 m', distance: 1234, oreType: 'Omber', oreAmount: 100 },
      { id: expect.any(String), name: 'Silvery Omber - 1,234 m', distance: 1234, oreType: 'Omber', oreAmount: 100 },
      { id: expect.any(String), name: 'Golden Omber - 1,234 m', distance: 1234, oreType: 'Omber', oreAmount: 100 },
      { id: expect.any(String), name: 'Kernite - 1,234 m', distance: 1234, oreType: 'Kernite', oreAmount: 100 },
      { id: expect.any(String), name: 'Luminous Kernite - 1,234 m', distance: 1234, oreType: 'Kernite', oreAmount: 100 },
      { id: expect.any(String), name: 'Fiery Kernite - 1,234 m', distance: 1234, oreType: 'Kernite', oreAmount: 100 },
      { id: expect.any(String), name: 'Jaspet - 1,234 m', distance: 1234, oreType: 'Jaspet', oreAmount: 100 },
      { id: expect.any(String), name: 'Pure Jaspet - 1,234 m', distance: 1234, oreType: 'Jaspet', oreAmount: 100 },
      { id: expect.any(String), name: 'Pristine Jaspet - 1,234 m', distance: 1234, oreType: 'Jaspet', oreAmount: 100 },
      { id: expect.any(String), name: 'Hemorphite - 1,234 m', distance: 1234, oreType: 'Hemorphite', oreAmount: 100 },
      { id: expect.any(String), name: 'Vivid Hemorphite - 1,234 m', distance: 1234, oreType: 'Hemorphite', oreAmount: 100 },
      { id: expect.any(String), name: 'Radiant Hemorphite - 1,234 m', distance: 1234, oreType: 'Hemorphite', oreAmount: 100 },
      { id: expect.any(String), name: 'Hedbergite - 1,234 m', distance: 1234, oreType: 'Hedbergite', oreAmount: 100 },
      { id: expect.any(String), name: 'Vitric Hedbergite - 1,234 m', distance: 1234, oreType: 'Hedbergite', oreAmount: 100 },
      { id: expect.any(String), name: 'Glazed Hedbergite - 1,234 m', distance: 1234, oreType: 'Hedbergite', oreAmount: 100 },
      { id: expect.any(String), name: 'Gneiss - 1,234 m', distance: 1234, oreType: 'Gneiss', oreAmount: 100 },
      { id: expect.any(String), name: 'Iridescent Gneiss - 1,234 m', distance: 1234, oreType: 'Gneiss', oreAmount: 100 },
      { id: expect.any(String), name: 'Prismatic Gneiss - 1,234 m', distance: 1234, oreType: 'Gneiss', oreAmount: 100 },
      { id: expect.any(String), name: 'Dark Ochre - 1,234 m', distance: 1234, oreType: 'Dark Ochre', oreAmount: 100 },
      { id: expect.any(String), name: 'Onyx Ochre - 1,234 m', distance: 1234, oreType: 'Dark Ochre', oreAmount: 100 },
      { id: expect.any(String), name: 'Obsidian Ochre - 1,234 m', distance: 1234, oreType: 'Dark Ochre', oreAmount: 100 },
      { id: expect.any(String), name: 'Spodumain - 1,234 m', distance: 1234, oreType: 'Spodumain', oreAmount: 100 },
      { id: expect.any(String), name: 'Bright Spodumain - 1,234 m', distance: 1234, oreType: 'Spodumain', oreAmount: 100 },
      { id: expect.any(String), name: 'Gleaming Spodumain - 1,234 m', distance: 1234, oreType: 'Spodumain', oreAmount: 100 },
      { id: expect.any(String), name: 'Crokite - 1,234 m', distance: 1234, oreType: 'Crokite', oreAmount: 100 },
      { id: expect.any(String), name: 'Sharp Crokite - 1,234 m', distance: 1234, oreType: 'Crokite', oreAmount: 100 },
      { id: expect.any(String), name: 'Crystalline Crokite - 1,234 m', distance: 1234, oreType: 'Crokite', oreAmount: 100 },
      { id: expect.any(String), name: 'Bistot - 1,234 m', distance: 1234, oreType: 'Bistot', oreAmount: 100 },
      { id: expect.any(String), name: 'Triclinic Bistot - 1,234 m', distance: 1234, oreType: 'Bistot', oreAmount: 100 },
      { id: expect.any(String), name: 'Monoclinic Bistot - 1,234 m', distance: 1234, oreType: 'Bistot', oreAmount: 100 },
      { id: expect.any(String), name: 'Arkonor - 1,234 m', distance: 1234, oreType: 'Arkonor', oreAmount: 100 },
      { id: expect.any(String), name: 'Crimson Arkonor - 1,234 m', distance: 1234, oreType: 'Arkonor', oreAmount: 100 },
      { id: expect.any(String), name: 'Prime Arkonor - 1,234 m', distance: 1234, oreType: 'Arkonor', oreAmount: 100 },
      { id: expect.any(String), name: 'Mercoxit - 1,234 m', distance: 1234, oreType: 'Mercoxit', oreAmount: 100 },
      { id: expect.any(String), name: 'Magma Mercoxit - 1,234 m', distance: 1234, oreType: 'Mercoxit', oreAmount: 100 },
      { id: expect.any(String), name: 'Vitreous Mercoxit - 1,234 m', distance: 1234, oreType: 'Mercoxit', oreAmount: 100 },
      /* eslint-enable */
    ])
  })

  it('should parse some data', () => {
    expect(
      parseScannerResult(
        /* eslint-disable */
        `
Solid Pyroxeres\t20 834\t6 250 m3\t4 801 m
Solid Pyroxeres\t22 478\t6 743 m3\t6 431 m
Solid Pyroxeres\t24 325\t7 297 m3\t13 km
Solid Pyroxeres\t3 230\t969 m3\t15 km
      `,
        /* eslint-enable */
      ),
    ).toEqual([
      /* eslint-disable */
      { id: expect.any(String), name: 'Solid Pyroxeres - 4 801 m', distance: 4801, oreType: 'Pyroxeres', oreAmount: 20834 },
      { id: expect.any(String), name: 'Solid Pyroxeres - 6 431 m', distance: 6431, oreType: 'Pyroxeres', oreAmount: 22478 },
      { id: expect.any(String), name: 'Solid Pyroxeres - 13 km', distance: 13, oreType: 'Pyroxeres', oreAmount: 24325 },
      { id: expect.any(String), name: 'Solid Pyroxeres - 15 km', distance: 15, oreType: 'Pyroxeres', oreAmount: 3230 },
      /* eslint-enable */
    ])
  })
})
