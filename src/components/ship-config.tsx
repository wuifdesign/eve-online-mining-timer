import * as React from 'react'
import { Box, Button, Group, NumberInput, SimpleGrid, Text } from '@mantine/core'
import { TbRepeat } from 'react-icons/tb'
import { formatNumber } from '../utils/format-number/format-number.tsx'
import { getMiningStats } from '../utils/mining-math.ts'
import { simulateCargoBands } from '../utils/mining-sim.ts'
import { useShipStore } from '../utils/use-ship-store.ts'
import { secToTime } from '../utils/sec-to-time/sec-to-time.tsx'

export const ShipConfig: React.FC = () => {
  const { ship, setShip, resetShip } = useShipStore()
  const stats = getMiningStats(ship)

  const cargoBands = React.useMemo(
    () =>
      simulateCargoBands({
        cargoSize: ship.cargoSize,
        stats,
        turrets: ship.numberOfTurrets,
        seed: ship.name ?? 'cargo',
      }),
    [ship.cargoSize, ship.numberOfTurrets, ship.name, stats],
  )
  const formatBand = (band: { p10: number; p50: number; p90: number }, options = {}) => {
    return `${formatNumber(band.p10, options)} / ${formatNumber(band.p50, options)} / ${formatNumber(band.p90, options)}`
  }
  const formatTimeBand = (band: { p10: number; p50: number; p90: number }) => {
    return `${secToTime(band.p10)} / ${secToTime(band.p50)} / ${secToTime(band.p90)}`
  }

  return (
    <Box my="lg" p="lg" bg="dark.5">
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
      <SimpleGrid cols={{ base: 1, sm: 3 }} mt="md">
        <NumberInput
          label="Residue chance"
          required
          value={ship.residueChancePercent ?? 0}
          min={0}
          max={100}
          step={0.1}
          suffix="%"
          onChange={(value) => {
            setShip({ ...ship, residueChancePercent: typeof value === 'number' ? value : 0 })
          }}
        />
        <NumberInput
          label="Critical chance"
          required
          value={ship.critChancePercent ?? 0}
          min={0}
          max={100}
          step={0.1}
          suffix="%"
          onChange={(value) => {
            setShip({ ...ship, critChancePercent: typeof value === 'number' ? value : 0 })
          }}
        />
        <NumberInput
          label="Critical success bonus yield"
          required
          value={ship.critBonusYieldPercent ?? 200}
          min={0}
          step={1}
          suffix="%"
          onChange={(value) => {
            setShip({ ...ship, critBonusYieldPercent: typeof value === 'number' ? value : 0 })
          }}
        />
      </SimpleGrid>
      <Group justify="space-between" mt="sm" align="center">
        <Text fz="sm">
          Cargo/sec: {formatBand(cargoBands.cargoPerSecondBands, { maximumFractionDigits: 2 })} m³ | Cargo full in{' '}
          {formatTimeBand(cargoBands.cargoFullTimeBands)}{' '}
        </Text>
        <div>
          <Text fz="xs" c="dimmed" mb={4} ta="center">
            P10/50/90 = 10th / 50th / 90th percentile bands.
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
        </div>
      </Group>
    </Box>
  )
}
