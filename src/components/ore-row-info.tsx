import * as React from 'react'
import { Grid } from '@mantine/core'

export const OreRowInfo: React.FC = () => {
  return (
    <Grid
      visibleFrom="sm"
      align="center"
      columns={25}
      gutter="xs"
      py={5}
      px={6}
      bg="dark.6"
      fz="sm"
      style={{ whiteSpace: 'nowrap', borderBottom: '1px solid var(--mantine-color-dark-4)' }}
    >
      <Grid.Col span={6}>Label</Grid.Col>
      <Grid.Col span={4} ta="center">
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
      <Grid.Col span={2} ta="center">
        Circles
      </Grid.Col>
      <Grid.Col span={2} ta="center">
        Time
      </Grid.Col>
    </Grid>
  )
}
