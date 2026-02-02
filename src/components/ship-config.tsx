import * as React from 'react'
import { ActionIcon, Box, Button, Group, NumberInput, SimpleGrid, Text } from '@mantine/core'
import { TbRepeat, TbVolume } from 'react-icons/tb'
import { formatNumber } from '../utils/format-number/format-number.tsx'
import { getMiningStats } from '../utils/mining-math.ts'
import { simulateCargoBands } from '../utils/mining-sim.ts'
import { useShipStore } from '../utils/use-ship-store.ts'
import { secToTime } from '../utils/sec-to-time/sec-to-time.tsx'
import { SoundSettingsModal } from './sound-settings-modal.tsx'

export const ShipConfig: React.FC = () => {
  const { ship, setShip, resetShip } = useShipStore()
  const [soundModalOpened, setSoundModalOpened] = React.useState(false)
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
  const formatBand = (band: { low: number; avg: number; high: number }, options = {}) => {
    return `${formatNumber(band.low, options)} / ${formatNumber(band.avg, options)} / ${formatNumber(band.high, options)}`
  }
  const formatTimeBand = (band: { low: number; avg: number; high: number }) => {
    return `${secToTime(band.low)} / ${secToTime(band.avg)} / ${secToTime(band.high)}`
  }

  return (
    <Box my="lg" p="lg" bg="dark.5">
      <SoundSettingsModal opened={soundModalOpened} onClose={() => setSoundModalOpened(false)} />
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
        <Group gap="xs" align="flex-start">
          <ActionIcon
            variant="outline"
            color="gray"
            size="lg"
            mt={4}
            onClick={() => setSoundModalOpened(true)}
            title="Sound settings"
          >
            <TbVolume />
          </ActionIcon>
          <div>
            <Text fz="xs" c="dimmed" mb={4} ta="center">
              Low/Avg/High = mean − 1σ / mean / mean + 1σ bands.
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
      </Group>
    </Box>
  )
}
