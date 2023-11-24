import * as React from 'react'
import { Box, Button, Group, NumberInput, SimpleGrid, Text } from '@mantine/core'
import { TbRepeat } from 'react-icons/tb'
import { useShipStore } from '../utils/use-ship-store.ts'
import { secToTime } from '../utils/sec-to-time/sec-to-time.tsx'
import { Number } from './number.tsx'

export const ShipConfig: React.FC = () => {
  const { ship, setShip, resetShip } = useShipStore()

  const yieldPerSec = (ship.yieldPerTurret / ship.turretCircleDuration) * ship.numberOfTurrets
  const cargoFullDuration = ship.cargoSize / yieldPerSec

  return (
    <Box my="md" p="md" bg="dark.5">
      <SimpleGrid cols={{ base: 2, sm: 4 }}>
        <NumberInput
          label="Yield/turret"
          required
          value={ship.yieldPerTurret}
          thousandSeparator=","
          suffix=" m³"
          onChange={(value) => {
            setShip({ ...ship, yieldPerTurret: parseInt(value as any) })
          }}
        />
        <NumberInput
          label="Circle duration"
          required
          value={ship.turretCircleDuration}
          thousandSeparator=","
          suffix=" sec"
          onChange={(value) => {
            setShip({ ...ship, turretCircleDuration: parseInt(value as any) })
          }}
        />
        <NumberInput
          label="Number of turrets"
          required
          value={ship.numberOfTurrets}
          thousandSeparator=","
          onChange={(value) => {
            setShip({ ...ship, numberOfTurrets: parseInt(value as any) })
          }}
        />
        <NumberInput
          label="Cargo Size"
          required
          value={ship.cargoSize}
          thousandSeparator=","
          suffix=" m³"
          onChange={(value) => {
            setShip({ ...ship, cargoSize: parseInt(value as any) })
          }}
        />
      </SimpleGrid>
      <Group justify="space-between" mt="sm" align="center">
        <Text fz="sm">
          Yield/sec: <Number value={yieldPerSec} /> m³ | Cargo full in {secToTime(cargoFullDuration)}
        </Text>
        <Button
          size="compact-xs"
          variant="outline"
          color="orange"
          onClick={() => resetShip()}
          leftSection={<TbRepeat />}
        >
          Reset to default ship values
        </Button>
      </Group>
    </Box>
  )
}
