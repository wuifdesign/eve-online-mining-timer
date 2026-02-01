import * as React from 'react'
import { ActionIcon, Grid, Group, NumberInput, Select, TextInput } from '@mantine/core'
import { TbPlayerPause, TbPlayerPlay, TbTrash } from 'react-icons/tb'
import { OreType } from '../@types/ore.type.ts'
import { oreNames, oreSizes } from '../config/ores.ts'
import { ShipType } from '../utils/use-ship-store.ts'
import { secToTime } from '../utils/sec-to-time/sec-to-time.tsx'
import { GlobalStoreRowType, useOreRows } from '../utils/use-global-store.ts'
import { formatNumber } from '../utils/format-number/format-number.tsx'
import { getMiningStats } from '../utils/mining-math.ts'
import { simulateMiningBands } from '../utils/mining-sim.ts'
import { Number } from './number.tsx'

export type OreRowType = {
  name: string
  oreType: OreType
  oreCount: number
}

export type OreRowProps = {
  index: number
  ship: ShipType
  data: GlobalStoreRowType
}

const oreSelectData = oreNames.map((value) => {
  return {
    value,
    label: value,
  }
})

export const OreRow: React.FC<OreRowProps> = ({ index, ship, data }) => {
  const { updateOreRow, deleteOreRow } = useOreRows()
  const stats = getMiningStats(ship)

  const oreUnitSize = data.oreType ? oreSizes[data.oreType] : 0
  const oreSize = oreUnitSize * data.oreAmount
  const bands = React.useMemo(
    () =>
      simulateMiningBands({
        oreAmount: data.oreAmount,
        oreUnitSize,
        stats,
        turrets: data.turrets,
        seed: data.id,
      }),
    [data.oreAmount, data.id, data.turrets, oreUnitSize, stats],
  )
  const formatBand = (band: { p10: number; p50: number; p90: number }, options = {}) => {
    return `${formatNumber(band.p10, options)} / ${formatNumber(band.p50, options)} / ${formatNumber(band.p90, options)}`
  }
  const formatTimeBand = (band: { p10: number; p50: number; p90: number }) => {
    return `${secToTime(band.p10)} / ${secToTime(band.p50)} / ${secToTime(band.p90)}`
  }
  const turretSelect: string[] = []
  for (let i = 1; i <= ship.numberOfTurrets; i++) {
    turretSelect.push(i.toString())
  }

  return (
    <Grid align="center" columns={45} gutter="xs" py={5} px={6} bg={index % 2 !== 0 ? 'dark.6' : undefined}>
      <Grid.Col visibleFrom="sm" span={9}>
        <TextInput required size="xs" defaultValue={data.name} />
      </Grid.Col>
      <Grid.Col span={{ base: 8, sm: 6 }}>
        <Select
          size="xs"
          searchable
          data={oreSelectData}
          required
          onChange={(type) => {
            updateOreRow(data.id, { oreType: type as OreType })
          }}
          value={data.oreType}
        />
      </Grid.Col>
      <Grid.Col span={{ base: 7, sm: 4 }}>
        <NumberInput
          required
          size="xs"
          thousandSeparator=","
          allowDecimal={false}
          allowNegative={false}
          value={data.oreAmount}
          onChange={(oreAmount) => {
            updateOreRow(data.id, { oreAmount: parseInt((oreAmount || 0) as any) })
          }}
        />
      </Grid.Col>
      <Grid.Col span={4} visibleFrom="sm" ff="monospace" fz="xs" ta="right" style={{ whiteSpace: 'nowrap' }}>
        <Number maximumFractionDigits={0} value={oreSize} /> m³
      </Grid.Col>
      <Grid.Col span={{ base: 4, sm: 3 }}>
        <Select
          required
          size="xs"
          data={turretSelect}
          onChange={(value) => updateOreRow(data.id, { turrets: parseInt(value as any) })}
          value={data.turrets.toString()}
        />
      </Grid.Col>
      <Grid.Col span={3} visibleFrom="sm" ff="monospace" fz="xs" ta="center">
        {formatBand(bands.residueTotalBands, { maximumFractionDigits: 1 })}
      </Grid.Col>
      <Grid.Col span={3} visibleFrom="sm" ff="monospace" fz="xs" ta="center">
        {formatBand(bands.critBonusTotalBands, { maximumFractionDigits: 1 })}
      </Grid.Col>
      <Grid.Col span={3} visibleFrom="sm" ff="monospace" fz="xs" ta="center">
        {formatBand(bands.cyclesBands, { maximumFractionDigits: 2 })}
      </Grid.Col>
      <Grid.Col span={5} visibleFrom="sm" ff="monospace" fz="xs" fw="bold" ta="center">
        {formatTimeBand(bands.timeBands)}
      </Grid.Col>
      <Grid.Col span={{ base: 6, sm: 4 }} ff="monospace" fz="sm">
        <Group gap="xs" justify="flex-end">
          {data.oreAmount > 0 && (
            <>
              {data.running ? (
                <ActionIcon color="yellow" onClick={() => updateOreRow(data.id, { running: false })} title="Pause">
                  <TbPlayerPause />
                </ActionIcon>
              ) : (
                <ActionIcon color="green" onClick={() => updateOreRow(data.id, { running: true })} title="Play">
                  <TbPlayerPlay />
                </ActionIcon>
              )}
            </>
          )}
          <ActionIcon color="red" onClick={() => deleteOreRow(data.id)} title="Delete Row">
            <TbTrash />
          </ActionIcon>
        </Group>
      </Grid.Col>
    </Grid>
  )
}
