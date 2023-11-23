import { useLocalStorage } from '@mantine/hooks'

export type ShipType = {
  name: string
  cargoSize: number
  yieldPerTurret: number
  turretCircleDuration: number
  numberOfTurrets: number
  splitTurrets: boolean
}

export const useShipStore = () => {
  const [ship, setShip, resetShip] = useLocalStorage({
    key: 'ships',
    defaultValue: {
      name: 'Demo Ship',
      cargoSize: 31000,
      yieldPerTurret: 1300,
      turretCircleDuration: 180,
      numberOfTurrets: 2,
      splitTurrets: true,
    } as ShipType,
    getInitialValueInEffect: false,
  })
  return {
    ship,
    setShip,
    resetShip,
  }
}
