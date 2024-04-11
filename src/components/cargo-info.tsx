import * as React from 'react'
import { Box, Button, Grid, MantineColor, Text } from '@mantine/core'
import { TbCircleMinus, TbResize } from 'react-icons/tb'
import { useCurrentCargo } from '../utils/use-global-store.ts'
import { ShipType } from '../utils/use-ship-store.ts'
import { Number } from './number.tsx'

export type CargoInfoProps = {
  ship: ShipType
}

export const CargoInfo: React.FC<CargoInfoProps> = ({ ship }) => {
  const { currentCargo, resetCurrentCargo, compressCurrentCargo } = useCurrentCargo()

  let color: MantineColor = 'green'
  if (currentCargo > ship.cargoSize * 0.95) {
    color = 'red'
  } else if (currentCargo > ship.cargoSize * 0.75) {
    color = 'yellow'
  }

  return (
    <Box my="md" p="md" bg="dark.5">
      <Grid justify="space-between">
        <Grid.Col span={{ base: 12, md: 6 }} ta={{ base: 'center', md: 'right' }} order={{ base: 1, md: 2 }}>
          <Text>Cargo used</Text>
          <Text size="lg" fw="bold" ff="monospace" c={color}>
            <Number value={currentCargo} maximumFractionDigits={0} /> m³
          </Text>
          <Text fz="xs" mt={-7} fw="bold" ff="monospace" c="dimmed">
            of <Number value={ship.cargoSize} /> m³
          </Text>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }} ta={{ base: 'center', md: 'left' }} order={{ base: 2, md: 1 }}>
          <Button leftSection={<TbCircleMinus />} color="orange" variant="outline" onClick={() => resetCurrentCargo()}>
            Empty Cargo
          </Button>
          <Button
            leftSection={<TbResize />}
            ml={5}
            color="orange"
            variant="outline"
            onClick={() => compressCurrentCargo()}
          >
            Compress Cargo
          </Button>
          <Text mt={4} c="dimmed" fz="sm">
            Empty your cargo upon jetting into space or unloading at a station. Compress your cargo if you have an Orca
            or Porpoise on your fleet you can reduce cargo size by x100
          </Text>
        </Grid.Col>
      </Grid>
    </Box>
  )
}
