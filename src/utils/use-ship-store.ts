import { useMemo } from 'preact/hooks'
import { useLocalStorage } from './use-local-storage.ts'

export type ShipType = {
  name: string
  cargoSize: number
  yieldPerTurret: number
  turretCycleDuration: number
  numberOfTurrets: number
  splitTurrets: boolean
  residueChancePercent: number
  residueMultiplier: number
  critChancePercent: number
  critBonusYieldPercent: number
}

const defaultShip: ShipType = {
  name: 'Demo Ship',
  cargoSize: 31000,
  // post-Catalyst strip miner cycle (4x faster than before, same m³/s)
  yieldPerTurret: 325,
  turretCycleDuration: 45,
  numberOfTurrets: 2,
  splitTurrets: true,
  residueChancePercent: 0,
  residueMultiplier: 1,
  critChancePercent: 1,
  critBonusYieldPercent: 200,
}

// ships saved by older versions
type StoredShip = ShipType & {
  // renamed to turretCycleDuration
  turretCircleDuration?: number
}

// default from before Catalyst (Nov 2025), nobody mines with these numbers anymore
const isPreCatalystDefault = (ship: ShipType) => ship.yieldPerTurret === 1300 && ship.turretCycleDuration === 180

// brings an older saved ship up to date, the next save persists it
export const migrateShip = (stored: StoredShip): ShipType => {
  const { turretCircleDuration, ...rest } = stored
  const ship: ShipType = {
    ...rest,
    turretCycleDuration: rest.turretCycleDuration ?? turretCircleDuration ?? defaultShip.turretCycleDuration,
  }
  if (isPreCatalystDefault(ship)) {
    return {
      ...ship,
      yieldPerTurret: defaultShip.yieldPerTurret,
      turretCycleDuration: defaultShip.turretCycleDuration,
    }
  }
  return ship
}

export const useShipStore = () => {
  const [storedShip, setShip, resetShip] = useLocalStorage<StoredShip>('ships', defaultShip)
  const ship = useMemo(() => migrateShip(storedShip), [storedShip])
  return {
    ship,
    setShip,
    resetShip,
  }
}
