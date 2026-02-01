import { useLocalStorage } from '@mantine/hooks'
export type ShipType = {
  name: string
  cargoSize: number
  yieldPerTurret: number
  turretCircleDuration: number
  numberOfTurrets: number
  splitTurrets: boolean
  residueChancePercent: number
  critChancePercent: number
  critBonusYieldPercent: number
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
      residueChancePercent: 0,
      critChancePercent: 1,
      critBonusYieldPercent: 200,
    } as ShipType,
    getInitialValueInEffect: false,
  })
  return {
    ship,
    setShip,
    resetShip,
  }
}
