import * as React from 'react'
import { ActionIcon, Grid, Group, NumberInput, Select, TextInput } from '@mantine/core'
import { TbPlayerPause, TbPlayerPlay, TbTrash } from 'react-icons/tb'
import { OreType } from '../@types/ore.type.ts'
import { oreNames, oreSizes } from '../config/ores.ts'
import { ShipType } from '../utils/use-ship-store.ts'
import { secToTime } from '../utils/sec-to-time/sec-to-time.tsx'
import { GlobalStoreRowType, useOreRows } from '../utils/use-global-store.ts'
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

  const oreSize = data.oreType ? oreSizes[data.oreType] * data.oreAmount : 0
  const circles = oreSize / (ship.yieldPerTurret * data.turrets)
  const durations = Math.round(circles * ship.turretCircleDuration)

  const turretSelect: string[] = []
  for (let i = 1; i <= ship.numberOfTurrets; i++) {
    turretSelect.push(i.toString())
  }

  return (
    <Grid align="center" columns={25} gutter="xs" py={5} px={6} bg={index % 2 !== 0 ? 'dark.6' : undefined}>
      <Grid.Col span={6}>
        <TextInput required size="xs" defaultValue={data.name} />
      </Grid.Col>
      <Grid.Col span={4}>
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
      <Grid.Col span={3}>
        <NumberInput
          required
          size="xs"
          thousandSeparator=","
          allowDecimal={false}
          allowNegative={false}
          value={data.oreAmount}
          onChange={(oreAmount) => {
            updateOreRow(data.id, { oreAmount: parseInt(oreAmount as any) })
          }}
        />
      </Grid.Col>
      <Grid.Col span={3} ff="monospace" fz="xs" ta="right" style={{ whiteSpace: 'nowrap' }}>
        <Number maximumFractionDigits={0} value={oreSize} /> m³
      </Grid.Col>
      <Grid.Col span={2}>
        <Select
          required
          size="xs"
          data={turretSelect}
          onChange={(value) => updateOreRow(data.id, { turrets: parseInt(value as any) })}
          value={data.turrets.toString()}
        />
      </Grid.Col>
      <Grid.Col span={2} ff="monospace" fz="xs" ta="center">
        <Number maximumFractionDigits={2} value={circles} />
      </Grid.Col>
      <Grid.Col span={2} ff="monospace" fz="sm" fw="bold" ta="center">
        {secToTime(durations)}
      </Grid.Col>
      <Grid.Col span={3} ff="monospace" fz="sm">
        <Group gap="xs" justify="flex-end">
          {data.running ? (
            <ActionIcon color="yellow" onClick={() => updateOreRow(data.id, { running: false })} title="Pause">
              <TbPlayerPause />
            </ActionIcon>
          ) : (
            <ActionIcon color="green" onClick={() => updateOreRow(data.id, { running: true })} title="Play">
              <TbPlayerPlay />
            </ActionIcon>
          )}
          <ActionIcon color="red" onClick={() => deleteOreRow(data.id)} title="Delete Row">
            <TbTrash />
          </ActionIcon>
        </Group>
      </Grid.Col>
    </Grid>
  )
}
