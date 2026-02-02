import * as React from 'react'
import { Grid, Tooltip } from '@mantine/core'

export const OreRowInfo: React.FC = () => {
  return (
    <Grid
      visibleFrom="sm"
      align="center"
      columns={45}
      gutter="xs"
      py={7}
      px={8}
      bg="dark.6"
      fz="sm"
      style={{ borderBottom: '1px solid var(--mantine-color-dark-4)' }}
    >
      <Grid.Col span={9}>Label</Grid.Col>
      <Grid.Col span={2} ta="center">
        Ore
      </Grid.Col>
      <Grid.Col span={5} ta="center">
        Ore count
      </Grid.Col>
      <Grid.Col span={4} ta="right">
        Ore size
      </Grid.Col>
      <Grid.Col span={3} ta="center">
        Turrets
      </Grid.Col>
      <Grid.Col span={3} ta="center">
        <Tooltip label="Total m³ (low/avg/high = mean ± 1σ) for the full ore stack">
          <span>Residue total (Low/Avg/High)</span>
        </Tooltip>
      </Grid.Col>
      <Grid.Col span={4} ta="center">
        <Tooltip label="Total m³ (low/avg/high = mean ± 1σ) for the full ore stack">
          <span>Crit bonus total (Low/Avg/High)</span>
        </Tooltip>
      </Grid.Col>
      <Grid.Col span={4} ta="center">
        Cycles (Low/Avg/High)
      </Grid.Col>
      <Grid.Col span={7} ta="center">
        Time (Low/Avg/High)
      </Grid.Col>
    </Grid>
  )
}
