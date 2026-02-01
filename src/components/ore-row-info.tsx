import * as React from 'react'
import { Grid } from '@mantine/core'

export const OreRowInfo: React.FC = () => {
  return (
    <Grid
      visibleFrom="sm"
      align="center"
      columns={33}
      gutter="xs"
      py={5}
      px={6}
      bg="dark.6"
      fz="sm"
      style={{ whiteSpace: 'nowrap', borderBottom: '1px solid var(--mantine-color-dark-4)' }}
    >
      <Grid.Col span={5}>Label</Grid.Col>
      <Grid.Col span={3} ta="center">
        Ore
      </Grid.Col>
      <Grid.Col span={3} ta="center">
        Ore count
      </Grid.Col>
      <Grid.Col span={3} ta="right">
        Ore size
      </Grid.Col>
      <Grid.Col span={2} ta="center">
        Turrets
      </Grid.Col>
      <Grid.Col span={4} ta="center">
        Residue (P10/50/90)
      </Grid.Col>
      <Grid.Col span={4} ta="center">
        Crit bonus (P10/50/90)
      </Grid.Col>
      <Grid.Col span={3} ta="center">
        Cycles (P10/50/90)
      </Grid.Col>
      <Grid.Col span={3} ta="center">
        Time (P10/50/90)
      </Grid.Col>
    </Grid>
  )
}
