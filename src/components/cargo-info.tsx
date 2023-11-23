import * as React from 'react'
import { Box, Button, Group, MantineColor, Text } from '@mantine/core'
import { TbCircleMinus } from 'react-icons/tb'
import { useCurrentCargo } from '../utils/use-global-store.ts'
import { ShipType } from '../utils/use-ship-store.ts'
import { Number } from './number.tsx'

export type CargoInfoProps = {
  ship: ShipType
}

export const CargoInfo: React.FC<CargoInfoProps> = ({ ship }) => {
  const { currentCargo, resetCurrentCargo } = useCurrentCargo()

  let color: MantineColor = 'green'
  if (currentCargo > ship.cargoSize * 0.95) {
    color = 'red'
  } else if (currentCargo > ship.cargoSize * 0.75) {
    color = 'yellow'
  }

  return (
    <Box my="md" p="md" bg="dark.5">
      <Group justify="space-between">
        <Box>
          <Button leftSection={<TbCircleMinus />} color="orange" variant="outline" onClick={() => resetCurrentCargo()}>
            Empty Cargo
          </Button>
          <Text mt={4} c="dimmed" fz="sm">
            Empty your cargo upon jetting into space or unloading at a station.
          </Text>
        </Box>
        <Box ta="right">
          <Text>Cargo used</Text>
          <Text size="lg" fw="bold" ff="monospace" c={color}>
            <Number value={currentCargo} maximumFractionDigits={0} /> m³
          </Text>
          <Text fz="xs" mt={-7} fw="bold" ff="monospace" c="dimmed">
            of <Number value={ship.cargoSize} /> m³
          </Text>
        </Box>
      </Group>
    </Box>
  )
}
